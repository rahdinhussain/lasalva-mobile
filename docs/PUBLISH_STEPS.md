# Lasalva Mobile – App Store & Google Play Publish Steps

This app targets **phones only** (no tablets): iOS is set via `supportsTablet: false` in `app.json`; for Android, restrict to phones in Google Play Console when publishing.

---

## Prerequisites

1. **Expo account** – [expo.dev](https://expo.dev), sign up if needed.
2. **EAS CLI** – `npm install -g eas-cli` then `eas login`.
3. **Environment** – Production `.env` with `EXPO_PUBLIC_API_URL` (and optional `EXPO_PUBLIC_BOOKING_BASE_URL`, `EXPO_PUBLIC_WEB_SIGNUP_URL`) set to your live API.
4. **Assets** – `assets/icon.png`, `assets/adaptive-icon.png`, `assets/splash-icon.png` present and correct (see [ASSETS.md](./ASSETS.md)).

---

## 1. Link project to EAS (one-time)

```bash
cd /path/to/lasalva-mobile
eas build:configure
```

If the project is not yet linked:

```bash
eas init
```

This creates/updates the project on Expo and sets `extra.eas.projectId` in `app.json` (needed for push notifications).

---

## 2. Build production binaries

**Android (AAB for Play Store):**

```bash
eas build --platform android --profile production
```

**iOS (for App Store):**

```bash
eas build --platform ios --profile production
```

**Both:**

```bash
eas build --platform all --profile production
```

Builds run in the cloud. When finished, download from the Expo dashboard or use the build URL. For store submission you can either submit manually (upload the build to the store) or use EAS Submit (below).

---

## 3a. Submit to Google Play (Android)

**Option A – EAS Submit (recommended)**

1. **Service account (one-time)**  
   In [Google Play Console](https://play.google.com/console) → Setup → API access, create a service account, download the JSON key, and grant it access to your app.  
   Put the key file in the project (e.g. `google-service-account.json`) and **add it to `.gitignore`**.

2. **Configure submit**  
   Add a `submit` section to `eas.json` (see [EAS Submit docs](https://docs.expo.dev/submit/eas-json/)). Under `submit.production.android`, set:
   - `serviceAccountKeyPath`: path to the JSON key (e.g. `./google-service-account.json`).
   - `track`: `internal` (testing), `alpha`, `beta`, or `production` for release.

3. **Submit latest build**

   ```bash
   eas submit --platform android --profile production --latest
   ```

**Option B – Manual**  
Download the production AAB from the EAS build page and upload it in Play Console → Your app → Production (or testing track) → Create new release.

**Phone-only on Android:**  
In Play Console, when creating the release, under “Device categories” or “Supported devices”, restrict to **phones** so the app is not offered for tablets.

---

## 3b. Submit to App Store (iOS)

**Option A – EAS Submit**

1. **Apple credentials (one-time)**  
   Add a `submit` section to `eas.json` if not present. Under `submit.production.ios`, set:
   - `appleId`: Apple ID email.
   - `ascAppId`: App Store Connect app ID (numeric).
   - `appleTeamId`: Apple Developer Team ID.

   Or use interactive prompts and store credentials in EAS:

   ```bash
   eas credentials
   ```

2. **Submit latest build**

   ```bash
   eas submit --platform ios --profile production --latest
   ```

**Option B – Manual**  
Download the `.ipa` from the EAS build page and upload with Transporter or Xcode Organizer to App Store Connect.

**Phone-only on iOS:**  
Already enforced by `supportsTablet: false` in `app.json`; the app will be listed for iPhone only.

---

## 4. Store listings and release

**Google Play**

- Store listing: title, short/full description, screenshots (phone), feature graphic, privacy policy URL.
- Content rating questionnaire and (if needed) target audience.
- Set device categories to **phones** for this app.

**App Store Connect**

- App information: name, subtitle, description, keywords, screenshots (iPhone sizes), privacy policy URL.
- App Privacy: declare data collection (e.g. email, push tokens) as required by Apple.

Then create the release (e.g. Production) and submit for review.

---

## 5. Version bumps and updates

- **Version:** Bump `version` in `app.json` (e.g. `1.0.0` → `1.0.1`) for each store release.
- **Build numbers:** `production` profile in `eas.json` has `autoIncrement: true` so EAS bumps build numbers automatically.
- Re-run the relevant build and submit commands above for each release.

---

## Quick reference

| Step              | Command / action |
|-------------------|------------------|
| One-time EAS link | `eas build:configure` or `eas init` |
| Build Android     | `eas build --platform android --profile production` |
| Build iOS         | `eas build --platform ios --profile production` |
| Submit Android    | `eas submit --platform android --profile production --latest` (after configuring `eas.json` and service account) |
| Submit iOS        | `eas submit --platform ios --profile production --latest` (after configuring `eas.json` and Apple IDs) |

Ensure `.env` is set for production and that store listings (screenshots, descriptions, privacy policy) are ready before submitting for review.
