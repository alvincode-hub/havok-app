import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme/ThemeProvider";

interface AppScreenProps {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  headerAccessory?: ReactNode;
  scrollable?: boolean;
  subtitle?: string;
  title: string;
  withBackButton?: boolean;
}

export function AppScreen({
  children,
  contentContainerStyle,
  headerAccessory,
  scrollable = true,
  subtitle,
  title,
  withBackButton = false,
}: AppScreenProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  const body = (
    <View style={[styles.content, !scrollable && styles.contentStatic, contentContainerStyle]}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          {withBackButton ? (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons color={theme.colors.text} name="chevron-back" size={18} />
            </Pressable>
          ) : (
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeLabel}>HAVOK</Text>
            </View>
          )}

          {headerAccessory ? <View>{headerAccessory}</View> : null}
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    backButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      height: 40,
      justifyContent: "center",
      width: 40,
    },
    brandBadge: {
      backgroundColor: colors.brandSurface,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    brandBadgeLabel: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.2,
    },
    content: {
      flexGrow: 1,
      gap: 24,
      paddingBottom: 120,
      paddingHorizontal: 20,
      paddingTop: 18,
    },
    contentStatic: {
      paddingBottom: 24,
    },
    header: {
      gap: 10,
    },
    safeArea: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      maxWidth: 540,
    },
    title: {
      color: colors.text,
      fontSize: 34,
      fontWeight: "900",
      letterSpacing: -0.8,
      lineHeight: 40,
    },
    topRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      minHeight: 40,
    },
  });
}
