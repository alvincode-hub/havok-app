import { useDeferredValue, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { LoadingState } from "@/src/components/LoadingState";
import { PlayerCard } from "@/src/components/PlayerCard";
import { SectionHeader } from "@/src/components/SectionHeader";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { getPlayerHref } from "@/src/navigation/routes";
import { useTheme } from "@/src/theme/ThemeProvider";

export function PlayersScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm.trim().toLowerCase());
  const { data, error, isLoading, refresh } = useAsyncResource(() => {
    return havokApi.getPlayers();
  });

  const filteredPlayers = (data ?? []).filter((player) => {
    if (!deferredSearchTerm) {
      return true;
    }

    return [player.name, player.pseudo, player.country]
      .filter(Boolean)
      .some((value) => {
        return String(value).toLowerCase().includes(deferredSearchTerm);
      });
  });

  return (
    <AppScreen
      subtitle="La liste publique des joueurs suivis par Havok."
      title="Joueurs"
    >
      <View>
        <SectionHeader
          subtitle="Recherche locale sur les joueurs recuperes depuis le backend."
          title="Recherche"
        />

        <TextInput
          onChangeText={setSearchTerm}
          placeholder="Rechercher un joueur"
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
          value={searchTerm}
        />
      </View>

      {isLoading ? <LoadingState label="Chargement des joueurs..." /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader
            subtitle={`${filteredPlayers.length} joueur${filteredPlayers.length > 1 ? "s" : ""} affiche${filteredPlayers.length > 1 ? "s" : ""}.`}
            title="Roster"
          />

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
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      color: colors.text,
      fontSize: 15,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    list: {
      gap: 12,
    },
  });
}
