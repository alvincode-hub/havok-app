import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { ThemeProvider, useTheme } from "@/src/theme/ThemeProvider";
import { logRuntimeConfiguration } from "@/src/utils/debug";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { theme } = useTheme();

  useEffect(() => {
    logRuntimeConfiguration();
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}
      />
      <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
    </>
  );
}
