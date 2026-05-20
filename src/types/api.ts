export interface ApiEnvelope<T> {
  updatedAt: string;
  data: T;
}

export interface ApiHealth {
  status?: string;
  message?: string;
}

export interface TournamentSummary {
  tournamentId: string;
  windowId: string;
  tournamentName?: string;
  name?: string;
  image?: string | null;
  start: string;
  end: string;
  teamFormat?: string | null;
  gameMode?: string | null;
  mode?: string | null;
  resolvedLocation?: string | null;
}

export interface Prize {
  scoringType: string;
  threshold: number;
  rewardType: string;
  value: string;
  quantity: number;
}

export interface ScoreRule {
  type: string;
  value: number;
  points: number;
}

export interface ScoreRuleSet {
  id?: string;
  leaderboardDefId?: string;
  rule?: ScoreRule[];
}

export interface CastChannel {
  channelName: string;
  link: string;
}

export interface TournamentWindowDetail {
  tournamentId: string;
  tournamentName: string;
  description: string;
  type: string;
  images?: {
    square?: string;
    tile?: string;
    background?: string;
  };
  windowId: string;
  start: string;
  end: string;
  cast?: {
    youtube?: CastChannel;
    twitch?: CastChannel;
  };
  matchCap: number;
  mode: string;
  teamFormat: string;
  anyRequiredTokens: string[];
  blockedTokens: string[];
  requiredTokens: string[];
  requiresQualification: boolean;
  leaderboardId: string | null;
  prizes: Prize[];
  scoreRules: ScoreRuleSet | null;
  playerQual: PlayerQualification[];
}

export interface PlayerQualification {
  accountId: string;
  playerName: string;
  image?: string | null;
  isThisPlayerQual: boolean;
}

export interface HomeData {
  actu: unknown[];
  liveTournament: TournamentSummary | null;
  upcomingTournaments: TournamentSummary[];
  lastPlayedWindow?: {
    tournament?: TournamentWindowDetail | null;
  } | null;
}

export interface PlayerSummary {
  id: string;
  name: string;
  image?: string | null;
  pseudo?: string | null;
  countryFlag?: string | null;
  country?: string | null;
  top5?: number | null;
  bestTop?: number | null;
}

export interface PlayerTournament {
  tournamentName?: string;
  placement?: number | null;
  eliminations?: number | null;
  points?: number | null;
  image?: string | null;
  windowId?: string;
  date?: string;
}

export interface PlayerProfile extends PlayerSummary {
  pseudo?: string | null;
  countryFlag?: string | null;
  country?: string | null;
  top5?: number | null;
  bestTop?: number | null;
  avgKill?: number | null;
  avgTop?: number | null;
  lastTournaments?: PlayerTournament[];
}

export interface TournamentLeaderboardEntry {
  rank: number;
  names: string[];
  points: number;
  nbGamesPlayed?: number | null;
  kills?: number | null;
  wins?: number | null;
}

export interface TournamentTrackedPlayer {
  accountId: string;
  name: string;
  image?: string | null;
}

export interface TournamentLeaderboard {
  results: TournamentLeaderboardEntry[];
  qualStatus?: TournamentQualStatus[];
}

export interface TournamentQualStatus {
  accountId: string;
  name: string;
  image?: string | null;
  labels: string[];
  rank?: number | null;
  points?: number | null;
}

export interface TournamentWindowResults {
  tournamentId: string;
  tournamentName: string;
  windowId: string;
  start: string;
  end: string;
  leaderboard: TournamentLeaderboard | null;
  cumulatif?: TournamentLeaderboard | null;
  players: TournamentTrackedPlayer[];
}
