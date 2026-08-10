import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { radius, type } from './src/theme/tokens';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { useStore } from './src/store/useStore';
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import UndoToast from './src/components/UndoToast';
import AcornMark from './src/components/AcornMark';
import { syncNow } from './src/lib/sync';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HeaderTitle() {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <AcornMark size={24} />
      <Text style={{ ...type.headlineMd, color: colors.primary }}>NutTrack</Text>
    </View>
  );
}

function Tabs() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerTitle: () => <HeaderTitle />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: colors.surfaceContainerLowest,
            borderTopWidth: 0,
            height: 76,
            paddingBottom: 16,
            paddingTop: 8,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
          },
          tabBarLabelStyle: { ...type.labelCaps },
          tabBarIcon: ({ color, size }) => {
            const name =
              route.name === 'Home' ? 'home'
              : route.name === 'Stats' ? 'leaderboard'
              : 'settings';
            return <MaterialIcons name={name as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
      <UndoToast />
    </View>
  );
}

function Root() {
  const { colors, dark, loaded: themeLoaded } = useTheme();
  const { ready, mode, init } = useStore();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    init().finally(() => setBooted(true));
  }, [init]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncNow().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.onSurface,
      primary: colors.primary,
      border: 'transparent',
    },
  };

  if (!booted || !ready || !themeLoaded) {
    return (
      <View style={{
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: colors.background, gap: 16,
      }}>
        <AcornMark size={64} />
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {mode === null && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Root />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
