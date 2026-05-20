import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";
import type { ThemePreference } from "@/src/theme/colors";

const OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: "Systeme", value: "system" },
  { label: "Sombre", value: "dark" },
  { label: "Clair", value: "light" },
];

export function ThemePreferenceControl() {
  const { preference, setPreference, theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isActive = option.value === preference;

        return (
          <Pressable
            key={option.value}
            onPress={() => setPreference(option.value)}
            style={[styles.option, isActive ? styles.optionActive : null]}
          >
            <Text
              style={[styles.optionLabel, isActive ? styles.optionLabelActive : null]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      padding: 4,
    },
    option: {
      alignItems: "center",
      borderRadius: 14,
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    optionActive: {
      backgroundColor: colors.accentSurface,
    },
    optionLabel: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
    },
    optionLabelActive: {
      color: colors.accent,
    },
  });
}
