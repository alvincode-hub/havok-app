import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

export function LoadingState({ label }: { label: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={theme.colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    container: {
      alignItems: "center",
      gap: 12,
      paddingVertical: 24,
    },
    label: {
      color: colors.textMuted,
      fontSize: 14,
    },
  });
}
