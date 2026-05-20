const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? "";
const apiKey = process.env.EXPO_PUBLIC_API_KEY?.trim() ?? "";
const attestationMode =
  process.env.EXPO_PUBLIC_APP_ATTESTATION_MODE?.trim() ?? "development";

export const appConfig = {
  apiBaseUrl,
  apiKey,
  attestationMode,
};

export const configStatus = {
  hasApiBaseUrl: Boolean(apiBaseUrl),
  hasApiKey: Boolean(apiKey),
  hasAttestationMode: Boolean(attestationMode),
  isReady: Boolean(apiBaseUrl && apiKey && attestationMode),
};
