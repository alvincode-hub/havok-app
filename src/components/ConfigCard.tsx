import { StyleSheet, Text, View } from "react-native";

import { appConfig, configStatus } from "@/src/config/env";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { colors } from "@/src/theme/colors";

export function ConfigCard() {
  const baseUrlLabel = appConfig.apiBaseUrl || "Non configure";
  const apiKeyLabel = configStatus.hasApiKey ? "Renseignee" : "Manquante";
  const attestationModeLabel = appConfig.attestationMode || "Non configure";

  return (
    <SurfaceCard>
      <View style={styles.header}>
        <Text style={styles.title}>Connexion backend</Text>
        <View
          style={[
            styles.badge,
            configStatus.isReady ? styles.badgeReady : styles.badgePending,
          ]}
        >
          <Text
            style={[
              styles.badgeLabel,
              configStatus.isReady ? styles.badgeReadyLabel : styles.badgePendingLabel,
            ]}
          >
            {configStatus.isReady ? "Pret" : "A configurer"}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Base URL</Text>
        <Text style={styles.value}>{baseUrlLabel}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>App key</Text>
        <Text style={styles.value}>{apiKeyLabel}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mode attestation</Text>
        <Text style={styles.value}>{attestationModeLabel}</Text>
      </View>

      {!configStatus.isReady ? (
        <Text style={styles.help}>
          Cree un fichier `.env.local` a partir de `.env.example` pour activer
          la session mobile et les appels API.
        </Text>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  badgePending: {
    backgroundColor: "rgba(176, 122, 32, 0.14)",
  },
  badgePendingLabel: {
    color: colors.warning,
  },
  badgeReady: {
    backgroundColor: "rgba(30, 138, 91, 0.12)",
  },
  badgeReadyLabel: {
    color: colors.success,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  help: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 14,
  },
  label: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  row: {
    gap: 6,
    marginTop: 10,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  value: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: "600",
  },
});
