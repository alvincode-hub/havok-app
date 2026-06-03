import type { AppConfig } from "@/src/types/api";
import { isLocalHostUrl } from "@/src/utils/network";

export class ApiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigError";
  }
}

type QueryValue = boolean | number | string | undefined;

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";
const apiKey = process.env.EXPO_PUBLIC_API_KEY?.trim() ?? "";
const attestationMode =
  process.env.EXPO_PUBLIC_APP_ATTESTATION_MODE?.trim() ?? "development";
const debugApi =
  process.env.EXPO_PUBLIC_DEBUG_API?.trim().toLowerCase() === "true";
const demoDataFlag = process.env.EXPO_PUBLIC_ENABLE_DEMO_DATA?.trim().toLowerCase();
const demoDataEnabled = demoDataFlag ? demoDataFlag !== "false" : true;

export const appConfig: AppConfig = {
  apiBaseUrl,
  apiKey,
  attestationMode,
  debugApi,
  demoDataEnabled,
};

export const configStatus = {
  hasApiBaseUrl: Boolean(apiBaseUrl),
  hasApiKey: Boolean(apiKey),
  isReady: Boolean(apiBaseUrl && apiKey),
};

export function buildApiUrl(
  path: string,
  query?: Record<string, QueryValue>,
) {
  const normalizedBaseUrl = appConfig.apiBaseUrl.replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    throw new ApiConfigError(
      "Configure EXPO_PUBLIC_API_BASE_URL pour connecter l application au backend.",
    );
  }

  if (!__DEV__ && isLocalHostUrl(normalizedBaseUrl)) {
    throw new ApiConfigError(
      "Une build de production ne peut pas utiliser localhost comme backend. Configure une URL HTTPS joignable publiquement.",
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const search = searchParams.toString();
  return search
    ? `${normalizedBaseUrl}${normalizedPath}?${search}`
    : `${normalizedBaseUrl}${normalizedPath}`;
}

export function getApiKeyHeaders(requiresApiKey = true): Record<string, string> {
  if (!requiresApiKey) {
    return {};
  }

  if (!appConfig.apiKey) {
    throw new ApiConfigError(
      "Configure EXPO_PUBLIC_API_KEY pour appeler les routes protegees du backend.",
    );
  }

  return { "x-app-key": appConfig.apiKey };
}
