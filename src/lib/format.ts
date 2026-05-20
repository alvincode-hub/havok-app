import type { TournamentSummary } from "@/src/types/api";

const dateFormatter = new Intl.DateTimeFormat("fr-CH", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-CH", {
  dateStyle: "medium",
  timeStyle: "short",
});

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

export function formatDateRange(start: string, end: string) {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
}

export function formatMetric(
  value: number | null | undefined,
  fallback = "-"
) {
  if (value === null || value === undefined) {
    return fallback;
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function getTournamentLabel(tournament: TournamentSummary) {
  return tournament.tournamentName || tournament.name || "Tournoi";
}

export function sortCalendarTournaments(items: TournamentSummary[]) {
  const now = Date.now();

  return [...items].sort((first, second) => {
    const firstDate = new Date(first.start).getTime();
    const secondDate = new Date(second.start).getTime();
    const firstIsUpcoming = firstDate >= now;
    const secondIsUpcoming = secondDate >= now;

    if (firstIsUpcoming && secondIsUpcoming) {
      return firstDate - secondDate;
    }

    if (!firstIsUpcoming && !secondIsUpcoming) {
      return secondDate - firstDate;
    }

    return firstIsUpcoming ? -1 : 1;
  });
}
