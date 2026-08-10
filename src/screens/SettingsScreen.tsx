import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCENTS, radius, space, type, type AccentId } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeMode } from '../theme/ThemeProvider';
import { LabelCaps } from '../components/ui';
import AcornMark from '../components/AcornMark';
import { useStore } from '../store/useStore';
import { exportCsv } from '../db';
import {
  setDailyReminder, cancelDailyReminder,
  notificationsAvailable, unavailableReason,
} from '../lib/notifications';
import { syncNow, signOut, currentUser } from '../lib/sync';

const MODES: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'system', label: 'System', icon: 'brightness-auto' },
  { id: 'light', label: 'Light', icon: 'light-mode' },
  { id: 'dark', label: 'Dark', icon: 'dark-mode' },
];

export default function SettingsScreen({ navigation }: any) {
  const { colors, mode, setMode, accent, setAccent } = useTheme();
  const s = useThemedStyles(makeStyles);
  const appMode = useStore((st) => st.mode);
  const wipe = useStore((st) => st.wipe);
  const [reminder, setReminder] = useState(false);
  const [milestones, setMilestones] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('nuttrack.reminder').then((v) => setReminder(v === '1'));
    AsyncStorage.getItem('nuttrack.milestoneAlerts').then((v) => setMilestones(v !== '0'));
    currentUser().then((u) => setEmail(u?.email ?? null));
  }, []);

  const toggleReminder = async (on: boolean) => {
    if (on && !notificationsAvailable) {
      Alert.alert('Not available here', unavailableReason);
      return;
    }
    setReminder(on);
    if (on) {
      const ok = await setDailyReminder(21, 0);
      if (!ok) {
        setReminder(false);
        await AsyncStorage.setItem('nuttrack.reminder', '0');
        Alert.alert('Reminder not set', 'Allow notifications for NutTrack in your system settings, then try again.');
        return;
      }
    } else {
      await cancelDailyReminder();
    }
    await AsyncStorage.setItem('nuttrack.reminder', on ? '1' : '0');
  };

  const toggleMilestones = async (on: boolean) => {
    setMilestones(on);
    await AsyncStorage.setItem('nuttrack.milestoneAlerts', on ? '1' : '0');
  };

  const doExport = async () => {
    const csv = await exportCsv();
    await Share.share({ message: csv, title: 'nuttrack-export.csv' });
  };

  const confirmWipe = () => {
    Alert.alert(
      'Clear local data?',
      'Every log on this device is removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: wipe },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.brandRow}>
        <AcornMark size={44} />
        <View>
          <Text style={s.h1}>Settings</Text>
          <Text style={s.sub}>Manage your preferences and account.</Text>
        </View>
      </View>

      {/* ---------- Appearance ---------- */}
      <View style={{ gap: space.stackSm }}>
        <LabelCaps style={s.groupTitle}>Appearance</LabelCaps>
        <View style={s.group}>
          <View style={[s.blockRow, s.divider]}>
            <Text style={s.rowLabel}>Theme</Text>
            <View style={s.segment}>
              {MODES.map((m) => {
                const active = mode === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setMode(m.id)}
                    style={[s.segmentBtn, active && s.segmentBtnActive]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <MaterialIcons
                      name={m.icon as any}
                      size={18}
                      color={active ? colors.onPrimary : colors.onSurfaceVariant}
                    />
                    <Text style={[s.segmentText, active && { color: colors.onPrimary }]}>
                      {m.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={s.blockRow}>
            <Text style={s.rowLabel}>Accent color</Text>
            <View style={s.swatchRow}>
              {ACCENTS.map((a) => {
                const active = accent === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => setAccent(a.id as AccentId)}
                    style={[s.swatchWrap, active && { borderColor: colors.onSurface }]}
                    accessibilityLabel={a.name}
                    accessibilityState={{ selected: active }}
                  >
                    <View style={[s.swatch, { backgroundColor: a.swatch }]}>
                      {active && <MaterialIcons name="check" size={16} color="#fff" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={s.hint}>
              Relapse always stays red so it can't be confused with your accent.
            </Text>
          </View>
        </View>
      </View>

      {/* ---------- Account ---------- */}
      <Group title="Account" s={s}>
        <Row s={s} icon="person" label="Status" value={email ?? (appMode === 'account' ? 'Signed in' : 'Guest')} />
        {email ? (
          <Row s={s} icon="sync" label="Sync now" chevron onPress={async () => {
            const r = await syncNow();
            Alert.alert('Sync', r.ok ? `Up to date. ${r.pushed} pushed, ${r.pulled} pulled.` : r.error);
          }} />
        ) : (
          <Row s={s} icon="person-add" label="Create account" chevron onPress={() => navigation.navigate('Auth')} />
        )}
        {email && (
          <Row s={s} icon="logout" label="Sign out" chevron onPress={async () => { await signOut(); setEmail(null); }} />
        )}
      </Group>

      {/* ---------- Notifications ---------- */}
      <Group title="Notifications" s={s}>
        <Row
          s={s}
          icon="alarm"
          label="Daily reminder"
          value={notificationsAvailable ? undefined : 'Needs a development build'}
        >
          <Switch
            value={reminder}
            onValueChange={toggleReminder}
            trackColor={{ true: colors.primaryContainer, false: colors.surfaceContainerHighest }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </Row>
        <Row s={s} icon="celebration" label="Milestone alerts">
          <Switch
            value={milestones}
            onValueChange={toggleMilestones}
            trackColor={{ true: colors.primaryContainer, false: colors.surfaceContainerHighest }}
            thumbColor={colors.surfaceContainerLowest}
          />
        </Row>
      </Group>

      {/* ---------- Data ---------- */}
      <Group title="Data" s={s}>
        <Row s={s} icon="download" label="Export CSV" chevron onPress={doExport} />
        <Row s={s} icon="delete" label="Clear local data" destructive onPress={confirmWipe} />
      </Group>

      <Group title="App" s={s}>
        <Row s={s} icon="info" label="About" value="NutTrack" />
        <Row s={s} icon="memory" label="Version" value="1.1.0" />
      </Group>
    </ScrollView>
  );
}

function Group({ title, children, s }: any) {
  const items = React.Children.toArray(children);
  return (
    <View style={{ gap: space.stackSm }}>
      <LabelCaps style={s.groupTitle}>{title}</LabelCaps>
      <View style={s.group}>
        {items.map((c, i) => (
          <View key={i} style={i < items.length - 1 ? s.divider : undefined}>{c}</View>
        ))}
      </View>
    </View>
  );
}

function Row({ icon, label, value, chevron, destructive, onPress, children, s }: any) {
  const { colors } = useTheme();
  const body = (
    <View style={s.row}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
        <View style={[s.rowIcon, destructive && { backgroundColor: colors.errorContainer }]}>
          <MaterialIcons name={icon} size={20} color={destructive ? colors.error : colors.tertiary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.rowLabel, destructive && { color: colors.error }]}>{label}</Text>
          {value ? <Text style={s.sub}>{value}</Text> : null}
        </View>
      </View>
      {children}
      {chevron && <MaterialIcons name="chevron-right" size={22} color={colors.outlineVariant} />}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{body}</Pressable> : body;
}

const makeStyles = ({ colors, ambient }: any) => ({
  scroll: { padding: space.containerMargin, paddingBottom: 140, gap: space.sectionGap },
  brandRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  h1: { ...type.headlineLgMobile, color: colors.onBackground },
  sub: { ...type.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  hint: { ...type.statLabel, color: colors.onSurfaceVariant, marginTop: 10 },
  groupTitle: { marginLeft: 16, color: colors.primary },
  group: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xxl, overflow: 'hidden' as const, ...ambient,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  row: {
    flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'space-between' as const, padding: space.cardPadding, gap: 12,
  },
  blockRow: { padding: space.cardPadding, gap: 12 },
  rowIcon: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  rowLabel: { ...type.bodyLg, color: colors.onSurface },
  segment: {
    flexDirection: 'row' as const, backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.button, padding: 4, gap: 4,
  },
  segmentBtn: {
    flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'center' as const, gap: 6, paddingVertical: 10,
    borderRadius: radius.xl,
  },
  segmentBtnActive: { backgroundColor: colors.primaryContainer },
  segmentText: { ...type.statLabel, color: colors.onSurfaceVariant },
  swatchRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12 },
  swatchWrap: {
    padding: 3, borderRadius: radius.full,
    borderWidth: 2, borderColor: 'transparent',
  },
  swatch: {
    width: 34, height: 34, borderRadius: radius.full,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
});
