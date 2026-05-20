import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";
import { resolveAssetUrl } from "@/src/utils/media";
import type {
  HavokPlayerStatus,
  PlayerProfile,
  PlayerQualification,
  PlayerSummary,
} from "@/src/types/api";

type PlayerCardData =
  | HavokPlayerStatus
  | PlayerProfile
  | PlayerQualification
  | PlayerSummary;

interface PlayerCardProps {
  caption?: string;
  onPress?: () => void;
  player: PlayerCardData;
}

export function PlayerCard({ caption, onPress, player }: PlayerCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const imageUrl = resolveAssetUrl(getPlayerImage(player));
  const flagUrl = resolveAssetUrl(getPlayerFlag(player));

  const content = (
    <>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackLabel}>
            {getPlayerName(player).slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.copy}>
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

function getPlayerName(player: PlayerCardData) {
  if ("playerName" in player && typeof player.playerName === "string") {
    return player.playerName;
  }

  if ("name" in player && typeof player.name === "string") {
    return player.name;
  }

  return "Joueur Havok";
}

function getPlayerImage(player: PlayerCardData) {
  return "image" in player ? player.image : undefined;
}

function getPlayerFlag(player: PlayerCardData) {
  return "countryFlag" in player ? player.countryFlag : undefined;
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    avatar: {
      borderRadius: 18,
      height: 58,
      width: 58,
    },
    avatarFallback: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
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
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    card: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 24,
      borderWidth: 1,
      flexDirection: "row",
      gap: 14,
      padding: 14,
    },
    copy: {
      flex: 1,
      gap: 4,
    },
    flag: {
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      height: 22,
      width: 22,
    },
    name: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "700",
    },
  });
}
