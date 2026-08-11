import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { Card, LabelCaps, StatLabel } from '../components/ui';
import MonthCalendar from '../components/MonthCalendar';
import DayDetailSheet from '../components/DayDetailSheet';
import { useStore } from '../store/useStore';
import { todayKey, type DateKey } from '../lib/date';
import { quoteOfTheDay } from '../logic/gamification';
import { celebrateMilestone } from '../lib/notifications';
import { MILESTONES } from '../logic/streaks';

export default function HomeScreen() {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { logs, stats, setLog } = useStore();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selected, setSelected] = useState<DateKey | null>(null);

  const today = todayKey();
  const todayEntry = logs[today];

  const shift = (n: number) => {
    const d = new Date(cursor.year, cursor.month + n, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  const quickLog = async (status: 'clean' | 'relapse') => {
    const before = stats.current;
    await setLog(today, status);
    const after = useStore.getState().stats.current;
    const hit = MILESTONES.find((m) => before < m && after >= m);
    if (hit) celebrateMilestone(hit);
  };

  return (
    <>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Card style={s.hero}>
          <View style={s.heroRow}>
            <MaterialIcons name="local-fire-department" size={26} color={colors.primary} />
            <LabelCaps>Day streak</LabelCaps>
          </View>
          <Text style={s.heroNumber}>{stats.current}</Text>
          <View style={s.pill}>
            <StatLabel>Best: {stats.best} days</StatLabel>
          </View>
        </Card>

        <View style={s.quickRow}>
          <Pressable
            style={[s.quickBtn, s.cleanBtn, todayEntry?.status === 'clean' && s.selectedRing]}
            onPress={() => quickLog('clean')}
          >
            <MaterialIcons name="check-circle" size={22} color={colors.onPrimary} />
            <Text style={s.cleanText}>Clean</Text>
          </Pressable>
          <Pressable
            style={[s.quickBtn, s.relapseBtn, todayEntry?.status === 'relapse' && s.selectedRing]}
            onPress={() => quickLog('relapse')}
          >
            <MaterialIcons name="warning-amber" size={22} color={colors.error} />
            <Text style={s.relapseText}>Relapse</Text>
          </Pressable>
        </View>

        <Text style={s.todayHint}>
          {todayEntry
            ? `Today is logged as ${todayEntry.status}. Tap the day to edit.`
            : 'No entry for today yet.'}
        </Text>

        <MonthCalendar
          year={cursor.year}
          month={cursor.month}
          logs={logs}
          onPrev={() => shift(-1)}
          onNext={() => shift(1)}
          onChangeMonth={(year, month) => setCursor({ year, month })}
          onSelectDay={setSelected}
        />

        <Card>
          <LabelCaps style={{ marginBottom: 8 }}>Today's note to self</LabelCaps>
          <Text style={s.quote}>{quoteOfTheDay(today)}</Text>
        </Card>
      </ScrollView>

      <DayDetailSheet date={selected} onClose={() => setSelected(null)} />
    </>
  );
}

const makeStyles = ({ colors, ambient }: any) => ({
  scroll: { padding: space.containerMargin, paddingBottom: 140, gap: space.gutter },
  hero: { alignItems: 'center' as const, paddingVertical: 28 },
  heroRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  heroNumber: { ...type.displayStreak, color: colors.primary, marginTop: 4 },
  pill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: radius.full, marginTop: 8,
  },
  quickRow: { flexDirection: 'row' as const, gap: space.gutter },
  quickBtn: {
    flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'center' as const, gap: 8, paddingVertical: 18,
    borderRadius: radius.button, ...ambient,
  },
  selectedRing: { borderWidth: 2, borderColor: colors.primary },
  cleanBtn: { backgroundColor: colors.primaryContainer },
  cleanText: { ...type.headlineMd, color: colors.onPrimary },
  relapseBtn: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: colors.error,
  },
  relapseText: { ...type.headlineMd, color: colors.error },
  todayHint: { ...type.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' as const },
  quote: { ...type.bodyLg, color: colors.onSurface },
});
