import { useRouter } from "expo-router";
import { View } from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { TournamentsScreenSkeleton } from "@/src/components/ScreenSkeletons";
import { SectionHeader } from "@/src/components/SectionHeader";
import { TournamentCalendar } from "@/src/components/TournamentCalendar";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { getWindowHref } from "@/src/navigation/routes";

export function TournamentsScreen() {
  const router = useRouter();
  const { data, error, isLoading, refresh } = useAsyncResource(() => {
    return havokApi.getCalendar();
  });

  return (
    <AppScreen title="Calendrier" subtitle="Change de mois puis touche un jour pour voir les tournois programmés.">
      {isLoading ? <TournamentsScreenSkeleton /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error && !data?.length ? (
        <EmptyState
          description="Aucun tournoi n'est disponible pour le moment."
          title="Liste vide"
        />
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader title=""/>
          <TournamentCalendar
            items={data ?? []}
            onPressItem={(windowId) => router.push(getWindowHref(windowId))}
          />
        </View>
      ) : null}
    </AppScreen>
  );
}
