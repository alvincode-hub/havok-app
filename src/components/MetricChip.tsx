import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme/colors";

interface MetricChipProps {
  label: string;
  value: string;
}

export function MetricChip({ label, value }: MetricChipProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardStrong,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minWidth: 96,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
});
