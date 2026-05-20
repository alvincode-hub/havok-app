import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

interface SkeletonBlockProps {
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  width?: number | `${number}%` | "100%";
}

export function SkeletonBlock({
  height,
  radius = 16,
  style,
  width = "100%",
}: SkeletonBlockProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View
      style={[
        styles.block,
        {
          borderRadius: radius,
          height,
          width,
        },
        style,
      ]}
    />
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    block: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderWidth: 1,
    },
  });
}
