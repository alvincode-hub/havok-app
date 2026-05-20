import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

export function MyImage() {
  const { getTheme } = useTheme();

  const imgMode: string = getTheme() === "light" ? "lightmode" : "darkmode";
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <Image
      source={
        imgMode === "lightmode"
          ? require("@/assets/images/HavoK_by_Vitality_lightmode.png")
          : require("@/assets/images/HavoK_by_Vitality_darkmode.png")
      }
      style={styles.brandImage}
      resizeMode="contain"
    />
  );
}

export function StartupSplash() {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
        <MyImage/>

      <View style={styles.copy}>
        <Text style={styles.title}>Havok App</Text>
      </View>

      <ActivityIndicator color={theme.colors.accent} size="small" />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    brandImage: {
      height: 140,
      width: 220,
    },
    brandShell: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 32,
      borderWidth: 1,
      paddingHorizontal: 24,
      paddingVertical: 28,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
    },
    container: {
      alignItems: "center",
      backgroundColor: colors.background,
      flex: 1,
      gap: 20,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    copy: {
      alignItems: "center",
      gap: 6,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -0.6,
    },
  });
}
