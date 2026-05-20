import { appConfig } from "@/src/config/env";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function resolveAssetUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (!appConfig.apiBaseUrl) {
    return undefined;
  }

  const normalizedBaseUrl = trimTrailingSlash(appConfig.apiBaseUrl);
  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${normalizedBaseUrl}${normalizedPath}`;
}
