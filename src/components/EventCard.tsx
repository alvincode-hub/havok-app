import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";
import {
  formatDateRange,
  getTournamentLabel,
  getTournamentStatus,
  getTournamentStatusLabel,
} from "@/src/utils/format";
import { resolveAssetUrl } from "@/src/utils/media";
import type {
  CalendarTournament,
  HomeTournament,
  PlayerTournament,
} from "@/src/types/api";

type EventCardTournament = CalendarTournament | HomeTournament | PlayerTournament;

interface EventCardProps {
  featured?: boolean;
  onPress?: () => void;
  tournament: EventCardTournament;
}

export function EventCard({
  featured = false,
  onPress,
  tournament,
}: EventCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors, featured);
  const imageUrl = resolveAssetUrl(tournament.image);
  const status = getTournamentStatus(tournament.start, tournament.end);
  const label = getTournamentLabel(tournament);
  const cardContent = (
    <>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackLabel}>HAVOK</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badge,
              status === "live"
                ? styles.liveBadge
                : status === "upcoming"
                  ? styles.upcomingBadge
                  : styles.pastBadge,
            ]}
          >
            <Text
              style={[
                styles.badgeLabel,
                status === "live"
                  ? styles.liveBadgeLabel
                  : status === "upcoming"
                    ? styles.upcomingBadgeLabel
                    : styles.pastBadgeLabel,
              ]}
            >
              {getTournamentStatusLabel(status)}
            </Text>
          </View>

          {tournament.teamFormat ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{tournament.teamFormat}</Text>
            </View>
          ) : null}

          {getTournamentMode(tournament) ? (
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>{getTournamentMode(tournament)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>{label}</Text>
        <Text style={styles.meta}>
          {formatDateRange(tournament.start, tournament.end)}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.card}>
        {cardContent}
      </Pressable>
    );
  }

  return <View style={styles.card}>{cardContent}</View>;
}

function getTournamentMode(tournament: EventCardTournament) {
  if ("gameMode" in tournament && tournament.gameMode) {
    return tournament.gameMode;
  }

  if ("mode" in tournament && tournament.mode) {
    return tournament.mode;
  }

  return null;
}

function createStyles(
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
  featured: boolean,
) {
  return StyleSheet.create({
    badge: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    badgeLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: featured ? colors.accentMuted : colors.border,
      borderRadius: 28,
      borderWidth: 1,
      overflow: "hidden",
    },
    content: {
      gap: 10,
      padding: 18,
    },
    image: {
      height: featured ? 220 : 220,
      width: "100%",
    },
    imageFallback: {
      alignItems: "center",
      backgroundColor: colors.brandSurface,
      height: featured ? 220 : 168,
      justifyContent: "center",
      width: "100%",
    },
    imageFallbackLabel: {
      color: colors.accent,
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: 3,
    },
    liveBadge: {
      backgroundColor: colors.liveSurface,
    },
    liveBadgeLabel: {
      color: colors.live,
    },
    meta: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    pastBadge: {
      backgroundColor: colors.surfaceTertiary,
    },
    pastBadgeLabel: {
      color: colors.textMuted,
    },
    title: {
      color: colors.text,
      fontSize: featured ? 24 : 19,
      fontWeight: "800",
      letterSpacing: -0.4,
      lineHeight: featured ? 30 : 24,
    },
    upcomingBadge: {
      backgroundColor: colors.accentSurface,
    },
    upcomingBadgeLabel: {
      color: colors.accent,
    },
  });
}
