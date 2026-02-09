# App assets: logo, splash & icons

Replace the placeholder files in `assets/` with your Lasalva branding. The same **icon** is used as the app icon and as the in-app logo on login, auth, and loading screens.

## Required files

| File | Purpose | Recommended size | Notes |
|------|--------|------------------|--------|
| **icon.png** | App icon (home screen) and in-app logo | **1024×1024** | Square. Shown on login, forgot/reset password, loading screen, and Settings header. |
| **adaptive-icon.png** | Android adaptive icon (foreground) | **1024×1024** | Same as icon or a version that looks good when masked to circle/square. |
| **splash-icon.png** | Splash screen (shown at app launch) | **1284×2778** or similar | Logo centered; background is filled with `splash.backgroundColor` (#4f46e5). Use `resizeMode: "contain"` so the image is not cropped. |
| **favicon.png** | Web / PWA favicon | **48×48** (or 32×32) | Used when running in browser. |

## Where each asset is used

- **icon.png** – App icon (iOS/Android), in-app `Logo` component (login, forgot password, reset password, loading screen, Settings header), and push notification icon.
- **splash-icon.png** – Native splash screen while the app loads (see `app.json` → `expo.splash`).
- **adaptive-icon.png** – Android only; foreground layer of the adaptive icon.
- **favicon.png** – Web build only.

## Splash screen

Configured in `app.json` under `expo.splash`:

- **image**: `./assets/splash-icon.png`
- **resizeMode**: `contain` (logo centered, no crop)
- **backgroundColor**: `#4f46e5` (indigo) – change to match your brand

For a simple splash: use a PNG with your logo centered and transparency; the background color will show behind it. For a full-bleed design, use an image that already includes the background at the recommended size.

## Optional: different in-app logo

The `Logo` component (see `components/ui/Logo.tsx`) uses `icon.png` by default. To use a separate image inside the app (e.g. a wordmark), add `assets/logo.png` and pass `source={require('@/assets/logo.png')}` where you render `<Logo />`.
