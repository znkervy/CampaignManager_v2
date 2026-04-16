# Auth Flow Design — CampaignManager v2

**Date:** 2026-04-17  
**Scope:** Signup, email confirmation, admin-approval gate, login with inline errors, route protection  
**Approach:** Next.js Server Actions + `@supabase/ssr` + edge middleware (mirrors Beneficiary_v2 pattern)

---

## Architecture

Auth logic lives entirely in the Next.js frontend. The NestJS backend (`cm-backend`) is not involved in auth — it handles campaign data only.

### Files Created or Modified

```
app/
  page.tsx                        ← MODIFY: wire real login server action
  create-account/page.tsx         ← MODIFY: split name fields, wire signup action
  auth/callback/route.ts          ← NEW: handles Supabase email confirmation redirect
  dashboard/page.tsx              ← MODIFY: server-side auth guard

  actions/
    auth.ts                       ← NEW: signup + login server actions

middleware.ts                     ← NEW: edge-level route protection

utils/supabase/
  client.ts                       ← NEW: browser Supabase client
  server.ts                       ← NEW: server Supabase client
```

---

## Database

**Table:** `campaign_manager_profiles`

| Column                   | Type    | Notes                              |
|--------------------------|---------|------------------------------------|
| `auth_user_id`           | uuid    | FK → `auth.users.id`              |
| `first_name`             | text    |                                    |
| `last_name`              | text    |                                    |
| `organization_name`      | text    |                                    |
| `email`                  | text    |                                    |
| `number`                 | text    | contact number                     |
| `sec_registration`       | text    | storage key in `camp-man-files`   |
| `organization_certificate` | text  | storage key in `camp-man-files`   |
| `status`                 | text    | `'pending'` \| `'approved'` \| `'rejected'` |

**Storage bucket:** `camp-man-files` (already exists)

---

## Signup Flow

1. User fills form: first name, last name, organization, email, contact number, password, confirm password, SEC registration file, org certificate file.
2. Client uploads both files to `camp-man-files` bucket — receives two storage keys.
3. Server Action calls `supabase.auth.signUp({ email, password })`.
4. Supabase sends a confirmation email to the user.
5. Server Action inserts a row into `campaign_manager_profiles`:
   ```ts
   {
     auth_user_id: user.id,
     first_name,
     last_name,
     organization_name,
     email,
     number,
     sec_registration,          // storage key
     organization_certificate,  // storage key
     status: 'pending',
   }
   ```
6. UI shows: *"Check your email to confirm your account."* — no dashboard access yet.

**Frontend change:** The "Full Name" field is split into separate "First Name" and "Last Name" inputs.

---

## Email Confirmation Callback

**Route:** `app/auth/callback/route.ts`

- Supabase redirects here after the user clicks the confirmation link.
- Calls `supabase.auth.exchangeCodeForSession(code)`.
- Redirects to `/?confirmed=true`.
- Login page detects `confirmed=true` and shows: *"Email confirmed! You can now sign in."*

---

## Login Flow

1. User submits email + password.
2. Server Action calls `supabase.auth.signInWithPassword({ email, password })`.
3. **Credential error** → inline error: *"Invalid email or password."*
4. **Email not confirmed** (`user.email_confirmed_at` is null) → sign out, inline error: *"Please confirm your email before signing in."*
5. **Email confirmed** → query `campaign_manager_profiles` where `auth_user_id = user.id`.
6. Status checks:
   - `'approved'` → redirect to `/dashboard`
   - `'pending'` → sign out, inline error: *"Your account is pending admin approval."*
   - `'rejected'` → sign out, inline error: *"Your account has been rejected. Please contact support."*

---

## Middleware (Route Protection)

**File:** `middleware.ts`

- Protected routes: `/dashboard`, `/my-campaigns`, `/create-campaign`, `/campaign/:id`, `/donors`, `/reports`, `/settings`
- Calls `supabase.auth.getUser()` — no valid session → redirect to `/`
- Public routes pass through freely: `/`, `/create-account`, `/auth/callback`

---

## OTP Page

The existing `/otp` page is **removed from the auth flow**. Supabase's email confirmation link handles verification. The OTP page UI can be repurposed or deleted.

---

## Error States Summary

| Condition                        | Message shown                                          |
|----------------------------------|--------------------------------------------------------|
| Wrong credentials                | *"Invalid email or password."*                         |
| Email not confirmed              | *"Please confirm your email before signing in."*       |
| Status: pending                  | *"Your account is pending admin approval."*            |
| Status: rejected                 | *"Your account has been rejected. Please contact support."* |
| Email just confirmed (redirect)  | *"Email confirmed! You can now sign in."*              |
