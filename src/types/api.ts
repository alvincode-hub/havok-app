export interface AppConfig {
  apiBaseUrl: string;
  apiKey: string;
  attestationMode: string;
  debugApi: boolean;
}

export interface ApiEnvelope<T> {
  data: T;
  updatedAt: string;
}

export interface ApiHealth {
  message?: string;
  status?: string;
  success?: boolean;
}

export interface AppChallengeResponse {
  challenge: string;
  expiresAt: string;
  success: boolean;
  ttlSeconds: number;
}

export interface AppSessionResponse {
  accessToken: string;
  expiresAt: string;
  expiresInSeconds: number;
  success: boolean;
  tokenType: string;
}

export interface HomeTournament {
  end: string;
  gameMode?: string | null;
  image?: string | null;
  start: string;
  teamFormat?: string | null;
  tournamentId: string;
  tournamentName: string;
  windowId: string;
}

export interface HomeNewsItem {
  date?: string | null;
  description?: string | null;
  id?: string | null;
  image?: string | null;
  link?: string | null;
  name?: string | null;
  text?: string | null;
  title?: string | null;
  tournament?: HomeTournament | null;
}

export interface LastPlayedPlace {
  accountId?: string | null;
  name: string;
  result?: PlayerTournamentResultSummary | null;
}

export interface HomeData {
  actu: HomeNewsItem[];
  lastPlayedWindow?: {
    places?: LastPlayedPlace[];
    tournament?: HomeTournament | null;
  } | null;
  liveTournament: HomeTournament | null;
  upcomingTournaments: HomeTournament[];
}

export interface CalendarTournament {
  end: string;
  image?: string | null;
  mode?: string | null;
  name: string;
  start: string;
  teamFormat?: string | null;
  tournamentId: string;
  windowId: string;
}

export interface TournamentWindowGroupItem {
  end: string;
  name: string;
  start: string;
  windowId: string;
}

export interface TournamentWindowGroup {
  id: string;
  windows: TournamentWindowGroupItem[];
}

export interface Prize {
  currency?: string | null;
  price?: number | string | null;
  qualificationTournamentId?: string | null;
  qualificationTournamentName?: string | null;
  qualificationWindowId?: string | null;
  qualificationWindowName?: string | null;
  quantity?: number | null;
  rewardTypeDisplayName?: string | null;
  rewardType?: string | null;
  scoringTypeDisplayName?: string | null;
  scoringType?: string | null;
  threshold?: number | null;
  value?: string | null;
}

export interface ScoreRule {
  points: number;
  type: string;
  value: number;
}

export interface ScoreRuleSet {
  id?: string | null;
  leaderboardDefId?: string | null;
  rule?: ScoreRule[] | null;
}

export interface CastChannel {
  channelName?: string | null;
  link?: string | null;
}

export interface PlayerQualification {
  image?: string | null;
  isThisPlayerQual?: boolean;
  playerName: string;
}

export interface TournamentWindowDetail {
  cast?: {
    twitch?: CastChannel;
    youtube?: CastChannel;
  } | null;
  description?: string | null;
  end: string;
  images?:
    | {
        background?: string | null;
        square?: string | null;
        tile?: string | null;
      }
    | string
    | null;
  matchCap?: number | null;
  mode?: string | null;
  playerQual: PlayerQualification[];
  prizes: Prize[];
  requiresQualification?: boolean | null;
  scoreRules?: ScoreRuleSet | null;
  start: string;
  teamFormat?: string | null;
  tournamentId: string;
  tournamentName: string;
  type?: string | null;
  windowId: string;
}

export interface LeaderboardEntry {
  kills?: number | null;
  labels?: string[] | null;
  names: string[];
  nbGamesPlayed?: number | null;
  points: number;
  pointsLabel?: string | null;
  rank: number;
  rankLabel?: string | null;
  wins?: number | null;
}

export interface HavokPlayerStatus {
  accountId?: string | null;
  image?: string | null;
  labels?: string[] | null;
  name: string;
  playerName?: string;
  points?: number | null;
  rank?: number | null;
}

export interface TrackedTournamentPlayer {
  accountId?: string | null;
  image?: string | null;
  name: string;
}

export interface TournamentLeaderboard {
  id?: string | null;
  qualStatus?: HavokPlayerStatus[] | null;
  results: LeaderboardEntry[];
  totalPages: number;
  windowId?: string | null;
}

export interface TournamentResults {
  end: string;
  leaderboard: TournamentLeaderboard | null;
  players: TrackedTournamentPlayer[];
  start: string;
  tournamentId: string;
  tournamentName: string;
  windowId: string;
}

export interface PlayerSummary {
  country?: string | null;
  countryFlag?: string | null;
  id: string;
  image?: string | null;
  name: string;
  pseudo?: string | null;
}

export interface PlayerTournamentResultSummary {
  kills?: number | null;
  nbGamesPlayed?: number | null;
  names?: string[] | null;
  points?: number | null;
  rank?: number | null;
  top15s?: number | null;
  top5s?: number | null;
  wins?: number | null;
}

export interface PlayerTournament {
  end: string;
  gameMode?: string | null;
  image?: string | null;
  result?: PlayerTournamentResultSummary | null;
  start: string;
  teamFormat?: string | null;
  tournamentId: string;
  tournamentName: string;
  windowId: string;
}

export interface PlayerProfile extends PlayerSummary {
  avgKill?: number | null;
  avgTop?: number | null;
  bestTop?: number | null;
  lastTournaments: PlayerTournament[];
  top5?: number | null;
}
