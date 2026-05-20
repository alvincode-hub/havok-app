import { appConfig } from "@/src/config/env";

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigError";
  }
}

type QueryValue = string | number | undefined;

export function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const normalizedBaseUrl = appConfig.apiBaseUrl.replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    throw new ApiConfigError(
      "Configure EXPO_PUBLIC_API_BASE_URL pour connecter l'application au backend."
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const queryEntries = Object.entries(query ?? {}).filter(([, value]) => {
    return value !== undefined && value !== "";
  });

  if (queryEntries.length === 0) {
    return `${normalizedBaseUrl}${normalizedPath}`;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of queryEntries) {
    searchParams.set(key, String(value));
  }

  return `${normalizedBaseUrl}${normalizedPath}?${searchParams.toString()}`;
}

export function getApiKeyHeaders(requiresApiKey: boolean): Record<string, string> {
  if (!requiresApiKey) {
    return {};
  }

  if (!appConfig.apiKey) {
    throw new ApiConfigError(
      "Configure EXPO_PUBLIC_API_KEY pour appeler les routes protegees du backend."
    );
  }

  return {
    "x-app-key": appConfig.apiKey,
  };
}
