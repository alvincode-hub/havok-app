import { useLocalSearchParams } from "expo-router";

import { TournamentDetailScreen } from "@/src/screens/TournamentDetailScreen";

export default function WindowDetailRoute() {
  const params = useLocalSearchParams<{ windowId?: string | string[] }>();
  const windowId = Array.isArray(params.windowId)
    ? params.windowId[0]
    : params.windowId ?? "";

  return <TournamentDetailScreen windowId={windowId} />;
}
