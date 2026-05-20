import { appConfig } from "@/src/api/apiConfig";
import type { TournamentWindowDetail } from "@/src/types/api";

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

export function getWindowPrimaryImage(window: TournamentWindowDetail | null) {
  if (!window?.images) {
    return undefined;
  }

  if (typeof window.images === "string") {
    return resolveAssetUrl(window.images);
  }

  return resolveAssetUrl(
    window.images.background ?? window.images.tile ?? window.images.square,
  );
}
