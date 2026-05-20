import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import { StartupSplash } from "@/src/components/StartupSplash";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeProvider";
import { logRuntimeConfiguration } from "@/src/utils/debug";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { isReady, theme } = useTheme();

  const [hasHiddenNativeSplash, setHasHiddenNativeSplash] = useState(false);
  const [showStartupSplash, setShowStartupSplash] = useState(true);

  useEffect(() => {
    logRuntimeConfiguration();
  }, []);

  useEffect(() => {
    if (!isReady || hasHiddenNativeSplash) {
      return;
    }

    let isMounted = true;

    SplashScreen.hideAsync()
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setHasHiddenNativeSplash(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hasHiddenNativeSplash, isReady]);

  useEffect(() => {
    if (!hasHiddenNativeSplash) {
      return;
    }

    const splashTimer = setTimeout(() => {
      setShowStartupSplash(false);
    }, 1100);

    return () => {
      clearTimeout(splashTimer);
    };
  }, [hasHiddenNativeSplash]);

  if (!isReady || !hasHiddenNativeSplash || showStartupSplash) {
    return <StartupSplash />;
  }

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