# Mobile App Integration Guide

> Last updated: February 6, 2026
> Backend: Next.js + Supabase
> Base URL: Configure via environment

---

## Quick Reference

### Authentication
- **Method:** JWT (HS256)
- **Header:** `Authorization: Bearer {token}`
- **Expiry:** 24 hours
- **Cookie (web):** `lasalva_auth`

### Supabase
- **URL:** `https://xisbxovtzufafoytqcgr.supabase.co`
- **Anon key:** Required for public endpoints

---

## Recent Changes (Mobile Must Support)

| Date | Change | Impact |
|------|--------|--------|
| Feb 1, 2026 | `customer_phone` added to appointments | Collect phone number during booking (optional) |
| Feb 2, 2026 | `idempotency_key` on appointments | Send unique key to prevent duplicate bookings |

---

## API Endpoints

### Authentication

#### POST /api/auth/signup
```json
// Request
{
  "name": "string",
  "email": "string",
  "password": "string"
}

// Response
{
  "ok": true,
  "userId": "uuid",
  "requiresOtp": true
}
```
Rate limit: 3/min

#### POST /api/auth/verify-otp
```json
// Request
{
  "userId": "uuid",
  "otp": "string",
  "businessName": "string (optional)",
  "planName": "string (optional)"
}

// Response
{
  "success": true,
  "userId": "uuid",
  "token": "jwt-token",
  "checkoutUrl": "string (optional)"
}
```

#### POST /api/auth/login
```json
// Request
{
  "email": "string",
  "password": "string"
}

// Response
{
  "success": true,
  "userId": "uuid",
  "token": "jwt-token"
}
```
Rate limit: 5/min

#### POST /api/auth/forgot-password
```json
// Request
{ "email": "string" }

// Response
{ "success": true }
```

#### POST /api/auth/reset-password
```json
// Request
{
  "token": "string",
  "newPassword": "string"
}

// Response
{ "success": true }
```

#### POST /api/auth/logout
```json
// Response
{ "success": true }
```

---

### Public Endpoints (No Auth Required)

#### GET /api/business/public/{businessId}
Returns business details and operating hours.

```json
// Response
{
  "success": true,
  "business": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "logo_url": "string | null",
    "timezone": "America/New_York",
    "allow_customer_choose_staff": true,
    "email": "string",
    "phone": "string",
    "phone_country_code": "string",
    "address_street": "string",
    "address_city": "string",
    "address_province": "string",
    "address_country": "string",
    "address_postal_code": "string"
  },
  "hours": [
    {
      "day_of_week": 0,
      "open_time": "09:00",
      "close_time": "17:00"
    }
  ]
}
```

#### GET /api/services/public/{businessId}
Returns active services for booking.

```json
// Response
{
  "success": true,
  "services": [
    {
      "id": "uuid",
      "name": "string",
      "duration_minutes": 60,
      "price": 50.00,
      "tax": 5.00,
      "image_url": "string | null",
      "deposit_required": false,
      "deposit_amount": null,
      "deposit_note": null
    }
  ]
}
```

#### GET /api/staff/public/{businessId}
Query params: `serviceId` (optional) - filter staff by service

```json
// Response
{
  "success": true,
  "staff": [
    {
      "id": "uuid",
      "name": "string",
      "designation": "string | null",
      "profile_photo_url": "string | null"
    }
  ]
}
```

---

### Availability

#### GET /api/appointments/availability
Query params:
- `serviceId` (required)
- `date` (required, YYYY-MM-DD)
- `staffId` (optional)

```json
// Response
{
  "success": true,
  "slots": [
    {
      "start": "2026-02-15T14:00:00.000Z",
      "end": "2026-02-15T15:00:00.000Z",
      "availableStaffCount": 2,
      "availableStaffIds": ["uuid1", "uuid2"]
    }
  ]
}
```
Rate limit: 30/min

#### GET /api/availability/slots
Formatted slots for UI display.

Query params:
- `serviceId` (required)
- `date` (required, YYYY-MM-DD)
- `staffId` (optional)

```json
// Response
{
  "success": true,
  "slots": [
    {
      "time": "2:00 PM",
      "available": true,
      "availableStaffCount": 2,
      "totalStaffIds": ["uuid1", "uuid2"],
      "startTime": "2026-02-15T14:00:00.000Z",
      "endTime": "2026-02-15T15:00:00.000Z"
    }
  ]
}
```

---

### Booking Flow

#### POST /api/appointments/create
```json
// Request
{
  "serviceId": "uuid",
  "startTime": "2026-02-15T14:00:00.000Z",
  "endTime": "2026-02-15T15:00:00.000Z",
  "staffId": "uuid (optional)",
  "customerName": "John Doe",
  "customerEmail": "customer@example.com",
  "customerPhone": "+1234567890",
  "idempotencyKey": "unique-client-generated-key"
}

// Response
{
  "success": true,
  "appointmentId": "uuid",
  "assignedStaffId": "uuid"
}
```
Rate limit: 5/min
Note: If `staffId` is omitted, system auto-assigns using workload balancing.

---

### Appointment Management (Auth Required)

#### GET /api/appointments
Query params:
- `start` (required, ISO timestamp)
- `end` (required, ISO timestamp)

```json
// Response
{
  "businessId": "uuid",
  "appointments": [
    {
      "id": "uuid",
      "service_id": "uuid",
      "staff_id": "uuid",
      "customer_name": "string",
      "customer_email": "string",
      "customer_phone": "string | null",
      "start_time": "timestamp",
      "end_time": "timestamp",
      "status": "PENDING | CONFIRMED | CANCELLED | NO_SHOW | COMPLETED",
      "price": 50.00,
      "tax": 5.00,
      "created_at": "timestamp"
    }
  ]
}
```
Rate limit: 100/min

#### PATCH /api/appointments
```json
// Request
{
  "appointmentId": "uuid",
  "status": "CONFIRMED | CANCELLED | NO_SHOW | COMPLETED"
}

// Response
{
  "success": true,
  "appointment": { ... }
}
```
Rate limit: 30/min

#### POST /api/appointments/reschedule
```json
// Request
{
  "appointmentId": "uuid",
  "startTime": "2026-02-16T14:00:00.000Z",
  "endTime": "2026-02-16T15:00:00.000Z",
  "staffId": "uuid (optional)"
}

// Response
{ "success": true }
```
Rate limit: 10/min

#### GET /api/appointments/search
Query params:
- `businessId` (required)
- `status` (optional)
- `serviceId` (optional)
- `staffId` (optional)
- `customerName` (optional)
- `customerEmail` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `limit` (optional)
- `offset` (optional)
- `stats` (optional, boolean)

```json
// Response
{
  "success": true,
  "appointments": [...],
  "total": 100,
  "statistics": {
    "statusBreakdown": {...},
    "revenue": 5000.00,
    "completionRate": 0.85
  }
}
```
Rate limit: 30/min

---

### Profile Management (Auth Required)

#### GET /api/profile
```json
// Response
{
  "success": true,
  "profile": {
    "id": "uuid",
    "business_id": "uuid",
    "role": "ADMIN | STAFF",
    "name": "string",
    "email": "string",
    "designation": "string | null",
    "is_active": true,
    "profile_photo_url": "string | null"
  }
}
```

#### PUT /api/profile
Supports multipart/form-data for photo upload.

```json
// Request (JSON or form-data)
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "designation": "string",
  "photo": "File (form-data only)"
}

// Response
{
  "success": true,
  "profile": { ... }
}
```

---

## Data Models

### Appointment
```typescript
interface Appointment {
  id: string;
  business_id: string;
  service_id: string;
  staff_id: string;
  customer_name: string | null;
  customer_email: string;
  customer_phone: string | null;  // NEW
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
  price: number | null;
  tax: number | null;
  idempotency_key: string | null;
  created_at: string;
  deleted_at: string | null;
}
```

### Service
```typescript
interface Service {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
  tax: number | null;
  image_url: string | null;
  is_active: boolean;
  deposit_required: boolean | null;
  deposit_amount: number | null;
  deposit_note: string | null;
  buffer_before_minutes: number | null;
  buffer_after_minutes: number | null;
  cancellation_min_hours_before: number | null;
  cancellation_penalty_fee: number | null;
  cancellation_penalty_percentage: number | null;
}
```

### Staff
```typescript
interface Staff {
  id: string;
  business_id: string;
  name: string;
  email: string;
  designation: string | null;
  profile_photo_url: string | null;
  is_active: boolean;
  role: 'ADMIN' | 'STAFF';
}
```

### Business
```typescript
interface Business {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  logo_url: string | null;
  email: string;
  phone: string;
  phone_country_code: string;
  address_street: string | null;
  address_city: string | null;
  address_province: string | null;
  address_country: string | null;
  address_postal_code: string | null;
  allow_customer_choose_staff: boolean;
  auto_confirm_appointments: boolean;
  slot_interval_minutes: number;
  buffer_minutes: number;
}
```

---

## Appointment Status Flow

```
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │CONFIRMED │  │CANCELLED │  │  NO_SHOW │
       └────┬─────┘  └──────────┘  └──────────┘
            │
       ┌────┴────┐
       ▼         ▼
┌──────────┐ ┌──────────┐
│COMPLETED │ │CANCELLED │
└──────────┘ └──────────┘
```

Valid transitions:
- `PENDING` → `CONFIRMED`, `CANCELLED`
- `CONFIRMED` → `COMPLETED`, `CANCELLED`, `NO_SHOW`
- `CANCELLED` → `PENDING` (rebooking)
- `NO_SHOW` → `PENDING` (rebooking)

---

## Error Handling

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not found |
| 409 | Conflict (e.g. slot no longer available) |
| 429 | Rate limit exceeded |
| 500 | Server error |

### Error Response Format
```json
{
  "error": "Descriptive error message"
}
```

### Common Errors
- `"Slot no longer available"` - 409, retry with different slot
- `"Duplicate booking"` - Returns existing appointment ID
- `"Rate limit exceeded"` - 429, implement exponential backoff

---

## Implementation Checklist

### Authentication
- [ ] Implement secure JWT storage (Keychain/Keystore)
- [ ] Add `Authorization: Bearer {token}` to all authenticated requests
- [ ] Handle 401 responses (redirect to login)
- [ ] Implement token refresh/re-login on expiry

### Booking Flow
- [ ] Fetch and cache business/services/staff data
- [ ] Display availability slots with timezone conversion
- [ ] Use POST /api/appointments/create with idempotency key
- [ ] Generate unique idempotency keys per booking attempt
- [ ] Collect customer phone number (optional field)

### Error Handling
- [ ] Implement exponential backoff for rate limits
- [ ] Handle network errors with retry
- [ ] Show user-friendly error messages
- [ ] Log errors for debugging

### Data
- [ ] Convert all times to business timezone for display
- [ ] Cache availability data (invalidate on booking)
- [ ] Validate input before API calls

---

## Example: Complete Booking Flow

```
1. Load Business Data
   GET /api/business/public/{businessId}
   GET /api/services/public/{businessId}
   GET /api/staff/public/{businessId}

2. User Selects Service & Date
   GET /api/appointments/availability?serviceId={id}&date=2026-02-15

3. User Selects Time Slot & Enters Details
   - Name, Email, Phone (optional)

4. Create Booking
   POST /api/appointments/create
   (with idempotencyKey, serviceId, startTime, endTime, staffId optional, customer details)
   → Show confirmation screen
```

---

## Notes

- All timestamps are in **UTC** (ISO 8601 format)
- Display times using `business.timezone`
- Business ID can be UUID or slug in public endpoints
- Staff auto-assignment uses workload balancing algorithm
- Email notifications sent automatically on status changes
