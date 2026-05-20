import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { havokApi } from "@/src/api/havokApi";
import { AppScreen } from "@/src/components/AppScreen";
import { EmptyState } from "@/src/components/EmptyState";
import { ErrorState } from "@/src/components/ErrorState";
import { LoadingState } from "@/src/components/LoadingState";
import { TournamentDetailSkeleton } from "@/src/components/ScreenSkeletons";
import { SectionHeader } from "@/src/components/SectionHeader";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useTheme } from "@/src/theme/ThemeProvider";
import type {
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
  getPublicPrizeDisplay,
  shouldDisplayPrize,
} from "@/src/utils/tournament";

type ResultsMode = "cumulative" | "normal";
type DetailSection =
  | "cast"
  | "prizes"
  | "points"
  | "leaderboards";

interface TrackedLeaderboardPlayer {
  accountId?: string | null;
  image?: string | null;
  labels: string[];
  name: string;
  points?: number | null;
  rank?: number | null;
}

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
  const [activeSection, setActiveSection] = useState<DetailSection>("points");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isCastExpanded, setIsCastExpanded] = useState(false);
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
    setActiveSection("points");
    setIsDescriptionExpanded(false);
    setIsCastExpanded(false);

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
        const nextHasCumulative = Boolean(nextCumulativeResults?.leaderboard);

        setDetail(nextDetail);
        setWindowGroup(nextWindowGroup);
        setHasCumulative(nextHasCumulative);
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

        if (resultsMode === "cumulative" && !result?.leaderboard) {
          setHasCumulative(false);
          setResultsMode("normal");
          setPage(0);
          setActiveResults(null);
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
  const publicScoreRules = buildPublicScoreRuleLines(detail?.scoreRules);
  const otherWindows =
    windowGroup?.windows.filter((item) => item.windowId !== windowId) ?? [];
  const leaderboardEntries = activeResults?.leaderboard?.results ?? [];
  const trackedPlayers = buildTrackedLeaderboardPlayers(activeResults);
  const visiblePrizes = (detail?.prizes ?? []).filter(shouldDisplayPrize);
  const showCumulativeToggle =
    hasCumulative && Boolean(resultsCache.cumulative[0]?.leaderboard);

  if (isInitialLoading) {
    return (
      <AppScreen
        subtitle="Chargement des informations du tournoi."
        title="Tournoi"
        withBackButton
      >
        <TournamentDetailSkeleton />
      </AppScreen>
    );
  }

  if (screenError) {
    return (
      <AppScreen
        subtitle="Le détail du tournoi n'a pas pu être chargé."
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

        <View style={styles.factsGrid}>
          <FactTile label="Format" value={detail.teamFormat ?? "Inconnu"} />
          <FactTile label="Mode" value={detail.mode ?? "Inconnu"} />
          <FactTile label="Matchs" value={formatCount(detail.matchCap)} />
          <FactTile
            label="Acces"
            value={detail.requiresQualification ? "Qualification" : "Ouvert"}
          />
        </View>

        {detail.description ? (
          <View style={styles.inlineDescription}>
            <Pressable
              onPress={() => setIsDescriptionExpanded((currentValue) => !currentValue)}
              style={styles.accordionTrigger}
            >
              <View style={styles.accordionHeader}>
                <Text style={styles.accordionTitle}>Description</Text>
                <Text style={styles.accordionHint}>
                  {isDescriptionExpanded ? "Masquer" : "Afficher"}
                </Text>
              </View>
              <Ionicons
                color={theme.colors.accent}
                name={isDescriptionExpanded ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </Pressable>

            {isDescriptionExpanded ? (
              <ScrollView nestedScrollEnabled style={styles.descriptionScroll}>
                <Text style={styles.description}>{detail.description}</Text>
              </ScrollView>
            ) : null}
          </View>
        ) : null}
      </SurfaceCard>

      <SurfaceCard compact>
        <Pressable
          onPress={() => setIsCastExpanded((currentValue) => !currentValue)}
          style={styles.accordionTrigger}
        >
          <View style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Cast</Text>
            <Text style={styles.accordionHint}>
              {isCastExpanded ? "Masquer" : "Afficher"}
            </Text>
          </View>
          <Ionicons
            color={theme.colors.accent}
            name={isCastExpanded ? "chevron-up" : "chevron-down"}
            size={18}
          />
        </Pressable>

        {isCastExpanded ? (
          hasVisibleCast(detail) ? (
            <View style={styles.stackCompact}>
              {detail.cast?.youtube?.link ? (
                <ExternalLinkCard
                  icon="logo-youtube"
                  label="YouTube"
                  subtitle={detail.cast.youtube.channelName ?? "Havok"}
                  url={detail.cast.youtube.link}
                />
              ) : null}
              {detail.cast?.twitch?.link ? (
                <ExternalLinkCard
                  icon="logo-twitch"
                  label="Twitch"
                  subtitle={detail.cast.twitch.channelName ?? "Live"}
                  url={detail.cast.twitch.link}
                />
              ) : null}
            </View>
          ) : (
            <View style={styles.accordionEmpty}>
              <Text style={styles.cardMeta}>
                Aucune diffusion n est disponible pour cette window.
              </Text>
            </View>
          )
        ) : null}
      </SurfaceCard>

      {otherWindows.length > 0 ? (
        <View>
          <SectionHeader
            subtitle="Passe rapidement d'une session à l'autre."
            title="Navigation windows"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.windowSwitcherRow}
          >
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
                  style={styles.windowSwitchCard}
                >
                  <Text numberOfLines={2} style={styles.windowSwitchTitle}>
                    {item.name}
                  </Text>
                  <Text style={styles.windowSwitchMeta}>
                    {formatDateRange(item.start, item.end)}
                  </Text>
                  <View style={styles.windowSwitchAction}>
                    <Text style={styles.windowSwitchActionLabel}>Ouvrir</Text>
                    <Ionicons
                      color={theme.colors.accent}
                      name="arrow-forward"
                      size={14}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <View>
        <SectionHeader
          title="Details"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabs}
        >
          <ToggleChip
            isActive={activeSection === "prizes"}
            label="Prizes"
            onPress={() => setActiveSection("prizes")}
          />
          <ToggleChip
            isActive={activeSection === "points"}
            label="Systeme de points"
            onPress={() => setActiveSection("points")}
          />
          <ToggleChip
            isActive={activeSection === "leaderboards"}
            label="Leaderboards"
            onPress={() => setActiveSection("leaderboards")}
          />
        </ScrollView>

        {activeSection === "prizes" ? (
          visiblePrizes.length > 0 ? (
            <View style={styles.stack}>
              {visiblePrizes.map((prize, index) => {
                const prizeDisplay = getPublicPrizeDisplay(prize);

                return (
                  <SurfaceCard compact key={`${prize.rewardType}-${index}`}>
                    <Text style={styles.cardTitle}>{prizeDisplay.title}</Text>
                    {prizeDisplay.subtitle ? (
                      <Text style={styles.prizeSubtitle}>{prizeDisplay.subtitle}</Text>
                    ) : null}
                  </SurfaceCard>
                );
              })}
            </View>
          ) : (
            <EmptyState
              description="Aucune recompense n'est disponible pour cette window."
              title="Pas de prize"
            />
          )
        ) : null}

        {activeSection === "points" ? (
          publicScoreRules.length > 0 ? (
            <SurfaceCard>
              <View style={styles.pointsTable}>
                <View style={styles.pointsTableHeaderRow}>
                  <View style={[styles.pointsTableCell, styles.pointsTableActionCell]}>
                    <Text style={styles.pointsTableHeaderLabel}>Action</Text>
                  </View>
                  <View style={[styles.pointsTableCell, styles.pointsTableConditionCell]}>
                    <Text style={styles.pointsTableHeaderLabel}>Condition</Text>
                  </View>
                  <View style={[styles.pointsTableCell, styles.pointsTableCapCell]}>
                    <Text style={styles.pointsTableHeaderLabel}>Cap</Text>
                  </View>
                  <View style={[styles.pointsTableCell, styles.pointsTablePointsCell]}>
                    <Text style={styles.pointsTableHeaderLabel}>Pts</Text>
                  </View>
                </View>

                {publicScoreRules.map((rule, index) => {
                  return (
                    <View
                      key={`${rule.actionLabel}-${rule.conditionLabel}-${rule.capLabel ?? "na"}-${rule.pointsLabel}-${index}`}
                      style={styles.pointsTableRow}
                    >
                      <View style={[styles.pointsTableCell, styles.pointsTableActionCell]}>
                        <Text style={styles.ruleLabel}>{rule.actionLabel}</Text>
                      </View>

                      <View style={[styles.pointsTableCell, styles.pointsTableConditionCell]}>
                        <Text style={styles.pointsTableValue}>{rule.conditionLabel}</Text>
                      </View>

                      <View style={[styles.pointsTableCell, styles.pointsTableCapCell]}>
                        <Text style={styles.pointsTableValue}>{rule.capLabel ?? "-"}</Text>
                      </View>

                      <View style={[styles.pointsTableCell, styles.pointsTablePointsCell]}>
                        <Text style={styles.rulePoints}>{rule.pointsLabel}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </SurfaceCard>
          ) : (
            <EmptyState
              description="Le barème n'est pas disponible pour ce tournoi."
              title="Points indisponibles"
            />
          )
        ) : null}

        {activeSection === "leaderboards" ? (
          <SurfaceCard>
            <View style={styles.resultsHeader}>
              {showCumulativeToggle ? (
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

            {!isResultsLoading &&
            !resultsError &&
            !leaderboardEntries.length &&
            !trackedPlayers.length ? (
              <EmptyState
                description="Aucun resultat n'est disponible sur cette page."
                title="Leaderboard vide"
              />
            ) : null}

            {!resultsError && trackedPlayers.length ? (
              <View style={styles.leaderboardSection}>
                <Text style={styles.tableSectionTitle}>Havok players</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tableScroll}
                >
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      <TableHeaderCell label="Player" style={styles.tableCellPlayer} />
                      <TableHeaderCell label="Rank" style={styles.tableCellRank} />
                      <TableHeaderCell label="Pts" style={styles.tableCellPoints} />
                      <TableHeaderCell label="Status" style={styles.tableCellStatus} />
                    </View>

                    {trackedPlayers.map((player, index) => {
                      return (
                        <TrackedPlayerRow
                          key={`${player.accountId ?? player.name}-${player.rank ?? "na"}-${index}`}
                          player={player}
                        />
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : null}

            {!resultsError && leaderboardEntries.length ? (
              <View style={styles.leaderboardSection}>
                <Text style={styles.tableSectionTitle}>Classement</Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.tableScroll}
                >
                  <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                      <TableHeaderCell label="Rank" style={styles.tableCellRank} />
                      <TableHeaderCell label="Team" style={styles.tableCellPlayers} />
                      <TableHeaderCell label="Pts" style={styles.tableCellPoints} />
                      <TableHeaderCell label="G" style={styles.tableCellNumber} />
                      <TableHeaderCell label="Kills" style={styles.tableCellNumber} />
                      <TableHeaderCell label="W" style={styles.tableCellNumber} />
                    </View>

                    {leaderboardEntries.map((entry, index) => {
                      return (
                        <LeaderboardRow
                          entry={entry}
                          key={`${page}-${entry.rank}-${entry.points}-${index}`}
                        />
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : null}
          </SurfaceCard>
        ) : null}
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
  icon,
  label,
  subtitle,
  url,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  url: string;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <Pressable onPress={() => void openExternalUrl(url)}>
      <SurfaceCard compact style={styles.linkCard}>
        <View style={styles.linkCardIcon}>
          <Ionicons color={theme.colors.accent} name={icon} size={18} />
        </View>
        <View style={styles.linkCardCopy}>
          <Text style={styles.cardTitle}>{label}</Text>
          <Text style={styles.cardMeta}>{subtitle}</Text>
        </View>
        <Ionicons color={theme.colors.textMuted} name="open-outline" size={18} />
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

function ToggleChip({
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
      style={[styles.sectionChip, isActive ? styles.sectionChipActive : null]}
    >
      <Text
        style={[
          styles.sectionChipLabel,
          isActive ? styles.sectionChipLabelActive : null,
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

function TableHeaderCell({
  label,
  style,
}: {
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return (
    <View style={[styles.tableCell, style]}>
      <Text style={styles.tableHeaderLabel}>{label}</Text>
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
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, styles.tableCellRank]}>
        <Text style={styles.tablePrimaryText}>
          {entry.rankLabel ?? formatPlacement(entry.rank)}
        </Text>
      </View>

      <View style={[styles.tableCell, styles.tableCellPlayers]}>
        <Text style={styles.tablePrimaryText}>{joinPlayerNames(entry.names)}</Text>

        {entry.labels?.length ? (
          <View style={styles.tableInlineTagsRow}>
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

      <View style={[styles.tableCell, styles.tableCellPoints]}>
        <Text style={styles.tablePrimaryText}>
          {entry.pointsLabel ?? formatPoints(entry.points)}
        </Text>
      </View>

      <View style={[styles.tableCell, styles.tableCellNumber]}>
        <Text style={styles.tablePrimaryText}>{formatCount(entry.nbGamesPlayed)}</Text>
      </View>

      <View style={[styles.tableCell, styles.tableCellNumber]}>
        <Text style={styles.tablePrimaryText}>{formatCount(entry.kills)}</Text>
      </View>

      <View style={[styles.tableCell, styles.tableCellNumber]}>
        <Text style={styles.tablePrimaryText}>{formatCount(entry.wins)}</Text>
      </View>
    </View>
  );
}

function TrackedPlayerRow({ player }: { player: TrackedLeaderboardPlayer }) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const imageUrl = resolveAssetUrl(player.image);

  return (
    <View style={styles.tableRow}>
      <View style={[styles.tableCell, styles.tableCellPlayer]}>
        <View style={styles.trackedPlayerCell}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.trackedPlayerAvatar} />
          ) : (
            <View style={styles.trackedPlayerAvatarFallback}>
              <Text style={styles.trackedPlayerAvatarFallbackText}>
                {player.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.tablePrimaryText}>{player.name}</Text>
        </View>
      </View>

      <View style={[styles.tableCell, styles.tableCellRank]}>
        <Text style={styles.tablePrimaryText}>
          {typeof player.rank === "number" ? formatPlacement(player.rank) : "-"}
        </Text>
      </View>

      <View style={[styles.tableCell, styles.tableCellPoints]}>
        <Text style={styles.tablePrimaryText}>
          {typeof player.points === "number" ? formatPoints(player.points) : "-"}
        </Text>
      </View>

      <View style={[styles.tableCell, styles.tableCellStatus]}>
        {player.labels.length ? (
          <View style={styles.tableTagsRow}>
            {player.labels.map((label, index) => {
              return (
                <View key={`${label}-${index}`} style={styles.resultLabelChip}>
                  <Text style={styles.resultLabelChipText}>{label}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.tableMutedText}>Suivi</Text>
        )}
      </View>
    </View>
  );
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

function buildTrackedLeaderboardPlayers(
  results: TournamentResults | null,
): TrackedLeaderboardPlayer[] {
  const trackedPlayers = Array.isArray(results?.players) ? results.players : [];
  const qualStatuses = Array.isArray(results?.leaderboard?.qualStatus)
    ? results.leaderboard.qualStatus
    : [];
  const statusByAccountId = new Map<string, (typeof qualStatuses)[number]>();
  const statusByName = new Map<string, (typeof qualStatuses)[number]>();

  qualStatuses.forEach((status) => {
    if (!status) {
      return;
    }

    if (status.accountId) {
      statusByAccountId.set(status.accountId, status);
    }

    if (status.name) {
      statusByName.set(status.name.toLowerCase(), status);
    }
  });

  const mergedPlayers = trackedPlayers.map((player) => {
    const matchedStatus =
      (player.accountId ? statusByAccountId.get(player.accountId) : null) ??
      (player.name ? statusByName.get(player.name.toLowerCase()) : null) ??
      null;

    return {
      accountId: player.accountId ?? matchedStatus?.accountId ?? null,
      image: player.image ?? matchedStatus?.image ?? null,
      labels: Array.isArray(matchedStatus?.labels)
        ? matchedStatus.labels.filter(Boolean)
        : [],
      name: player.name ?? matchedStatus?.name ?? "Joueur Havok",
      points: matchedStatus?.points ?? null,
      rank: matchedStatus?.rank ?? null,
    };
  });

  const seenKeys = new Set(
    mergedPlayers.map((player) => {
      return player.accountId || player.name.toLowerCase();
    }),
  );

  qualStatuses.forEach((status) => {
    if (!status?.name) {
      return;
    }

    const key = status.accountId || status.name.toLowerCase();

    if (seenKeys.has(key)) {
      return;
    }

    mergedPlayers.push({
      accountId: status.accountId ?? null,
      image: status.image ?? null,
      labels: Array.isArray(status.labels) ? status.labels.filter(Boolean) : [],
      name: status.name,
      points: status.points ?? null,
      rank: status.rank ?? null,
    });
    seenKeys.add(key);
  });

  return mergedPlayers;
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    accordionEmpty: {
      paddingTop: 12,
    },
    accordionHeader: {
      flex: 1,
      gap: 4,
    },
    accordionHint: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    accordionTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "800",
    },
    accordionTrigger: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
    },
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
      paddingTop: 12,
    },
    descriptionScroll: {
      maxHeight: 160,
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
    heroImage: {
      borderRadius: 28,
      width: '100%',
      aspectRatio: 1,
    },
    inlineDescription: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      marginTop: 16,
      paddingTop: 16,
    },
    linkCard: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
    },
    linkCardCopy: {
      flex: 1,
    },
    linkCardIcon: {
      alignItems: "center",
      backgroundColor: colors.accentSurface,
      borderRadius: 14,
      height: 40,
      justifyContent: "center",
      width: 40,
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
    pointsTable: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      overflow: "hidden",
    },
    pointsTableActionCell: {
      flex: 1.1,
    },
    pointsTableCell: {
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    pointsTableCapCell: {
      width: 82,
    },
    pointsTableConditionCell: {
      flex: 1.2,
    },
    pointsTableHeaderLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    pointsTableHeaderRow: {
      backgroundColor: colors.surfaceSecondary,
      flexDirection: "row",
    },
    pointsTablePointsCell: {
      alignItems: "flex-end",
      width: 82,
    },
    pointsTableRow: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      flexDirection: "row",
    },
    pointsTableValue: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    prizeSubtitle: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
    },
    leaderboardSection: {
      gap: 10,
      marginTop: 14,
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
    resultsHeader: {
      gap: 14,
      marginBottom: 4,
    },
    sectionChip: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    sectionChipActive: {
      backgroundColor: colors.accentSurface,
    },
    sectionChipLabel: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
    },
    sectionChipLabelActive: {
      color: colors.accent,
    },
    sectionTabs: {
      gap: 8,
      paddingBottom: 4,
      paddingRight: 8,
    },
    stackCompact: {
      gap: 8,
      paddingTop: 12,
    },
    table: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      minWidth: 500,
      overflow: "hidden",
    },
    tableCell: {
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 11,
    },
    tableCellNumber: {
      width: 52,
    },
    tableCellPlayer: {
      minWidth: 180,
      width: 180,
    },
    tableCellPlayers: {
      minWidth: 170,
      width: 170,
    },
    tableCellPoints: {
      width: 70,
    },
    tableCellRank: {
      width: 62,
    },
    tableCellStatus: {
      minWidth: 120,
      width: 120,
    },
    tableHeaderLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    tableHeaderRow: {
      backgroundColor: colors.surfaceSecondary,
      flexDirection: "row",
    },
    tableMutedText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    tablePrimaryText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    tableRow: {
      flexDirection: "row",
      borderTopColor: colors.border,
      borderTopWidth: 1,
    },
    tableInlineTagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 8,
    },
    tableScroll: {
      marginTop: 2,
    },
    tableSectionTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    tableTagsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    trackedPlayerAvatar: {
      borderRadius: 14,
      height: 28,
      width: 28,
    },
    trackedPlayerAvatarFallback: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 14,
      height: 28,
      justifyContent: "center",
      width: 28,
    },
    trackedPlayerAvatarFallbackText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "800",
    },
    trackedPlayerCell: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
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
    windowSwitchAction: {
      alignItems: "center",
      flexDirection: "row",
      gap: 6,
      marginTop: 12,
    },
    windowSwitchActionLabel: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    windowSwitchCard: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 20,
      borderWidth: 1,
      minHeight: 132,
      width: 248,
      padding: 16,
    },
    windowSwitcherRow: {
      gap: 10,
      paddingRight: 8,
    },
    windowSwitchMeta: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 6,
    },
    windowSwitchTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
  });
}
