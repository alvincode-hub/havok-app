import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

import {
  darkTheme,
  lightTheme,
  type AppTheme,
  type ThemePreference,
} from "@/src/theme/colors";
import { readStoredString, writeStoredString } from "@/src/utils/storage";

const THEME_PREFERENCE_KEY = "havok-theme-preference";

interface ThemeContextValue {
  isReady: boolean;
  preference: ThemePreference;
  setPreference: (nextPreference: ThemePreference) => void;
  theme: AppTheme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "dark" || value === "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [preference, setPreferenceState] =
    useState<ThemePreference>("system");

  useEffect(() => {
    let isMounted = true;

    readStoredString(THEME_PREFERENCE_KEY)
      .then((storedPreference) => {
        if (!isMounted || !isThemePreference(storedPreference)) {
          return;
        }

        setPreferenceState(storedPreference);
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedMode =
    preference === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : preference;
  const theme = resolvedMode === "light" ? lightTheme : darkTheme;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme]);

  function setPreference(nextPreference: ThemePreference) {
    setPreferenceState(nextPreference);
    void writeStoredString(THEME_PREFERENCE_KEY, nextPreference);
  }

  return (
    <ThemeContext.Provider
      value={{
        isReady,
        preference,
        setPreference,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error("ThemeProvider manquant.");
  }

  return value;
}
