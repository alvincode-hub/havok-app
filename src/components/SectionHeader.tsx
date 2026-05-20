import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/src/theme/ThemeProvider";

interface SectionHeaderProps {
  subtitle?: string;
  title: string;
}

export function SectionHeader({ subtitle, title }: SectionHeaderProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    container: {
      gap: 4,
      marginBottom: 12,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    title: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
  });
}
