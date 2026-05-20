import { useDeferredValue, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { colors } from "@/src/theme/colors";
import type { PlayerSummary } from "@/src/types/api";

export function PlayersScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const { data, error, isLoading, refresh } = useAsyncResource(
    () => havokApi.getPlayers()
  );

  const players = (data ?? []).filter((player) => {
    if (!deferredSearchTerm) {
      return true;
    }

    return player.name.toLowerCase().includes(deferredSearchTerm);
  });

  return (
    <AppScreen
      subtitle="Liste simple des joueurs retournes par le backend, avec recherche locale."
      title="Joueurs"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recherche</Text>
        <Text style={styles.sectionDescription}>
          Filtrage local sur les joueurs recuperes depuis `/api/players`.
        </Text>

        <TextInput
          onChangeText={setSearchTerm}
          placeholder="Rechercher un joueur"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          value={searchTerm}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total backend</Text>
            <Text style={styles.summaryValue}>{data?.length ?? 0}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Resultats filtres</Text>
            <Text style={styles.summaryValue}>{players.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Chargement des joueurs...</Text>
          </View>
        ) : null}

        {error ? <ErrorState message={error} onRetry={refresh} /> : null}

        {!isLoading && !error && players.length === 0 ? (
          <EmptyState
            description="Aucun joueur ne correspond a cette recherche."
            title="Aucun resultat"
          />
        ) : null}

        {!error
          ? players.map((player) => {
              return <PlayerRow key={player.id} player={player} />;
            })
          : null}
      </View>
    </AppScreen>
  );
}

function getPlayerCaption(player: PlayerSummary) {
  const parts = [player.country, player.pseudo].filter(Boolean);

  if (typeof player.top5 === "number" && player.top5 > 0) {
    parts.push(`Top 5: ${player.top5}`);
  }

  return parts.length > 0 ? parts.join(" - ") : player.id;
}

function PlayerRow({ player }: { player: PlayerSummary }) {
  return (
    <SurfaceCard>
      <View style={styles.playerRow}>
        <View style={styles.playerCopy}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerCaption}>{getPlayerCaption(player)}</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>
            {player.bestTop ? `Top ${player.bestTop}` : "Actif"}
          </Text>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderRadius: 999,
    justifyContent: "center",
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badgeLabel: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  loadingBlock: {
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  playerCaption: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  playerCopy: {
    flex: 1,
    gap: 4,
  },
  playerName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  playerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
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
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
});
