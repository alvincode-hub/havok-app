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
