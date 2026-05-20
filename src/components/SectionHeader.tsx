import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/colors";

interface SectionHeaderProps {
  description?: string;
  title: string;
}

export function SectionHeader({ description, title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 12,
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "700",
  },
});
