import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCENTS, radius, space, type, type AccentId } from '../theme/tokens';
import { useTheme, useThemedStyles, type ThemeMode } from '../theme/ThemeProvider';
import { LabelCaps } from '../components/ui';
import AcornMark from '../components/AcornMark';
import AppDialog from '../components/AppDialog';
import { useStore } from '../store/useStore';
import {
  setDailyReminder, cancelDailyReminder,
  notificationsAvailable, unavailableReason,
} from '../lib/notifications';
import { syncNow, signOut, currentUser } from '../lib/sync';
import { shareCsvExport } from '../lib/export';

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
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [wipeStep, setWipeStep] = useState<1 | 2>(1);
  const [dialog, setDialog] = useState<null | {
    title: string;
    message: string;
    icon?: string;
    destructive?: boolean;
  }>(null);

  useEffect(() => {
    AsyncStorage.getItem('nuttrack.reminder').then((v) => setReminder(v === '1'));
    AsyncStorage.getItem('nuttrack.milestoneAlerts').then((v) => setMilestones(v !== '0'));
    currentUser().then((u) => setEmail(u?.email ?? null));
  }, []);

  const toggleReminder = async (on: boolean) => {
    if (on && !notificationsAvailable) {
      setDialog({ title: 'Not available here', message: unavailableReason, icon: 'notifications-off' });
      return;
    }
    setReminder(on);
    if (on) {
      const ok = await setDailyReminder(21, 0);
      if (!ok) {
        setReminder(false);
        await AsyncStorage.setItem('nuttrack.reminder', '0');
        setDialog({
          title: 'Reminder not set',
          message: 'Allow notifications for NutTrack in your system settings, then try again.',
          icon: 'alarm-off',
        });
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
    try {
      await shareCsvExport();
    } catch (e: any) {
      setDialog({
        title: 'Export failed',
        message: e?.message ?? 'Could not create the CSV file.',
        icon: 'download',
      });
    }
  };

  const confirmWipe = () => {
    setWipeStep(1);
    setShowWipeModal(true);
  };

  return (
    <>
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
              setDialog({
                title: 'Sync',
                message: r.ok ? `Up to date. ${r.pushed} pushed, ${r.pulled} pulled.` : r.error,
                icon: 'sync',
              });
            }} />
          ) : (
            <Row s={s} icon="person-add" label="Create account" chevron onPress={() => navigation.navigate('SignUp')} />
          )}
          {email && (
            <Row s={s} icon="logout" label="Sign out" chevron onPress={() => setShowSignOutModal(true)} />
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
        </Group>

        <Group title="Danger zone" s={s}>
          <Row
            s={s}
            icon="delete"
            label="Clear local data"
            value="Removes everything on this device."
            destructive
            onPress={confirmWipe}
          />
        </Group>

        <Group title="App" s={s}>
          <Row s={s} icon="info" label="About" value="NutTrack" chevron onPress={() => navigation.navigate('About')} />
          <Row s={s} icon="memory" label="Version" value="1.1.0" />
        </Group>
      </ScrollView>

      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={s.modalBackdrop}>
          <Pressable style={s.modalScrim} onPress={() => setShowSignOutModal(false)} />
          <View style={s.modalCard}>
            <View style={s.modalIconWrap}>
              <MaterialIcons name="logout" size={24} color={colors.primary} />
            </View>
            <Text style={s.modalTitle}>Sign out?</Text>
            <Text style={s.modalBody}>
              You will stay on this device, but cloud sync will stop until you log in again.
            </Text>
            <View style={s.modalActions}>
              <Pressable style={s.modalGhostBtn} onPress={() => setShowSignOutModal(false)}>
                <Text style={s.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={s.modalPrimaryBtn}
                onPress={async () => {
                  setShowSignOutModal(false);
                  await signOut();
                  setEmail(null);
                }}
              >
                <Text style={s.modalPrimaryText}>Sign out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWipeModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowWipeModal(false);
          setWipeStep(1);
        }}
      >
        <View style={s.modalBackdrop}>
          <Pressable
            style={s.modalScrim}
            onPress={() => {
              setShowWipeModal(false);
              setWipeStep(1);
            }}
          />
          <View style={s.modalCard}>
            <View style={s.modalIconWrap}>
              <MaterialIcons name="delete-forever" size={24} color={colors.error} />
            </View>
            <Text style={s.modalTitle}>
              {wipeStep === 1 ? 'Clear local data?' : 'Are you absolutely sure?'}
            </Text>
            <Text style={s.modalBody}>
              {wipeStep === 1
                ? 'Every log on this device will be removed. This action cannot be undone.'
                : 'This will permanently remove all local records on this device. Please confirm one more time.'}
            </Text>
            <View style={s.modalActions}>
              <Pressable
                style={s.modalGhostBtn}
                onPress={() => {
                  setShowWipeModal(false);
                  setWipeStep(1);
                }}
              >
                <Text style={s.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={s.modalDangerBtn}
                onPress={async () => {
                  if (wipeStep === 1) {
                    setWipeStep(2);
                    return;
                  }
                  setShowWipeModal(false);
                  setWipeStep(1);
                  await wipe();
                }}
              >
                <Text style={s.modalDangerText}>{wipeStep === 1 ? 'Continue' : 'Clear all data'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        icon={dialog?.icon}
        destructive={dialog?.destructive}
        onCancel={() => setDialog(null)}
        onConfirm={() => setDialog(null)}
      />
    </>
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
  modalCard: {
    width: '100%' as const,
    maxWidth: 360,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xxl,
    padding: 24,
    gap: 14,
    ...ambient,
    zIndex: 1,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.errorContainer,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalTitle: { ...type.headlineMd, color: colors.onSurface },
  modalBody: { ...type.bodyLg, color: colors.onSurfaceVariant },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 6,
  },
  modalGhostBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modalGhostText: { ...type.headlineMd, color: colors.onSurface },
  modalDangerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center' as const,
    backgroundColor: colors.errorContainer,
  },
  modalPrimaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center' as const,
    backgroundColor: colors.primaryContainer,
  },
  modalPrimaryText: { ...type.headlineMd, color: colors.onPrimary },
  modalDangerText: { ...type.headlineMd, color: colors.error },
});
