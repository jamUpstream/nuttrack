import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, Pressable, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { LabelCaps } from './ui';
import { longDate, type DateKey } from '../lib/date';
import { useStore } from '../store/useStore';
import type { Status } from '../db';

interface Props { date: DateKey | null; onClose: () => void }

export default function DayDetailSheet({ date, onClose }: Props) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const logs = useStore((st) => st.logs);
  const setLog = useStore((st) => st.setLog);
  const removeLog = useStore((st) => st.removeLog);

  const existing = date ? logs[date] : undefined;
  const [status, setStatus] = useState<Status>('clean');
  const [note, setNote] = useState('');

  useEffect(() => {
    setStatus(existing?.status ?? 'clean');
    setNote(existing?.note ?? '');
  }, [date, existing?.status, existing?.note]);

  if (!date) return null;

  const save = async () => {
    await setLog(date, status, note.trim() || null);
    onClose();
  };
  const remove = async () => {
    await removeLog(date);
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.sheetWrap}
      >
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.title}>{longDate(date)}</Text>

          <View style={{ gap: space.stackSm }}>
            <LabelCaps>Daily status</LabelCaps>
            <View style={s.toggle}>
              <ToggleBtn
                active={status === 'clean'}
                onPress={() => setStatus('clean')}
                icon="check-circle"
                label="Clean"
                activeColor={colors.primaryContainer}
                idle={colors.onSurfaceVariant}
                style={s}
              />
              <ToggleBtn
                active={status === 'relapse'}
                onPress={() => setStatus('relapse')}
                icon="error-outline"
                label="Relapse"
                activeColor={colors.error}
                idle={colors.onSurfaceVariant}
                style={s}
              />
            </View>
          </View>

          <View style={{ gap: space.stackSm, marginTop: space.stackMd }}>
            <LabelCaps>Notes</LabelCaps>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note about this day…"
              placeholderTextColor={colors.outlineVariant}
              multiline
              style={s.input}
            />
          </View>

          <Pressable style={s.save} onPress={save}>
            <Text style={s.saveText}>Save changes</Text>
          </Pressable>

          {existing && (
            <Pressable style={s.delete} onPress={remove}>
              <Text style={s.deleteText}>Delete entry</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ToggleBtn({ active, onPress, icon, label, activeColor, idle, style }: any) {
  return (
    <Pressable onPress={onPress} style={[style.toggleBtn, active && style.toggleBtnActive]}>
      <MaterialIcons name={icon} size={20} color={active ? activeColor : idle} />
      <Text style={[style.toggleText, active && { color: activeColor, fontWeight: '600' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = ({ colors, interactive }: any) => ({
  scrim: { flex: 1, backgroundColor: colors.scrim },
  sheetWrap: { position: 'absolute' as const, bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: space.containerMargin,
    paddingBottom: 36,
    ...interactive,
  },
  handle: {
    width: 48, height: 6, borderRadius: 3, alignSelf: 'center' as const,
    backgroundColor: colors.surfaceVariant, marginBottom: 12,
  },
  title: {
    ...type.headlineLgMobile, color: colors.onSurface,
    textAlign: 'center' as const, marginBottom: space.sectionGap,
  },
  toggle: {
    flexDirection: 'row' as const, backgroundColor: colors.surfaceContainerLow,
    padding: 4, borderRadius: radius.xxl, gap: 4,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const,
    justifyContent: 'center' as const, gap: 8, paddingVertical: 12, borderRadius: radius.button,
  },
  toggleBtnActive: { backgroundColor: colors.surfaceContainerLowest },
  toggleText: { ...type.bodyLg, color: colors.onSurfaceVariant },
  input: {
    borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xxl,
    padding: space.cardPadding, minHeight: 96, textAlignVertical: 'top' as const,
    ...type.bodySm, color: colors.onSurface,
  },
  save: {
    backgroundColor: colors.primaryContainer, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center' as const, marginTop: space.sectionGap,
  },
  saveText: { ...type.bodyLg, fontWeight: '600' as const, color: colors.onPrimary },
  delete: { paddingVertical: 12, alignItems: 'center' as const, marginTop: space.stackSm },
  deleteText: { ...type.statLabel, color: colors.error },
});
