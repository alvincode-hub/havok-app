import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import {
  formatDateTime,
  getTournamentLabel,
} from "@/src/lib/format";
import { colors } from "@/src/theme/colors";
import type { TournamentSummary } from "@/src/types/api";

export function HomeScreen() {
  const { data, error, isLoading, refresh } = useAsyncResource(async () => {
    const [health, home] = await Promise.all([
      havokApi.getHealth(),
      havokApi.getHome(),
    ]);

    return {
      health,
      home,
    };
  });

  const homeData = data?.home.data ?? null;
  const liveTournament = homeData?.liveTournament ?? null;
  const lastPlayedTournament = homeData?.lastPlayedWindow?.tournament ?? null;
  const upcomingTournaments = homeData?.upcomingTournaments ?? [];
  const healthLabel =
    data?.health.message || data?.health.status || "Connexion en attente";

  return (
    <AppScreen
      subtitle="Base minimale de l'app avec la navigation principale et les appels utiles au backend."
      title="Accueil"
    >
      <View style={styles.metricsRow}>
        <MetricCard
          label="Etat serveur"
          value={error ? "Erreur" : healthLabel}
        />
        <MetricCard
          label="Tournois a venir"
          value={`${upcomingTournaments.length}`}
        />
        <MetricCard label="Actu" value={`${homeData?.actu.length ?? 0}`} />
      </View>

      {isLoading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Chargement des donnees...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.section}>
          <ErrorState message={error} onRetry={refresh} />
        </View>
      ) : null}

      {homeData ? (
        <>
          <View style={styles.section}>
            <SectionTitle
              description={
                data?.home.updatedAt
                  ? `Derniere synchro: ${formatDateTime(data.home.updatedAt)}`
                  : "Donnees chargees depuis /api/home"
              }
              title="Tournoi live"
            />

            {liveTournament ? (
              <TournamentCard tournament={liveTournament} />
            ) : (
              <EmptyState
                description="Le backend ne renvoie pas de tournoi live pour le moment."
                title="Aucun live en cours"
              />
            )}
          </View>

          <View style={styles.section}>
            <SectionTitle
              description="Apercu rapide des prochaines fenetres disponibles."
              title="Prochains tournois"
            />

            {upcomingTournaments.length > 0 ? (
              upcomingTournaments.slice(0, 3).map((tournament) => {
                return (
                  <TournamentCard
                    key={tournament.windowId}
                    tournament={tournament}
                  />
                );
              })
            ) : (
              <EmptyState
                description="Aucun tournoi a venir dans la reponse du backend."
                title="Liste vide"
              />
            )}
          </View>

          <View style={styles.section}>
            <SectionTitle
              description="Derniere fenetre exposee par les donnees du serveur."
              title="Derniere fenetre jouee"
            />

            {lastPlayedTournament ? (
              <SurfaceCard>
                <Text style={styles.cardTitle}>
                  {lastPlayedTournament.tournamentName}
                </Text>
                <Text style={styles.cardMeta}>
                  {formatDateTime(lastPlayedTournament.start)}
                </Text>
                <Text style={styles.cardMeta}>
                  {lastPlayedTournament.mode || "Mode inconnu"}
                </Text>
              </SurfaceCard>
            ) : (
              <EmptyState
                description="Le backend n'a pas encore fourni de derniere fenetre jouee."
                title="Aucune donnee"
              />
            )}
          </View>
        </>
      ) : null}
    </AppScreen>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function SectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function TournamentCard({ tournament }: { tournament: TournamentSummary }) {
  return (
    <SurfaceCard>
      <Text style={styles.cardTitle}>{getTournamentLabel(tournament)}</Text>
      <Text style={styles.cardMeta}>{formatDateTime(tournament.start)}</Text>
      <Text style={styles.cardMeta}>
        {tournament.teamFormat ||
          tournament.gameMode ||
          tournament.mode ||
          "Format inconnu"}
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
  metricCard: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 98,
    padding: 16,
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "600",
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionDescription: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
});
