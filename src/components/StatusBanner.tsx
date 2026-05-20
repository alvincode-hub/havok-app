import { StyleSheet, Text, View } from "react-native";

import { SurfaceCard } from "@/src/components/SurfaceCard";
import { colors } from "@/src/theme/colors";

interface StatusBannerProps {
  isHealthy: boolean;
  label: string;
}

export function StatusBanner({ isHealthy, label }: StatusBannerProps) {
  return (
    <SurfaceCard>
      <View style={styles.row}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isHealthy ? colors.success : colors.warning },
          ]}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Statut API</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 4,
  },
  dot: {
    borderRadius: 999,
    height: 12,
    marginTop: 4,
    width: 12,
  },
  label: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
});
