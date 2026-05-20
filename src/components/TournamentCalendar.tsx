import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/src/components/EmptyState";
import { SurfaceCard } from "@/src/components/SurfaceCard";
import { useTheme } from "@/src/theme/ThemeProvider";
import type { CalendarTournament, HomeTournament } from "@/src/types/api";
import {
  formatDateRange,
  getTournamentLabel,
  getTournamentStatus,
  getTournamentStatusLabel,
} from "@/src/utils/format";

type CalendarItem = CalendarTournament | HomeTournament;

interface TournamentCalendarProps {
  items: CalendarItem[];
  onPressItem?: (windowId: string) => void;
}

const weekDayLabels = ["L", "M", "M", "J", "V", "S", "D"];

const monthFormatter = new Intl.DateTimeFormat("fr-CH", {
  month: "long",
  year: "numeric",
});

const selectedDayFormatter = new Intl.DateTimeFormat("fr-CH", {
  day: "numeric",
  month: "long",
  weekday: "long",
});

export function TournamentCalendar({
  items,
  onPressItem,
}: TournamentCalendarProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const sortedItems = [...items].sort((first, second) => {
    return new Date(first.start).getTime() - new Date(second.start).getTime();
  });
  const initialMonth = getInitialMonth(sortedItems);
  const minMonth = addMonths(startOfMonth(initialMonth), -1);
  const maxMonth = addMonths(startOfMonth(initialMonth), 1);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialMonth));
  const monthEntries = getMonthEntries(visibleMonth, sortedItems);
  const [selectedDate, setSelectedDate] = useState(() => {
    return getDefaultSelectedDate(visibleMonth, monthEntries);
  });
  const selectedItems = getItemsForDay(sortedItems, selectedDate);

  useEffect(() => {
    const nextSelectedDate = getDefaultSelectedDate(visibleMonth, monthEntries);
    const isSelectedInMonth =
      selectedDate.getMonth() === visibleMonth.getMonth() &&
      selectedDate.getFullYear() === visibleMonth.getFullYear();

    if (!isSelectedInMonth) {
      setSelectedDate(nextSelectedDate);
    }
  }, [monthEntries, selectedDate, visibleMonth]);

  if (items.length === 0) {
    return (
      <EmptyState
        description="Aucun tournoi n est disponible dans le calendrier pour le moment."
        title="Calendrier vide"
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <SurfaceCard>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Mois precedent"
            disabled={isSameMonth(visibleMonth, minMonth)}
            onPress={() => setVisibleMonth(addMonths(visibleMonth, -1))}
            style={[
              styles.navButton,
              isSameMonth(visibleMonth, minMonth) && styles.navButtonDisabled,
            ]}
          >
            <Ionicons color={theme.colors.text} name="chevron-back" size={18} />
          </Pressable>

          <Text style={styles.monthLabel}>{capitalize(monthFormatter.format(visibleMonth))}</Text>

          <Pressable
            accessibilityLabel="Mois suivant"
            disabled={isSameMonth(visibleMonth, maxMonth)}
            onPress={() => setVisibleMonth(addMonths(visibleMonth, 1))}
            style={[
              styles.navButton,
              isSameMonth(visibleMonth, maxMonth) && styles.navButtonDisabled,
            ]}
          >
            <Ionicons color={theme.colors.text} name="chevron-forward" size={18} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {weekDayLabels.map((label, index) => {
            return (
              <Text key={`${label}-${index}`} style={styles.weekLabel}>
                {label}
              </Text>
            );
          })}
        </View>

        <View style={styles.grid}>
          {monthEntries.map((entry) => {
            const isSelected = isSameDay(entry.date, selectedDate);
            const isToday = isSameDay(entry.date, new Date());

            return (
              <Pressable
                key={entry.key}
                onPress={() => {
                  setVisibleMonth(startOfMonth(entry.date));
                  setSelectedDate(entry.date);
                }}
                style={[
                  styles.dayCell,
                  !entry.isCurrentMonth && styles.dayCellMuted,
                  isSelected && styles.dayCellSelected,
                  isToday && !isSelected && styles.dayCellToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    !entry.isCurrentMonth && styles.dayLabelMuted,
                    isSelected && styles.dayLabelSelected,
                  ]}
                >
                  {entry.date.getDate()}
                </Text>

                {entry.events.length > 0 ? (
                  <View
                    style={[
                      styles.eventDot,
                      isSelected ? styles.eventDotSelected : null,
                    ]}
                  />
                ) : null}

                {entry.events.length > 1 ? (
                  <Text
                    style={[
                      styles.eventCount,
                      isSelected && styles.eventCountSelected,
                    ]}
                  >
                    {entry.events.length}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </SurfaceCard>

      <View style={styles.daySection}>
        <Text style={styles.daySectionTitle}>
          {capitalize(selectedDayFormatter.format(selectedDate))}
        </Text>

        {selectedItems.length > 0 ? (
          <View style={styles.eventsStack}>
            {selectedItems.map((item) => {
              const status = getTournamentStatus(item.start, item.end);

              return (
                <Pressable
                  key={item.windowId}
                  disabled={!onPressItem}
                  onPress={onPressItem ? () => onPressItem(item.windowId) : undefined}
                  style={({ pressed }) => [
                    styles.eventRow,
                    pressed && onPressItem ? styles.eventRowPressed : null,
                  ]}
                >
                  <View style={styles.eventRowMain}>
                    <Text style={styles.eventRowTitle}>{getTournamentLabel(item)}</Text>
                    <Text style={styles.eventRowMeta}>
                      {formatDateRange(item.start, item.end)}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillLabel}>{getTournamentStatusLabel(status)}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState
            description="Aucun tournoi programmé pour cette journee."
            title="Jour libre"
          />
        )}
      </View>
    </View>
  );
}

function getInitialMonth(items: CalendarItem[]) {
  const upcomingItem = items.find((item) => {
    return getTournamentStatus(item.start, item.end) !== "past";
  });

  return upcomingItem ? new Date(upcomingItem.start) : new Date(items[0]?.start ?? Date.now());
}

function getDefaultSelectedDate(visibleMonth: Date, monthEntries: MonthEntry[]) {
  const todayEntry = monthEntries.find((entry) => {
    return entry.isCurrentMonth && isSameDay(entry.date, new Date());
  });

  if (todayEntry) {
    return todayEntry.date;
  }

  const firstEventEntry = monthEntries.find((entry) => {
    return entry.isCurrentMonth && entry.events.length > 0;
  });

  if (firstEventEntry) {
    return firstEventEntry.date;
  }

  return startOfMonth(visibleMonth);
}

interface MonthEntry {
  date: Date;
  events: CalendarItem[];
  isCurrentMonth: boolean;
  key: string;
}

function getMonthEntries(visibleMonth: Date, items: CalendarItem[]) {
  const monthStart = startOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart);
  const entries: MonthEntry[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index);
    entries.push({
      date,
      events: getItemsForDay(items, date),
      isCurrentMonth: date.getMonth() === monthStart.getMonth(),
      key: date.toISOString(),
    });
  }

  return entries;
}

function getItemsForDay(items: CalendarItem[], date: Date) {
  const dayStart = startOfDay(date).getTime();
  const dayEnd = endOfDay(date).getTime();

  return items.filter((item) => {
    const start = new Date(item.start).getTime();
    const end = new Date(item.end).getTime();
    return start <= dayEnd && end >= dayStart;
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const normalizedDay = (date.getDay() + 6) % 7;
  return addDays(date, -normalizedDay);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function isSameMonth(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth()
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createStyles(colors: ReturnType<typeof useTheme>["theme"]["colors"]) {
  return StyleSheet.create({
    dayCell: {
      alignItems: "center",
      borderRadius: 16,
      gap: 2,
      minHeight: 52,
      justifyContent: "center",
      paddingVertical: 8,
      width: "14.28%",
    },
    dayCellMuted: {
      opacity: 0.45,
    },
    dayCellSelected: {
      backgroundColor: colors.accent,
    },
    dayCellToday: {
      borderColor: colors.accent,
      borderWidth: 1,
    },
    dayLabel: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
    },
    dayLabelMuted: {
      color: colors.textMuted,
    },
    dayLabelSelected: {
      color: colors.onAccent,
    },
    daySection: {
      gap: 12,
    },
    daySectionTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "800",
    },
    eventCount: {
      color: colors.accent,
      fontSize: 10,
      fontWeight: "800",
    },
    eventCountSelected: {
      color: colors.onAccent,
    },
    eventDot: {
      backgroundColor: colors.accent,
      borderRadius: 999,
      height: 6,
      width: 6,
    },
    eventDotSelected: {
      backgroundColor: colors.onAccent,
    },
    eventRow: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    eventRowMain: {
      flex: 1,
      gap: 4,
    },
    eventRowMeta: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    eventRowPressed: {
      opacity: 0.86,
    },
    eventRowTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    eventsStack: {
      gap: 10,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    monthLabel: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
    },
    navButton: {
      alignItems: "center",
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
      borderRadius: 999,
      borderWidth: 1,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    navButtonDisabled: {
      opacity: 0.35,
    },
    statusPill: {
      backgroundColor: colors.accentSurface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statusPillLabel: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "800",
    },
    weekLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textAlign: "center",
      width: "14.28%",
    },
    weekRow: {
      flexDirection: "row",
      marginTop: 16,
    },
    wrapper: {
      gap: 16,
    },
  });
}
