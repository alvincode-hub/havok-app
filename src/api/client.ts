import { ApiConfigError, buildApiUrl, getApiKeyHeaders } from "@/src/api/apiConfig";
import {
  clearStoredAppSession,
  getAppSessionAccessToken,
} from "@/src/api/appSession";
import {
  logApiDebug,
  logApiError,
  logApiWarning,
} from "@/src/utils/debug";

type QueryValue = boolean | number | string | undefined;

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  query?: Record<string, QueryValue>;
  requiresApiKey?: boolean;
  requiresSession?: boolean;
}

export async function requestJson<T>(
  path: string,
  options: RequestOptions = {},
  hasRetried = false,
): Promise<T> {
  const requiresApiKey = options.requiresApiKey ?? true;
  const requiresSession = options.requiresSession ?? requiresApiKey;
  const method = options.method ?? "GET";
  const url = buildApiUrl(path, options.query);

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: await getRequestHeaders({
        forceRefreshSession: hasRetried,
        headers: options.headers,
        method,
        requiresApiKey,
        requiresSession,
      }),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    logApiError("request.network_failure", error, {
      method,
      path,
      requiresSession,
      url,
    });
    throw error;
  }

  const payload = await readJsonSafe(response);

  if (response.status === 401 && requiresSession && !hasRetried) {
    logApiWarning("request.retry_after_401", {
      method,
      path,
      status: response.status,
      url,
    });
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

    logApiError("request.http_failure", message, {
      method,
      path,
      payload,
      status: response.status,
      url,
    });
    throw new ApiRequestError(message, response.status);
  }

  logApiDebug("request.success", {
    method,
    path,
    status: response.status,
    url,
  });

  return payload as T;
}

async function getRequestHeaders({
  forceRefreshSession,
  headers,
  method,
  requiresApiKey,
  requiresSession,
}: {
  forceRefreshSession: boolean;
  headers?: Record<string, string>;
  method: "GET" | "POST";
  requiresApiKey: boolean;
  requiresSession: boolean;
}) {
  const nextHeaders: Record<string, string> = {
    Accept: "application/json",
    ...getApiKeyHeaders(requiresApiKey),
    ...headers,
  };

  if (method !== "GET") {
    nextHeaders["Content-Type"] = "application/json";
  }

  if (requiresSession) {
    const accessToken = await getAppSessionAccessToken(forceRefreshSession);
    nextHeaders.Authorization = `Bearer ${accessToken}`;
  }

  return nextHeaders;
}

async function readJsonSafe(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export { ApiConfigError };
