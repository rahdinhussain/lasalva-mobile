# Lasalva Mobile

A cross-platform mobile application (iOS & Android) for a Booking System that provides business owners and staff with dashboard access to manage appointments, staff, and services.

## Tech Stack

- **Framework**: React Native with Expo SDK 54+
- **Navigation**: Expo Router with file-based routing
- **State Management**: React Context + React Query (TanStack Query)
- **UI Components**: Custom components with NativeWind (Tailwind CSS)
- **Authentication**: JWT-based auth with expo-secure-store
- **Backend**: REST API integration

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL and optional booking base URL:
```
EXPO_PUBLIC_API_URL=https://your-api-url.com
# Optional: base URL for public booking links (Business settings). Defaults to API_URL. Link shown is BASE/slug.
# EXPO_PUBLIC_BOOKING_BASE_URL=https://your-api-url.com
```

### Running the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
/app                    # Expo Router screens
├── (auth)/            # Authentication screens
│   ├── login.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
├── (tabs)/            # Main tab screens
│   ├── calendar/      # Appointments calendar
│   ├── staff/         # Staff management
│   ├── services/      # Services management
│   └── settings/      # App settings
├── _layout.tsx        # Root layout with providers
└── index.tsx          # Entry redirect

/components            # Reusable components
├── ui/               # Base UI components
├── layout/           # Layout components
├── calendar/         # Calendar-specific components
├── staff/            # Staff-specific components
├── services/         # Services-specific components
└── forms/            # Form components

/hooks                 # Custom React hooks
/context               # React Context providers
/services              # API service modules
/utils                 # Utility functions
/types                 # TypeScript types
/constants             # App constants & colors
```

## Features

### Authentication
- Email/password login
- Password reset flow
- JWT token management with secure storage
- Auto-redirect based on auth state

### Calendar
- Week view with day columns
- List view grouped by day
- Appointment status management (Confirm, Cancel, Complete, No-Show)
- Real-time updates (30-second polling)

### Staff Management (Admin only)
- Staff list with schedule preview
- Add/edit staff members
- Weekly schedule editor
- Notification preferences

### Services Management (Admin only)
- Active/inactive services
- Service details (duration, price, tax, deposit)
- Staff assignment per service
- Image upload

### Settings
- Profile settings (all users)
- Business settings (Admin only)
  - Business info & logo
  - Contact information
  - Operating hours
  - Booking preferences
- Billing settings (Admin only)
  - Current plan status
  - Stripe portal integration
  - Invoice history

## Role-Based Access

| Feature | Admin | Staff |
|---------|-------|-------|
| View Calendar | ✅ | ✅ |
| Update Appointment Status | ✅ | ✅ |
| View Staff List | ✅ | ✅ |
| Add/Edit/Delete Staff | ✅ | ❌ |
| View Services | ✅ | ✅ |
| Add/Edit/Delete Services | ✅ | ❌ |
| View Own Profile | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ |
| Business Settings | ✅ | ❌ |
| Billing Settings | ✅ | ❌ |

## API Integration

The app connects to a REST API with the same base URL as the web app (see `EXPO_PUBLIC_API_URL` in `.env`). **For appointment confirmation emails to work**, the backend must run the same handler (including email sending) for Bearer-authenticated requests as for cookie-authenticated requests. See [docs/BACKEND_REQUIREMENTS.md](docs/BACKEND_REQUIREMENTS.md) for details.

The app uses these endpoints:

- `/api/auth/*` - Authentication
- `/api/profile` - User profile
- `/api/business` - Business settings
- `/api/appointments` - Appointments CRUD
- `/api/staff` - Staff management
- `/api/services` - Services management
- `/api/billing` - Billing & subscriptions

## Design System

### Colors
- Primary: Indigo (#4f46e5)
- Status: Emerald (success), Amber (warning), Rose (error)
- Backgrounds: Slate grays

### Components
- Rounded corners (16-20px)
- Subtle shadows
- Bottom sheet modals
- Skeleton loading states
- Press animations

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Building for Production

The app is configured for **phones only** (no tablets). See **[docs/PUBLISH_STEPS.md](docs/PUBLISH_STEPS.md)** for full App Store and Google Play publish steps.

### One-time setup
```bash
eas build:configure   # link project to EAS / create project
```

### iOS
```bash
eas build --platform ios --profile production
```

### Android
```bash
eas build --platform android --profile production
```

## License

Private - All rights reserved
