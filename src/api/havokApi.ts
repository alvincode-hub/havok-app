import { requestJson } from "@/src/api/client";
import type {
  ApiEnvelope,
  ApiHealth,
  HomeData,
  PlayerProfile,
  PlayerSummary,
  TournamentSummary,
  TournamentWindowDetail,
  TournamentWindowResults,
} from "@/src/types/api";

export const havokApi = {
  getHealth() {
    return requestJson<ApiHealth>("/api/health", { requiresApiKey: false });
  },
  getHome() {
    return requestJson<ApiEnvelope<HomeData>>("/api/home");
  },
  getCalendar() {
    return requestJson<ApiEnvelope<TournamentSummary[]>>(
      "/api/tournaments/calendrier"
    );
  },
  getPlayers() {
    return requestJson<PlayerSummary[]>("/api/players");
  },
  getPlayer(playerId: string) {
    return requestJson<PlayerProfile | null>("/api/player", {
      query: { playerId },
    });
  },
  getTournamentWindow(windowId: string) {
    return requestJson<TournamentWindowDetail | null>(
      "/api/tournaments/window",
      {
        query: { windowId },
      }
    );
  },
  getTournamentResults(windowId: string) {
    return requestJson<TournamentWindowResults | null>(
      "/api/tournaments/results",
      {
        query: { windowId },
      }
    );
  },
};
