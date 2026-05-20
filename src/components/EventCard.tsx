import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { formatDateRange, getTournamentLabel } from "@/src/lib/format";
import { resolveAssetUrl } from "@/src/lib/media";
import type { TournamentSummary } from "@/src/types/api";
import { colors } from "@/src/theme/colors";

interface EventCardProps {
  onPress?: () => void;
  tournament: TournamentSummary;
}

export function EventCard({ onPress, tournament }: EventCardProps) {
  const imageUrl = resolveAssetUrl(tournament.image);
  const status = getTournamentStatus(tournament.start, tournament.end);
  const content = (
    <>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : null}

      <View style={styles.content}>
        <View style={styles.tagsRow}>
          <View
            style={[styles.tag, status === "live" ? styles.liveTag : styles.statusTag]}
          >
            <Text
              style={[
                styles.tagLabel,
                status === "live" ? styles.liveTagLabel : styles.statusTagLabel,
              ]}
            >
              {status === "live" ? "Live" : status === "upcoming" ? "A venir" : "Archive"}
            </Text>
          </View>

          {tournament.teamFormat ? (
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>{tournament.teamFormat}</Text>
            </View>
          ) : null}

          {tournament.gameMode || tournament.mode ? (
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>
                {tournament.gameMode || tournament.mode}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>{getTournamentLabel(tournament)}</Text>
        <Text style={styles.meta}>
          {formatDateRange(tournament.start, tournament.end)}
        </Text>
        {tournament.resolvedLocation ? (
          <Text style={styles.location}>{tournament.resolvedLocation}</Text>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.card}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

function getTournamentStatus(start: string, end: string) {
  const now = Date.now();
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (now >= startTime && now <= endTime) {
    return "live";
  }

  if (startTime > now) {
    return "upcoming";
  }

  return "past";
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    overflow: "hidden",
  },
  content: {
    gap: 10,
    padding: 18,
  },
  image: {
    height: 190,
    width: "100%",
  },
  liveTag: {
    backgroundColor: colors.primaryText,
  },
  liveTagLabel: {
    color: colors.cardStrong,
  },
  location: {
    color: colors.primaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  statusTag: {
    backgroundColor: colors.surfaceStrong,
  },
  statusTagLabel: {
    color: colors.warning,
  },
  tag: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagLabel: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "700",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
  },
});
