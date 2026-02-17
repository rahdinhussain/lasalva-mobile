# Lasalva Mobile – Rebuild (Expo Managed, No Reanimated/Folly)

This project has been rebuilt to run as a **stable Expo managed app** with:

- **No** `react-native-reanimated`
- **No** `@gorhom/bottom-sheet`
- **No** Hermes/New Architecture overrides (Expo defaults)
- **No** custom native modules or Podfile/Folly
- **No** `react-native-worklets`

Replacements:

- **Animations**: React Native `Animated` API (Button, Card, IconButton, Toggle, Skeleton, BookingFAB, TabBar).
- **Booking flow**: React Native `Modal` + `ScrollView` / `TextInput` instead of bottom sheet.
- **Storage**: `expo-secure-store` on native, `localStorage` on web.

## Install

```bash
cd /Users/rahdi/lasalva-mobile
rm -rf node_modules
npm install
```

## Run (development)

```bash
npx expo start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## Build (EAS)

```bash
# Install EAS CLI if needed
npm install -g eas-cli

# Login and configure (first time)
eas login

# Build for iOS (simulator or device)
eas build --platform ios --profile development
# or
eas build --platform ios --profile preview
# or
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile development
# or
eas build --platform android --profile preview
# or
eas build --platform android --profile production
```

Ensure `eas.json` has the profiles you need (e.g. `development`, `preview`, `production`).

## Project layout (summary)

- **app/** – Expo Router: `_layout.tsx`, `index.tsx`, `(auth)/`, `(tabs)/` (calendar, staff, services, settings).
- **components/** – UI, layout, booking, calendar, staff, services, forms.
- **context/** – AuthContext, BusinessContext.
- **hooks/** – useAppointments, useBooking, useBilling, useBusiness, useProfile, useRoleAccess, useServices, useStaff, usePushNotifications.
- **services/** – api, auth, appointments, business, profile, staff, services, billing, public, pushNotifications.
- **utils/** – storage, dateUtils, formatters.
- **constants/** – API_URL, colors, query keys, etc.
- **types/** – Shared TypeScript types.

See **ANALYSIS.md** for a full list of screens, components, and API integrations.
