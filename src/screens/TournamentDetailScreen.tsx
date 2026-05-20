import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { LoadingState } from "@/src/components/LoadingState";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useTheme } from "@/src/theme/ThemeProvider";
import type {
  HavokPlayerStatus,
  PlayerQualification,
  TournamentResults,
  TournamentWindowDetail,
  TournamentWindowGroup,
} from "@/src/types/api";
import { logApiError } from "@/src/utils/debug";
import { getUserFacingErrorMessage } from "@/src/utils/errors";
import {
  formatCount,
  formatDateRange,
  formatPlacement,
  formatPoints,
  getTournamentStatus,
  getTournamentStatusLabel,
  joinPlayerNames,
} from "@/src/utils/format";
import { getWindowPrimaryImage, resolveAssetUrl } from "@/src/utils/media";
import {
  buildPublicScoreRuleLines,
  getPublicPrizeLabel,
} from "@/src/utils/tournament";

type ResultsMode = "cumulative" | "normal";

interface ResultsCache {
  cumulative: Record<number, TournamentResults | null>;
  normal: Record<number, TournamentResults | null>;
}

const EMPTY_CACHE: ResultsCache = {
  cumulative: {},
  normal: {},
};

export function TournamentDetailScreen({ windowId }: { windowId: string }) {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const [detail, setDetail] = useState<TournamentWindowDetail | null>(null);
  const [windowGroup, setWindowGroup] = useState<TournamentWindowGroup | null>(null);
  const [hasCumulative, setHasCumulative] = useState(false);
  const [resultsMode, setResultsMode] = useState<ResultsMode>("normal");
  const [page, setPage] = useState(0);
  const [resultsCache, setResultsCache] = useState<ResultsCache>(EMPTY_CACHE);
  const [activeResults, setActiveResults] = useState<TournamentResults | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    setIsInitialLoading(true);
    setScreenError(null);
    setResultsError(null);
    setDetail(null);
    setWindowGroup(null);
    setHasCumulative(false);
    setResultsMode("normal");
    setPage(0);
    setResultsCache(EMPTY_CACHE);
    setActiveResults(null);

    (async () => {
      try {
        const [detailResult, groupResult, normalResult, cumulativeResult] =
          await Promise.allSettled([
            havokApi.getTournamentWindow(windowId),
            havokApi.getTournamentWindowGroup(windowId),
            havokApi.getTournamentResults(windowId, 0, false),
            havokApi.getTournamentResults(windowId, 0, true),
          ]);

        if (!isActive) {
          return;
        }

        if (detailResult.status === "rejected") {
          throw detailResult.reason;
        }

        if (normalResult.status === "rejected") {
          throw normalResult.reason;
        }

        const nextDetail = detailResult.value;
        const nextNormalResults = normalResult.value;
        const nextWindowGroup =
          groupResult.status === "fulfilled" ? groupResult.value : null;
        const nextCumulativeResults =
          cumulativeResult.status === "fulfilled" &&
          cumulativeResult.value?.leaderboard
            ? cumulativeResult.value
            : null;

        setDetail(nextDetail);
        setWindowGroup(nextWindowGroup);
        setHasCumulative(Boolean(nextCumulativeResults?.leaderboard));
        setResultsCache({
          cumulative: nextCumulativeResults ? { 0: nextCumulativeResults } : {},
          normal: { 0: nextNormalResults },
        });
        setActiveResults(nextNormalResults);
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        setScreenError(getUserFacingErrorMessage(caughtError));
      } finally {
        if (isActive) {
          setIsInitialLoading(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [windowId]);

  useEffect(() => {
    if (isInitialLoading) {
      return;
    }

    if (resultsMode === "cumulative" && !hasCumulative) {
      setResultsMode("normal");
      return;
    }

    const bucket = resultsMode === "normal" ? resultsCache.normal : resultsCache.cumulative;

    if (Object.prototype.hasOwnProperty.call(bucket, page)) {
      setActiveResults(bucket[page] ?? null);
      setResultsError(null);
      return;
    }

    let isActive = true;

    setIsResultsLoading(true);
    setResultsError(null);

    havokApi
      .getTournamentResults(windowId, page, resultsMode === "cumulative")
      .then((result) => {
        if (!isActive) {
          return;
        }

        setResultsCache((currentCache) => {
          return {
            ...currentCache,
            [resultsMode]: {
              ...currentCache[resultsMode],
              [page]: result,
            },
          };
        });
        setActiveResults(result);
      })
      .catch((caughtError: unknown) => {
        if (!isActive) {
          return;
        }

        setResultsError(getUserFacingErrorMessage(caughtError));
      })
      .finally(() => {
        if (isActive) {
          setIsResultsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [hasCumulative, isInitialLoading, page, resultsCache, resultsMode, windowId]);

  const pageCount = activeResults?.leaderboard?.totalPages ?? 1;
  const havokPlayers = getHavokPlayers(activeResults, detail);
  const publicScoreRules = buildPublicScoreRuleLines(detail?.scoreRules);
  const otherWindows =
    windowGroup?.windows.filter((item) => item.windowId !== windowId) ?? [];

  if (isInitialLoading) {
    return (
      <AppScreen
        subtitle="Chargement des informations du tournoi."
        title="Tournoi"
        withBackButton
      >
        <LoadingState label="Chargement du tournoi..." />
      </AppScreen>
    );
  }

  if (screenError) {
    return (
      <AppScreen
        subtitle="Le detail du tournoi n a pas pu etre charge."
        title="Tournoi"
        withBackButton
      >
        <ErrorState message={screenError} />
      </AppScreen>
    );
  }

  if (!detail) {
    return (
      <AppScreen
        subtitle="Le detail du tournoi n est pas disponible."
        title="Tournoi"
        withBackButton
      >
        <EmptyState
          description="Cette window n est pas disponible dans le backend."
          title="Tournoi introuvable"
        />
      </AppScreen>
    );
  }

  const tournamentImage = getWindowPrimaryImage(detail);
  const tournamentStatus = getTournamentStatus(detail.start, detail.end);

  return (
    <AppScreen
      subtitle={formatDateRange(detail.start, detail.end)}
      title={detail.tournamentName}
      withBackButton
    >
      {tournamentImage ? (
        <Image source={{ uri: tournamentImage }} style={styles.heroImage} />
      ) : null}

      <SurfaceCard>
        <View style={styles.badgesRow}>
          <StatusBadge label={getTournamentStatusLabel(tournamentStatus)} status={tournamentStatus} />
          {detail.teamFormat ? <MetaBadge label={detail.teamFormat} /> : null}
          {detail.mode ? <MetaBadge label={detail.mode} /> : null}
        </View>

        {detail.description ? (
          <Text style={styles.description}>{detail.description}</Text>
        ) : null}

        <View style={styles.factsGrid}>
          <FactTile label="Format" value={detail.teamFormat ?? "Inconnu"} />
          <FactTile label="Mode" value={detail.mode ?? "Inconnu"} />
          <FactTile label="Matchs" value={formatCount(detail.matchCap)} />
          <FactTile
            label="Acces"
            value={detail.requiresQualification ? "Qualification" : "Ouvert"}
          />
        </View>
      </SurfaceCard>

      {hasVisibleCast(detail) ? (
        <View>
          <SectionHeader
            subtitle="Les diffusions utiles remontees par le backend."
            title="Cast"
          />
          <View style={styles.stack}>
            {detail.cast?.youtube?.link ? (
              <ExternalLinkCard
                label="YouTube"
                subtitle={detail.cast.youtube.channelName ?? "Havok"}
                url={detail.cast.youtube.link}
              />
            ) : null}
            {detail.cast?.twitch?.link ? (
              <ExternalLinkCard
                label="Twitch"
                subtitle={detail.cast.twitch.channelName ?? "Live"}
                url={detail.cast.twitch.link}
              />
            ) : null}
          </View>
        </View>
      ) : null}

      <View>
        <SectionHeader
          subtitle="Recompenses lisibles pour le public."
          title="Prizes"
        />

        {detail.prizes.length > 0 ? (
          <View style={styles.stack}>
            {detail.prizes.map((prize, index) => {
              return (
                <SurfaceCard compact key={`${prize.rewardType}-${index}`}>
                  <Text style={styles.cardTitle}>{getPublicPrizeLabel(prize)}</Text>
                </SurfaceCard>
              );
            })}
          </View>
        ) : (
          <EmptyState
            description="Aucune recompense n est disponible pour cette window."
            title="Pas de prize"
          />
        )}
      </View>

      <View>
        <SectionHeader
          subtitle="Bareme public compact a partir des regles du backend."
          title="Systeme de points"
        />

        {publicScoreRules.length > 0 ? (
          <View style={styles.stack}>
            {publicScoreRules.map((rule, index) => {
              return (
                <SurfaceCard
                  compact
                  key={`${rule.label}-${rule.pointsLabel}-${index}`}
                >
                  <View style={styles.ruleRow}>
                    <Text style={styles.ruleLabel}>{rule.label}</Text>
                    <Text style={styles.rulePoints}>{rule.pointsLabel}</Text>
                  </View>
                </SurfaceCard>
              );
            })}
          </View>
        ) : (
          <EmptyState
            description="Le bareme n est pas disponible pour ce tournoi."
            title="Points indisponibles"
          />
        )}
      </View>

      {otherWindows.length > 0 ? (
        <View>
          <SectionHeader
            subtitle="Les autres windows du meme event quand elles existent."
            title="Autres windows"
          />

          <View style={styles.stack}>
            {otherWindows.map((item) => {
              return (
                <Pressable
                  key={item.windowId}
                  onPress={() =>
                    router.push({
                      pathname: "/window/[windowId]",
                      params: { windowId: item.windowId },
                    })
                  }
                >
                  <SurfaceCard compact>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {formatDateRange(item.start, item.end)}
                    </Text>
                  </SurfaceCard>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View>
        <SectionHeader
          subtitle="Le bloc Havok priorise le leaderboard puis le fallback du detail."
          title="Havok players"
        />

        {havokPlayers.length > 0 ? (
          <View style={styles.havokGrid}>
            {havokPlayers.map((player, index) => {
              return (
                <HavokPlayerTile
                  key={`${getHavokPlayerName(player)}-${index}`}
                  player={player}
                />
              );
            })}
          </View>
        ) : (
          <EmptyState
            description="Aucun joueur Havok n a ete remonte pour cette window."
            title="Aucun joueur"
          />
        )}
      </View>

      <View>
        <SectionHeader
          subtitle="Une page de 10 equipes, avec toggle cumulatif si disponible."
          title="Resultats"
        />

        <SurfaceCard>
          <View style={styles.resultsHeader}>
            {hasCumulative ? (
              <View style={styles.toggleRow}>
                <ToggleButton
                  isActive={resultsMode === "normal"}
                  label="Normal"
                  onPress={() => {
                    setResultsMode("normal");
                    setPage(0);
                  }}
                />
                <ToggleButton
                  isActive={resultsMode === "cumulative"}
                  label="Cumul"
                  onPress={() => {
                    setResultsMode("cumulative");
                    setPage(0);
                  }}
                />
              </View>
            ) : null}

            {activeResults?.leaderboard ? (
              <View style={styles.paginationRow}>
                <PaginationButton
                  disabled={page === 0}
                  label="Prec."
                  onPress={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                />
                <Text style={styles.paginationLabel}>
                  Page {page + 1} / {pageCount}
                </Text>
                <PaginationButton
                  disabled={page + 1 >= pageCount}
                  label="Suiv."
                  onPress={() =>
                    setPage((currentPage) => Math.min(pageCount - 1, currentPage + 1))
                  }
                />
              </View>
            ) : null}
          </View>

          {isResultsLoading ? (
            <LoadingState label="Chargement de la page..." />
          ) : null}

          {resultsError ? <ErrorState message={resultsError} /> : null}

          {!isResultsLoading && !resultsError && !activeResults?.leaderboard?.results.length ? (
            <EmptyState
              description="Aucun resultat n est disponible sur cette page."
              title="Leaderboard vide"
            />
          ) : null}

          {!resultsError && activeResults?.leaderboard?.results.length ? (
            <View style={styles.resultsList}>
              {activeResults.leaderboard.results.map((entry, index) => {
                return (
                  <LeaderboardRow
                    entry={entry}
                    key={`${page}-${entry.rank}-${entry.points}-${index}`}
                  />
                );
              })}
            </View>
          ) : null}
        </SurfaceCard>
      </View>
    </AppScreen>
  );
}

function FactTile({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <SurfaceCard compact style={styles.factTile}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </SurfaceCard>
  );
}

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: ReturnType<typeof getTournamentStatus>;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View
      style={[
        styles.statusBadge,
        status === "live"
          ? styles.statusBadgeLive
          : status === "upcoming"
            ? styles.statusBadgeUpcoming
            : styles.statusBadgePast,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeLabel,
          status === "live"
            ? styles.statusBadgeLabelLive
            : status === "upcoming"
              ? styles.statusBadgeLabelUpcoming
              : styles.statusBadgeLabelPast,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function MetaBadge({ label }: { label: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.metaBadge}>
      <Text style={styles.metaBadgeLabel}>{label}</Text>
    </View>
  );
}

function ExternalLinkCard({
  label,
  subtitle,
  url,
}: {
  label: string;
  subtitle: string;
  url: string;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <Pressable onPress={() => void openExternalUrl(url)}>
      <SurfaceCard compact>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardMeta}>{subtitle}</Text>
      </SurfaceCard>
    </Pressable>
  );
}

function ToggleButton({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggleButton, isActive ? styles.toggleButtonActive : null]}
    >
      <Text
        style={[
          styles.toggleButtonLabel,
          isActive ? styles.toggleButtonLabelActive : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PaginationButton({
  disabled,
  label,
  onPress,
}: {
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.paginationButton, disabled ? styles.paginationButtonDisabled : null]}
    >
      <Text
        style={[
          styles.paginationButtonLabel,
          disabled ? styles.paginationButtonLabelDisabled : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HavokPlayerTile({
  player,
}: {
  player: HavokPlayerStatus | (PlayerQualification & { labels?: string[] });
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const imageUrl = resolveAssetUrl(player.image);
  const name = getHavokPlayerName(player);
  const label = getPlayerLabel(player);

  return (
    <View style={styles.havokTile}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.havokAvatar} />
      ) : (
        <View style={styles.havokAvatarFallback}>
          <Text style={styles.havokAvatarFallbackLabel}>
            {name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
      )}
      <Text numberOfLines={1} style={styles.havokName}>
        {name}
      </Text>
      <Text style={styles.havokLabel}>{label}</Text>
      {"rank" in player && player.rank ? (
        <Text style={styles.havokMeta}>{formatPlacement(player.rank)}</Text>
      ) : null}
      {"points" in player && player.points !== undefined && player.points !== null ? (
        <Text style={styles.havokMeta}>{formatPoints(player.points)}</Text>
      ) : null}
    </View>
  );
}

function LeaderboardRow({
  entry,
}: {
  entry: NonNullable<TournamentResults["leaderboard"]>["results"][number];
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.resultRow}>
      <View style={styles.resultRank}>
        <Text style={styles.resultRankLabel}>
          {entry.rankLabel ?? formatPlacement(entry.rank)}
        </Text>
      </View>

      <View style={styles.resultBody}>
        <Text style={styles.resultNames}>{joinPlayerNames(entry.names)}</Text>

        <View style={styles.resultStatsRow}>
          <ResultStat label="Pts" value={entry.pointsLabel ?? formatPoints(entry.points)} />
          <ResultStat
            label="Games"
            value={formatCount(entry.nbGamesPlayed)}
          />
          <ResultStat label="Kills" value={formatCount(entry.kills)} />
          <ResultStat label="Wins" value={formatCount(entry.wins)} />
        </View>

        {entry.labels?.length ? (
          <View style={styles.resultLabelsRow}>
            {entry.labels.map((label, index) => {
              return (
                <View key={`${label}-${index}`} style={styles.resultLabelChip}>
                  <Text style={styles.resultLabelChipText}>{label}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={styles.resultStat}>
      <Text style={styles.resultStatLabel}>{label}</Text>
      <Text style={styles.resultStatValue}>{value}</Text>
    </View>
  );
}

function getHavokPlayers(
  results: TournamentResults | null,
  detail: TournamentWindowDetail | null,
) {
  if (results?.leaderboard?.qualStatus?.length) {
    return results.leaderboard.qualStatus;
  }

  return detail?.playerQual ?? [];
}

function getPlayerLabel(
  player: HavokPlayerStatus | (PlayerQualification & { labels?: string[] }),
) {
  if ("labels" in player && player.labels?.length) {
    return player.labels[0];
  }

  if ("isThisPlayerQual" in player && player.isThisPlayerQual) {
    return "Qualifie";
  }

  return "Havok";
}

function getHavokPlayerName(
  player: HavokPlayerStatus | (PlayerQualification & { labels?: string[] }),
) {
  if ("playerName" in player && typeof player.playerName === "string") {
    return player.playerName;
  }

  if ("name" in player && typeof player.name === "string") {
    return player.name;
  }

  return "Havok";
}

function hasVisibleCast(detail: TournamentWindowDetail) {
  return Boolean(detail.cast?.youtube?.link || detail.cast?.twitch?.link);
}

async function openExternalUrl(url: string) {
  const normalizedUrl = normalizeExternalUrl(url);

  if (!normalizedUrl) {
    showExternalLinkError();
    return;
  }

  try {
    const supported = await Linking.canOpenURL(normalizedUrl);

    if (!supported) {
      throw new Error("unsupported_external_url");
    }

    await Linking.openURL(normalizedUrl);
  } catch (error) {
    logApiError("external_link.open_failure", error, { url: normalizedUrl });
    showExternalLinkError();
  }
}

function normalizeExternalUrl(url: string) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  return encodeURI(withProtocol);
}

function showExternalLinkError() {
  Alert.alert(
    "Lien indisponible",
    "Impossible d ouvrir ce lien pour le moment.",
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    cardMeta: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "800",
    },
    description: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
    },
    factLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    factTile: {
      flexBasis: "48%",
    },
    factValue: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 8,
    },
    factsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    havokAvatar: {
      borderRadius: 18,
      height: 64,
      width: 64,
    },
    havokAvatarFallback: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 18,
      height: 64,
      justifyContent: "center",
      width: 64,
    },
    havokAvatarFallbackLabel: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "800",
    },
    havokGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    havokLabel: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
    },
    havokMeta: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 4,
    },
    havokName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "800",
      marginTop: 10,
    },
    havokTile: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 22,
      borderWidth: 1,
      minHeight: 180,
      padding: 14,
      width: "48%",
    },
    heroImage: {
      borderRadius: 28,
      height: 220,
      width: "100%",
    },
    metaBadge: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    metaBadgeLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },
    paginationButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    paginationButtonDisabled: {
      opacity: 0.45,
    },
    paginationButtonLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "700",
    },
    paginationButtonLabelDisabled: {
      color: colors.textMuted,
    },
    paginationLabel: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
    },
    paginationRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    resultBody: {
      flex: 1,
      gap: 10,
    },
    resultLabelChip: {
      backgroundColor: colors.accentSurface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    resultLabelChipText: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "700",
    },
    resultLabelsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    resultNames: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
      lineHeight: 22,
    },
    resultRank: {
      alignItems: "center",
      backgroundColor: colors.brandSurface,
      borderRadius: 16,
      justifyContent: "center",
      minHeight: 56,
      minWidth: 62,
      paddingHorizontal: 10,
    },
    resultRankLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    resultRow: {
      alignItems: "flex-start",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: 12,
      paddingVertical: 14,
    },
    resultsHeader: {
      gap: 14,
      marginBottom: 4,
    },
    resultsList: {
      marginTop: 8,
    },
    resultStat: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 14,
      gap: 4,
      minWidth: 78,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    resultStatLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },
    resultStatValue: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    resultStatsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    ruleLabel: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    rulePoints: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: "800",
    },
    ruleRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    stack: {
      gap: 10,
    },
    statusBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statusBadgeLabel: {
      fontSize: 11,
      fontWeight: "700",
    },
    statusBadgeLabelLive: {
      color: colors.live,
    },
    statusBadgeLabelPast: {
      color: colors.textMuted,
    },
    statusBadgeLabelUpcoming: {
      color: colors.accent,
    },
    statusBadgeLive: {
      backgroundColor: colors.liveSurface,
    },
    statusBadgePast: {
      backgroundColor: colors.surfaceSecondary,
    },
    statusBadgeUpcoming: {
      backgroundColor: colors.accentSurface,
    },
    toggleButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    toggleButtonActive: {
      backgroundColor: colors.accentSurface,
    },
    toggleButtonLabel: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
    },
    toggleButtonLabelActive: {
      color: colors.accent,
    },
    toggleRow: {
      flexDirection: "row",
      gap: 8,
    },
  });
}
