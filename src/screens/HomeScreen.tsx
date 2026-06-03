import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { appConfig } from "@/src/api/apiConfig";
import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { EventCard } from "@/src/components/EventCard";
import { HomeScreenSkeleton } from "@/src/components/ScreenSkeletons";
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

  const liveTournament = data?.liveTournament ?? null;
  const upcomingTournaments = data?.upcomingTournaments.slice(0, 3) ?? [];
  const latestPlaces = data?.lastPlayedWindow?.places?.slice(0, 6) ?? [];
  const latestTournament = data?.lastPlayedWindow?.tournament ?? null;
  const hasNews = Boolean(data?.actu.length);

  return (
    <AppScreen title="Accueil">
      {isLoading ? <HomeScreenSkeleton /> : null}

      {error ? <ErrorState message={error} onRetry={refresh} /> : null}

      {!isLoading && !error && appConfig.demoDataEnabled ? (
        <SurfaceCard style={styles.alertCard}>
          <Text style={styles.alertEyebrow}>Alerte demo</Text>
          <Text style={styles.alertTitle}>Fausses donnees actives</Text>
          <Text style={styles.alertDescription}>
            Cette page utilise des donnees de demonstration. Certaines images,
            stats, classements ou profils peuvent etre incomplets ou manquants.
          </Text>
        </SurfaceCard>
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader title="Actu"/>
          {hasNews ? (
            <View style={styles.stack}>
              {(data?.actu ?? []).map((item, index) => {
                return <NewsCard item={item} key={item.id ?? `news-${index}`} />;
              })}
            </View>
          ) : (
            <EmptyState
              description="Aucune actualité n'est disponible pour le moment."
              title="Actu vide"
            />
          )}
        </View>
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader title="Live"/>

          {liveTournament ? (
            <EventCard
              featured
              key={liveTournament.windowId}
              onPress={() => router.push(getWindowHref(liveTournament.windowId))}
              tournament={liveTournament}
            />
          ) : (
            <EmptyState
              description="Aucun tournoi en direct en ce moment."
              title="Pas de live"
            />
          )}
        </View>
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader title="À  venir"/>

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
              description="Aucun tournoi à venir n'est disponible pour le moment."
              title="Rien à venir"
            />
          )}
        </View>
      ) : null}

      {!isLoading && !error ? (
        <View>
          <SectionHeader title="Derniers résultats Havok"/>

          {latestTournament ? (
            <EventCard
              key={latestTournament.windowId}
              onPress={() => router.push(getWindowHref(latestTournament.windowId))}
              tournament={latestTournament}
            />
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
              description="Aucun résultat de joueur Havok n'est remonte pour le moment."
              title="Resultats indisponibles"
            />
          )}
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
  const newsLink = normalizeNewsLink(item.link);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SurfaceCard>
      <View style={styles.newsWrapper}>
        <Pressable
          onPress={() => setIsExpanded((current) => !current)}
          style={styles.newsHeader}
        >
          <View style={styles.newsCard}>
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.newsImage} /> : null}

            <View style={styles.newsCopy}>
              <Text style={styles.newsTitle}>{getNewsTitle(item)}</Text>
            </View>
          </View>

          <Text style={styles.newsToggle}>{isExpanded ? "Masquer" : "Voir plus"}</Text>
        </Pressable>

        {isExpanded ? (
          <View style={styles.newsDetails}>
            <Text style={styles.newsDescription}>{getNewsDescription(item)}</Text>
            {item.date ? <Text style={styles.newsDate}>{formatDate(item.date)}</Text> : null}
            {newsLink ? (
              <Pressable onPress={() => void Linking.openURL(newsLink)} style={styles.newsLinkButton}>
                <Text style={styles.newsLinkText}>Ouvrir le lien</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </SurfaceCard>
  );
}

function getNewsTitle(item: HomeNewsItem) {
  return item.title ?? item.name ?? "Actualité Havok";
}

function getNewsDescription(item: HomeNewsItem) {
  return item.description ?? item.text ?? "Nouvelle information disponible.";
}

function normalizeNewsLink(link?: string | null) {
  if (!link) {
    return null;
  }

  const trimmedLink = link.trim();

  if (!trimmedLink) {
    return null;
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedLink)) {
    return trimmedLink;
  }

  return `https://${trimmedLink}`;
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    alertCard: {
      backgroundColor: colors.accentSurface,
      borderColor: colors.accent,
      gap: 8,
    },
    alertDescription: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
    alertEyebrow: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    alertTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
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
    newsDetails: {
      gap: 10,
      paddingTop: 12,
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
    newsHeader: {
      gap: 10,
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
    newsLinkButton: {
      alignSelf: "flex-start",
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    newsLinkText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },
    newsTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    newsToggle: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    newsWrapper: {
      gap: 2,
    },
    resultsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 10
    },
    stack: {
      gap: 12,
    },
  });
}
