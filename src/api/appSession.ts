import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { createAppAttestation } from "@/src/api/appAttestation";
import { buildApiUrl, getApiKeyHeaders } from "@/src/api/apiConfig";

const INSTALLATION_ID_KEY = "havok-installation-id";
const SESSION_KEY = "havok-api-session";

interface SessionResponse {
  accessToken: string;
  expiresAt: string;
  expiresInSeconds: number;
  success: boolean;
  tokenType: string;
}

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
  await removeStoredValue(SESSION_KEY);
}

async function getOrCreateSession(forceRefresh: boolean) {
  if (!forceRefresh) {
    const cachedSession = await readStoredSession();

    if (cachedSession && !isExpired(cachedSession.expiresAt)) {
      return cachedSession;
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
  const platform = Platform.OS;
  const appVersion = getAppVersion();

  const challengeResponse = await fetchSessionJson<{
    challenge: string;
    expiresAt: string;
    success: boolean;
    ttlSeconds: number;
  }>("/api/app/challenge", {
    appVersion,
    installationId,
    platform,
  });

  const attestation = await createAppAttestation({
    challenge: challengeResponse.challenge,
    installationId,
    platform,
    appVersion,
  });

  const sessionResponse = await fetchSessionJson<SessionResponse>(
    "/api/app/session",
    {
      appVersion,
      attestation,
      challenge: challengeResponse.challenge,
      installationId,
      platform,
    }
  );

  const storedSession: StoredSession = {
    accessToken: sessionResponse.accessToken,
    expiresAt: sessionResponse.expiresAt,
    tokenType: sessionResponse.tokenType,
  };

  await writeStoredValue(SESSION_KEY, JSON.stringify(storedSession));

  return storedSession;
}

async function fetchSessionJson<T>(
  path: string,
  body: Record<string, unknown>
) {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getApiKeyHeaders(true),
    },
    body: JSON.stringify(body),
  });

  const payload = await readJsonSafe(response);

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `La creation de session a echoue (${response.status}).`;

    throw new Error(message);
  }

  return payload as T;
}

async function readStoredSession() {
  const rawSession = await readStoredValue(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredSession;
  } catch {
    await removeStoredValue(SESSION_KEY);
    return null;
  }
}

async function getInstallationId() {
  const storedInstallationId = await readStoredValue(INSTALLATION_ID_KEY);

  if (storedInstallationId) {
    return storedInstallationId;
  }

  const nextInstallationId = createInstallationId();
  await writeStoredValue(INSTALLATION_ID_KEY, nextInstallationId);
  return nextInstallationId;
}

function createInstallationId() {
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `havok-${Date.now().toString(36)}-${randomPart}`;
}

function getAppVersion() {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "dev"
  );
}

function isExpired(expiresAt: string) {
  const expiresAtMs = Date.parse(expiresAt);

  if (Number.isNaN(expiresAtMs)) {
    return true;
  }

  return expiresAtMs <= Date.now() + 15 * 1000;
}

async function readStoredValue(key: string) {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function writeStoredValue(key: string, value: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeStoredValue(key: string) {
  if (Platform.OS === "web") {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

async function readJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
