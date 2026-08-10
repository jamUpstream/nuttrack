import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { Card } from '../components/ui';
import AcornMark from '../components/AcornMark';
import { useStore } from '../store/useStore';
import { signIn, signUp, syncNow } from '../lib/sync';

const BENEFITS = [
  { icon: 'devices', title: 'Sync across devices', body: 'Pick up where you left off.' },
  { icon: 'cloud-done', title: 'Cloud backup', body: 'Never lose your history.' },
  { icon: 'military-tech', title: 'Keep your badges', body: 'Progress follows the account.' },
];

export default function AuthScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const setMode = useStore((st) => st.setMode);
  const refresh = useStore((st) => st.refresh);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn: typeof signIn) => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Check your details', 'Enter an email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    const res = await fn(email.trim(), password);
    if (!res.ok) {
      setBusy(false);
      Alert.alert('Could not continue', res.error);
      return;
    }
    await setMode('account');
    await syncNow();
    await refresh();
    setBusy(false);
    navigation.replace('Tabs');
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.wrap}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <AcornMark size={52} />
          <Text style={s.h1}>Protect your streak</Text>
          <Text style={s.subCenter}>Create an account to keep your progress safe.</Text>
        </View>

        <Card style={{ gap: space.stackMd }}>
          {BENEFITS.map((b) => (
            <View key={b.title} style={s.benefit}>
              <View style={s.benefitIcon}>
                <MaterialIcons name={b.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.h3}>{b.title}</Text>
                <Text style={s.sub}>{b.body}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ gap: 12 }}>
          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={colors.outlineVariant}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor={colors.outlineVariant}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={s.primaryBtn} disabled={busy} onPress={() => run(signUp)}>
            {busy ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={s.primaryBtnText}>Sign up</Text>}
          </Pressable>
          <Pressable style={s.ghostBtn} disabled={busy} onPress={() => run(signIn)}>
            <Text style={s.ghostBtnText}>Log in</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={async () => { await setMode('guest'); navigation.replace('Tabs'); }}
          style={{ alignItems: 'center', paddingVertical: 12 }}
        >
          <Text style={s.link}>Continue as guest</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, ambient }: any) => ({
  safe: { flex: 1, backgroundColor: colors.surface },
  wrap: { flex: 1, justifyContent: 'center' as const, padding: space.containerMargin, gap: space.sectionGap },
  h1: { ...type.headlineLgMobile, color: colors.onSurface },
  h3: { ...type.bodyLg, fontWeight: '600' as const, color: colors.onSurface },
  sub: { ...type.bodySm, color: colors.onSurfaceVariant },
  subCenter: { ...type.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' as const },
  benefit: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 16 },
  benefitIcon: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: colors.outlineVariant,
    borderRadius: radius.button, paddingHorizontal: 16, paddingVertical: 14,
    ...type.bodyLg, color: colors.onSurface,
  },
  primaryBtn: {
    backgroundColor: colors.primaryContainer, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center' as const, ...ambient,
  },
  primaryBtnText: { ...type.headlineMd, color: colors.onPrimary },
  ghostBtn: {
    backgroundColor: colors.surfaceContainer, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center' as const,
    borderWidth: 1, borderColor: colors.outlineVariant,
  },
  ghostBtnText: { ...type.headlineMd, color: colors.onSurface },
  link: { ...type.bodySm, color: colors.onSurfaceVariant },
});
