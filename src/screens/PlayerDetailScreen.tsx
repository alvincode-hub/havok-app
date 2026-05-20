import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { LoadingState } from "@/src/components/LoadingState";
import { PlayerCard } from "@/src/components/PlayerCard";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { getWindowHref } from "@/src/navigation/routes";
import { useTheme } from "@/src/theme/ThemeProvider";
import { formatDateRange, formatPlacement, formatPoints } from "@/src/utils/format";

export function PlayerDetailScreen({ playerId }: { playerId: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const { data, error, isLoading, refresh } = useAsyncResource(() => {
    return havokApi.getPlayer(playerId);
  }, playerId);

  return (
    <AppScreen
      subtitle="Profil public du joueur et derniers tournois joues."
      title={data?.name ?? "Joueur"}
      withBackButton
    >
      {isLoading ? <LoadingState label="Chargement du joueur..." /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error && !data ? (
        <EmptyState
          description="Le joueur demande n est pas disponible dans le backend."
          title="Joueur introuvable"
        />
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <PlayerCard caption={buildProfileCaption(data)} player={data} />

          <View>
            <SectionHeader
              subtitle="Les stats utiles seulement, sans details techniques."
              title="Repere rapide"
            />

            <View style={styles.metricsGrid}>
              <MetricTile label="Meilleur top" value={formatPlacement(data.bestTop)} />
              <MetricTile label="Top 5" value={`${data.top5 ?? 0}`} />
              <MetricTile label="Moy. kills" value={formatMetric(data.avgKill)} />
              <MetricTile label="Moy. place" value={formatMetric(data.avgTop)} />
            </View>
          </View>

          <View>
            <SectionHeader
              subtitle="Les derniers tournois remontes par le backend."
              title="Derniers tournois"
            />

            {data.lastTournaments.length > 0 ? (
              <View style={styles.tournamentsStack}>
                {data.lastTournaments.map((tournament) => {
                  return (
                    <Pressable
                      key={tournament.windowId}
                      onPress={() => router.push(getWindowHref(tournament.windowId))}
                    >
                      <SurfaceCard>
                        <Text style={styles.tournamentTitle}>
                          {tournament.tournamentName}
                        </Text>
                        <Text style={styles.tournamentMeta}>
                          {formatDateRange(tournament.start, tournament.end)}
                        </Text>
                        <Text style={styles.tournamentMeta}>
                          {formatPlacement(tournament.result?.rank)} -{" "}
                          {formatPoints(tournament.result?.points)}
                        </Text>
                      </SurfaceCard>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                description="Aucun tournoi recent n est disponible pour ce joueur."
                title="Historique vide"
              />
            )}
          </View>
        </>
      ) : null}
    </AppScreen>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <SurfaceCard compact style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </SurfaceCard>
  );
}

function buildProfileCaption(player: NonNullable<Awaited<ReturnType<typeof havokApi.getPlayer>>>) {
  const parts = [player.country, player.pseudo].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : "Joueur Havok";
}

function formatMetric(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }

  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    metricLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    metricTile: {
      flexBasis: "48%",
    },
    metricValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginTop: 8,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    tournamentMeta: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },
    tournamentTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    tournamentsStack: {
      gap: 12,
    },
  });
}
