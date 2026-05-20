import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/colors";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion impossible</Text>
      <Text style={styles.message}>{message}</Text>

      <Pressable onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonLabel}>Reessayer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonLabel: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: "800",
  },
  container: {
    backgroundColor: colors.card,
    borderColor: colors.danger,
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  message: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});
