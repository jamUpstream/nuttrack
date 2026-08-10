# NutTrack

Offline-first streak tracker built with Expo + React Native. Guest mode works with zero configuration; Supabase sync is opt-in.

## Run it

```bash
cd nuttrack
npx expo install            # resolves every dep to your Expo SDK version
npx expo start
```

If `npx expo install` complains about a version, run `npx expo install --fix` once — the `package.json` deliberately leaves Expo-owned packages unpinned so they match whichever SDK you're on.

The app is fully usable at this point in guest mode. Nothing leaves the device.

## Enable sync (optional)

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor. It creates the `logs` table with row-level security so a user can only ever read their own rows.
3. `cp .env.example .env` and paste your project URL and anon key.
4. Restart the dev server. Settings → Create account.

Without `.env`, `supabase` is `null` and every sync path short-circuits. That's intentional: no config, no crashes.

## How it's put together

```
App.tsx                 navigation shell, tabs, foreground auto-sync
src/theme/tokens.ts     colors/type/spacing ported 1:1 from your mockups
src/lib/date.ts         local YYYY-MM-DD keys, month grid, DST-safe day math
src/db/index.ts         SQLite schema + CRUD + tombstones + sync flags
src/logic/streaks.ts    streak engine (pure, tested)
src/logic/gamification.ts  XP, levels, badges, daily quote
src/store/useStore.ts   zustand: logs, derived stats, undo buffer
src/components/         MonthCalendar, DayDetailSheet, UndoToast, ui primitives
src/screens/            Onboarding, Home, Stats, Settings, Auth
src/lib/sync.ts         push pending → pull remote, last-write-wins
src/lib/notifications.ts  daily reminder + milestone congrats
```

### Decisions worth knowing about

**Streaks are always recomputed, never incremented.** `computeStats` takes the whole log set and derives current/best from scratch. That's what makes backdated edits and deletes correct without special cases — edit any day, recompute, done. A streak is a run of consecutive days containing no logged relapse, bounded by your first log and today; days with no entry don't break it, matching "days since last relapse" in your spec.

**Dates are local calendar strings, never `toISOString()`.** Logging at 11pm in Manila would otherwise land on the wrong day.

**Deletes are tombstones.** `deleted = 1` locally rather than a real `DELETE`, so removals actually propagate to Supabase instead of being resurrected by the next pull.

**Custom calendar instead of `react-native-calendars`.** The month grid is ~90 lines and matches your mockup exactly (dot under the number, filled pill on today, six-week fixed height so the layout doesn't jump). One less dependency to keep on version.

**StyleSheet instead of NativeWind.** All your tokens live in `src/theme/tokens.ts` with the same names as the Tailwind config, so the mapping is one-to-one. If you'd rather have NativeWind, that file converts into a `tailwind.config.js` `extend` block mechanically.

**A `note` field was added** to both SQLite and Postgres — your Day Detail mockup has a notes textarea, but the SQL in the build prompt didn't have a column for it.

## Build order status

| # | Step | Status |
|---|------|--------|
| 1 | Expo init + navigation shell | done |
| 2 | Local SQLite CRUD | done |
| 3 | Calendar UI wired to local DB | done |
| 4 | Streak calc logic | done |
| 5 | Guest mode offline | done |
| 6 | Supabase auth | done |
| 7 | Sync logic | done |
| 8 | Gamification | done |
| 9 | Notifications | done |
| 10 | Icon, splash, store build | assets done; run `eas build` when ready |

## Theming

Settings → Appearance has two controls:

- **Theme**: System / Light / Dark. System follows the OS via `useColorScheme()`.
- **Accent**: Forest, Ocean, Violet, Ember, Rose, Teal, Graphite.

Both persist to AsyncStorage and apply instantly. Colors now come from `useTheme()` rather than a static import, because a fixed `colors` object can't change at runtime. Components that need styles use `useThemedStyles(makeStyles)`, which memoises `StyleSheet.create` against the current theme.

Adding an accent is one entry in `ACCENTS` in `src/theme/tokens.ts` — each defines `primary` (deep, for text and the streak number) and `primaryContainer` (vivid, for filled buttons) in both light and dark tones. Neutrals are shared.

Relapse red is deliberately *not* themed. It stays semantic in both modes so the calendar dot and the Relapse button never collide with a warm accent like Ember or Rose.

## Logo

`src/components/AcornMark.tsx` redraws the acorn as vector (`react-native-svg`), so the in-app logo picks up the active accent — cap uses `primary`, body uses `primaryContainer`. It's in the tab header, onboarding, auth, boot screen, and Settings.

App icons in `assets/` are generated from the same geometry, acorn only. The wordmark lockup from your pack is legible on a store listing but not at 48px in a launcher, so the shipped icon drops the type. Your original pack is preserved untouched at `assets/brand/` if you'd rather use it — point `app.json` at `assets/brand/android/play_store_512.png`.

## Notifications and Expo Go

Expo Go on Android dropped the push-notification native module in SDK 53. Importing `expo-notifications` at module scope crashes the runtime there even if you only schedule local notifications, which is all this app does. So `src/lib/notifications.ts` requires the package lazily and detects Expo Go via `expo-constants`. In Expo Go on Android the toggles report "Needs a development build" and everything else works normally.

To get real reminders, build the dev client once:

```bash
npx expo run:android          # local, needs Android Studio
# or
eas build --profile development --platform android
```

After that install the resulting APK and use `npx expo start --dev-client`. iOS Expo Go still handles local notifications fine.

## Left for you

- **Assets.** Drop `icon.png`, `splash.png`, `adaptive-icon.png` into `assets/` and reference them in `app.json`.
- **Guest → account merge.** Right now signing up pushes local rows to the new account, which is right for the common case. If someone signs into an *existing* account that already has data, both sets merge by day with last-write-wins. Decide whether that's what you want.
- **Delete account.** Settings has Clear Local Data; server-side deletion needs the commented-out RPC in `schema.sql`.
- **Realtime.** Sync currently runs on foreground and on demand. Supabase Realtime on the `logs` table would make multi-device instant.
