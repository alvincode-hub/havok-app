import { View } from "react-native";

import { AppScreen } from "@/src/components/AppScreen";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { ThemePreferenceControl } from "@/src/components/ThemePreferenceControl";

export function SettingsScreen() {
  return (
    <AppScreen
      subtitle="Un ecran simple centre sur l experience utilisateur."
      title="Reglages"
    >
      <View>
        <SectionHeader
          subtitle="Le mode sombre reste la reference visuelle."
          title="Theme"
        />

        <SurfaceCard>
          <ThemePreferenceControl />
        </SurfaceCard>
      </View>
    </AppScreen>
  );
}
