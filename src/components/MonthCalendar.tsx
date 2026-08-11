import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
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
  onChangeMonth: (year: number, month: number) => void;
  onSelectDay: (date: DateKey) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MonthCalendar({
  year, month, logs, onPrev, onNext, onChangeMonth, onSelectDay,
}: Props) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const cells = useMemo(() => monthGrid(year, month), [year, month]);
  const today = todayKey();
  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  useEffect(() => {
    if (!pickerOpen) setPickerYear(year);
  }, [year, pickerOpen]);

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
        <Pressable
          style={s.titleBtn}
          onPress={() => {
            setPickerYear(year);
            setPickerOpen((open) => !open);
          }}
        >
          <Text style={s.title}>{monthTitle(year, month)}</Text>
          <MaterialIcons
            name={pickerOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color={colors.onSurfaceVariant}
          />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(year !== currentYear || month !== currentMonth) && (
            <Pressable
              onPress={() => onChangeMonth(currentYear, currentMonth)}
              style={s.todayBtn}
              accessibilityLabel="Jump to current month"
            >
              <Text style={s.todayBtnText}>Today</Text>
            </Pressable>
          )}
          <Pressable onPress={onPrev} hitSlop={8} accessibilityLabel="Previous month">
            <MaterialIcons name="chevron-left" size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            onPress={onNext}
            hitSlop={8}
            accessibilityLabel="Next month"
            disabled={year === currentYear && month === currentMonth}
            style={year === currentYear && month === currentMonth ? s.arrowDisabled : undefined}
          >
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
          const isFuture = c.key > today;
          const dayNum = Number(c.key.slice(8));
          const dotColor =
            entry?.status === 'clean' ? colors.primaryContainer
            : entry?.status === 'relapse' ? colors.error
            : c.key <= today && c.inMonth ? colors.surfaceContainerHighest
            : 'transparent';

          return (
            <Pressable
              key={c.key}
              style={[s.cell, isFuture && s.cellDisabled]}
              onPress={() => !isFuture && onSelectDay(c.key)}
              disabled={isFuture}
              accessibilityLabel={`${c.key}${entry ? `, ${entry.status}` : ', no entry'}${isFuture ? ', future date disabled' : ''}`}
            >
              <View style={[s.dayWrap, isToday && s.todayPill]}>
                <Text style={[s.dayText, !c.inMonth && s.dayMuted, isFuture && s.dayFuture, isToday && s.todayText]}>
                  {dayNum}
                </Text>
              </View>
              <View style={[s.dot, { backgroundColor: dotColor }]} />
            </Pressable>
          );
        })}
      </View>

      <View style={s.legend}>
        <Legend color={colors.primaryContainer} label={`${counts.clean} Clean`} />
        <Legend color={colors.error} label={`${counts.relapse} Relapse`} />
        <Legend color={colors.surfaceContainerHighest} label={`${counts.none} No Entry`} />
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={s.modalBackdrop}>
          <Pressable style={s.modalScrim} onPress={() => setPickerOpen(false)} />
          <View style={s.pickerModal}>
            <View style={s.pickerHead}>
              <Pressable
                onPress={() => setPickerYear((y) => y - 1)}
                hitSlop={8}
                accessibilityLabel="Previous year"
              >
                <MaterialIcons name="chevron-left" size={22} color={colors.onSurfaceVariant} />
              </Pressable>
              <Text style={s.pickerYear}>{pickerYear}</Text>
              <Pressable
                onPress={() => setPickerYear((y) => Math.min(currentYear, y + 1))}
                hitSlop={8}
                accessibilityLabel="Next year"
                disabled={pickerYear >= currentYear}
                style={pickerYear >= currentYear ? s.arrowDisabled : undefined}
              >
                <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>

            <View style={s.monthGrid}>
              {MONTHS.map((label, idx) => {
                const active = pickerYear === year && idx === month;
                const futureMonth = pickerYear === currentYear && idx > currentMonth;
                return (
                  <Pressable
                    key={label}
                    style={[s.monthChip, active && s.monthChipActive, futureMonth && s.monthChipDisabled]}
                    onPress={() => {
                      if (futureMonth) return;
                      onChangeMonth(pickerYear, idx);
                      setPickerOpen(false);
                    }}
                    disabled={futureMonth}
                    accessibilityLabel={`${label} ${pickerYear}${futureMonth ? ', unavailable' : ''}`}
                  >
                    <Text style={[s.monthChipText, active && s.monthChipTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <StatLabel>{label}</StatLabel>
    </View>
  );
}

const makeStyles = ({ colors }: any) => ({
  head: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 20 },
  titleBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
  title: { ...type.headlineMd, color: colors.onBackground },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  todayBtnText: { ...type.statLabel, color: colors.onSurface },
  arrowDisabled: { opacity: 0.35 },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: space.containerMargin,
    backgroundColor: colors.scrim,
  },
  modalScrim: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  pickerModal: {
    width: '100%' as const,
    maxWidth: 360,
    padding: 16,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLow,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  pickerHead: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  pickerYear: { ...type.headlineMd, color: colors.onSurface },
  monthGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 10 },
  monthChip: {
    width: '22%' as any,
    minWidth: 58,
    paddingVertical: 10,
    borderRadius: radius.button,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  monthChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  monthChipDisabled: { opacity: 0.4 },
  monthChipText: { ...type.bodySm, color: colors.onSurface, fontWeight: '600' as const },
  monthChipTextActive: { color: colors.onPrimary },
  row: { flexDirection: 'row' as const, marginBottom: 8 },
  weekday: { flex: 1, textAlign: 'center' as const, ...type.labelCaps, color: colors.tertiary },
  grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  cell: { width: `${100 / 7}%` as any, alignItems: 'center' as const, paddingVertical: 6, height: 50 },
  cellDisabled: { opacity: 0.45 },
  dayWrap: {
    width: 34, height: 34, alignItems: 'center' as const, justifyContent: 'center' as const,
    borderRadius: radius.full, borderWidth: 1, borderColor: 'transparent',
  },
  todayPill: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  dayText: { ...type.bodySm, color: colors.onSurface, fontWeight: '600' as const },
  dayMuted: { color: colors.outlineVariant },
  dayFuture: { color: colors.outlineVariant },
  todayText: { color: colors.onPrimary, fontWeight: '700' as const },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 3 },
  legend: {
    flexDirection: 'row' as const, justifyContent: 'center' as const, gap: 16,
    marginTop: space.stackMd, paddingTop: space.stackMd,
    borderTopWidth: 1, borderTopColor: colors.surfaceContainerHigh,
  },
});
