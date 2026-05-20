import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { EventCard } from "@/src/components/EventCard";
import { LoadingState } from "@/src/components/LoadingState";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { getPlayerHref, getWindowHref } from "@/src/navigation/routes";
import { useTheme } from "@/src/theme/ThemeProvider";
import type { HomeNewsItem, LastPlayedPlace } from "@/src/types/api";
import { formatDate, formatPlacement, formatPoints } from "@/src/utils/format";
import { resolveAssetUrl } from "@/src/utils/media";

export function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const { data, error, isLoading, refresh } = useAsyncResource(() => {
    return havokApi.getHome();
  });

  const heroTournament =
    data?.liveTournament ??
    data?.upcomingTournaments[0] ??
    data?.lastPlayedWindow?.tournament ??
    null;
  const upcomingTournaments = data?.upcomingTournaments.slice(0, 3) ?? [];
  const latestPlaces = data?.lastPlayedWindow?.places?.slice(0, 6) ?? [];
  const latestTournament = data?.lastPlayedWindow?.tournament ?? null;
  const hasNews = Boolean(data?.actu.length);

  return (
    <AppScreen
      subtitle="Le resume public Havok, branche directement sur le backend."
      title="Accueil"
    >
      {isLoading ? <LoadingState label="Chargement de l accueil..." /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error && heroTournament ? (
        <View>
          <SectionHeader
            subtitle={
              data?.liveTournament
                ? "Le tournoi en cours passe en premier."
                : "Le prochain tournoi important remonte en tete."
            }
            title="A la une"
          />

          <EventCard
            featured
            onPress={() => router.push(getWindowHref(heroTournament.windowId))}
            tournament={heroTournament}
          />
        </View>
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader
            subtitle="Les prochaines dates publiques a ne pas manquer."
            title="A venir"
          />

          {upcomingTournaments.length > 0 ? (
            <View style={styles.stack}>
              {upcomingTournaments.map((tournament) => {
                return (
                  <EventCard
                    key={tournament.windowId}
                    onPress={() => router.push(getWindowHref(tournament.windowId))}
                    tournament={tournament}
                  />
                );
              })}
            </View>
          ) : (
            <EmptyState
              description="Aucun tournoi a venir n est disponible pour le moment."
              title="Rien a venir"
            />
          )}
        </View>
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader
            subtitle={
              latestTournament
                ? `${latestTournament.tournamentName} - ${formatDate(latestTournament.start)}`
                : "Les derniers resultats Havok s affichent ici des qu ils sont disponibles."
            }
            title="Derniers resultats Havok"
          />

          {latestTournament ? (
            <Pressable
              onPress={() => router.push(getWindowHref(latestTournament.windowId))}
            >
              <SurfaceCard style={styles.latestHeaderCard}>
                <Text style={styles.latestHeaderTitle}>
                  {latestTournament.tournamentName}
                </Text>
                <Text style={styles.latestHeaderMeta}>
                  Ouvrir le detail du tournoi
                </Text>
              </SurfaceCard>
            </Pressable>
          ) : null}

          {latestPlaces.length > 0 ? (
            <View style={styles.resultsGrid}>
              {latestPlaces.map((place, index) => {
                return (
                  <LatestPlaceCard
                    key={`${place.name}-${index}`}
                    onPress={
                      place.accountId
                        ? () => router.push(getPlayerHref(place.accountId as string))
                        : undefined
                    }
                    place={place}
                  />
                );
              })}
            </View>
          ) : (
            <EmptyState
              description="Aucun resultat joueur Havok n est remonte pour le moment."
              title="Resultats indisponibles"
            />
          )}
        </View>
      ) : null}

      {!isLoading && !error && hasNews ? (
        <View>
          <SectionHeader
            subtitle="Les informations utiles remontees par le backend."
            title="Actu"
          />

          <View style={styles.stack}>
            {(data?.actu ?? []).map((item, index) => {
              return <NewsCard item={item} key={item.id ?? `news-${index}`} />;
            })}
          </View>
        </View>
      ) : null}
    </AppScreen>
  );
}

function LatestPlaceCard({
  onPress,
  place,
}: {
  onPress?: () => void;
  place: LastPlayedPlace;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  const content = (
    <>
      <Text style={styles.latestResultName}>{place.name}</Text>
      <Text style={styles.latestResultMeta}>
        {formatPlacement(place.result?.rank)} - {formatPoints(place.result?.points)}
      </Text>
      <Text style={styles.latestResultMeta}>
        {place.result?.kills ?? 0} kills - {place.result?.wins ?? 0} wins
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.latestResultCard}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.latestResultCard}>{content}</View>;
}

function NewsCard({ item }: { item: HomeNewsItem }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const imageUrl = resolveAssetUrl(item.image);

  return (
    <SurfaceCard>
      <View style={styles.newsCard}>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.newsImage} /> : null}

        <View style={styles.newsCopy}>
          <Text style={styles.newsTitle}>{getNewsTitle(item)}</Text>
          <Text style={styles.newsDescription}>{getNewsDescription(item)}</Text>
          {item.date ? <Text style={styles.newsDate}>{formatDate(item.date)}</Text> : null}
        </View>
      </View>
    </SurfaceCard>
  );
}

function getNewsTitle(item: HomeNewsItem) {
  return item.title ?? item.name ?? "Actualite Havok";
}

function getNewsDescription(item: HomeNewsItem) {
  return item.description ?? item.text ?? "Nouvelle information disponible.";
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    latestHeaderCard: {
      marginBottom: 12,
    },
    latestHeaderMeta: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: "700",
      marginTop: 6,
    },
    latestHeaderTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    latestResultCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1,
      flexBasis: "48%",
      gap: 8,
      padding: 16,
    },
    latestResultMeta: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    latestResultName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    newsCard: {
      flexDirection: "row",
      gap: 14,
    },
    newsCopy: {
      flex: 1,
      gap: 8,
    },
    newsDate: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    newsDescription: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    newsImage: {
      borderRadius: 18,
      height: 88,
      width: 88,
    },
    newsTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    resultsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    stack: {
      gap: 12,
    },
  });
}
