# Backend Implementation Design
**Date:** 2026-04-19  
**Branch:** campaignmanager_backend  
**Scope:** Full backend for Dashboard, My Campaigns, Create Campaign, Donors, Reports

---

## Overview

Connect all five pages to real Supabase data. All pages follow the existing pattern: a server component fetches data and passes it as props to a `*-ui.tsx` client component. All metrics are scoped to the currently logged-in campaign manager except where noted.

---

## 1. Database Changes

### New Table: `campaign_beneficiaries`
Replaces the single `beneficiary_profiles.campaign_id` FK with a proper many-to-many join.

```sql
CREATE TABLE campaign_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES hc_campaigns(id) ON DELETE CASCADE,
  beneficiary_profile_id uuid NOT NULL REFERENCES beneficiary_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (campaign_id, beneficiary_profile_id)
);
```

### Code Fix: `createCampaignAction`
- Change `status: 'pending'` → `status: 'draft'` (matches `hc_campaigns` constraint)
- After campaign insert, write selected beneficiaries to `campaign_beneficiaries` (one row per selected beneficiary)
- Remove any write to `beneficiary_profiles.campaign_id`

---

## 2. Architecture

**Pattern:** Server Component (data fetch) → Client Component (UI + interactivity)

Each page gains a server-side data fetch in `page.tsx` and the UI is moved to or updated in a `*-ui.tsx` client component that accepts typed props.

**Shared server action file:** `app/actions/campaign.ts` (already exists) — extended with new query functions.

New file: `app/actions/reports.ts` — queries for donors and reports pages.

---

## 3. Page Designs

### 3.1 Dashboard (`/dashboard`)

**Data fetched in `page.tsx`:**
- Manager profile from `campaign_manager_profiles` where `auth_user_id = user.id`
- Metric cards (all scoped to `hc_campaigns.created_by = user.id`):
  - **Funds Raised:** `SUM(collected_amount)` from `hc_campaigns`
  - **Active Campaigns:** `COUNT` where `status = 'active'`
  - **Total Donors:** `COUNT DISTINCT hopecard_purchases.buyer_auth_id` via `hopecards.campaign_id` → manager's campaigns
  - **Pending Actions:** `COUNT` of campaigns where `status = 'draft'`
- **My Campaigns table:** top 5 `hc_campaigns` by `created_at DESC`, with `title`, `status`, `collected_amount`, `target_amount`, `end_date`
- **Live Activity:** 5 most recent `hopecard_purchases` joined with `digital_donor_profiles` (name) and `hopecards → hc_campaigns` (campaign title), scoped to manager's campaigns

**Props passed to `DashboardUI`:**
```ts
{
  managerName: string
  fundsRaised: number
  activeCampaigns: number
  totalDonors: number
  pendingActions: number
  campaigns: Campaign[]
  liveActivity: ActivityItem[]
}
```

---

### 3.2 My Campaigns (`/my-campaigns`)

**Data fetched in `page.tsx`:**
- `hc_campaigns` where `created_by = user.id`
- Supports URL search params: `?status=active&search=water&page=1`
- Each campaign joined with first beneficiary name via `campaign_beneficiaries → beneficiary_profiles`
- Manager name from `campaign_manager_profiles`
- Pagination: 10 per page, server-side

**Status mapping (DB → UI label):**
- `draft` → PENDING
- `active` → ACTIVE  
- `completed` → CLOSED
- `cancelled` → CLOSED

**Props passed to `MyCampaignsUI`:**
```ts
{
  campaigns: CampaignRow[]
  totalCount: number
  currentPage: number
  managerName: string
  managerInitials: string
}
```

---

### 3.3 Create Campaign (`/create-campaign`)

**Changes to `createCampaignAction`:**
1. `status: 'draft'` (was `'pending'`)
2. After campaign insert, batch-insert into `campaign_beneficiaries`:
   ```ts
   selectedBeneficiaryIds.map(id => ({ campaign_id: campaign.id, beneficiary_profile_id: id }))
   ```
3. Remove `beneficiary_profiles.campaign_id` write

No page.tsx changes needed — page stays client-only as it is.

---

### 3.4 Donors (`/donors`)

**Data fetched in `page.tsx`:**

*Stat cards — scoped to manager's campaigns:*
- **Total Unique Donors:** `COUNT DISTINCT buyer_auth_id` from `hopecard_purchases` where campaign belongs to manager
- **Average Donation:** `AVG(amount_paid)` from same scope
- **New Donors This Month:** `COUNT DISTINCT buyer_auth_id` whose first purchase on manager's campaigns was this calendar month

*Community Database table — platform-wide:*
- All `digital_donor_profiles` joined with aggregated `hopecard_purchases`:
  - `total_donations_amount`, `total_donations_count` (already tracked on profile)
  - Most recent `purchased_at` as last donation date
  - Up to 3 campaign titles they donated to (via `hopecards → hc_campaigns`)
- Pagination: 10 per page, server-side

**Props passed to `DonorsUI`:**
```ts
{
  statCards: { totalUniqueDonors: number, averageDonation: number, newDonorsThisMonth: number }
  donors: DonorRow[]
  totalCount: number
  currentPage: number
}
```

---

### 3.5 Reports (`/reports`)

**Data fetched in `page.tsx` — all scoped to manager's campaigns:**

*Stat cards:*
- **Total Funds Raised:** `SUM(collected_amount)` from manager's `hc_campaigns`
- **Average Donation:** `AVG(amount_paid)` from `hopecard_purchases` scoped to manager
- **Active Donors:** `COUNT DISTINCT buyer_auth_id` with a purchase in last 30 days
- **Conversion Rate:** `COUNT(paid) / COUNT(total)` from `hopecard_purchases`

*Fundraising Trends chart:*
- Weekly SUM of `hopecard_purchases.amount_paid` for last 8 weeks
- Two series: current 8 weeks vs previous 8 weeks
- Returns array of `{ week_label: string, current: number, previous: number }`

*Donation by Category:*
- GROUP BY `hc_campaigns.category` with `SUM(collected_amount)`
- Returns `{ category: string, amount: number, percentage: number }[]`

*Transactions table:*
- `hopecard_purchases` joined with `digital_donor_profiles` (name) and `hopecards → hc_campaigns` (campaign title)
- Columns: date, donor name, campaign, amount, payment method, status
- Pagination: 10 per page, server-side

**Props passed to `ReportsUI`:**
```ts
{
  statCards: { totalFundsRaised: number, averageDonation: number, activeDonors: number, conversionRate: number }
  weeklyTrends: WeeklyTrend[]
  categoryBreakdown: CategoryBreakdown[]
  transactions: TransactionRow[]
  totalTransactions: number
  currentPage: number
}
```

---

## 4. File Changes Summary

| File | Change |
|------|--------|
| `app/actions/campaign.ts` | Fix `createCampaignAction` (status + beneficiary join table) |
| `app/actions/reports.ts` | New file — donor and report query functions |
| `app/dashboard/page.tsx` | Add real data fetch, pass props to DashboardUI |
| `app/dashboard/dashboard-ui.tsx` | Accept props, replace hardcoded data |
| `app/my-campaigns/page.tsx` | Convert to server component, fetch campaigns |
| `app/my-campaigns/page.tsx` (UI) | Extract client UI to `my-campaigns-ui.tsx`, accept props |
| `app/donors/page.tsx` | Convert to server component pattern |
| `app/donors/donors-ui.tsx` | New client UI file accepting props |
| `app/reports/page.tsx` | Convert to server component pattern |
| `app/reports/reports-ui.tsx` | New client UI file accepting props |
| Supabase migration | Create `campaign_beneficiaries` table |

---

## 5. Constraints & Notes

- All Supabase queries use `createClient()` (RLS-respecting) for scoped queries; `createAdminClient()` only where RLS blocks needed reads (e.g., cross-profile lookups)
- `hc_campaigns` status values: `draft | active | completed | cancelled`
- UI status labels: `draft` displays as "PENDING", `completed`/`cancelled` display as "CLOSED"
- Donors community database is intentionally platform-wide (not scoped to manager)
- Donors stat cards are scoped to manager's campaigns only
- No new UI components — replace hardcoded data in existing UI structure
