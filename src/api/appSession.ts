import Constants from "expo-constants";
import { Platform } from "react-native";

import { createAppAttestation } from "@/src/api/appAttestation";
import { buildApiUrl, getApiKeyHeaders } from "@/src/api/apiConfig";
import {
  readStoredString,
  removeStoredString,
  writeStoredString,
} from "@/src/utils/storage";
import {
  logApiDebug,
  logApiError,
  logApiWarning,
} from "@/src/utils/debug";
import type { AppChallengeResponse, AppSessionResponse } from "@/src/types/api";

const INSTALLATION_ID_KEY = "havok-installation-id";
const SESSION_KEY = "havok-api-session";

interface StoredSession {
  accessToken: string;
  expiresAt: string;
  tokenType: string;
}

let inFlightSessionPromise: Promise<StoredSession> | null = null;

export async function getAppSessionAccessToken(forceRefresh = false) {
  const session = await getOrCreateSession(forceRefresh);
  return session.accessToken;
}

export async function clearStoredAppSession() {
  await removeStoredString(SESSION_KEY);
}

async function getOrCreateSession(forceRefresh: boolean) {
  if (!forceRefresh) {
    const currentSession = await readStoredSession();

    if (currentSession && !isExpired(currentSession.expiresAt)) {
      return currentSession;
    }
  }

  if (!inFlightSessionPromise) {
    inFlightSessionPromise = createSession().finally(() => {
      inFlightSessionPromise = null;
    });
  }

  return inFlightSessionPromise;
}

async function createSession() {
  const installationId = await getInstallationId();
  const platform = getPlatform();
  const appVersion = getAppVersion();

  logApiDebug("session.bootstrap_start", {
    appVersion,
    installationId,
    platform,
  });

  const challengeResponse = await fetchSessionJson<AppChallengeResponse>(
    "/api/app/challenge",
    {
      appVersion,
      installationId,
      platform,
    },
  );

  const attestation = await createAppAttestation({
    appVersion,
    challenge: challengeResponse.challenge,
    installationId,
    platform,
  });

  const sessionResponse = await fetchSessionJson<AppSessionResponse>(
    "/api/app/session",
    {
      appVersion,
      attestation,
      challenge: challengeResponse.challenge,
      installationId,
      platform,
    },
  );

  const session: StoredSession = {
    accessToken: sessionResponse.accessToken,
    expiresAt: sessionResponse.expiresAt,
    tokenType: sessionResponse.tokenType,
  };

  await writeStoredString(SESSION_KEY, JSON.stringify(session));

  logApiDebug("session.bootstrap_success", {
    expiresAt: session.expiresAt,
    installationId,
    platform,
  });

  return session;
}

async function fetchSessionJson<T>(
  path: string,
  body: Record<string, unknown>,
) {
  const url = buildApiUrl(path);
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...getApiKeyHeaders(true),
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    logApiError("session.network_failure", error, { path, url });
    throw error;
  }

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `La creation de session a echoue (${response.status}).`;

    logApiError("session.http_failure", errorMessage, {
      path,
      payload,
      status: response.status,
      url,
    });
    throw new Error(errorMessage);
  }

  logApiDebug("session.step_success", {
    path,
    status: response.status,
    url,
  });

  return payload as T;
}

async function readStoredSession() {
  const storedSession = await readStoredString(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as StoredSession;
  } catch {
    logApiWarning("session.cache_corrupted");
    await removeStoredString(SESSION_KEY);
    return null;
  }
}

async function getInstallationId() {
  const storedInstallationId = await readStoredString(INSTALLATION_ID_KEY);

  if (storedInstallationId) {
    return storedInstallationId;
  }

  const nextInstallationId = createInstallationId();
  await writeStoredString(INSTALLATION_ID_KEY, nextInstallationId);
  return nextInstallationId;
}

function createInstallationId() {
  return `havok-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function getAppVersion() {
  return Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "dev";
}

function getPlatform() {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return Platform.OS;
  }

  return "web";
}

function isExpired(expiresAt: string) {
  const expirationTime = Date.parse(expiresAt);

  if (Number.isNaN(expirationTime)) {
    return true;
  }

  return expirationTime <= Date.now() + 15_000;
}

async function readJsonSafe(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}
