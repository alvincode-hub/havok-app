import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import {
  formatDateRange,
  formatDateTime,
  getTournamentLabel,
  sortCalendarTournaments,
} from "@/src/lib/format";
import { colors } from "@/src/theme/colors";
import type { TournamentSummary } from "@/src/types/api";

export function CalendarScreen() {
  const { data, error, isLoading, refresh } = useAsyncResource(
    () => havokApi.getCalendar()
  );

  const tournaments = sortCalendarTournaments(data?.data ?? []);
  const upcomingCount = tournaments.filter((item) => {
    return new Date(item.start).getTime() >= Date.now();
  }).length;

  return (
    <AppScreen
      subtitle="Calendrier principal alimente par `/api/tournaments/calendrier`."
      title="Calendrier"
    >
      <View style={styles.summaryRow}>
        <SummaryCard label="Evenements" value={`${tournaments.length}`} />
        <SummaryCard label="A venir" value={`${upcomingCount}`} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toutes les fenetres</Text>
        <Text style={styles.sectionDescription}>
          {data?.updatedAt
            ? `Derniere synchro: ${formatDateTime(data.updatedAt)}`
            : "Chaque carte vient directement de la reponse du serveur."}
        </Text>

        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Chargement du calendrier...</Text>
          </View>
        ) : null}

        {error ? <ErrorState message={error} onRetry={refresh} /> : null}

        {!isLoading && !error && tournaments.length === 0 ? (
          <EmptyState
            description="Le backend ne renvoie encore aucune fenetre de tournoi."
            title="Calendrier vide"
          />
        ) : null}

        {!error
          ? tournaments.map((tournament) => {
              return (
                <TournamentRow
                  key={tournament.windowId}
                  tournament={tournament}
                />
              );
            })
          : null}
      </View>
    </AppScreen>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function TournamentRow({ tournament }: { tournament: TournamentSummary }) {
  return (
    <SurfaceCard>
      <Text style={styles.cardTitle}>{getTournamentLabel(tournament)}</Text>
      <Text style={styles.cardMeta}>
        {formatDateRange(tournament.start, tournament.end)}
      </Text>
      <Text style={styles.cardMeta}>
        {tournament.teamFormat ||
          tournament.gameMode ||
          tournament.mode ||
          "Format inconnu"}
      </Text>
      <Text style={styles.cardMeta}>
        {tournament.resolvedLocation || tournament.windowId}
      </Text>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  cardMeta: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  loadingBlock: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionDescription: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  summaryCard: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 16,
  },
  summaryLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
});
