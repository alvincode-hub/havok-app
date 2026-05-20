import { StyleSheet, View } from "react-native";

import { SectionHeader } from "@/src/components/SectionHeader";
import { SkeletonBlock } from "@/src/components/SkeletonBlock";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useTheme } from "@/src/theme/ThemeProvider";

export function HomeScreenSkeleton() {
  const styles = useStyles();

  return (
    <View style={styles.screenStack}>
      <View>
        <SectionHeader title="Actu" />
        <View style={styles.sectionStack}>
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </View>
      </View>

      <View>
        <SectionHeader title="Live" />
        <EventCardSkeleton featured />
      </View>

      <View>
        <SectionHeader title="A venir" />
        <View style={styles.sectionStack}>
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      </View>

      <View>
        <SectionHeader title="Derniers resultats Havok" />
        <EventCardSkeleton />

        <View style={styles.resultsGrid}>
          <LatestResultSkeleton />
          <LatestResultSkeleton />
          <LatestResultSkeleton />
          <LatestResultSkeleton />
        </View>
      </View>
    </View>
  );
}

export function TournamentsScreenSkeleton() {
  const styles = useStyles();

  return (
    <View style={styles.screenStack}>
      <SurfaceCard>
        <View style={styles.calendarHeader}>
          <SkeletonBlock height={36} radius={18} width={36} />
          <SkeletonBlock height={28} radius={14} width="42%" />
          <SkeletonBlock height={36} radius={18} width={36} />
        </View>

        <View style={styles.weekRow}>
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBlock
              key={`week-${index}`}
              height={14}
              radius={7}
              style={styles.weekLabelSkeleton}
            />
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {Array.from({ length: 35 }).map((_, index) => (
            <SkeletonBlock
              key={`day-${index}`}
              height={52}
              radius={16}
              style={styles.daySkeleton}
            />
          ))}
        </View>
      </SurfaceCard>

      <View style={styles.sectionStack}>
        <SkeletonBlock height={24} radius={12} width="38%" />
        <CalendarEventRowSkeleton />
        <CalendarEventRowSkeleton />
        <CalendarEventRowSkeleton />
      </View>
    </View>
  );
}

export function PlayersScreenSkeleton() {
  const styles = useStyles();

  return (
    <View>
      <SectionHeader title="Roster" />
      <View style={styles.sectionStack}>
        {Array.from({ length: 6 }).map((_, index) => (
          <PlayerRowSkeleton key={`player-${index}`} />
        ))}
      </View>
    </View>
  );
}

export function TournamentDetailSkeleton() {
  const styles = useStyles();

  return (
    <View style={styles.screenStack}>
      <SkeletonBlock height={280} radius={28} />

      <SurfaceCard>
        <View style={styles.badgesRow}>
          <SkeletonBlock height={30} radius={15} width={110} />
          <SkeletonBlock height={30} radius={15} width={84} />
          <SkeletonBlock height={30} radius={15} width={78} />
        </View>

        <View style={styles.factsGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={`fact-${index}`} style={styles.factSkeleton}>
              <SkeletonBlock height={12} radius={6} width="54%" />
              <SkeletonBlock height={24} radius={10} style={styles.factValueSkeleton} />
            </View>
          ))}
        </View>

        <View style={styles.descriptionSkeleton}>
          <SkeletonBlock height={18} radius={9} width="34%" />
          <SkeletonBlock height={16} radius={8} style={styles.copyLine} />
          <SkeletonBlock height={16} radius={8} style={styles.copyLine} width="88%" />
          <SkeletonBlock height={16} radius={8} width="62%" />
        </View>
      </SurfaceCard>

      <SurfaceCard compact>
        <SkeletonBlock height={18} radius={9} width="26%" />
        <View style={styles.sectionStackCompact}>
          <SkeletonBlock height={58} radius={18} />
          <SkeletonBlock height={58} radius={18} />
        </View>
      </SurfaceCard>

      <View>
        <SectionHeader title="Details" />

        <View style={styles.chipsRow}>
          <SkeletonBlock height={40} radius={20} width={92} />
          <SkeletonBlock height={40} radius={20} width={144} />
          <SkeletonBlock height={40} radius={20} width={122} />
        </View>

        <SurfaceCard>
          <View style={styles.sectionStack}>
            <SkeletonBlock height={46} radius={14} />
            <SkeletonBlock height={46} radius={14} />
            <SkeletonBlock height={46} radius={14} />
            <SkeletonBlock height={46} radius={14} />
          </View>
        </SurfaceCard>
      </View>
    </View>
  );
}

function NewsCardSkeleton() {
  const styles = useStyles();

  return (
    <SurfaceCard>
      <View style={styles.newsRow}>
        <SkeletonBlock height={88} radius={18} width={88} />
        <View style={styles.flexOne}>
          <SkeletonBlock height={22} radius={11} width="82%" />
          <SkeletonBlock height={14} radius={7} style={styles.copyLine} />
          <SkeletonBlock height={14} radius={7} width="56%" />
        </View>
      </View>
    </SurfaceCard>
  );
}

function EventCardSkeleton({ featured = false }: { featured?: boolean }) {
  const styles = useStyles();

  return (
    <SurfaceCard>
      <SkeletonBlock height={featured ? 220 : 184} radius={22} />
      <View style={styles.eventContent}>
        <View style={styles.badgesRow}>
          <SkeletonBlock height={28} radius={14} width={90} />
          <SkeletonBlock height={28} radius={14} width={72} />
          <SkeletonBlock height={28} radius={14} width={66} />
        </View>
        <SkeletonBlock height={featured ? 30 : 24} radius={12} width="78%" />
        <SkeletonBlock height={16} radius={8} width="52%" />
      </View>
    </SurfaceCard>
  );
}

function LatestResultSkeleton() {
  const styles = useStyles();

  return (
    <View style={styles.latestResultCard}>
      <SkeletonBlock height={18} radius={9} width="76%" />
      <SkeletonBlock height={14} radius={7} style={styles.copyLine} width="58%" />
      <SkeletonBlock height={14} radius={7} width="66%" />
    </View>
  );
}

function PlayerRowSkeleton() {
  const styles = useStyles();

  return (
    <SurfaceCard compact>
      <View style={styles.playerRow}>
        <SkeletonBlock height={58} radius={18} width={58} />
        <View style={styles.flexOne}>
          <SkeletonBlock height={18} radius={9} width="44%" />
          <SkeletonBlock height={14} radius={7} style={styles.copyLine} width="28%" />
        </View>
        <SkeletonBlock height={22} radius={11} width={22} />
      </View>
    </SurfaceCard>
  );
}

function CalendarEventRowSkeleton() {
  const styles = useStyles();

  return (
    <View style={styles.calendarEventRow}>
      <View style={styles.flexOne}>
        <SkeletonBlock height={18} radius={9} width="72%" />
        <SkeletonBlock height={14} radius={7} style={styles.copyLine} width="48%" />
      </View>
      <SkeletonBlock height={28} radius={14} width={76} />
    </View>
  );
}

function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    calendarEventRow: {
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 14,
    },
    calendarHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    chipsRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
    },
    copyLine: {
      marginTop: 10,
    },
    daySkeleton: {
      width: "14.28%",
    },
    descriptionSkeleton: {
      borderTopColor: theme.colors.border,
      borderTopWidth: 1,
      gap: 2,
      marginTop: 18,
      paddingTop: 16,
    },
    eventContent: {
      gap: 12,
      paddingTop: 18,
    },
    factSkeleton: {
      flexBasis: "48%",
    },
    factsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 16,
    },
    factValueSkeleton: {
      marginTop: 10,
    },
    flexOne: {
      flex: 1,
    },
    latestResultCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderRadius: 20,
      borderWidth: 1,
      flexBasis: "48%",
      padding: 16,
    },
    newsRow: {
      flexDirection: "row",
      gap: 14,
    },
    playerRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 14,
    },
    resultsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginTop: 10,
    },
    screenStack: {
      gap: 24,
    },
    sectionStack: {
      gap: 12,
    },
    sectionStackCompact: {
      gap: 8,
      marginTop: 12,
    },
    weekLabelSkeleton: {
      width: "10%",
    },
    weekRow: {
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
      marginTop: 18,
    },
  });
}
