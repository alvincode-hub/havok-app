import {
  clearStoredAppSession,
  getAppSessionAccessToken,
} from "@/src/api/appSession";
import { ApiConfigError, buildApiUrl, getApiKeyHeaders } from "@/src/api/apiConfig";

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface RequestOptions {
  query?: Record<string, string | number | undefined>;
  requiresApiKey?: boolean;
  requiresSession?: boolean;
}

async function getRequestHeaders(
  requiresApiKey: boolean,
  requiresSession: boolean,
  forceRefreshSession = false
) {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (requiresApiKey) {
    Object.assign(headers, getApiKeyHeaders(true));
  }

  if (requiresSession) {
    const accessToken = await getAppSessionAccessToken(forceRefreshSession);
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
  hasRetried = false
) {
  const requiresApiKey = options.requiresApiKey ?? true;
  const requiresSession = options.requiresSession ?? requiresApiKey;
  const url = buildApiUrl(path, options.query);
  const response = await fetch(url, {
    headers: await getRequestHeaders(
      requiresApiKey,
      requiresSession,
      hasRetried
    ),
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (response.status === 401 && requiresSession && !hasRetried) {
    await clearStoredAppSession();
    return requestJson<T>(path, options, true);
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `La requete a echoue (${response.status}).`;

    throw new ApiRequestError(message, response.status);
  }

  return payload as T;
}

export { ApiConfigError, ApiRequestError };
