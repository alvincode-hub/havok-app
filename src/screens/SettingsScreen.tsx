import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { clearStoredAppSession } from "@/src/api/appSession";
import { havokApi } from "@/src/api/havokApi";
import { appConfig, configStatus } from "@/src/config/env";
import { AppScreen } from "@/src/components/AppScreen";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useAsyncResource } from "@/src/hooks/useAsyncResource";
import { colors } from "@/src/theme/colors";

interface DiagnosticsState {
  healthLabel: string;
  healthOk: boolean;
  protectedLabel: string;
  protectedOk: boolean;
}

export function SettingsScreen() {
  const [sessionResetMessage, setSessionResetMessage] = useState<string | null>(
    null
  );
  const { data, isLoading, refresh } = useAsyncResource<DiagnosticsState>(
    async () => {
      const [healthResult, protectedResult] = await Promise.allSettled([
        havokApi.getHealth(),
        havokApi.getPlayers(),
      ]);

      return {
        healthLabel:
          healthResult.status === "fulfilled"
            ? healthResult.value.message ||
              healthResult.value.status ||
              "Serveur joignable"
            : getErrorMessage(healthResult.reason),
        healthOk: healthResult.status === "fulfilled",
        protectedLabel:
          protectedResult.status === "fulfilled"
            ? `${protectedResult.value.length} joueurs recuperes`
            : getErrorMessage(protectedResult.reason),
        protectedOk: protectedResult.status === "fulfilled",
      };
    }
  );

  async function handleResetSession() {
    setSessionResetMessage(null);
    await clearStoredAppSession();
    setSessionResetMessage("Session locale reinitialisee.");
    refresh();
  }

  return (
    <AppScreen
      subtitle="Ecran de verification pour la configuration locale et les appels serveur."
      title="Settings"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Text style={styles.sectionDescription}>
          Cet ecran verifie le minimum requis pour connecter l application au backend.
        </Text>

        <SurfaceCard>
          <SettingRow
            label="API base URL"
            value={appConfig.apiBaseUrl || "Non configure"}
          />
          <SettingRow
            label="API key"
            value={configStatus.hasApiKey ? "Configuree" : "Non configuree"}
          />
          <SettingRow
            label="Attestation mode"
            value={appConfig.attestationMode || "Non configure"}
          />
          <SettingRow
            label="Configuration prete"
            value={configStatus.isReady ? "Oui" : "Non"}
          />
        </SurfaceCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Diagnostic serveur</Text>
        <Text style={styles.sectionDescription}>
          Test public sur `/api/health` puis test protege sur `/api/players`.
        </Text>

        {isLoading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Verification en cours...</Text>
          </View>
        ) : null}

        <SurfaceCard>
          <StatusRow
            label="Health"
            ok={data?.healthOk ?? false}
            value={data?.healthLabel ?? "En attente"}
          />
          <StatusRow
            label="Route protegee"
            ok={data?.protectedOk ?? false}
            value={data?.protectedLabel ?? "En attente"}
          />
        </SurfaceCard>
      </View>

      <View style={styles.actionsRow}>
        <Pressable onPress={refresh} style={styles.primaryButton}>
          <Text style={styles.primaryButtonLabel}>Retester</Text>
        </Pressable>

        <Pressable onPress={handleResetSession} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonLabel}>Reset session</Text>
        </Pressable>
      </View>

      {sessionResetMessage ? (
        <Text style={styles.helperText}>{sessionResetMessage}</Text>
      ) : null}
    </AppScreen>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function StatusRow({
  label,
  ok,
  value,
}: {
  label: string;
  ok: boolean;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.statusLabelRow}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: ok ? colors.success : colors.danger },
          ]}
        />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Erreur inconnue";
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  loadingBlock: {
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  primaryButtonLabel: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: "800",
  },
  row: {
    gap: 8,
    paddingVertical: 8,
  },
  rowLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  rowValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.cardStrong,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  secondaryButtonLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  section: {
    marginBottom: 24,
  },
  sectionDescription: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statusDot: {
    borderRadius: 99,
    height: 10,
    width: 10,
  },
  statusLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
});
