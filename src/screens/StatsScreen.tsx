import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { Card, LabelCaps, StatLabel } from '../components/ui';
import { useStore } from '../store/useStore';
import { nextMilestone } from '../logic/streaks';
import { badges, levelFor, xp } from '../logic/gamification';

export default function StatsScreen() {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const stats = useStore((st) => st.stats);
  const points = xp(stats);
  const level = levelFor(points);
  const milestone = nextMilestone(stats.current);
  const earned = badges(stats);
  const milestoneProgress = milestone ? stats.current / milestone.target : 1;

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View>
        <Text style={s.h1}>Your progress</Text>
        <Text style={s.sub}>Stay consistent, build momentum.</Text>
      </View>

      <Card>
        <View style={s.rowBetween}>
          <LabelCaps>Current streak</LabelCaps>
          <MaterialIcons name="local-fire-department" size={22} color={colors.primaryContainer} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
          <Text style={s.big}>{stats.current}</Text>
          <StatLabel style={{ color: colors.primary }}>Days</StatLabel>
        </View>
      </Card>

      <View style={s.pair}>
        <Card style={{ flex: 1 }}>
          <View style={s.iconRow}>
            <MaterialIcons name="emoji-events" size={16} color={colors.tertiary} />
            <LabelCaps>Best streak</LabelCaps>
          </View>
          <Text style={s.medium}>{stats.best} <Text style={s.unit}>days</Text></Text>
        </Card>
        <Card style={{ flex: 1 }}>
          <View style={s.iconRow}>
            <MaterialIcons name="calendar-today" size={16} color={colors.tertiary} />
            <LabelCaps>Total clean</LabelCaps>
          </View>
          <Text style={s.medium}>{stats.totalClean} <Text style={s.unit}>days</Text></Text>
        </Card>
      </View>

      <Card>
        <View style={s.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={s.h3}>Next milestone</Text>
            <Text style={s.sub}>
              {milestone
                ? `${milestone.remaining} ${milestone.remaining === 1 ? 'day' : 'days'} until ${milestone.target} days.`
                : 'Every milestone cleared. Keep going.'}
            </Text>
          </View>
          <View style={s.medal}>
            <MaterialIcons name="workspace-premium" size={22} color={colors.primaryContainer} />
          </View>
        </View>
        <View style={{ marginTop: space.stackMd, gap: 8 }}>
          <View style={s.rowBetween}>
            <StatLabel>Day {stats.current}</StatLabel>
            <StatLabel>Day {milestone?.target ?? stats.current}</StatLabel>
          </View>
          <ProgressBar value={milestoneProgress} />
        </View>
      </Card>

      <Card>
        <View style={s.rowBetween}>
          <View>
            <LabelCaps>Level {level.level}</LabelCaps>
            <Text style={s.h3}>{level.title}</Text>
          </View>
          <StatLabel>{points} XP</StatLabel>
        </View>
        <View style={{ marginTop: space.stackMd, gap: 8 }}>
          <ProgressBar value={level.progress} />
          <StatLabel>
            {level.next ? `${level.next.at - points} XP to ${level.next.title}` : 'Max tier reached.'}
          </StatLabel>
        </View>
      </Card>

      <View>
        <LabelCaps style={{ marginBottom: space.stackSm, marginLeft: 4, color: colors.primary }}>
          Badges
        </LabelCaps>
        <View style={s.badgeGrid}>
          {earned.map((b) => (
            <Card key={b.days} style={[s.badge, !b.earned && s.badgeLocked]}>
              <MaterialIcons
                name={b.earned ? 'military-tech' : 'lock-outline'}
                size={26}
                color={b.earned ? colors.primaryContainer : colors.outlineVariant}
              />
              <Text style={[s.badgeName, !b.earned && { color: colors.outlineVariant }]}>
                {b.name}
              </Text>
              <StatLabel>{b.days} days</StatLabel>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ProgressBar({ value }: { value: number }) {
  const { colors } = useTheme();
  return (
    <View style={{
      height: 12, borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh, overflow: 'hidden',
    }}>
      <View style={{
        height: '100%', borderRadius: radius.full,
        backgroundColor: colors.primaryContainer,
        width: `${Math.min(100, Math.max(0, value * 100))}%`,
      }} />
    </View>
  );
}

const makeStyles = ({ colors }: any) => ({
  scroll: { padding: space.containerMargin, paddingBottom: 140, gap: space.gutter },
  h1: { ...type.headlineLgMobile, color: colors.onSurface },
  h3: { ...type.headlineMd, color: colors.onSurface },
  sub: { ...type.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  rowBetween: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  iconRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 12 },
  big: { ...type.displayStreak, color: colors.primary },
  medium: { ...type.headlineMd, color: colors.onSurface },
  unit: { ...type.statLabel, color: colors.onSurfaceVariant },
  pair: { flexDirection: 'row' as const, gap: space.gutter },
  medal: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    borderWidth: 2, borderColor: colors.primaryContainer,
  },
  badgeGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: space.gutter },
  badge: { width: '47%' as any, alignItems: 'center' as const, gap: 6, paddingVertical: 20 },
  badgeLocked: { opacity: 0.7 },
  badgeName: { ...type.bodySm, fontWeight: '600' as const, color: colors.onSurface, textAlign: 'center' as const },
});
