import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { Card, StatLabel } from './ui';
import { monthGrid, monthTitle, todayKey, type DateKey } from '../lib/date';
import type { DayEntry } from '../store/useStore';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  year: number;
  month: number;
  logs: Record<DateKey, DayEntry>;
  onPrev: () => void;
  onNext: () => void;
  onSelectDay: (date: DateKey) => void;
}

export default function MonthCalendar({ year, month, logs, onPrev, onNext, onSelectDay }: Props) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayKey();

  const counts = useMemo(() => {
    let clean = 0, relapse = 0, none = 0;
    for (const c of cells) {
      if (!c.inMonth) continue;
      const e = logs[c.key];
      if (!e) { if (c.key <= today) none++; }
      else if (e.status === 'clean') clean++;
      else relapse++;
    }
    return { clean, relapse, none };
  }, [cells, logs, today]);

  return (
    <Card style={{ padding: 24 }}>
      <View style={s.head}>
        <Text style={s.title}>{monthTitle(year, month)}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={onPrev} hitSlop={8} accessibilityLabel="Previous month">
            <MaterialIcons name="chevron-left" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={onNext} hitSlop={8} accessibilityLabel="Next month">
            <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>

      <View style={s.row}>
        {WEEKDAYS.map((d, i) => <Text key={i} style={s.weekday}>{d}</Text>)}
      </View>

      <View style={s.grid}>
        {cells.map((c) => {
          const entry = logs[c.key];
          const isToday = c.key === today;
          const dayNum = Number(c.key.slice(8));
          const dotColor =
            entry?.status === 'clean' ? colors.primaryContainer
            : entry?.status === 'relapse' ? colors.error
            : c.key <= today && c.inMonth ? colors.surfaceContainerHighest
            : 'transparent';

          return (
            <Pressable
              key={c.key}
              style={s.cell}
              onPress={() => onSelectDay(c.key)}
              accessibilityLabel={`${c.key}${entry ? `, ${entry.status}` : ', no entry'}`}
            >
              <View style={[s.dayWrap, isToday && s.todayPill]}>
                <Text style={[s.dayText, !c.inMonth && s.dayMuted, isToday && s.todayText]}>
                  {dayNum}
                </Text>
              </View>
              {!isToday && <View style={[s.dot, { backgroundColor: dotColor }]} />}
            </Pressable>
          );
        })}
      </View>

      <View style={s.legend}>
        <Legend color={colors.primaryContainer} label={`${counts.clean} Clean`} />
        <Legend color={colors.error} label={`${counts.relapse} Relapse`} />
        <Legend color={colors.surfaceContainerHighest} label={`${counts.none} No Entry`} />
      </View>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <StatLabel>{label}</StatLabel>
    </View>
  );
}

const makeStyles = ({ colors }: any) => ({
  head: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 20 },
  title: { ...type.headlineMd, color: colors.onBackground },
  row: { flexDirection: 'row' as const, marginBottom: 8 },
  weekday: { flex: 1, textAlign: 'center' as const, ...type.labelCaps, color: colors.tertiary },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  cell: { width: `${100 / 7}%` as any, alignItems: 'center' as const, paddingVertical: 6, height: 44 },
  dayWrap: { width: 32, height: 32, alignItems: 'center' as const, justifyContent: 'center' as const, borderRadius: radius.full },
  todayPill: { backgroundColor: colors.primaryContainer },
  dayText: { ...type.bodySm, color: colors.onSurface },
  dayMuted: { color: colors.outlineVariant },
  todayText: { color: colors.onPrimary, fontWeight: '700' as const },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  legend: {
    flexDirection: 'row' as const, justifyContent: 'center' as const, gap: 16,
    marginTop: space.stackMd, paddingTop: space.stackMd,
    borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh,
  },
});
