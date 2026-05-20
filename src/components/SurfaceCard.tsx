import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/src/theme/colors";

interface SurfaceCardProps {
  children: ReactNode;
}

export function SurfaceCard({ children }: SurfaceCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
  },
});
