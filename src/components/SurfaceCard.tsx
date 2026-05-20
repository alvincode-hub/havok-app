import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

interface SurfaceCardProps {
  children: ReactNode;
  compact?: boolean;
  style?: ViewStyle;
}

export function SurfaceCard({
  children,
  compact = false,
  style,
}: SurfaceCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors, compact);

  return <View style={[styles.card, style]}>{children}</View>;
}

function createStyles(
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
  compact: boolean,
) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 26,
      borderWidth: 1,
      padding: compact ? 14 : 18,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.16,
      shadowRadius: 22,
    },
  });
}
