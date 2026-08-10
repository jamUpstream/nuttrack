import React from 'react';
import { View, Text, type ViewProps, type TextProps } from 'react-native';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export function Card({ style, children, ...rest }: ViewProps) {
  const { colors, ambient } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: radius.xxl,
          padding: space.cardPadding,
          ...ambient,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function LabelCaps({ style, children, ...rest }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        { ...type.labelCaps, textTransform: 'uppercase', color: colors.onSurfaceVariant },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export function StatLabel({ style, children, ...rest }: TextProps) {
  const { colors } = useTheme();
  return (
    <Text style={[{ ...type.statLabel, color: colors.onSurfaceVariant }, style]} {...rest}>
      {children}
    </Text>
  );
}

export { useThemedStyles };
