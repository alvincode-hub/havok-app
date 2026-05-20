import { Tabs } from "expo-router";

import { colors } from "@/src/theme/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.cardStrong,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderRadius: 22,
          bottom: 14,
          height: 68,
          left: 16,
          paddingBottom: 10,
          paddingTop: 10,
          position: "absolute",
          right: 16,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
        },
        tabBarItemStyle: {
          borderRadius: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
        }}
      />
      <Tabs.Screen
        name="calendrier"
        options={{
          title: "Calendrier",
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Joueurs",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
