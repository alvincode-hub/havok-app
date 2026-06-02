import type { Href } from "expo-router";

export function getPlayerHref(playerId: string): Href {
  return {
    pathname: "/player/[playerId]",
    params: { playerId },
  };
}

export function getWindowHref(windowId: string): Href {
  return {
    pathname: "/window/[windowId]",
    params: { windowId },
  };
}

export function getSessionHref(
  windowId: string,
  accountId: string,
  cumulatif: boolean,
  page: number,
): Href {
  return {
    pathname: "/session/[windowId]/[cumulatif]/[accountId]",
    params: { 
      windowId, 
      accountId, 
      cumulatif: cumulatif ? "true" : "false",
      page: String(page),
    },
  };
}
