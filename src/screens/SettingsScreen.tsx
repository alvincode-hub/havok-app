import { View } from "react-native";

import { AppScreen } from "@/src/components/AppScreen";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { ThemePreferenceControl } from "@/src/components/ThemePreferenceControl";

export function SettingsScreen() {
  return (
    <AppScreen
      title="Reglages"
    >
      <View>
        <SectionHeader
          title="Theme"
        />

        <SurfaceCard>
          <ThemePreferenceControl />
        </SurfaceCard>
      </View>
    </AppScreen>
  );
}
