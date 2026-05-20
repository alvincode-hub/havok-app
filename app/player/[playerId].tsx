import { useLocalSearchParams } from "expo-router";

import { PlayerDetailScreen } from "@/src/screens/PlayerDetailScreen";

export default function PlayerDetailRoute() {
  const params = useLocalSearchParams<{ playerId?: string | string[] }>();
  const playerId = Array.isArray(params.playerId)
    ? params.playerId[0]
    : params.playerId ?? "";

  return <PlayerDetailScreen playerId={playerId} />;
}
