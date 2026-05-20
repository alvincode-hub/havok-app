import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/src/theme/colors";

interface AppScreenProps {
  children: ReactNode;
  subtitle: string;
  title: string;
}

export function AppScreen({ children, subtitle, title }: AppScreenProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowLeft} />
      <View style={styles.backgroundBubbleRight} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Havok App</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundBubbleRight: {
    backgroundColor: colors.primaryText,
    borderRadius: 220,
    height: 220,
    opacity: 0.05,
    position: "absolute",
    right: -88,
    top: 26,
    width: 220,
  },
  backgroundGlowLeft: {
    backgroundColor: colors.accent,
    borderRadius: 160,
    height: 190,
    left: -60,
    opacity: 0.12,
    position: "absolute",
    top: 180,
    width: 190,
  },
  backgroundGlowTop: {
    backgroundColor: colors.accentMuted,
    borderRadius: 260,
    height: 260,
    opacity: 0.2,
    position: "absolute",
    right: -40,
    top: -80,
    width: 260,
  },
  content: {
    paddingBottom: 148,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  header: {
    gap: 8,
    marginBottom: 28,
  },
  kicker: {
    color: colors.accentStrong,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 540,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    maxWidth: 540,
  },
});
