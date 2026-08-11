# NutTrack

NutTrack is a React Native habit and streak tracking app built with Expo. It supports local tracking, optional account login, calendar-based history viewing, progress stats, badges, appearance settings, and data export.

## Features

- Track each day as `Clean` or `Relapse`
- View history in a monthly calendar
- Open older months quickly from the month picker
- Separate login and sign up screens
- Optional cloud sync for signed-in users
- Stats, milestones, level progress, and badges
- Appearance settings with accent colors
- About page in Settings
- CSV export
- Custom confirmation dialogs for sensitive actions

## Project Structure

```text
App.tsx
src/components/
src/screens/
src/lib/
src/db/
src/store/
src/theme/
assets/
android/
```

## Requirements

- Node.js
- npm
- Android Studio for local Android builds
- Java JDK for Android builds

## Install

```text
npm install
```

## Run In Development

```text
npx expo start
```

## Run On Android Locally

```text
npx expo run:android
```

## Build Android Locally

```text
cd android
gradlew.bat assembleRelease
cd ..
```

The local release APK output is usually here:

```text
android\app\build\outputs\apk\release\app-release.apk
```

## Build Android In Cloud

```text
npx eas build --profile preview --platform android
```

If build cache causes issues:

```text
npx eas build --profile preview --platform android --clear-cache
```

## Environment Setup

Create a `.env` file based on `.env.example` and add your project values there if you want account and cloud features enabled.

```text
.env.example
```

Example:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Common Commands

```text
npx expo start
npx expo start --clear
npx expo run:android
npx expo prebuild
npx eas build --profile preview --platform android
npx eas build --profile preview --platform android --clear-cache
npx expo doctor
adb devices
adb logcat
```

## Git Commands

```text
git status
git add -A
git commit -m "update app"
git push origin HEAD
```

## Version

Current app version:

```text
1.1.0
```

## Notes

- Local build and cloud build are both supported
- If account or cloud features are not configured, the app can still be used locally
- Android launcher icon and splash assets are configured from the project assets
