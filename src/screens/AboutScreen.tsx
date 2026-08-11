import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import AcornMark from '../components/AcornMark';
import { Card, LabelCaps } from '../components/ui';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { radius, space, type } from '../theme/tokens';

export default function AboutScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.topRow}>
          <Pressable style={s.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={20} color={colors.onSurface} />
          </Pressable>
          <Text style={s.topTitle}>About</Text>
          <View style={{ width: 44 }} />
        </View>

        <Card style={s.hero}>
          <View style={s.logoWrap}>
            <AcornMark size={72} />
          </View>
          <Text style={s.name}>NutTrack</Text>
          <Text style={s.tagline}>Offline-first streak tracking with optional cloud sync.</Text>
        </Card>

        <Card style={s.section}>
          <LabelCaps style={{ color: colors.primary }}>What it does</LabelCaps>
          <Text style={s.body}>
            NutTrack helps you log clean and relapse days, track your streak, and review your progress
            without needing an internet connection.
          </Text>
        </Card>

        <Card style={s.section}>
          <LabelCaps style={{ color: colors.primary }}>How your data works</LabelCaps>
          <Text style={s.body}>
            Guest mode keeps everything on this device. If you create an account, your logs can also sync
            to the cloud so you can keep your progress across devices.
          </Text>
        </Card>

        <Card style={s.section}>
          <LabelCaps style={{ color: colors.primary }}>Version</LabelCaps>
          <Text style={s.body}>1.1.0</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, ambient }: any) => ({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: space.containerMargin, paddingBottom: 80, gap: space.gutter },
  topRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surfaceContainerLowest,
    ...ambient,
  },
  topTitle: { ...type.headlineMd, color: colors.onSurface },
  hero: { alignItems: 'center' as const, gap: 12, paddingVertical: 28 },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surfaceContainerLow,
  },
  name: { ...type.headlineLgMobile, color: colors.primary },
  tagline: { ...type.bodyLg, color: colors.onSurfaceVariant, textAlign: 'center' as const },
  section: { gap: 10 },
  body: { ...type.bodyLg, color: colors.onSurface },
});
