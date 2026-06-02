import { useEffect, useState } from "react";
import { useTheme } from "@/src/theme/ThemeProvider";
import { havokApi } from "@/src/api/havokApi";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import type { LeaderboardEntry } from "@/src/types/api";
import { AppScreen } from "@/src/components/AppScreen";
import { SectionHeader } from "@/src/components/SectionHeader";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

interface SessionStatsScreenProps {
  windowId: string;
  cumulatif: boolean;
  accountId: string;
  page: number;
}

type SessionEntry = LeaderboardEntry & {
  tournamentName?: string | null;
};

interface Game {
  gameIndex: number;
  id: string;
  place: number;
  timeAlive: number;
  endTime: string;
  kills: number;
  rank:number;
}

function GameCard({gameIndex,id,place,timeAlive,endTime,kills,rank}:Game){
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  const timeAliveString = new Date(timeAlive * 1000).toISOString().substring(14, 19)
  const endTimeString = new Date(endTime).toISOString().substring(11, 16)

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameCardHeader}>
        <View style={styles.gameTitleBlock}>
          <View style={styles.gameBadge}>
            <Text style={styles.gameBadgeLabel}>Game {String(gameIndex + 1 || "X")}</Text>
          </View>
          <Text style={styles.gameTitle}>Partie jouee</Text>
          <Text style={styles.gameId}>ID {String(id || "inconnu")}</Text>
        </View>

        <View style={styles.gameHeaderAside}>
          <View style={styles.gameStatusBadge}>
            <Text style={styles.gameStatusBadgeLabel}>Top {String(place || "X")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.gameStats}>
        <View style={styles.factsGrid}>
          <FactTile label="Temps en vie" value={timeAliveString} />
          <FactTile label="Heure de fin" value={endTimeString} />
          <FactTile label="Kills" value={String(kills)} />
          <FactTile label="Rank de la partie" value={String(rank)} />
        </View>
      </View>
    </View>
  )
}

function FactTile({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <SurfaceCard compact style={styles.factTile}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </SurfaceCard>
  );
}

export function SessionStatsScreen({
  windowId,
  cumulatif,
  accountId,
  page,
}: SessionStatsScreenProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const [entry, setEntry] = useState<SessionEntry | null>(null);

  useEffect(() => {
    let isActive = true;

    setEntry(null);

    havokApi
      .getTournamentResults(windowId, page, cumulatif)
      .then((results) => {
        if (!isActive) {
          return;
        }

        const nextEntry =
          results?.leaderboard?.results.find((resultEntry) => {
            const relatedAccountIds = [
              resultEntry.accountId,
              resultEntry.teamAccountId,
              ...(resultEntry.accountIds ?? []),
            ].filter(Boolean);

            return relatedAccountIds.includes(accountId);
          }) ?? null;

        
        setEntry(nextEntry
            ? {
                ...nextEntry,
                tournamentName: results?.tournamentName ?? null,
              }
            : null,
        );

      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setEntry(null);
      });

    return () => {
      isActive = false;
    };
  }, [accountId, cumulatif, page, windowId]);

  const avrgPlacement = entry?.avrgPlacement ?
   Math.round(entry?.avrgPlacement * 10)/10
  : undefined
  const avrgKills = entry?.avrgKill ?
   Math.round(entry?.avrgKill * 10)/10
  : undefined
  const avrgPoints = entry?.avrgPoints ?
   Math.round(entry?.avrgPoints * 10)/10
  : undefined
  return(
    <AppScreen
      subtitle={`Session de ${entry?.names.join(" et ")} pendant ${entry?.tournamentName}`}
      title="Detail de la session"
      withBackButton
    >
    <SurfaceCard>
      <SectionHeader title="Stats"  subtitle="Stats général du tournois."/>
      <View style={styles.factsGrid}>
        <FactTile label="Points" value={String(entry?.points ?? "Inconnu") } />
        <FactTile label="Place" value={String(entry?.rank ?? "Inconnu") } />
        <FactTile label="Games jouées" value={String(entry?.nbGamesPlayed ?? "Inconnu") } />
        <FactTile label="Kills" value={String(entry?.kills ?? "Inconnu") } />
        <FactTile label="Top 15" value={String(entry?.top15s ?? "Inconnu") } />
        <FactTile label="Top 5" value={String(entry?.top5s ?? "Inconnu") } />
        <FactTile label="Top 1" value={String(entry?.wins ?? "Inconnu") } />
        <FactTile label="Placement moy." value={String(avrgPlacement  ?? "Inconnu")} />
        <FactTile label="Points moy." value={String(avrgPoints ?? "Inconnu") } />
        <FactTile label="Kills moy." value={String(avrgKills ?? "Inconnu") } />
        <FactTile label="Points de kill" value={String(entry?.pointsKills  ?? "Inconnu")} />
        <FactTile label="Points de placement" value={String(entry?.pointsTop  ?? "Inconnu")} />
      </View>
    </SurfaceCard>

    <SurfaceCard>
      <SectionHeader title="Games"  subtitle="Historique des games du tournois."/>
      {entry?.sessionHistory?.map((game, index)=>(
        <GameCard key={game.id} gameIndex={index} id={game.id} place={game.placement  || 0} timeAlive={game.timeAlived || 0} endTime={game.end} kills={game.kills || 0} rank={0}/>
      ))}
    </SurfaceCard>
    </AppScreen>
  )
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]){
  return StyleSheet.create({
    factLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    factTile: {
      flexBasis: "48%",
    },
    factValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 8,
    },
    factsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    gameCard: {
      marginTop: 20,
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 24,
      borderWidth: 1,
      gap: 16,
      overflow: "hidden",
      padding: 16,
    },
    gameCardHeader: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
    },
    gameTitleBlock: {
      flex: 1,
      gap: 8,
    },
    gameBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.accentSurface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    gameBadgeLabel: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    gameHeaderAside: {
      alignItems: "flex-end",
      justifyContent: "flex-start",
    },
    gameStatusBadge: {
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    gameStatusBadgeLabel: {
      color: colors.background,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    gameId: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 18,
    },
    gameTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.4,
    },
    gameStats: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingTop: 14,
    },
  })
}
