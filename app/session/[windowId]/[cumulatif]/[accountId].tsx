import { useLocalSearchParams } from "expo-router";
import { SessionStatsScreen } from "@/src/screens/SessionDetail";

export default function SessionDetailRoute() {
  const params = useLocalSearchParams<{
    windowId?: string | string[];
    cumulatif?: string | string[];
    accountId?: string | string[];
    page?: string | string[];
  }>();

  const windowId = Array.isArray(params.windowId)
    ? params.windowId[0]
    : params.windowId ?? "";

  const cumulatifParam = Array.isArray(params.cumulatif)
    ? params.cumulatif[0]
    : params.cumulatif ?? "false";

  const accountId = Array.isArray(params.accountId)
    ? params.accountId[0]
    : params.accountId ?? "";

  const pageParam = Array.isArray(params.page)
    ? params.page[0]
    : params.page ?? "0";

  const cumulatif = cumulatifParam === "true";
  const page = Number.isFinite(Number(pageParam)) ? Number(pageParam) : 0;

  return (
    <SessionStatsScreen
      windowId={windowId}
      accountId={accountId}
      cumulatif={cumulatif}
      page={page}
    />
  );
}
