import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { resolveAssetUrl } from "@/src/lib/media";
import type { PlayerProfile, PlayerQualification, PlayerSummary } from "@/src/types/api";
import { colors } from "@/src/theme/colors";

type PlayerCardData = PlayerSummary | PlayerProfile | PlayerQualification;

interface PlayerCardProps {
  caption?: string;
  onPress?: () => void;
  player: PlayerCardData;
}

function getPlayerName(player: PlayerCardData) {
  if ("playerName" in player) {
    return player.playerName;
  }

  return player.name;
}

function getPlayerImage(player: PlayerCardData) {
  return resolveAssetUrl(player.image);
}

function getPlayerFlag(player: PlayerCardData) {
  if ("countryFlag" in player) {
    return resolveAssetUrl(player.countryFlag);
  }

  return undefined;
}

export function PlayerCard({ caption, onPress, player }: PlayerCardProps) {
  const imageUrl = getPlayerImage(player);
  const flagUrl = getPlayerFlag(player);
  const content = (
    <>
      <View style={styles.media}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackLabel}>
              {getPlayerName(player).slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{getPlayerName(player)}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>

      {flagUrl ? <Image source={{ uri: flagUrl }} style={styles.flag} /> : null}
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

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 18,
    height: 58,
    width: 58,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: colors.surfaceStrong,
    borderRadius: 18,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  avatarFallbackLabel: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  caption: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
    padding: 14,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  flag: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 20,
    width: 20,
  },
  media: {
    minHeight: 58,
    minWidth: 58,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
});
