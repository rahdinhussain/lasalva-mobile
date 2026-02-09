# Backend requirements for mobile

This document describes backend behavior required so the mobile app works correctly (e.g. appointment confirmation emails).

## Mobile app brief (current behavior)

1. **Login response includes token**  
   After `POST /api/auth/login`, the response body includes `token`. The app stores this (e.g. SecureStore) and uses it for all protected API calls.

2. **Bearer auth for protected routes**  
   The app adds `Authorization: Bearer <token>` to all protected requests. This works for `PATCH /api/appointments`, `GET /api/appointments`, and all other dashboard/admin APIs.

3. **Appointment status updates and emails**  
   `PATCH /api/appointments` with `{ appointmentId, status }` and Bearer auth triggers the same backend flow as the web app. Emails (confirmation, cancellation, etc.) are sent automatically; no extra API calls needed.

---

## PATCH /api/appointments – status change and emails (backend requirements)

The mobile app calls `PATCH /api/appointments` with body `{ appointmentId, status }` (e.g. `CONFIRMED`) and authenticates with **Bearer token** in the `Authorization` header. The web app uses the same endpoint and body but authenticates with the **cookie** `lasalva_auth`.

**Requirement:** The backend must send status-change emails (e.g. APPOINTMENT_CONFIRMED) for **all** authenticated requests to this endpoint, whether the request uses:

- **Cookie:** `Cookie: lasalva_auth=<token>`
- **Header:** `Authorization: Bearer <token>`

### What to do on the backend

1. **Single auth resolution**  
   Resolve the authenticated user in one place (e.g. `getAuthenticatedProfile()` or equivalent) that supports **both**:
   - Cookie: `lasalva_auth`
   - Header: `Authorization: Bearer <token>`

2. **Same code path after auth**  
   After resolving the user, run the **same** logic for both auth methods:
   - Update appointment status (e.g. `updateAppointmentStatus()`)
   - Invalidate availability cache
   - Map status transition to email event (e.g. `eventForTransition()` in `app/lib/appointments/lifecycle.ts`)
   - Build recipients and send emails (customer, admins, staff per business rules)

3. **No branch that skips email for Bearer**  
   Remove or avoid any branch that updates status but does **not** run the lifecycle/email logic for Bearer-authenticated requests.

### Allowed transitions and email events

| From    | To        | Email event           |
|---------|-----------|------------------------|
| PENDING | CONFIRMED | APPOINTMENT_CONFIRMED  |
| PENDING | CANCELLED | APPOINTMENT_CANCELLED  |
| CONFIRMED | CANCELLED | APPOINTMENT_CANCELLED  |
| CONFIRMED | NO_SHOW   | APPOINTMENT_NO_SHOW    |
| CONFIRMED | COMPLETED | (no email)             |
| CANCELLED / NO_SHOW | PENDING | APPOINTMENT_REBOOKED   |

### Verification

- Send a request with **only** `Authorization: Bearer <token>` (no cookie) to `PATCH /api/appointments` with a valid transition (e.g. PENDING → CONFIRMED).
- Confirm that the appointment status is updated and that the same confirmation email is sent as when the request uses the cookie.

---

## Optional: Cookie fallback for mobile

If the backend cannot support Bearer for the appointments route, the mobile app can send the same cookie as the web. The app will:

- On login: parse `Set-Cookie` for `lasalva_auth` and store it; if the client cannot read `Set-Cookie` (e.g. React Native), the backend may return `lasalva_auth` or `cookieToken` in the login JSON so the app can store and send it.
- On every request: send `Cookie: lasalva_auth=<value>` in addition to `Authorization: Bearer <token>` when the value is present.

Recommended approach is still to support Bearer and run the same handler (including email) for Bearer auth, so the mobile app can rely on the current flow without cookie handling.
