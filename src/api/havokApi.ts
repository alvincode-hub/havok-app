import { requestJson } from "@/src/api/client";
import type {
  ApiHealth,
  CalendarTournament,
  HomeData,
  PlayerProfile,
  PlayerSummary,
  TournamentResults,
  TournamentWindowDetail,
  TournamentWindowGroup,
} from "@/src/types/api";

export const havokApi = {
  getCalendar() {
    return requestJson<CalendarTournament[]>("/api/tournaments/calendrier");
  },
  getHealth() {
    return requestJson<ApiHealth>("/api/health", { requiresApiKey: false });
  },
  getHome() {
    return requestJson<HomeData>("/api/home");
  },
  getPlayer(playerId: string) {
    return requestJson<PlayerProfile | null>("/api/player", {
      query: { playerId },
    });
  },
  getPlayers() {
    return requestJson<PlayerSummary[]>("/api/players");
  },
  getTournamentResults(windowId: string, page = 0, cumulative = false) {
    return requestJson<TournamentResults | null>("/api/tournaments/results", {
      query: {
        cumulatif: cumulative ? 1 : undefined,
        page,
        windowId,
      },
    });
  },
  getTournamentWindow(windowId: string) {
    return requestJson<TournamentWindowDetail | null>(
      "/api/tournaments/window",
      {
        query: { windowId },
      },
    );
  },
  getTournamentWindowGroup(windowId: string) {
    return requestJson<TournamentWindowGroup | null>(
      "/api/tournaments/allWindow",
      {
        query: { windowId },
      },
    );
  },
};
