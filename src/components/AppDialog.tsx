import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';

type AppDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  icon?: string;
  destructive?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AppDialog({
  visible,
  title,
  message,
  icon = 'info',
  destructive = false,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
}: AppDialogProps) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.backdrop}>
        <Pressable style={s.scrim} onPress={onCancel} />
        <View style={s.card}>
          <View style={[s.iconWrap, destructive && { backgroundColor: colors.errorContainer }]}>
            <MaterialIcons
              name={icon as any}
              size={24}
              color={destructive ? colors.error : colors.primary}
            />
          </View>
          <Text style={s.title}>{title}</Text>
          <Text style={s.body}>{message}</Text>
          <View style={s.actions}>
            {cancelText ? (
              <Pressable style={s.ghostBtn} onPress={onCancel}>
                <Text style={s.ghostText}>{cancelText}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={[s.primaryBtn, destructive && { backgroundColor: colors.errorContainer }]}
              onPress={onConfirm}
            >
              <Text style={[s.primaryText, destructive && { color: colors.error }]}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = ({ colors, ambient }: any) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: space.containerMargin,
    backgroundColor: colors.scrim,
  },
  scrim: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    width: '100%' as const,
    maxWidth: 360,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xxl,
    padding: 24,
    gap: 14,
    ...ambient,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: { ...type.headlineMd, color: colors.onSurface },
  body: { ...type.bodyLg, color: colors.onSurfaceVariant },
  actions: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 6,
  },
  ghostBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  ghostText: { ...type.headlineMd, color: colors.onSurface },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.button,
    alignItems: 'center' as const,
    backgroundColor: colors.primaryContainer,
  },
  primaryText: { ...type.headlineMd, color: colors.onPrimary },
});
