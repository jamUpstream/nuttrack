import React, { useEffect, useRef } from 'react';
import { Animated, Text, Pressable } from 'react-native';
import { radius, space, type } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../store/useStore';

const WINDOW_MS = 5000;

export default function UndoToast() {
  const { colors, interactive, dark } = useTheme();
  const undo = useStore((s) => s.undo);
  const applyUndo = useStore((s) => s.applyUndo);
  const dismissUndo = useStore((s) => s.dismissUndo);
  const y = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    if (!undo) return;
    y.setValue(80);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 18 }).start();
    const t = setTimeout(() => {
      Animated.timing(y, { toValue: 80, duration: 180, useNativeDriver: true })
        .start(() => dismissUndo());
    }, WINDOW_MS);
    return () => clearTimeout(t);
  }, [undo, y, dismissUndo]);

  if (!undo) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: space.containerMargin,
          right: space.containerMargin,
          bottom: 96,
          backgroundColor: colors.inverseSurface,
          borderRadius: radius.button,
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          ...interactive,
        },
        { transform: [{ translateY: y }] },
      ]}
    >
      <Text style={{ ...type.bodySm, color: colors.inverseOnSurface, flexShrink: 1 }} numberOfLines={1}>
        {undo.label}
      </Text>
      <Pressable onPress={applyUndo} hitSlop={10}>
        <Text style={{
          ...type.labelCaps,
          textTransform: 'uppercase',
          color: dark ? colors.primaryContainer : colors.primaryContainer,
        }}>
          Undo
        </Text>
      </Pressable>
    </Animated.View>
  );
}
