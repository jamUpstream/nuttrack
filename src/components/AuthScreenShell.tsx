import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { radius, space, type } from '../theme/tokens';
import { useTheme, useThemedStyles } from '../theme/ThemeProvider';
import { Card } from './ui';
import AcornMark from './AcornMark';
import AppDialog from './AppDialog';
import { useStore } from '../store/useStore';
import { signIn, signUp, syncNow } from '../lib/sync';

const BENEFITS = [
  { icon: 'devices', title: 'Sync across devices', body: 'Pick up where you left off.' },
  { icon: 'cloud-done', title: 'Cloud backup', body: 'Never lose your history.' },
  { icon: 'military-tech', title: 'Keep your badges', body: 'Progress follows the account.' },
];

type AuthMode = 'login' | 'signup';

type AuthScreenShellProps = {
  mode: AuthMode;
  navigation: any;
};

export default function AuthScreenShell({ mode, navigation }: AuthScreenShellProps) {
  const isLogin = mode === 'login';
  const { colors } = useTheme();
  const s = useThemedStyles(makeStyles);
  const setMode = useStore((st) => st.setMode);
  const refresh = useStore((st) => st.refresh);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<null | { title: string; message: string }>(null);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      setDialog({
        title: 'Check your details',
        message: 'Enter an email and a password of at least 6 characters.',
      });
      return;
    }

    setBusy(true);
    const normalizedEmail = email.trim();
    const action = isLogin ? signIn : signUp;
    const res = await action(normalizedEmail, password);

    if (!res.ok) {
      setBusy(false);
      setDialog({ title: 'Could not continue', message: res.error });
      return;
    }

    if (!isLogin) {
      setBusy(false);
      setDialog({
        title: 'Check your email',
        message: 'Your account was created. Open the confirmation email, verify your address, then log in.',
      });
      navigation.replace('Login');
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.safe}>
        <ScrollView
          contentContainerStyle={s.wrap}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.hero}>
            <AcornMark size={52} />
            <Text style={s.h1}>{isLogin ? 'Welcome back' : 'Protect your streak'}</Text>
            <Text style={s.subCenter}>
              {isLogin
                ? 'Log in to sync your progress and keep going.'
                : 'Create an account to keep your progress safe.'}
            </Text>
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
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardAppearance={Platform.OS === 'ios' ? 'dark' : undefined}
              cursorColor={colors.primary}
              selectionColor={colors.primary}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={colors.outlineVariant}
              secureTextEntry
              autoCorrect={false}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              textContentType={isLogin ? 'password' : 'newPassword'}
              keyboardAppearance={Platform.OS === 'ios' ? 'dark' : undefined}
              cursorColor={colors.primary}
              selectionColor={colors.primary}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable style={s.primaryBtn} disabled={busy} onPress={submit}>
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={s.primaryBtnText}>{isLogin ? 'Log in' : 'Sign up'}</Text>
              )}
            </Pressable>
            <Pressable
              style={s.ghostBtn}
              disabled={busy}
              onPress={() => navigation.replace(isLogin ? 'SignUp' : 'Login')}
            >
              <Text style={s.ghostBtnText}>
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={async () => { await setMode('guest'); navigation.replace('Tabs'); }}
            style={{ alignItems: 'center', paddingVertical: 12 }}
          >
            <Text style={s.link}>Continue as guest</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        onCancel={() => setDialog(null)}
        onConfirm={() => setDialog(null)}
      />
    </SafeAreaView>
  );
}

const makeStyles = ({ colors, ambient }: any) => ({
  safe: { flex: 1, backgroundColor: colors.surface },
  wrap: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    padding: space.containerMargin,
    gap: space.sectionGap,
    paddingBottom: 48,
  },
  hero: { alignItems: 'center' as const, gap: 8 },
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
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1, borderColor: colors.outline,
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
  ghostBtnText: { ...type.bodyLg, color: colors.onSurface },
  link: { ...type.bodySm, color: colors.onSurfaceVariant },
});
