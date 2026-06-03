import type {
  ApiHealth,
  CalendarTournament,
  HomeData,
  HomeTournament,
  PlayerProfile,
  PlayerSummary,
  TournamentResults,
  TournamentWindowDetail,
  TournamentWindowGroup,
  TournamentWindowGroupItem,
} from "@/src/types/api";

type DemoResultKey = `${string}:${"normal" | "cumulative"}:${number}`;

const DEMO_DELAY_MS = 150;
const now = Date.now();

function isoFromNow({
  days = 0,
  hours = 0,
  minutes = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
}) {
  return new Date(
    now + ((days * 24 + hours) * 60 + minutes) * 60 * 1000,
  ).toISOString();
}

function buildSessionHistory(
  baseOffsetHours: number,
  placements: number[],
  kills: number[],
) {
  return placements.map((placement, index) => ({
    end: isoFromNow({ hours: baseOffsetHours + index }),
    id: `demo-game-${Math.abs(baseOffsetHours)}-${index + 1}`,
    kills: kills[index] ?? 0,
    placement,
    timeAlived: 980 + index * 87,
  }));
}

function buildHomeTournament(input: {
  end: string;
  gameMode: string;
  image: string;
  start: string;
  teamFormat: string;
  tournamentId: string;
  tournamentName: string;
  windowId: string;
}): HomeTournament {
  return {
    end: input.end,
    gameMode: input.gameMode,
    image: input.image,
    start: input.start,
    teamFormat: input.teamFormat,
    tournamentId: input.tournamentId,
    tournamentName: input.tournamentName,
    windowId: input.windowId,
  };
}

const images = {
  actu: "/dashboard-assets/actu/actu-1779291450392-894-b28fb0847f.jpg",
  fncs: "https://cdn2.unrealengine.com/fnce-39-00-comp-fncs2026update-in-game-tab-800x800-800x800-41126f7a36d0.jpg",
  fncsDiv1:
    "https://cdn2.unrealengine.com/fnce-39-00-comp-fncs2026update-in-game-tab-800x800-800x800-5294f60924d6.jpg",
  performance:
    "https://cdn2.unrealengine.com/fnce-33-30-tileview-performance-cup-01-800x800-800x800-3e3bf91766c6.jpg",
  reload:
    "https://cdn2.unrealengine.com/fneco-35-00-consolevictorycup-comp-in-game-tab-800x800-rockerpunk-800x800-791783a7a571.jpg",
};

const players: PlayerProfile[] = [
  {
    id: "b39cded93b0f4aa59ffdadf0db18e853",
    name: "Pixie",
    pseudo: "havok pixie sc",
    image:
      "/dashboard-assets/players/b39cded93b0f4aa59ffdadf0db18e853-5f99856eee.jpg",
    country: "Suede",
    countryFlag: "/dashboard-assets/flags/su-de-1998912eba.png",
    top5: 6,
    bestTop: 1,
    avgKill: 59.95,
    avgTop: 76.81,
    lastTournaments: [],
  },
  {
    id: "072e8b9f8188405ab0eb52544e1dc906",
    name: "Swizzy",
    pseudo: "havok swizzy",
    image:
      "/dashboard-assets/players/072e8b9f8188405ab0eb52544e1dc906-5c5b05cd97.jpg",
    country: "Russie",
    countryFlag: "/dashboard-assets/flags/russie-4f47c2c291.png",
    top5: 6,
    bestTop: 1,
    avgKill: 61.4,
    avgTop: 64.95,
    lastTournaments: [],
  },
  {
    id: "3acf97a254a0469ca39a30030d6d752d",
    name: "Wox",
    pseudo: "havok wx sc",
    image:
      "/dashboard-assets/players/3acf97a254a0469ca39a30030d6d752d-b3a99c9ea5.jpg",
    country: "Suede",
    countryFlag: "/dashboard-assets/flags/su-de-1998912eba.png",
    top5: 1,
    bestTop: 2,
    avgKill: 52.46,
    avgTop: 147.15,
    lastTournaments: [],
  },
  {
    id: "9cd77d61613244699e3dfb7815f59cf9",
    name: "PabloWingu",
    pseudo: "havok pablo sc",
    image:
      "/dashboard-assets/players/9cd77d61613244699e3dfb7815f59cf9-67877b3c15.jpg",
    country: "Danemark",
    countryFlag: "/dashboard-assets/flags/danemark-284f0c543a.png",
    top5: 4,
    bestTop: 1,
    avgKill: 62.58,
    avgTop: 309.58,
    lastTournaments: [],
  },
  {
    id: "137b42eb15ad4c0eaed668678ef884a6",
    name: "Tjino",
    pseudo: "Havok Tjino",
    image:
      "/dashboard-assets/players/137b42eb15ad4c0eaed668678ef884a6-df15bc5b2e.jpg",
    country: "Danemark",
    countryFlag: "/dashboard-assets/flags/danemark-284f0c543a.png",
    top5: 4,
    bestTop: 1,
    avgKill: 62.58,
    avgTop: 309.58,
    lastTournaments: [],
  },
  {
    id: "4eef01c0cbc74341bf879fab965daa98",
    name: "Pixx",
    pseudo: "havok pixx",
    image:
      "/dashboard-assets/players/4eef01c0cbc74341bf879fab965daa98-84f232845e.jpg",
    country: "Pologne",
    countryFlag: "/dashboard-assets/flags/pologne-cae7f0d1a3.png",
    top5: 2,
    bestTop: 4,
    avgKill: 54.76,
    avgTop: 666.59,
    lastTournaments: [],
  },
  {
    id: "2b3da27c62d14887bd6daa865df33487",
    name: "Idrop",
    pseudo: "Havok IDrop",
    image:
      "/dashboard-assets/players/2b3da27c62d14887bd6daa865df33487-6ec0049a84.jpg",
    country: "Norvege",
    countryFlag: "/dashboard-assets/flags/norvege-9fd7d91ef5.png",
    top5: 1,
    bestTop: 8,
    avgKill: 49.3,
    avgTop: 420.5,
    lastTournaments: [],
  },
];

const tournamentMoments = {
  fncsDay1End: isoFromNow({ days: -1, hours: 7 }),
  fncsDay1Start: isoFromNow({ days: -1, hours: -10 }),
  fncsDay2End: isoFromNow({ hours: 8 }),
  fncsDay2Start: isoFromNow({ hours: -10 }),
  fncsFinalEnd: isoFromNow({ days: 1, hours: 8 }),
  fncsFinalStart: isoFromNow({ days: 1, hours: -10 }),
  performanceFinalEnd: isoFromNow({ days: 1, hours: 31 }),
  performanceFinalStart: isoFromNow({ days: 1, hours: 29 }),
  performanceQualEnd: isoFromNow({ days: 1, hours: 28 }),
  performanceQualStart: isoFromNow({ days: 1, hours: 26 }),
  reloadFinalEnd: isoFromNow({ days: -12, hours: 1 }),
  reloadFinalStart: isoFromNow({ days: -12 }),
};

const homeTournaments = {
  fncsDay1: buildHomeTournament({
    end: tournamentMoments.fncsDay1End,
    gameMode: "Battle Royale",
    image: images.fncs,
    start: tournamentMoments.fncsDay1Start,
    teamFormat: "Duo",
    tournamentId: "epicgames_Bratwurst_Official",
    tournamentName: "Fortnite Championship Series (Jour 1)",
    windowId: "Bratwurst_UpperBracket_Day1",
  }),
  fncsDay2: buildHomeTournament({
    end: tournamentMoments.fncsDay2End,
    gameMode: "Battle Royale",
    image: images.fncs,
    start: tournamentMoments.fncsDay2Start,
    teamFormat: "Duo",
    tournamentId: "epicgames_Bratwurst_Official",
    tournamentName: "Fortnite Championship Series (Jour 2)",
    windowId: "Bratwurst_LowerBracket_Day2",
  }),
  fncsFinal: buildHomeTournament({
    end: tournamentMoments.fncsFinalEnd,
    gameMode: "Battle Royale",
    image: images.fncs,
    start: tournamentMoments.fncsFinalStart,
    teamFormat: "Duo",
    tournamentId: "epicgames_Bratwurst_Official",
    tournamentName: "Fortnite Championship Series (Finale)",
    windowId: "Bratwurst_Finals_Day3",
  }),
  performanceQual: buildHomeTournament({
    end: tournamentMoments.performanceQualEnd,
    gameMode: "Battle Royale",
    image: images.performance,
    start: tournamentMoments.performanceQualStart,
    teamFormat: "Duo",
    tournamentId: "epicgames_S40_PerformanceEvaluation_EU",
    tournamentName: "Evaluation des performances de Fortnite (Qualifications)",
    windowId: "S40_PerformanceEvaluation_Event11Round1_EU",
  }),
  performanceFinal: buildHomeTournament({
    end: tournamentMoments.performanceFinalEnd,
    gameMode: "Battle Royale",
    image: images.performance,
    start: tournamentMoments.performanceFinalStart,
    teamFormat: "Duo",
    tournamentId: "epicgames_S40_PerformanceEvaluation_EU",
    tournamentName: "Evaluation des performances de Fortnite (Finale)",
    windowId: "S40_PerformanceEvaluation_Event11Round2_EU",
  }),
  reloadFinal: buildHomeTournament({
    end: tournamentMoments.reloadFinalEnd,
    gameMode: "Reload",
    image: images.reload,
    start: tournamentMoments.reloadFinalStart,
    teamFormat: "Duo",
    tournamentId: "epicgames_S40_DuosReloadVictoryCup_EU",
    tournamentName: "Coupe victoire duos (mode Recharge) (Finale)",
    windowId: "S40_DuosReloadVictoryCup_Round2_day2_EU",
  }),
};

const calendarTournaments: CalendarTournament[] = [
  {
    end: homeTournaments.reloadFinal.end,
    image: images.reload,
    mode: "Reload",
    name: "Coupe victoire duos (mode Recharge) (Finale)",
    start: homeTournaments.reloadFinal.start,
    teamFormat: "Duo",
    tournamentId: homeTournaments.reloadFinal.tournamentId,
    windowId: homeTournaments.reloadFinal.windowId,
  },
  {
    end: homeTournaments.fncsDay1.end,
    image: images.fncs,
    mode: "Battle Royale",
    name: "Fortnite Championship Series (Jour 1)",
    start: homeTournaments.fncsDay1.start,
    teamFormat: "Duo",
    tournamentId: homeTournaments.fncsDay1.tournamentId,
    windowId: homeTournaments.fncsDay1.windowId,
  },
  {
    end: homeTournaments.fncsDay2.end,
    image: images.fncs,
    mode: "Battle Royale",
    name: "Fortnite Championship Series (Jour 2)",
    start: homeTournaments.fncsDay2.start,
    teamFormat: "Duo",
    tournamentId: homeTournaments.fncsDay2.tournamentId,
    windowId: homeTournaments.fncsDay2.windowId,
  },
  {
    end: homeTournaments.fncsFinal.end,
    image: images.fncs,
    mode: "Battle Royale",
    name: "Fortnite Championship Series (Finale)",
    start: homeTournaments.fncsFinal.start,
    teamFormat: "Duo",
    tournamentId: homeTournaments.fncsFinal.tournamentId,
    windowId: homeTournaments.fncsFinal.windowId,
  },
  {
    end: homeTournaments.performanceQual.end,
    image: images.performance,
    mode: "Battle Royale",
    name: "Evaluation des performances de Fortnite (Qualifications)",
    start: homeTournaments.performanceQual.start,
    teamFormat: "Duo",
    tournamentId: homeTournaments.performanceQual.tournamentId,
    windowId: homeTournaments.performanceQual.windowId,
  },
  {
    end: homeTournaments.performanceFinal.end,
    image: images.performance,
    mode: "Battle Royale",
    name: "Evaluation des performances de Fortnite (Finale)",
    start: homeTournaments.performanceFinal.start,
    teamFormat: "Duo",
    tournamentId: homeTournaments.performanceFinal.tournamentId,
    windowId: homeTournaments.performanceFinal.windowId,
  },
  {
    end: isoFromNow({ days: -10, hours: 2 }),
    image: images.fncsDiv1,
    mode: "Battle Royale",
    name: "Division 1 FNCS (Semaine 5 - Finale)",
    start: isoFromNow({ days: -10 }),
    teamFormat: "Duo",
    tournamentId: "epicgames_S40_FNCSDivisionalCup_Division1_EU",
    windowId: "S40_FNCSDivisionalCup_Division1_Week5Final_EU",
  },
];

const fncsWindows: TournamentWindowGroupItem[] = [
  {
    end: homeTournaments.fncsDay1.end,
    name: "Jour 1",
    start: homeTournaments.fncsDay1.start,
    windowId: homeTournaments.fncsDay1.windowId,
  },
  {
    end: homeTournaments.fncsDay2.end,
    name: "Jour 2",
    start: homeTournaments.fncsDay2.start,
    windowId: homeTournaments.fncsDay2.windowId,
  },
  {
    end: homeTournaments.fncsFinal.end,
    name: "Finale",
    start: homeTournaments.fncsFinal.start,
    windowId: homeTournaments.fncsFinal.windowId,
  },
];

const performanceWindows: TournamentWindowGroupItem[] = [
  {
    end: homeTournaments.performanceQual.end,
    name: "Qualifications",
    start: homeTournaments.performanceQual.start,
    windowId: homeTournaments.performanceQual.windowId,
  },
  {
    end: homeTournaments.performanceFinal.end,
    name: "Finale",
    start: homeTournaments.performanceFinal.start,
    windowId: homeTournaments.performanceFinal.windowId,
  },
];

const windowGroups = new Map<string, TournamentWindowGroup>([
  [
    homeTournaments.fncsDay1.windowId,
    { id: homeTournaments.fncsDay1.tournamentId, windows: fncsWindows },
  ],
  [
    homeTournaments.fncsDay2.windowId,
    { id: homeTournaments.fncsDay2.tournamentId, windows: fncsWindows },
  ],
  [
    homeTournaments.fncsFinal.windowId,
    { id: homeTournaments.fncsFinal.tournamentId, windows: fncsWindows },
  ],
  [
    homeTournaments.performanceQual.windowId,
    {
      id: homeTournaments.performanceQual.tournamentId,
      windows: performanceWindows,
    },
  ],
  [
    homeTournaments.performanceFinal.windowId,
    {
      id: homeTournaments.performanceFinal.tournamentId,
      windows: performanceWindows,
    },
  ],
  [
    homeTournaments.reloadFinal.windowId,
    {
      id: homeTournaments.reloadFinal.tournamentId,
      windows: [
        {
          end: homeTournaments.reloadFinal.end,
          name: "Finale",
          start: homeTournaments.reloadFinal.start,
          windowId: homeTournaments.reloadFinal.windowId,
        },
      ],
    },
  ],
]);

const windowDetails = new Map<string, TournamentWindowDetail>([
  [
    homeTournaments.fncsDay1.windowId,
    {
      cast: {
        youtube: {
          channelName: "HavoK",
          link: "https://www.youtube.com/@HvKGGs",
        },
        twitch: {
          channelName: "Wazz",
          link: "https://www.twitch.tv/wazz",
        },
      },
      description:
        "La finale du Major Summit est un evenement sur trois jours compose de 20 parties. Cette version demo reprend le naming et les medias du dataset enrichi pour donner un rendu beaucoup plus proche du reel.",
      end: homeTournaments.fncsDay1.end,
      images: images.fncs,
      matchCap: 6,
      mode: "Battle Royale",
      playerQual: players.slice(0, 4).map((player) => ({
        accountId: player.id,
        image: player.image,
        isThisPlayerQual: true,
        playerName: player.name,
      })),
      prizes: [],
      requiresQualification: true,
      scoreRules: {
        id: "ScoringRules_Bratwurst",
        leaderboardDefId: "Bratwurst_MainLeaderboardDef",
        rule: [
          { type: "PLACEMENT_STAT_INDEX", value: 1, points: 9 },
          { type: "PLACEMENT_STAT_INDEX", value: 2, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 3, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 4, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 5, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 6, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 7, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 8, points: 2 },
          { type: "TEAM_ELIMS_STAT_INDEX", value: 1, points: 1 },
        ],
      },
      start: homeTournaments.fncsDay1.start,
      teamFormat: "Duo",
      tournamentId: homeTournaments.fncsDay1.tournamentId,
      tournamentName: homeTournaments.fncsDay1.tournamentName,
      type: "Inconnu",
      windowId: homeTournaments.fncsDay1.windowId,
    },
  ],
  [
    homeTournaments.fncsDay2.windowId,
    {
      cast: {
        youtube: {
          channelName: "HavoK",
          link: "https://www.youtube.com/@HvKGGs",
        },
        twitch: {
          channelName: "Wazz",
          link: "https://www.twitch.tv/wazz",
        },
      },
      description:
        "Jour 2 de la Fortnite Championship Series. Les resultats de demo ci-dessous utilisent de vrais joueurs Havok du fichier enriched et des statistiques plausibles pour la presentation.",
      end: homeTournaments.fncsDay2.end,
      images: images.fncs,
      matchCap: 6,
      mode: "Battle Royale",
      playerQual: players.slice(0, 6).map((player, index) => ({
        accountId: player.id,
        image: player.image,
        isThisPlayerQual: index < 4,
        playerName: player.name,
      })),
      prizes: [
        {
          qualificationWindowName: "Fortnite Championship Series (Finale)",
          rewardTypeDisplayName: "Qualification",
          threshold: 25,
          value: homeTournaments.fncsFinal.windowId,
        },
      ],
      requiresQualification: true,
      scoreRules: {
        id: "ScoringRules_Bratwurst",
        leaderboardDefId: "Bratwurst_MainLeaderboardDef",
        rule: [
          { type: "PLACEMENT_STAT_INDEX", value: 1, points: 9 },
          { type: "PLACEMENT_STAT_INDEX", value: 2, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 3, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 4, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 5, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 6, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 7, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 8, points: 2 },
          { type: "TEAM_ELIMS_STAT_INDEX", value: 1, points: 1 },
        ],
      },
      start: homeTournaments.fncsDay2.start,
      teamFormat: "Duo",
      tournamentId: homeTournaments.fncsDay2.tournamentId,
      tournamentName: homeTournaments.fncsDay2.tournamentName,
      type: "Inconnu",
      windowId: homeTournaments.fncsDay2.windowId,
    },
  ],
  [
    homeTournaments.fncsFinal.windowId,
    {
      cast: {
        youtube: {
          channelName: "HavoK",
          link: "https://www.youtube.com/@HvKGGs",
        },
        twitch: {
          channelName: "Wazz",
          link: "https://www.twitch.tv/wazz",
        },
      },
      description:
        "Grande finale FNCS pour la demo. On garde le branding, les liens de cast et les joueurs Havok reels afin que les captures et la navigation aient une vraie allure de production.",
      end: homeTournaments.fncsFinal.end,
      images: images.fncs,
      matchCap: 8,
      mode: "Battle Royale",
      playerQual: players.slice(0, 6).map((player, index) => ({
        accountId: player.id,
        image: player.image,
        isThisPlayerQual: index < 4,
        playerName: player.name,
      })),
      prizes: [
        {
          currency: "EUR",
          price: 1200,
          rewardTypeDisplayName: "Cash prize",
          threshold: 1,
        },
        {
          currency: "EUR",
          price: 600,
          rewardTypeDisplayName: "Cash prize",
          threshold: 2,
        },
      ],
      requiresQualification: true,
      scoreRules: {
        id: "ScoringRules_Bratwurst",
        leaderboardDefId: "Bratwurst_MainLeaderboardDef",
        rule: [
          { type: "PLACEMENT_STAT_INDEX", value: 1, points: 9 },
          { type: "PLACEMENT_STAT_INDEX", value: 2, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 3, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 4, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 5, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 6, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 7, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 8, points: 2 },
          { type: "TEAM_ELIMS_STAT_INDEX", value: 1, points: 1 },
        ],
      },
      start: homeTournaments.fncsFinal.start,
      teamFormat: "Duo",
      tournamentId: homeTournaments.fncsFinal.tournamentId,
      tournamentName: homeTournaments.fncsFinal.tournamentName,
      type: "Inconnu",
      windowId: homeTournaments.fncsFinal.windowId,
    },
  ],
  [
    homeTournaments.performanceQual.windowId,
    {
      cast: {
        youtube: {
          channelName: "HavoK",
          link: "https://www.youtube.com/@HvKGGs",
        },
        twitch: {
          channelName: "Wazz",
          link: "https://www.twitch.tv/wazz",
        },
      },
      description:
        "Vous devez etre dans la division 1 FNCS pour participer a cet evenement. Cette description est inspiree directement du dataset enrichi, avec un rendu simplifie pour la demo mobile.",
      end: homeTournaments.performanceQual.end,
      images: images.performance,
      matchCap: 8,
      mode: "Battle Royale",
      playerQual: players.map((player) => ({
        accountId: player.id,
        image: player.image,
        isThisPlayerQual: true,
        playerName: player.name,
      })),
      prizes: [
        {
          qualificationWindowName:
            "Evaluation des performances de Fortnite (Finale)",
          quantity: 1,
          rewardTypeDisplayName: "Qualification",
          scoringTypeDisplayName: "Top",
          threshold: 50,
          value: homeTournaments.performanceFinal.windowId,
        },
      ],
      requiresQualification: true,
      scoreRules: {
        id: "ScoringRules_DuosDivisionalCupTrial",
        leaderboardDefId:
          "S37_PerformanceEvaluation_Round1_DefaultLeaderboardDef",
        rule: [
          { type: "PLACEMENT_STAT_INDEX", value: 1, points: 9 },
          { type: "PLACEMENT_STAT_INDEX", value: 2, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 3, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 4, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 5, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 6, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 7, points: 2 },
          { type: "PLACEMENT_STAT_INDEX", value: 8, points: 2 },
          { type: "TEAM_ELIMS_STAT_INDEX", value: 1, points: 1 },
        ],
      },
      start: homeTournaments.performanceQual.start,
      teamFormat: "Duo",
      tournamentId: homeTournaments.performanceQual.tournamentId,
      tournamentName: homeTournaments.performanceQual.tournamentName,
      type: "Workshop Cup",
      windowId: homeTournaments.performanceQual.windowId,
    },
  ],
  [
    homeTournaments.performanceFinal.windowId,
    {
      cast: {
        youtube: {
          channelName: "HavoK",
          link: "https://www.youtube.com/@HvKGGs",
        },
        twitch: {
          channelName: "Wazz",
          link: "https://www.twitch.tv/wazz",
        },
      },
      description:
        "Finale du tournoi d evaluation des performances. Les donnees de classement sont simulees mais construites autour des vrais joueurs Havok extraits de enriched.",
      end: homeTournaments.performanceFinal.end,
      images: images.performance,
      matchCap: 6,
      mode: "Battle Royale",
      playerQual: players.slice(0, 4).map((player) => ({
        accountId: player.id,
        image: player.image,
        isThisPlayerQual: true,
        playerName: player.name,
      })),
      prizes: [
        {
          currency: "EUR",
          price: 350,
          rewardTypeDisplayName: "Cash prize",
          threshold: 1,
        },
      ],
      requiresQualification: true,
      scoreRules: {
        id: "ScoringRules_DuosDivisionalCupTrial",
        leaderboardDefId:
          "S37_PerformanceEvaluation_Round2_DefaultLeaderboardDef",
        rule: [
          { type: "PLACEMENT_STAT_INDEX", value: 1, points: 9 },
          { type: "PLACEMENT_STAT_INDEX", value: 2, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 3, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 4, points: 4 },
          { type: "PLACEMENT_STAT_INDEX", value: 5, points: 4 },
          { type: "TEAM_ELIMS_STAT_INDEX", value: 1, points: 1 },
        ],
      },
      start: homeTournaments.performanceFinal.start,
      teamFormat: "Duo",
      tournamentId: homeTournaments.performanceFinal.tournamentId,
      tournamentName: homeTournaments.performanceFinal.tournamentName,
      type: "Workshop Cup",
      windowId: homeTournaments.performanceFinal.windowId,
    },
  ],
  [
    homeTournaments.reloadFinal.windowId,
    {
      cast: null,
      description:
        "Coupe victoire duos en mode Recharge. Cette window est surtout la pour offrir un historique joueur et un event card inspires de enriched.",
      end: homeTournaments.reloadFinal.end,
      images: images.reload,
      matchCap: 3,
      mode: "Reload",
      playerQual: players.slice(0, 2).map((player) => ({
        accountId: player.id,
        image: player.image,
        isThisPlayerQual: true,
        playerName: player.name,
      })),
      prizes: [
        {
          currency: "EUR",
          price: 250,
          rewardTypeDisplayName: "Cash prize",
          threshold: 1,
        },
      ],
      requiresQualification: false,
      scoreRules: {
        rule: [
          { type: "PLACEMENT_STAT_INDEX", value: 1, points: 12 },
          { type: "PLACEMENT_STAT_INDEX", value: 2, points: 8 },
          { type: "PLACEMENT_STAT_INDEX", value: 3, points: 6 },
          { type: "TEAM_ELIMS_STAT_INDEX", value: 1, points: 2 },
        ],
      },
      start: homeTournaments.reloadFinal.start,
      teamFormat: "Duo",
      tournamentId: homeTournaments.reloadFinal.tournamentId,
      tournamentName: homeTournaments.reloadFinal.tournamentName,
      type: "Reload Cup",
      windowId: homeTournaments.reloadFinal.windowId,
    },
  ],
]);

const trackedPlayers = players.map((player) => ({
  accountId: player.id,
  image: player.image,
  name: player.name,
}));

const resultsByKey = new Map<DemoResultKey, TournamentResults>([
  [
    `${homeTournaments.fncsDay2.windowId}:normal:0`,
    {
      end: homeTournaments.fncsDay2.end,
      leaderboard: {
        id: "lb-fncs-day2",
        qualStatus: [
          {
            accountId: players[0].id,
            labels: ["Qualifie"],
            name: players[0].name,
            points: 181,
            rank: 8,
          },
          {
            accountId: players[1].id,
            labels: ["Qualifie"],
            name: players[1].name,
            points: 181,
            rank: 8,
          },
          {
            accountId: players[2].id,
            labels: ["Top 25"],
            name: players[2].name,
            points: 164,
            rank: 17,
          },
          {
            accountId: players[3].id,
            labels: ["Top 25"],
            name: players[3].name,
            points: 152,
            rank: 23,
          },
        ],
        results: [
          {
            accountIds: [players[0].id, players[1].id],
            avrgKill: 4.7,
            avrgPlacement: 7.1,
            avrgPoints: 30.2,
            kills: 28,
            labels: ["Havok"],
            names: ["havok pixie sc", "havok swizzy"],
            nbGamesPlayed: 6,
            points: 181,
            pointsKills: 28,
            pointsTop: 153,
            rank: 8,
            sessionHistory: buildSessionHistory(
              -9,
              [5, 12, 4, 8, 2, 9],
              [5, 3, 6, 4, 5, 5],
            ),
            top15s: 5,
            top5s: 3,
            wins: 0,
          },
          {
            accountIds: [players[3].id, players[4].id],
            avrgKill: 4.2,
            avrgPlacement: 10.4,
            avrgPoints: 25.3,
            kills: 25,
            labels: ["Havok"],
            names: ["havok pablo sc", "Havok Tjino"],
            nbGamesPlayed: 6,
            points: 152,
            pointsKills: 25,
            pointsTop: 127,
            rank: 23,
            sessionHistory: buildSessionHistory(
              -8,
              [11, 9, 17, 6, 15, 4],
              [4, 4, 3, 6, 2, 6],
            ),
            top15s: 4,
            top5s: 1,
            wins: 0,
          },
          {
            accountIds: [players[2].id, players[5].id],
            avrgKill: 4.4,
            avrgPlacement: 9.8,
            avrgPoints: 27.3,
            kills: 26,
            labels: ["Havok"],
            names: ["havok wx sc", "havok pixx"],
            nbGamesPlayed: 6,
            points: 164,
            pointsKills: 26,
            pointsTop: 138,
            rank: 17,
            sessionHistory: buildSessionHistory(
              -7,
              [7, 10, 6, 14, 12, 5],
              [4, 5, 4, 3, 3, 7],
            ),
            top15s: 5,
            top5s: 2,
            wins: 0,
          },
          {
            accountId: players[6].id,
            avrgKill: 3.5,
            avrgPlacement: 15.2,
            avrgPoints: 18.6,
            kills: 21,
            labels: ["Havok"],
            names: ["Havok IDrop"],
            nbGamesPlayed: 6,
            points: 112,
            pointsKills: 21,
            pointsTop: 91,
            rank: 41,
            sessionHistory: buildSessionHistory(
              -6,
              [16, 14, 18, 12, 19, 13],
              [4, 3, 2, 5, 3, 4],
            ),
            top15s: 3,
            top5s: 0,
            wins: 0,
          },
        ],
        totalPages: 2,
        windowId: homeTournaments.fncsDay2.windowId,
      },
      players: trackedPlayers,
      start: homeTournaments.fncsDay2.start,
      tournamentId: homeTournaments.fncsDay2.tournamentId,
      tournamentName: homeTournaments.fncsDay2.tournamentName,
      windowId: homeTournaments.fncsDay2.windowId,
    },
  ],
  [
    `${homeTournaments.fncsDay2.windowId}:normal:1`,
    {
      end: homeTournaments.fncsDay2.end,
      leaderboard: {
        id: "lb-fncs-day2",
        qualStatus: [],
        results: [
          {
            names: ["Team Nebula", "Team Frost"],
            nbGamesPlayed: 6,
            points: 104,
            rank: 42,
            sessionHistory: buildSessionHistory(
              -5,
              [18, 22, 14, 15, 11, 20],
              [2, 1, 4, 3, 5, 2],
            ),
            top15s: 2,
            top5s: 0,
            wins: 0,
          },
          {
            names: ["Team Orbit", "Team Pulse"],
            nbGamesPlayed: 6,
            points: 97,
            rank: 47,
            sessionHistory: buildSessionHistory(
              -4,
              [21, 17, 19, 16, 20, 15],
              [1, 3, 2, 2, 1, 4],
            ),
            top15s: 1,
            top5s: 0,
            wins: 0,
          },
        ],
        totalPages: 2,
        windowId: homeTournaments.fncsDay2.windowId,
      },
      players: trackedPlayers,
      start: homeTournaments.fncsDay2.start,
      tournamentId: homeTournaments.fncsDay2.tournamentId,
      tournamentName: homeTournaments.fncsDay2.tournamentName,
      windowId: homeTournaments.fncsDay2.windowId,
    },
  ],
  [
    `${homeTournaments.fncsDay2.windowId}:cumulative:0`,
    {
      end: homeTournaments.fncsDay2.end,
      leaderboard: {
        id: "lb-fncs-day2-cumulative",
        qualStatus: [
          {
            accountId: players[0].id,
            labels: ["Qualifie"],
            name: players[0].name,
            points: 297,
            rank: 6,
          },
          {
            accountId: players[1].id,
            labels: ["Qualifie"],
            name: players[1].name,
            points: 297,
            rank: 6,
          },
          {
            accountId: players[2].id,
            labels: ["Top 15"],
            name: players[2].name,
            points: 264,
            rank: 13,
          },
        ],
        results: [
          {
            accountId: players[0].id,
            avrgKill: 4.8,
            avrgPlacement: 6.3,
            avrgPoints: 33,
            kills: 41,
            labels: ["Leader"],
            names: [players[0].name],
            nbGamesPlayed: 9,
            points: 297,
            pointsKills: 41,
            pointsTop: 256,
            rank: 6,
            sessionHistory: buildSessionHistory(
              -18,
              [4, 7, 3, 8, 5, 2],
              [5, 4, 6, 3, 5, 4],
            ),
            top15s: 8,
            top5s: 4,
            wins: 0,
          },
          {
            accountId: players[1].id,
            avrgKill: 4.9,
            avrgPlacement: 6.6,
            avrgPoints: 33,
            kills: 43,
            labels: ["Leader"],
            names: [players[1].name],
            nbGamesPlayed: 9,
            points: 297,
            pointsKills: 43,
            pointsTop: 254,
            rank: 6,
            sessionHistory: buildSessionHistory(
              -17,
              [8, 6, 5, 4, 7, 3],
              [4, 5, 6, 3, 4, 5],
            ),
            top15s: 8,
            top5s: 4,
            wins: 0,
          },
          {
            accountId: players[2].id,
            avrgKill: 4.3,
            avrgPlacement: 8.4,
            avrgPoints: 29.3,
            kills: 36,
            labels: ["Havok"],
            names: [players[2].name],
            nbGamesPlayed: 9,
            points: 264,
            pointsKills: 36,
            pointsTop: 228,
            rank: 13,
            sessionHistory: buildSessionHistory(
              -16,
              [10, 7, 9, 11, 5, 6],
              [3, 4, 5, 3, 6, 4],
            ),
            top15s: 7,
            top5s: 2,
            wins: 0,
          },
        ],
        totalPages: 1,
        windowId: homeTournaments.fncsDay2.windowId,
      },
      players: trackedPlayers,
      start: homeTournaments.fncsDay2.start,
      tournamentId: homeTournaments.fncsDay2.tournamentId,
      tournamentName: homeTournaments.fncsDay2.tournamentName,
      windowId: homeTournaments.fncsDay2.windowId,
    },
  ],
  [
    `${homeTournaments.fncsDay1.windowId}:normal:0`,
    {
      end: homeTournaments.fncsDay1.end,
      leaderboard: {
        id: "lb-fncs-day1",
        qualStatus: [
          {
            accountId: players[0].id,
            labels: ["Top 10"],
            name: players[0].name,
            points: 139,
            rank: 10,
          },
          {
            accountId: players[1].id,
            labels: ["Top 10"],
            name: players[1].name,
            points: 139,
            rank: 10,
          },
        ],
        results: [
          {
            accountIds: [players[0].id, players[1].id],
            kills: 22,
            labels: ["Havok"],
            names: ["havok pixie sc", "havok swizzy"],
            nbGamesPlayed: 6,
            points: 139,
            rank: 10,
            sessionHistory: buildSessionHistory(
              -40,
              [9, 7, 6, 12, 8, 5],
              [4, 3, 5, 2, 4, 4],
            ),
            top15s: 5,
            top5s: 1,
            wins: 0,
          },
          {
            accountIds: [players[3].id, players[4].id],
            kills: 18,
            labels: ["Havok"],
            names: ["havok pablo sc", "Havok Tjino"],
            nbGamesPlayed: 6,
            points: 128,
            rank: 18,
            sessionHistory: buildSessionHistory(
              -39,
              [13, 8, 11, 10, 9, 14],
              [3, 4, 2, 4, 3, 2],
            ),
            top15s: 4,
            top5s: 0,
            wins: 0,
          },
        ],
        totalPages: 1,
        windowId: homeTournaments.fncsDay1.windowId,
      },
      players: trackedPlayers,
      start: homeTournaments.fncsDay1.start,
      tournamentId: homeTournaments.fncsDay1.tournamentId,
      tournamentName: homeTournaments.fncsDay1.tournamentName,
      windowId: homeTournaments.fncsDay1.windowId,
    },
  ],
  [
    `${homeTournaments.performanceQual.windowId}:normal:0`,
    {
      end: homeTournaments.performanceQual.end,
      leaderboard: {
        id: "lb-performance-qual",
        qualStatus: players.slice(0, 6).map((player, index) => ({
          accountId: player.id,
          labels: index < 4 ? ["Qualifie"] : ["Bubble"],
          name: player.name,
          points: 90 - index * 6,
          rank: index + 7,
        })),
        results: [
          {
            accountIds: [players[0].id, players[1].id],
            avrgKill: 6.1,
            avrgPlacement: 5.3,
            avrgPoints: 15.5,
            kills: 49,
            labels: ["Havok"],
            names: ["havok pixie sc", "havok swizzy"],
            nbGamesPlayed: 8,
            points: 124,
            pointsKills: 49,
            pointsTop: 75,
            rank: 7,
            sessionHistory: buildSessionHistory(
              22,
              [5, 7, 3, 8, 4, 9, 6, 2],
              [7, 6, 8, 4, 6, 5, 7, 6],
            ),
            top15s: 8,
            top5s: 3,
            wins: 0,
          },
          {
            accountIds: [players[2].id, players[5].id],
            avrgKill: 5.4,
            avrgPlacement: 7.4,
            avrgPoints: 13.2,
            kills: 43,
            labels: ["Havok"],
            names: ["havok wx sc", "havok pixx"],
            nbGamesPlayed: 8,
            points: 106,
            pointsKills: 43,
            pointsTop: 63,
            rank: 14,
            sessionHistory: buildSessionHistory(
              23,
              [8, 10, 5, 7, 6, 12, 4, 11],
              [5, 4, 7, 6, 5, 4, 7, 5],
            ),
            top15s: 8,
            top5s: 2,
            wins: 0,
          },
          {
            accountIds: [players[3].id, players[4].id],
            avrgKill: 5.2,
            avrgPlacement: 8.6,
            avrgPoints: 12.1,
            kills: 38,
            labels: ["Havok"],
            names: ["havok pablo sc", "Havok Tjino"],
            nbGamesPlayed: 8,
            points: 97,
            pointsKills: 38,
            pointsTop: 59,
            rank: 19,
            sessionHistory: buildSessionHistory(
              24,
              [11, 9, 8, 14, 5, 10, 7, 13],
              [4, 5, 6, 3, 7, 4, 5, 4],
            ),
            top15s: 7,
            top5s: 1,
            wins: 0,
          },
        ],
        totalPages: 1,
        windowId: homeTournaments.performanceQual.windowId,
      },
      players: trackedPlayers,
      start: homeTournaments.performanceQual.start,
      tournamentId: homeTournaments.performanceQual.tournamentId,
      tournamentName: homeTournaments.performanceQual.tournamentName,
      windowId: homeTournaments.performanceQual.windowId,
    },
  ],
  [
    `${homeTournaments.performanceFinal.windowId}:normal:0`,
    {
      end: homeTournaments.performanceFinal.end,
      leaderboard: {
        id: "lb-performance-final",
        qualStatus: players.slice(0, 4).map((player, index) => ({
          accountId: player.id,
          labels: index < 2 ? ["Cash"] : ["Top 10"],
          name: player.name,
          points: 71 - index * 5,
          rank: index + 3,
        })),
        results: [
          {
            accountIds: [players[0].id, players[1].id],
            kills: 18,
            labels: ["Havok"],
            names: ["havok pixie sc", "havok swizzy"],
            nbGamesPlayed: 4,
            points: 71,
            rank: 3,
            sessionHistory: buildSessionHistory(28, [4, 8, 3, 6], [5, 4, 6, 3]),
            top15s: 4,
            top5s: 2,
            wins: 0,
          },
          {
            accountIds: [players[3].id, players[4].id],
            kills: 16,
            labels: ["Havok"],
            names: ["havok pablo sc", "Havok Tjino"],
            nbGamesPlayed: 4,
            points: 61,
            rank: 6,
            sessionHistory: buildSessionHistory(29, [9, 4, 7, 5], [3, 5, 4, 4]),
            top15s: 4,
            top5s: 1,
            wins: 0,
          },
        ],
        totalPages: 1,
        windowId: homeTournaments.performanceFinal.windowId,
      },
      players: trackedPlayers,
      start: homeTournaments.performanceFinal.start,
      tournamentId: homeTournaments.performanceFinal.tournamentId,
      tournamentName: homeTournaments.performanceFinal.tournamentName,
      windowId: homeTournaments.performanceFinal.windowId,
    },
  ],
  [
    `${homeTournaments.reloadFinal.windowId}:normal:0`,
    {
      end: homeTournaments.reloadFinal.end,
      leaderboard: {
        id: "lb-reload-final",
        qualStatus: [
          {
            accountId: players[0].id,
            labels: ["Victoire"],
            name: players[0].name,
            points: 100,
            rank: 6,
          },
        ],
        results: [
          {
            accountIds: [players[0].id, players[1].id],
            avrgKill: 12.3,
            avrgPlacement: 2.0,
            avrgPoints: 33.3,
            kills: 37,
            labels: ["Havok"],
            names: ["havok swizzy", "havok pixie sc"],
            nbGamesPlayed: 3,
            points: 100,
            pointsKills: 74,
            pointsTop: 26,
            rank: 6,
            sessionHistory: buildSessionHistory(-280, [3, 1, 2], [11, 14, 12]),
            top15s: 3,
            top5s: 3,
            wins: 1,
          },
        ],
        totalPages: 1,
        windowId: homeTournaments.reloadFinal.windowId,
      },
      players: trackedPlayers.slice(0, 2),
      start: homeTournaments.reloadFinal.start,
      tournamentId: homeTournaments.reloadFinal.tournamentId,
      tournamentName: homeTournaments.reloadFinal.tournamentName,
      windowId: homeTournaments.reloadFinal.windowId,
    },
  ],
]);

const playerSummaries: PlayerSummary[] = players.map((player) => ({
  country: player.country,
  countryFlag: player.countryFlag,
  id: player.id,
  image: player.image,
  name: player.name,
  pseudo: player.pseudo,
}));

const playerTournamentHistory = new Map<
  string,
  PlayerProfile["lastTournaments"]
>([
  [
    players[0].id,
    [
      {
        end: homeTournaments.fncsDay2.end,
        gameMode: homeTournaments.fncsDay2.gameMode,
        image: homeTournaments.fncsDay2.image,
        result: {
          kills: 28,
          nbGamesPlayed: 6,
          points: 181,
          rank: 8,
          top5s: 3,
          wins: 0,
        },
        start: homeTournaments.fncsDay2.start,
        teamFormat: homeTournaments.fncsDay2.teamFormat,
        tournamentId: homeTournaments.fncsDay2.tournamentId,
        tournamentName: homeTournaments.fncsDay2.tournamentName,
        windowId: homeTournaments.fncsDay2.windowId,
      },
      {
        end: homeTournaments.reloadFinal.end,
        gameMode: homeTournaments.reloadFinal.gameMode,
        image: homeTournaments.reloadFinal.image,
        result: {
          kills: 37,
          nbGamesPlayed: 3,
          points: 100,
          rank: 6,
          top5s: 1,
          wins: 1,
        },
        start: homeTournaments.reloadFinal.start,
        teamFormat: homeTournaments.reloadFinal.teamFormat,
        tournamentId: homeTournaments.reloadFinal.tournamentId,
        tournamentName: homeTournaments.reloadFinal.tournamentName,
        windowId: homeTournaments.reloadFinal.windowId,
      },
    ],
  ],
  [
    players[1].id,
    [
      {
        end: homeTournaments.fncsDay2.end,
        gameMode: homeTournaments.fncsDay2.gameMode,
        image: homeTournaments.fncsDay2.image,
        result: {
          kills: 28,
          nbGamesPlayed: 6,
          points: 181,
          rank: 8,
          top5s: 3,
          wins: 0,
        },
        start: homeTournaments.fncsDay2.start,
        teamFormat: homeTournaments.fncsDay2.teamFormat,
        tournamentId: homeTournaments.fncsDay2.tournamentId,
        tournamentName: homeTournaments.fncsDay2.tournamentName,
        windowId: homeTournaments.fncsDay2.windowId,
      },
      {
        end: homeTournaments.performanceQual.end,
        gameMode: homeTournaments.performanceQual.gameMode,
        image: homeTournaments.performanceQual.image,
        result: {
          kills: 49,
          nbGamesPlayed: 8,
          points: 124,
          rank: 7,
          top5s: 3,
          wins: 0,
        },
        start: homeTournaments.performanceQual.start,
        teamFormat: homeTournaments.performanceQual.teamFormat,
        tournamentId: homeTournaments.performanceQual.tournamentId,
        tournamentName: homeTournaments.performanceQual.tournamentName,
        windowId: homeTournaments.performanceQual.windowId,
      },
    ],
  ],
]);

for (const [index, player] of players.entries()) {
  player.lastTournaments = playerTournamentHistory.get(player.id) ?? [
    {
      end: homeTournaments.performanceQual.end,
      gameMode: homeTournaments.performanceQual.gameMode,
      image: homeTournaments.performanceQual.image,
      result: {
        kills: 18 + index * 3,
        nbGamesPlayed: 8,
        points: 96 - index * 7,
        rank: 10 + index * 4,
        top5s: index < 3 ? 1 : 0,
        wins: 0,
      },
      start: homeTournaments.performanceQual.start,
      teamFormat: homeTournaments.performanceQual.teamFormat,
      tournamentId: homeTournaments.performanceQual.tournamentId,
      tournamentName: homeTournaments.performanceQual.tournamentName,
      windowId: homeTournaments.performanceQual.windowId,
    },
  ];
}

const homeData: HomeData = {
  actu: [
    {
      date: isoFromNow({ days: -12 }),
      description:
        "Inspire des elements qui ont marque l histoire de HavoK, ce maillot fusionne puissance et elegance. Cette news reprend directement le ton et le visuel presents dans le dataset enriched.",
      id: "actu-demo-1",
      image: images.actu,
      link: "x.com",
      name: "App Havok",
      title: "App Havok",
    },
  ],
  lastPlayedWindow: {
    places: [
      {
        accountId: players[0].id,
        name: players[0].name,
        result: { kills: 22, nbGamesPlayed: 6, points: 139, rank: 10, wins: 0 },
      },
      {
        accountId: players[1].id,
        name: players[1].name,
        result: { kills: 22, nbGamesPlayed: 6, points: 139, rank: 10, wins: 0 },
      },
      {
        accountId: players[3].id,
        name: players[3].name,
        result: { kills: 18, nbGamesPlayed: 6, points: 128, rank: 18, wins: 0 },
      },
      {
        accountId: players[4].id,
        name: players[4].name,
        result: { kills: 18, nbGamesPlayed: 6, points: 128, rank: 18, wins: 0 },
      },
    ],
    tournament: homeTournaments.fncsDay1,
  },
  liveTournament: homeTournaments.fncsDay2,
  upcomingTournaments: [
    homeTournaments.fncsFinal,
    homeTournaments.performanceQual,
    homeTournaments.performanceFinal,
  ],
};

function withDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), DEMO_DELAY_MS);
  });
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getWindowFallback(windowId: string): TournamentWindowGroupItem[] {
  return [
    {
      end: homeTournaments.fncsDay2.end,
      name: "Window",
      start: homeTournaments.fncsDay2.start,
      windowId,
    },
  ];
}

export const demoApi = {
  getCalendar() {
    return withDelay(cloneValue(calendarTournaments));
  },
  getHealth() {
    const health: ApiHealth = {
      message: "Demo data enabled from enriched dataset",
      status: "ok",
      success: true,
    };

    return withDelay(health);
  },
  getHome() {
    return withDelay(cloneValue(homeData));
  },
  getPlayer(playerId: string) {
    const player = players.find((item) => item.id === playerId) ?? null;
    return withDelay(cloneValue(player));
  },
  getPlayers() {
    return withDelay(cloneValue(playerSummaries));
  },
  getTournamentResults(windowId: string, page = 0, cumulative = false) {
    const key: DemoResultKey = `${windowId}:${cumulative ? "cumulative" : "normal"}:${page}`;
    const result =
      resultsByKey.get(key) ?? resultsByKey.get(`${windowId}:normal:0`) ?? null;
    return withDelay(cloneValue(result));
  },
  getTournamentWindow(windowId: string) {
    const detail = windowDetails.get(windowId) ?? null;
    return withDelay(cloneValue(detail));
  },
  getTournamentWindowGroup(windowId: string) {
    const group =
      windowGroups.get(windowId) ??
      ({
        id: windowId,
        windows: getWindowFallback(windowId),
      } satisfies TournamentWindowGroup);

    return withDelay(cloneValue(group));
  },
};
