import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/colors";

interface EmptyStateProps {
  description: string;
  title: string;
}

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    gap: 6,
    padding: 18,
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
});
