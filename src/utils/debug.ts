import { Platform } from "react-native";

import { appConfig } from "@/src/api/apiConfig";
import { isLocalHostUrl } from "@/src/utils/network";

export function logApiDebug(event: string, details?: Record<string, unknown>) {
  if (!shouldLogDebug()) {
    return;
  }

  console.log(`[HavokDebug] ${event}`, details ?? {});
}

export function logApiWarning(event: string, details?: Record<string, unknown>) {
  if (!shouldLogDebug()) {
    return;
  }

  console.warn(`[HavokDebug] ${event}`, details ?? {});
}

export function logApiError(
  event: string,
  error: unknown,
  details?: Record<string, unknown>,
) {
  if (!shouldLogDebug()) {
    return;
  }

  const enrichedDetails = {
    ...details,
    hints: getDebugHints(event, details),
    errorMessage: error instanceof Error ? error.message : String(error),
    errorName: error instanceof Error ? error.name : "UnknownError",
  };

  console.error(`[HavokDebug] ${event}`, enrichedDetails);
}

export function logRuntimeConfiguration() {
  if (!shouldLogDebug()) {
    return;
  }

  const baseUrl = appConfig.apiBaseUrl || "(missing)";
  const hostType = isLocalHostUrl(baseUrl) ? "local" : "remote";
  const warnings: string[] = [];

  if (isLocalHostUrl(baseUrl)) {
    warnings.push(
      "Localhost is fine for web, but Android emulator usually needs 10.0.2.2 and physical devices need a LAN or public HTTPS URL.",
    );
  }

  if (appConfig.attestationMode === "development") {
    warnings.push(
      "Development attestation is enabled. This is acceptable for local or preprod tests, but not a final store-ready mobile attestation flow.",
    );
  }

  if (appConfig.attestationMode === "web" && Platform.OS !== "web") {
    warnings.push(
      "Web attestation mode only works on Expo web. Native iOS/Android builds still need a dedicated production attestation flow.",
    );
  }

  console.log("[HavokDebug] Runtime configuration", {
    apiBaseUrl: baseUrl,
    attestationMode: appConfig.attestationMode,
    demoDataEnabled: appConfig.demoDataEnabled,
    hostType,
    platform: Platform.OS,
    warnings,
  });
}

export function shouldLogDebug() {
  return __DEV__ || appConfig.debugApi;
}

function getDebugHints(
  event: string,
  details?: Record<string, unknown>,
) {
  const hints: string[] = [];
  const url = typeof details?.url === "string" ? details.url : "";
  const isNative = Platform.OS === "ios" || Platform.OS === "android";

  if (event.includes("network_failure") && isNative && isLocalHostUrl(url)) {
    hints.push(
      "Cette app native ne peut pas joindre localhost sur un appareil physique. Utilise l IP LAN du PC ou une URL HTTPS publique.",
    );
    hints.push(
      "Apres un changement de EXPO_PUBLIC_API_BASE_URL, redemarre Expo completement avec un cache vide.",
    );
  }

  if (event.includes("network_failure") && !url) {
    hints.push(
      "Aucune URL n a ete resolue. Verifie EXPO_PUBLIC_API_BASE_URL puis relance Expo.",
    );
  }

  return hints;
}
