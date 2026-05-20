import type {
  CalendarTournament,
  HomeTournament,
  PlayerTournament,
} from "@/src/types/api";

export type TournamentStatus = "live" | "past" | "upcoming";

const dateFormatter = new Intl.DateTimeFormat("fr-CH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-CH", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
});

const integerFormatter = new Intl.NumberFormat("fr-CH");

type TournamentListItem = CalendarTournament | HomeTournament | PlayerTournament;

export function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Date inconnue";
  }

  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) {
    return "Date inconnue";
  }

  return dateTimeFormatter.format(new Date(date));
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  if (!start && !end) {
    return "Date inconnue";
  }

  if (!end) {
    return formatDateTime(start);
  }

  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
}

export function formatCount(value: number | null | undefined, fallback = "-") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return integerFormatter.format(value);
}

export function formatPoints(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `${formatCount(value)} pts`;
}

export function formatPlacement(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return `#${formatCount(value)}`;
}

export function getTournamentLabel(
  tournament: Partial<HomeTournament> &
    Partial<CalendarTournament> &
    Partial<PlayerTournament>,
) {
  return tournament.tournamentName ?? tournament.name ?? "Tournoi";
}

export function getTournamentStatus(
  start: string | null | undefined,
  end: string | null | undefined,
): TournamentStatus {
  const now = Date.now();
  const startTime = start ? new Date(start).getTime() : 0;
  const endTime = end ? new Date(end).getTime() : 0;

  if (startTime && endTime && now >= startTime && now <= endTime) {
    return "live";
  }

  if (startTime && startTime > now) {
    return "upcoming";
  }

  return "past";
}

export function getTournamentStatusLabel(status: TournamentStatus) {
  if (status === "live") {
    return "Live";
  }

  if (status === "upcoming") {
    return "À venir";
  }

  return "Terminé";
}

export function groupTournamentsByStatus<T extends TournamentListItem>(items: T[]) {
  const live: T[] = [];
  const upcoming: T[] = [];
  const past: T[] = [];

  for (const item of items) {
    const status = getTournamentStatus(item.start, item.end);

    if (status === "live") {
      live.push(item);
      continue;
    }

    if (status === "upcoming") {
      upcoming.push(item);
      continue;
    }

    past.push(item);
  }

  live.sort((first, second) => {
    return new Date(first.start).getTime() - new Date(second.start).getTime();
  });
  upcoming.sort((first, second) => {
    return new Date(first.start).getTime() - new Date(second.start).getTime();
  });
  past.sort((first, second) => {
    return new Date(second.start).getTime() - new Date(first.start).getTime();
  });

  return { live, past, upcoming };
}

export function joinPlayerNames(names: string[] | null | undefined) {
  const validNames = (names ?? []).filter(Boolean);

  if (validNames.length === 0) {
    return "Equipe inconnue";
  }

  return validNames.join(" / ");
}
