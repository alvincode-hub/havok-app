import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { PlayersScreenSkeleton } from "@/src/components/ScreenSkeletons";
import { PlayerCard } from "@/src/components/PlayerCard";
import { SectionHeader } from "@/src/components/SectionHeader";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { getPlayerHref } from "@/src/navigation/routes";
import { useTheme } from "@/src/theme/ThemeProvider";

export function PlayersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const { data, error, isLoading, refresh } = useAsyncResource(() => {
    return havokApi.getPlayers();
  });

  const filteredPlayers = data ?? [];

  return (
    <AppScreen title="Joueurs">

      {isLoading ? <PlayersScreenSkeleton /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader title="Roster"/>

          {filteredPlayers.length > 0 ? (
            <View style={styles.list}>
              {filteredPlayers.map((player) => {
                return (
                  <Pressable
                    key={player.id}
                    onPress={() => router.push(getPlayerHref(player.id))}
                  >
                    <PlayerCard
                      caption={buildPlayerCaption(player)}
                      player={player}
                    />
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyState
              description="Aucun joueur ne correspond a cette recherche."
              title="Aucun resultat"
            />
          )}
        </View>
      ) : null}
    </AppScreen>
  );
}

function buildPlayerCaption(player: Awaited<ReturnType<typeof havokApi.getPlayers>>[number]) {
  const parts = [player.country, player.pseudo].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : "Profil Havok";
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    list: {
      gap: 12,
    },
  });
}
