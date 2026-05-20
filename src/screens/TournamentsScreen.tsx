import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { EventCard } from "@/src/components/EventCard";
import { LoadingState } from "@/src/components/LoadingState";
import { SectionHeader } from "@/src/components/SectionHeader";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { getWindowHref } from "@/src/navigation/routes";
import { useTheme } from "@/src/theme/ThemeProvider";
import { groupTournamentsByStatus } from "@/src/utils/format";

export function TournamentsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const { data, error, isLoading, refresh } = useAsyncResource(() => {
    return havokApi.getCalendar();
  });

  const groups = groupTournamentsByStatus(data ?? []);

  return (
    <AppScreen
      subtitle="Toutes les windows publiques, triees par statut."
      title="Tournois"
    >
      {isLoading ? <LoadingState label="Chargement des tournois..." /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error && !data?.length ? (
        <EmptyState
          description="Aucun tournoi n est disponible dans le backend pour le moment."
          title="Liste vide"
        />
      ) : null}

      {!isLoading && !error ? (
        <View style={styles.sections}>
          <TournamentGroup
            items={groups.live}
            onPress={(windowId) => router.push(getWindowHref(windowId))}
            subtitle="Les events en cours passent devant."
            title="En direct"
          />
          <TournamentGroup
            items={groups.upcoming}
            onPress={(windowId) => router.push(getWindowHref(windowId))}
            subtitle="Les prochaines windows a suivre."
            title="A venir"
          />
          <TournamentGroup
            items={groups.past}
            onPress={(windowId) => router.push(getWindowHref(windowId))}
            subtitle="Les windows terminees restent consultables."
            title="Termines"
          />
        </View>
      ) : null}
    </AppScreen>
  );
}

function TournamentGroup({
  items,
  onPress,
  subtitle,
  title,
}: {
  items: Awaited<ReturnType<typeof havokApi.getCalendar>>;
  onPress: (windowId: string) => void;
  subtitle: string;
  title: string;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <View>
      <SectionHeader subtitle={subtitle} title={title} />
      <View style={{ gap: 12 }}>
        {items.map((item) => {
          return (
            <EventCard
              key={item.windowId}
              onPress={() => onPress(item.windowId)}
              tournament={item}
            />
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    sections: {
      gap: 28,
    },
  });
}
