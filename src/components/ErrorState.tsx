import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chargement impossible</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonLabel}>Reessayer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    button: {
      alignSelf: "flex-start",
      backgroundColor: colors.accent,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    buttonLabel: {
      color: colors.onAccent,
      fontSize: 14,
      fontWeight: "800",
    },
    container: {
      backgroundColor: colors.dangerSurface,
      borderColor: colors.danger,
      borderRadius: 24,
      borderWidth: 1,
      gap: 10,
      padding: 18,
    },
    message: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "700",
    },
  });
}
