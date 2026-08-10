import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * expo-notifications must NOT be imported at module scope.
 *
 * Since SDK 53, Expo Go on Android strips the push-notification native module.
 * Merely importing the package registers a push-token listener, which throws
 * "[runtime not ready]" before any of our code runs. So we require it lazily,
 * and only when the environment can actually support it.
 *
 * Local notifications (all NutTrack uses) work fine in a development build.
 * In Expo Go on Android they're skipped — the app stays fully usable, the
 * toggles just report that they need a dev build.
 */

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** True when scheduling will actually work on this device/build. */
export const notificationsAvailable = !(isExpoGo && Platform.OS === 'android');

export const unavailableReason =
  'Notifications need a development build on Android. Run `npx expo run:android`, or `eas build --profile development`.';

let mod: any = null;

function load() {
  if (!notificationsAvailable) return null;
  if (!mod) {
    mod = require('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return mod;
}

const REMINDER_KEY = 'nuttrack.reminderId';

export async function ensurePermission(): Promise<boolean> {
  const N = load();
  if (!N) return false;
  const { status } = await N.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await N.requestPermissionsAsync();
  return req.status === 'granted';
}

export async function setDailyReminder(hour = 21, minute = 0): Promise<boolean> {
  const N = load();
  if (!N) return false;
  if (!(await ensurePermission())) return false;

  await cancelDailyReminder();

  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync('default', {
      name: 'Reminders',
      importance: N.AndroidImportance.DEFAULT,
    });
  }

  const id = await N.scheduleNotificationAsync({
    content: { title: 'Log your day', body: 'Takes one tap. Keep the record honest.' },
    trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
  await AsyncStorage.setItem(REMINDER_KEY, id);
  return true;
}

export async function cancelDailyReminder(): Promise<void> {
  const N = load();
  const id = await AsyncStorage.getItem(REMINDER_KEY);
  if (id && N) await N.cancelScheduledNotificationAsync(id).catch(() => {});
  await AsyncStorage.removeItem(REMINDER_KEY);
}

export async function celebrateMilestone(days: number): Promise<void> {
  const N = load();
  if (!N) return;
  const enabled = await AsyncStorage.getItem('nuttrack.milestoneAlerts');
  if (enabled === '0') return;
  if (!(await ensurePermission())) return;
  await N.scheduleNotificationAsync({
    content: { title: `${days} days`, body: 'Milestone unlocked. Check your badges.' },
    trigger: null,
  });
}
