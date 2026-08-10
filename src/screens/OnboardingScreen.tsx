import React, { useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { Card } from '../components/ui';
import AcornMark from '../components/AcornMark';
import { useStore } from '../store/useStore';

const FEATURES = [
  { icon: 'touch-app', title: '1-tap logging', body: 'Record the day instantly. No friction, no forms.' },
  { icon: 'bolt', title: 'Streak tracking', body: 'Watch momentum build, and fix mistakes any time.' },
  { icon: 'military-tech', title: 'Rewards', body: 'Unlock badges and levels as you go.' },
];

export default function OnboardingScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const { width } = useWindowDimensions();
  const ref = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const setMode = useStore((st) => st.setMode);

  const go = (i: number) => ref.current?.scrollTo({ x: width * i, animated: true });

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        <View style={[s.slide, { width }]}>
          <View style={s.center}>
            <View style={s.logoTile}><AcornMark size={84} /></View>
            <Text style={s.display}>NutTrack</Text>
            <Text style={s.lead}>Build your streak.{'\n'}Track your progress.</Text>
            <Text style={s.body}>Simple, fast, offline-first habit tracking.</Text>
          </View>
          <Pressable style={s.primaryBtn} onPress={() => go(1)}>
            <Text style={s.primaryBtnText}>Get started</Text>
          </Pressable>
        </View>

        <View style={[s.slide, { width }]}>
          <View style={{ flex: 1, justifyContent: 'center', gap: space.gutter, width: '100%' }}>
            <Text style={[s.h2, { textAlign: 'center', marginBottom: 8 }]}>How it works</Text>
            {FEATURES.map((f) => (
              <Card key={f.title} style={s.feature}>
                <View style={s.featureIcon}>
                  <MaterialIcons name={f.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.h3}>{f.title}</Text>
                  <Text style={s.bodyLeft}>{f.body}</Text>
                </View>
              </Card>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: space.gutter, width: '100%' }}>
            <Pressable style={[s.ghostBtn, { flex: 1 }]} onPress={() => go(0)}>
              <Text style={s.ghostBtnText}>Back</Text>
            </Pressable>
            <Pressable style={[s.primaryBtn, { flex: 2 }]} onPress={() => go(2)}>
              <Text style={s.primaryBtnText}>Next</Text>
            </Pressable>
          </View>
        </View>

        <View style={[s.slide, { width }]}>
          <View style={s.center}>
            <View style={s.logoCircle}><AcornMark size={54} /></View>
            <Text style={s.h2}>Ready to start?</Text>
            <Text style={s.body}>
              Jump in completely offline, or create an account to sync across devices.
            </Text>
          </View>
          <View style={{ width: '100%', gap: space.stackMd }}>
            <Pressable
              style={s.primaryBtn}
              onPress={async () => { await setMode('guest'); navigation.replace('Tabs'); }}
            >
              <MaterialIcons name="wifi-off" size={20} color={colors.onPrimary} />
              <Text style={s.primaryBtnText}>Continue as guest</Text>
            </Pressable>
            <Pressable style={s.ghostBtn} onPress={() => navigation.navigate('Auth')}>
              <MaterialIcons name="cloud-sync" size={20} color={colors.onSurface} />
              <Text style={s.ghostBtnText}>Create account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={s.dots}>
        {[0, 1, 2].map((i) => <View key={i} style={[s.dot, page === i && s.dotActive]} />)}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, ambient, interactive }: any) => ({
  safe: { flex: 1, backgroundColor: colors.background },
  slide: { paddingHorizontal: space.containerMargin, paddingVertical: space.sectionGap, flex: 1 },
  center: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 12 },
  logoTile: {
    width: 128, height: 128, borderRadius: 32, marginBottom: 24,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center' as const, justifyContent: 'center' as const, ...ambient,
  },
  logoCircle: {
    width: 96, height: 96, borderRadius: radius.full, marginBottom: 16,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center' as const, justifyContent: 'center' as const, ...ambient,
  },
  display: { ...type.displayStreak, color: colors.primary },
  lead: { ...type.headlineLgMobile, color: colors.onSurface, textAlign: 'center' as const },
  h2: { ...type.headlineLgMobile, color: colors.onSurface },
  h3: { ...type.headlineMd, color: colors.onSurface },
  body: { ...type.bodyLg, color: colors.tertiary, textAlign: 'center' as const },
  bodyLeft: { ...type.bodySm, color: colors.tertiary },
  feature: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 16 },
  featureIcon: {
    width: 44, height: 44, borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  primaryBtn: {
    backgroundColor: colors.primaryContainer, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center' as const,
    justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 8, ...interactive,
  },
  primaryBtnText: { ...type.headlineMd, color: colors.onPrimary },
  ghostBtn: {
    backgroundColor: colors.surfaceContainerLowest, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center' as const,
    justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 8,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  ghostBtnText: { ...type.headlineMd, color: colors.onSurface },
  dots: { flexDirection: 'row' as const, justifyContent: 'center' as const, gap: 8, paddingVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surfaceContainerHigh },
  dotActive: { width: 24, backgroundColor: colors.primary },
});
