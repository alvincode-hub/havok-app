import { appConfig } from "@/src/api/apiConfig";
import { requestJson } from "@/src/api/client";
import { demoApi } from "@/src/api/demoData";
import type {
  ApiHealth,
  CalendarTournament,
  HomeData,
  LeaderboardEntry,
  PlayerProfile,
  PlayerSummary,
  TournamentResults,
  TournamentWindowDetail,
  TournamentWindowGroup,
} from "@/src/types/api";

type RawLeaderboardEntry = LeaderboardEntry & {
  teamAccountId?: string | null;
};

type RawTournamentResults = Omit<TournamentResults, "leaderboard"> & {
  leaderboard: (TournamentResults["leaderboard"] & {
    results: RawLeaderboardEntry[];
  }) | null;
};

export const havokApi = {
  getCalendar() {
    if (appConfig.demoDataEnabled) {
      return demoApi.getCalendar();
    }

    return requestJson<CalendarTournament[]>("/api/tournaments/calendrier");
  },
  getHealth() {
    if (appConfig.demoDataEnabled) {
      return demoApi.getHealth();
    }

    return requestJson<ApiHealth>("/api/health", { requiresApiKey: false });
  },
  getHome() {
    if (appConfig.demoDataEnabled) {
      return demoApi.getHome();
    }

    return requestJson<HomeData>("/api/home");
  },
  getPlayer(playerId: string) {
    if (appConfig.demoDataEnabled) {
      return demoApi.getPlayer(playerId);
    }

    return requestJson<PlayerProfile | null>("/api/player", {
      query: { playerId },
    });
  },
  getPlayers() {
    if (appConfig.demoDataEnabled) {
      return demoApi.getPlayers();
    }

    return requestJson<PlayerSummary[]>("/api/players");
  },
  getTournamentResults(windowId: string, page = 0, cumulative = false) {
    if (appConfig.demoDataEnabled) {
      return demoApi.getTournamentResults(windowId, page, cumulative);
    }

    return requestJson<RawTournamentResults | null>("/api/tournaments/results", {
      query: {
        cumulatif: cumulative ? 1 : undefined,
        page,
        windowId,
      },
    }).then((results) => {
      if (!results?.leaderboard) {
        return results as TournamentResults | null;
      }

      return {
        ...results,
        leaderboard: {
          ...results.leaderboard,
          results: results.leaderboard.results.map((entry: RawLeaderboardEntry) => {
            return {
              ...entry,
              accountId: entry.accountId ?? entry.teamAccountId ?? null,
            };
          }),
        },
      };
    });
  },
  getTournamentWindow(windowId: string) {
    if (appConfig.demoDataEnabled) {
      return demoApi.getTournamentWindow(windowId);
    }

    return requestJson<TournamentWindowDetail | null>(
      "/api/tournaments/window",
      {
        query: { windowId },
      },
    );
  },
  getTournamentWindowGroup(windowId: string) {
    if (appConfig.demoDataEnabled) {
      return demoApi.getTournamentWindowGroup(windowId);
    }

    return requestJson<TournamentWindowGroup | null>(
      "/api/tournaments/allWindow",
      {
        query: { windowId },
      },
    );
  },
};
