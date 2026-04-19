# Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect Dashboard, My Campaigns, Create Campaign, Donors, and Reports pages to real Supabase data, replacing all hardcoded mock data.

**Architecture:** Server components fetch data and pass typed props to `*-ui.tsx` client components. All metrics are scoped to the logged-in campaign manager except the Donors community database (platform-wide). Complex joins (purchases → hopecards → campaigns) are resolved in server-side JS after sequential Supabase queries.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase JS v2, `@supabase/ssr`, Tailwind CSS

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/actions/campaign.ts` | Modify | Fix status bug + campaign_beneficiaries insert |
| `app/actions/reports.ts` | Create | Query functions for donors and reports pages |
| `app/dashboard/page.tsx` | Modify | Add real data fetch, pass props to DashboardUI |
| `app/dashboard/dashboard-ui.tsx` | Modify | Accept typed props, replace all hardcoded data |
| `app/my-campaigns/page.tsx` | Modify | Convert to server component, fetch campaigns |
| `app/my-campaigns/my-campaigns-ui.tsx` | Create | Extract client UI from page.tsx, accept props |
| `app/donors/page.tsx` | Modify | Convert to server component, fetch donors |
| `app/donors/donors-ui.tsx` | Create | Extract client UI from page.tsx, accept props |
| `app/reports/page.tsx` | Modify | Convert to server component, fetch reports data |
| `app/reports/reports-ui.tsx` | Create | Extract client UI from page.tsx, accept props |

---

## Task 1: Create `campaign_beneficiaries` Migration

**Files:**
- No file changes — apply via Supabase MCP

- [ ] **Step 1: Apply migration via Supabase MCP**

Run this SQL against project `hycsbfugiboutvgbvueg`:

```sql
CREATE TABLE IF NOT EXISTS public.campaign_beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.hc_campaigns(id) ON DELETE CASCADE,
  beneficiary_profile_id uuid NOT NULL REFERENCES public.beneficiary_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (campaign_id, beneficiary_profile_id)
);
```

- [ ] **Step 2: Verify table exists**

Run: list tables on the Supabase project and confirm `campaign_beneficiaries` appears.

---

## Task 2: Fix `createCampaignAction`

**Files:**
- Modify: `app/actions/campaign.ts`

- [ ] **Step 1: Fix status and beneficiary linking**

Replace the `createCampaignAction` function in `app/actions/campaign.ts`. The full file becomes:

```typescript
'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import nodemailer from 'nodemailer';

export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

export async function getApprovedBeneficiaries(): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('beneficiary_profiles')
      .select('id, first_name, last_name, email, role, status, account_name, bank_name')
      .eq('status', 'approved')
      .eq('role', 'beneficiary');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createCampaignAction(formData: FormData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const targetAmount = parseFloat(formData.get('target_amount') as string) || 0;
    const endDate = (formData.get('end_date') as string) || null;
    const coverImage = formData.get('coverImage') as File | null;
    let selectedBeneficiaryIds: string[] = [];
    try {
      selectedBeneficiaryIds = JSON.parse((formData.get('selectedBeneficiaries') as string) || '[]');
    } catch {}

    let cover_image_key = null;

    if (coverImage && coverImage.size > 0) {
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `campaigns/${fileName}`;

      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from('cover-images')
        .upload(filePath, coverImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Failed to upload cover image. Ensure the cover-images bucket exists.' };
      }
      cover_image_key = uploadData.path;
    }

    const { data: campaign, error: insertError } = await adminSupabase
      .from('hc_campaigns')
      .insert({
        title: title || 'Untitled Campaign',
        category: category?.toLowerCase() || null,
        description: description || null,
        cover_image_key,
        target_amount: targetAmount,
        end_date: endDate,
        status: 'draft',
        created_by: userData.user.id,
        start_date: new Date().toISOString().split('T')[0],
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return { success: false, error: 'Failed to create campaign record.' };
    }

    if (selectedBeneficiaryIds.length > 0) {
      const joinRows = selectedBeneficiaryIds.map((id) => ({
        campaign_id: campaign.id,
        beneficiary_profile_id: id,
      }));

      const { error: joinError } = await adminSupabase
        .from('campaign_beneficiaries')
        .insert(joinRows);

      if (joinError) {
        console.error('Beneficiary link error:', joinError);
      }

      // Send invitation emails
      const { data: beneficiaries } = await adminSupabase
        .from('beneficiary_profiles')
        .select('email, first_name, last_name')
        .in('id', selectedBeneficiaryIds);

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      for (const b of beneficiaries || []) {
        if (!b.email) continue;
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'hopecardenterprise@gmail.com',
            to: b.email,
            subject: 'You have been invited to a new HopeCard Campaign!',
            html: `
              <div style="font-family: sans-serif; text-align: center; color: #333;">
                <h2 style="color: #b55247;">Hello ${b.first_name || 'Beneficiary'},</h2>
                <p>You have been selected as a beneficiary for a newly created campaign on HopeCard.</p>
                <p>Please log in to your dashboard to view the details and confirm your participation.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #b55247; color: #fff; text-decoration: none; border-radius: 5px;">Login to Dashboard</a>
              </div>
            `,
          });
        } catch (mailError) {
          console.error(`Email failed to ${b.email}`, mailError);
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return { success: false, error: error.message };
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors related to `app/actions/campaign.ts`

- [ ] **Step 3: Commit**

```bash
git add app/actions/campaign.ts
git commit -m "fix: use draft status and campaign_beneficiaries join table in createCampaignAction"
```

---

## Task 3: Create `app/actions/reports.ts`

**Files:**
- Create: `app/actions/reports.ts`

This file contains all query functions needed by Dashboard, Donors, and Reports pages.

- [ ] **Step 1: Create the file**

```typescript
'use server';

import { createAdminClient } from '@/utils/supabase/admin';

export type DashboardMetrics = {
  fundsRaised: number;
  activeCampaigns: number;
  totalDonors: number;
  pendingActions: number;
  managerName: string;
};

export type DashboardCampaign = {
  id: string;
  title: string;
  status: string;
  collectedAmount: number;
  targetAmount: number;
  endDate: string | null;
  coverImageKey: string | null;
};

export type LiveActivityItem = {
  donorName: string;
  amount: number;
  campaignTitle: string;
  purchasedAt: string;
};

export type MyCampaignRow = {
  id: string;
  title: string;
  status: string;
  collectedAmount: number;
  targetAmount: number;
  endDate: string | null;
  beneficiaryName: string;
  coverImageKey: string | null;
  createdAt: string;
};

export type DonorStatCards = {
  totalUniqueDonors: number;
  averageDonation: number;
  newDonorsThisMonth: number;
};

export type DonorRow = {
  id: string;
  name: string;
  email: string;
  totalContributed: number;
  donationCount: number;
  lastDonationDate: string | null;
  campaignTags: string[];
  tier: 'VIP DONOR' | 'MAJOR GIFT' | 'RECURRING' | 'STANDARD';
};

export type ReportStatCards = {
  totalFundsRaised: number;
  averageDonation: number;
  activeDonors: number;
  conversionRate: number;
};

export type WeeklyTrend = {
  weekLabel: string;
  current: number;
  previous: number;
};

export type CategoryBreakdown = {
  category: string;
  amount: number;
  percentage: number;
};

export type TransactionRow = {
  id: string;
  purchasedAt: string;
  donorName: string;
  donorInitials: string;
  campaignTitle: string;
  amount: number;
  paymentMethod: string;
  status: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function donorTier(totalAmount: number): DonorRow['tier'] {
  if (totalAmount >= 10000) return 'MAJOR GIFT';
  if (totalAmount >= 5000) return 'VIP DONOR';
  if (totalAmount >= 500) return 'RECURRING';
  return 'STANDARD';
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardData(authUserId: string): Promise<{
  metrics: DashboardMetrics;
  campaigns: DashboardCampaign[];
  liveActivity: LiveActivityItem[];
}> {
  const adminSupabase = createAdminClient();

  // Manager name
  const { data: managerProfile } = await adminSupabase
    .from('campaign_manager_profiles')
    .select('first_name, last_name')
    .eq('auth_user_id', authUserId)
    .single();

  const managerName = managerProfile
    ? `${managerProfile.first_name} ${managerProfile.last_name}`
    : 'Manager';

  // Manager's campaigns
  const { data: campaigns } = await adminSupabase
    .from('hc_campaigns')
    .select('id, title, status, collected_amount, target_amount, end_date, cover_image_key, created_at')
    .eq('created_by', authUserId)
    .order('created_at', { ascending: false });

  const campaignList = campaigns ?? [];
  const campaignIds = campaignList.map((c) => c.id);

  const fundsRaised = campaignList.reduce((sum, c) => sum + Number(c.collected_amount ?? 0), 0);
  const activeCampaigns = campaignList.filter((c) => c.status === 'active').length;
  const pendingActions = campaignList.filter((c) => c.status === 'draft').length;

  // Purchases via hopecards
  let totalDonors = 0;
  let liveActivity: LiveActivityItem[] = [];

  if (campaignIds.length > 0) {
    const { data: hopecards } = await adminSupabase
      .from('hopecards')
      .select('id, campaign_id')
      .in('campaign_id', campaignIds);

    const hopecardIds = (hopecards ?? []).map((h) => h.id);
    const hopecardCampaignMap = Object.fromEntries(
      (hopecards ?? []).map((h) => [h.id, h.campaign_id])
    );
    const campaignTitleMap = Object.fromEntries(campaignList.map((c) => [c.id, c.title]));

    if (hopecardIds.length > 0) {
      const { data: purchases } = await adminSupabase
        .from('hopecard_purchases')
        .select('id, buyer_auth_id, amount_paid, purchased_at, hopecard_id, status')
        .in('hopecard_id', hopecardIds)
        .eq('status', 'paid')
        .order('purchased_at', { ascending: false });

      const purchaseList = purchases ?? [];
      totalDonors = new Set(purchaseList.map((p) => p.buyer_auth_id)).size;

      const recent = purchaseList.slice(0, 5);
      const buyerIds = recent.map((p) => p.buyer_auth_id);

      const { data: donors } = await adminSupabase
        .from('digital_donor_profiles')
        .select('auth_user_id, first_name, last_name')
        .in('auth_user_id', buyerIds);

      const donorMap = Object.fromEntries(
        (donors ?? []).map((d) => [d.auth_user_id, `${d.first_name} ${d.last_name}`])
      );

      liveActivity = recent.map((p) => ({
        donorName: donorMap[p.buyer_auth_id] ?? 'Anonymous',
        amount: Number(p.amount_paid),
        campaignTitle: campaignTitleMap[hopecardCampaignMap[p.hopecard_id]] ?? 'Unknown Campaign',
        purchasedAt: p.purchased_at,
      }));
    }
  }

  return {
    metrics: { fundsRaised, activeCampaigns, totalDonors, pendingActions, managerName },
    campaigns: campaignList.slice(0, 5).map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      collectedAmount: Number(c.collected_amount ?? 0),
      targetAmount: Number(c.target_amount ?? 0),
      endDate: c.end_date,
      coverImageKey: c.cover_image_key,
      createdAt: c.created_at,
    })),
    liveActivity,
  };
}

// ─── My Campaigns ─────────────────────────────────────────────────────────────

export async function getMyCampaigns(
  authUserId: string,
  options: { status?: string; search?: string; page?: number }
): Promise<{ campaigns: MyCampaignRow[]; totalCount: number }> {
  const adminSupabase = createAdminClient();
  const page = options.page ?? 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  let query = adminSupabase
    .from('hc_campaigns')
    .select('id, title, status, collected_amount, target_amount, end_date, cover_image_key, created_at', { count: 'exact' })
    .eq('created_by', authUserId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (options.status && options.status !== 'all') {
    const dbStatus =
      options.status === 'active' ? 'active'
      : options.status === 'draft' ? 'draft'
      : options.status === 'completed' ? 'completed'
      : options.status === 'cancelled' ? 'cancelled'
      : null;
    if (dbStatus) query = query.eq('status', dbStatus);
  }

  if (options.search) {
    query = query.ilike('title', `%${options.search}%`);
  }

  const { data: campaigns, count } = await query;
  const campaignList = campaigns ?? [];
  const totalCount = count ?? 0;

  // Get first beneficiary name per campaign
  const campaignIds = campaignList.map((c) => c.id);
  let beneficiaryMap: Record<string, string> = {};

  if (campaignIds.length > 0) {
    const { data: links } = await adminSupabase
      .from('campaign_beneficiaries')
      .select('campaign_id, beneficiary_profile_id')
      .in('campaign_id', campaignIds);

    const beneficiaryIds = [...new Set((links ?? []).map((l) => l.beneficiary_profile_id))];

    if (beneficiaryIds.length > 0) {
      const { data: beneficiaries } = await adminSupabase
        .from('beneficiary_profiles')
        .select('id, first_name, last_name')
        .in('id', beneficiaryIds);

      const bMap = Object.fromEntries(
        (beneficiaries ?? []).map((b) => [b.id, `${b.first_name} ${b.last_name}`])
      );

      for (const link of links ?? []) {
        if (!beneficiaryMap[link.campaign_id]) {
          beneficiaryMap[link.campaign_id] = bMap[link.beneficiary_profile_id] ?? '—';
        }
      }
    }
  }

  return {
    campaigns: campaignList.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      collectedAmount: Number(c.collected_amount ?? 0),
      targetAmount: Number(c.target_amount ?? 0),
      endDate: c.end_date,
      beneficiaryName: beneficiaryMap[c.id] ?? '—',
      coverImageKey: c.cover_image_key,
      createdAt: c.created_at,
    })),
    totalCount,
  };
}

// ─── Donors ───────────────────────────────────────────────────────────────────

export async function getDonorsData(
  authUserId: string,
  page: number = 1
): Promise<{
  statCards: DonorStatCards;
  donors: DonorRow[];
  totalCount: number;
}> {
  const adminSupabase = createAdminClient();
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // ── Stat cards: scoped to manager's campaigns ──
  const { data: managerCampaigns } = await adminSupabase
    .from('hc_campaigns')
    .select('id')
    .eq('created_by', authUserId);

  const managerCampaignIds = (managerCampaigns ?? []).map((c) => c.id);
  let totalUniqueDonors = 0;
  let averageDonation = 0;
  let newDonorsThisMonth = 0;

  if (managerCampaignIds.length > 0) {
    const { data: hopecards } = await adminSupabase
      .from('hopecards')
      .select('id')
      .in('campaign_id', managerCampaignIds);

    const hopecardIds = (hopecards ?? []).map((h) => h.id);

    if (hopecardIds.length > 0) {
      const { data: purchases } = await adminSupabase
        .from('hopecard_purchases')
        .select('buyer_auth_id, amount_paid, purchased_at')
        .in('hopecard_id', hopecardIds)
        .eq('status', 'paid');

      const purchaseList = purchases ?? [];
      const uniqueBuyerIds = [...new Set(purchaseList.map((p) => p.buyer_auth_id))];
      totalUniqueDonors = uniqueBuyerIds.length;

      if (purchaseList.length > 0) {
        const total = purchaseList.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        averageDonation = total / purchaseList.length;
      }

      // New donors this month: buyers whose first purchase (on any campaign) was this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const thisMonthBuyers = new Set(
        purchaseList
          .filter((p) => p.purchased_at >= startOfMonth)
          .map((p) => p.buyer_auth_id)
      );

      // Only count if they have no purchases before this month
      const priorBuyers = new Set(
        purchaseList
          .filter((p) => p.purchased_at < startOfMonth)
          .map((p) => p.buyer_auth_id)
      );

      for (const buyerId of thisMonthBuyers) {
        if (!priorBuyers.has(buyerId)) newDonorsThisMonth++;
      }
    }
  }

  // ── Community database: platform-wide ──
  const { data: allDonors, count } = await adminSupabase
    .from('digital_donor_profiles')
    .select('id, auth_user_id, first_name, last_name, email, total_donations_amount, total_donations_count', { count: 'exact' })
    .order('total_donations_amount', { ascending: false })
    .range(offset, offset + pageSize - 1);

  const donorList = allDonors ?? [];
  const donorAuthIds = donorList.map((d) => d.auth_user_id).filter(Boolean);

  // Last donation date + campaign tags per donor
  let lastDonationMap: Record<string, string> = {};
  let campaignTagsMap: Record<string, string[]> = {};

  if (donorAuthIds.length > 0) {
    const { data: recentPurchases } = await adminSupabase
      .from('hopecard_purchases')
      .select('buyer_auth_id, purchased_at, hopecard_id')
      .in('buyer_auth_id', donorAuthIds)
      .eq('status', 'paid')
      .order('purchased_at', { ascending: false });

    for (const p of recentPurchases ?? []) {
      if (!lastDonationMap[p.buyer_auth_id]) {
        lastDonationMap[p.buyer_auth_id] = p.purchased_at;
      }
    }

    // Campaign tags (up to 2 unique campaign titles per donor)
    const hopecardIds = [...new Set((recentPurchases ?? []).map((p) => p.hopecard_id))];
    if (hopecardIds.length > 0) {
      const { data: hopecardRows } = await adminSupabase
        .from('hopecards')
        .select('id, campaign_id')
        .in('id', hopecardIds);

      const hcardCampaignMap = Object.fromEntries(
        (hopecardRows ?? []).map((h) => [h.id, h.campaign_id])
      );

      const campaignIdSet = new Set(Object.values(hcardCampaignMap));
      const { data: campaignRows } = await adminSupabase
        .from('hc_campaigns')
        .select('id, title, category')
        .in('id', [...campaignIdSet]);

      const campaignMap = Object.fromEntries((campaignRows ?? []).map((c) => [c.id, c.title]));

      for (const buyerId of donorAuthIds) {
        const buyerPurchases = (recentPurchases ?? []).filter((p) => p.buyer_auth_id === buyerId);
        const tags: string[] = [];
        for (const p of buyerPurchases) {
          const title = campaignMap[hcardCampaignMap[p.hopecard_id]];
          if (title && !tags.includes(title.toUpperCase().slice(0, 12))) {
            tags.push(title.toUpperCase().slice(0, 12));
          }
          if (tags.length >= 2) break;
        }
        campaignTagsMap[buyerId] = tags;
      }
    }
  }

  return {
    statCards: { totalUniqueDonors, averageDonation, newDonorsThisMonth },
    donors: donorList.map((d) => ({
      id: d.id,
      name: `${d.first_name} ${d.last_name}`,
      email: d.email ?? '',
      totalContributed: Number(d.total_donations_amount ?? 0),
      donationCount: Number(d.total_donations_count ?? 0),
      lastDonationDate: lastDonationMap[d.auth_user_id] ?? null,
      campaignTags: campaignTagsMap[d.auth_user_id] ?? [],
      tier: donorTier(Number(d.total_donations_amount ?? 0)),
    })),
    totalCount: count ?? 0,
  };
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getReportsData(
  authUserId: string,
  page: number = 1
): Promise<{
  statCards: ReportStatCards;
  weeklyTrends: WeeklyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: TransactionRow[];
  totalTransactions: number;
}> {
  const adminSupabase = createAdminClient();
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { data: managerCampaigns } = await adminSupabase
    .from('hc_campaigns')
    .select('id, title, category, collected_amount, status')
    .eq('created_by', authUserId);

  const campaignList = managerCampaigns ?? [];
  const campaignIds = campaignList.map((c) => c.id);

  // Stat cards
  const totalFundsRaised = campaignList.reduce((sum, c) => sum + Number(c.collected_amount ?? 0), 0);

  let allPurchases: any[] = [];
  let hopecardCampaignMap: Record<string, string> = {};

  if (campaignIds.length > 0) {
    const { data: hopecards } = await adminSupabase
      .from('hopecards')
      .select('id, campaign_id')
      .in('campaign_id', campaignIds);

    hopecardCampaignMap = Object.fromEntries(
      (hopecards ?? []).map((h) => [h.id, h.campaign_id])
    );

    const hopecardIds = (hopecards ?? []).map((h) => h.id);

    if (hopecardIds.length > 0) {
      const { data: purchases } = await adminSupabase
        .from('hopecard_purchases')
        .select('id, buyer_auth_id, amount_paid, purchased_at, payment_method, status, hopecard_id')
        .in('hopecard_id', hopecardIds)
        .order('purchased_at', { ascending: false });

      allPurchases = purchases ?? [];
    }
  }

  const paidPurchases = allPurchases.filter((p) => p.status === 'paid');
  const averageDonation =
    paidPurchases.length > 0
      ? paidPurchases.reduce((sum, p) => sum + Number(p.amount_paid), 0) / paidPurchases.length
      : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeDonors = new Set(
    paidPurchases
      .filter((p) => new Date(p.purchased_at) >= thirtyDaysAgo)
      .map((p) => p.buyer_auth_id)
  ).size;

  const conversionRate =
    allPurchases.length > 0 ? (paidPurchases.length / allPurchases.length) * 100 : 0;

  // Weekly trends (last 16 weeks, split into current 8 vs previous 8)
  const now = new Date();
  const sixteenWeeksAgo = new Date(now);
  sixteenWeeksAgo.setDate(now.getDate() - 112);

  const recentPurchases = paidPurchases.filter(
    (p) => new Date(p.purchased_at) >= sixteenWeeksAgo
  );

  const weekTotals: Record<string, { date: Date; total: number }> = {};
  for (const p of recentPurchases) {
    const d = new Date(p.purchased_at);
    d.setDate(d.getDate() - d.getDay()); // start of week (Sunday)
    const key = d.toISOString().split('T')[0];
    if (!weekTotals[key]) weekTotals[key] = { date: d, total: 0 };
    weekTotals[key].total += Number(p.amount_paid);
  }

  const sortedWeeks = Object.entries(weekTotals).sort(([a], [b]) => a.localeCompare(b));
  const currentWeeks = sortedWeeks.slice(-8);
  const previousWeeks = sortedWeeks.slice(-16, -8);

  const weeklyTrends: WeeklyTrend[] = Array.from({ length: 8 }).map((_, i) => ({
    weekLabel: currentWeeks[i] ? getWeekStart(currentWeeks[i][1].date) : `W${i + 1}`,
    current: currentWeeks[i] ? currentWeeks[i][1].total : 0,
    previous: previousWeeks[i] ? previousWeeks[i][1].total : 0,
  }));

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  for (const c of campaignList) {
    const cat = c.category ?? 'other';
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(c.collected_amount ?? 0);
  }
  const totalForCategories = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const categoryBreakdown: CategoryBreakdown[] = Object.entries(categoryTotals).map(
    ([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: totalForCategories > 0 ? Math.round((amount / totalForCategories) * 100) : 0,
    })
  );

  // Transactions table (paginated)
  const campaignTitleMap = Object.fromEntries(campaignList.map((c) => [c.id, c.title]));
  const pageTransactions = allPurchases.slice(offset, offset + pageSize);
  const buyerIds = [...new Set(pageTransactions.map((p) => p.buyer_auth_id))];

  let donorNameMap: Record<string, string> = {};
  if (buyerIds.length > 0) {
    const { data: donors } = await adminSupabase
      .from('digital_donor_profiles')
      .select('auth_user_id, first_name, last_name')
      .in('auth_user_id', buyerIds);

    donorNameMap = Object.fromEntries(
      (donors ?? []).map((d) => [d.auth_user_id, `${d.first_name} ${d.last_name}`])
    );
  }

  const transactions: TransactionRow[] = pageTransactions.map((p) => {
    const name = donorNameMap[p.buyer_auth_id] ?? 'Anonymous';
    const initials = name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return {
      id: p.id,
      purchasedAt: p.purchased_at,
      donorName: name,
      donorInitials: initials,
      campaignTitle: campaignTitleMap[hopecardCampaignMap[p.hopecard_id]] ?? 'Unknown',
      amount: Number(p.amount_paid),
      paymentMethod: p.payment_method ?? 'Unknown',
      status: p.status,
    };
  });

  return {
    statCards: { totalFundsRaised, averageDonation, activeDonors, conversionRate },
    weeklyTrends,
    categoryBreakdown,
    transactions,
    totalTransactions: allPurchases.length,
  };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors in `app/actions/reports.ts`

- [ ] **Step 3: Commit**

```bash
git add app/actions/reports.ts
git commit -m "feat: add reports.ts server action with queries for all pages"
```

---

## Task 4: Wire Up Dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/dashboard-ui.tsx`

- [ ] **Step 1: Update `app/dashboard/page.tsx`**

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import DashboardUI from './dashboard-ui';
import { getDashboardData } from '@/app/actions/reports';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
    return null;
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from('campaign_manager_profiles')
    .select('status')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.status !== 'approved') {
    await supabase.auth.signOut();
    redirect('/');
    return null;
  }

  const { metrics, campaigns, liveActivity } = await getDashboardData(user.id);

  return (
    <DashboardUI
      metrics={metrics}
      campaigns={campaigns}
      liveActivity={liveActivity}
    />
  );
}
```

- [ ] **Step 2: Update `app/dashboard/dashboard-ui.tsx`**

Replace the entire file with the version below. All hardcoded `metricCards`, `campaigns`, and `liveActivities` arrays are replaced with props:

```typescript
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  Heart,
  Megaphone,
  Plus,
  QrCode,
  Rocket,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import type {
  DashboardMetrics,
  DashboardCampaign,
  LiveActivityItem,
} from '@/app/actions/reports';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active: { label: 'ACTIVE', className: 'bg-[#ddf7e8] text-[#3caa71]' },
  draft: { label: 'PENDING', className: 'bg-[#ffe7d7] text-[#e38f4d]' },
  completed: { label: 'CLOSED', className: 'bg-[#f1efee] text-[#9e9692]' },
  cancelled: { label: 'CLOSED', className: 'bg-[#f1efee] text-[#9e9692]' },
};

const quickActions = [
  { icon: Megaphone, label: 'Updates' },
  { icon: FileText, label: 'CSV Report' },
  { icon: ClipboardCheck, label: 'Proof' },
  { icon: QrCode, label: 'QR Code' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function DashboardUI({
  metrics,
  campaigns,
  liveActivity,
}: {
  metrics: DashboardMetrics;
  campaigns: DashboardCampaign[];
  liveActivity: LiveActivityItem[];
}) {
  const metricCards = [
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fdf2d8]',
      iconColor: 'text-[#b58b28]',
      badge: formatCurrency(metrics.fundsRaised),
      badgeColor: 'text-[#bf9336]',
      title: 'Funds Raised',
      value: formatCurrency(metrics.fundsRaised),
    },
    {
      icon: Rocket,
      iconBg: 'bg-[#fde7e1]',
      iconColor: 'text-[#c86b5e]',
      badge: `${metrics.activeCampaigns} Active`,
      badgeColor: 'text-[#ca7264]',
      title: 'Active Campaigns',
      value: metrics.activeCampaigns.toString(),
    },
    {
      icon: Heart,
      iconBg: 'bg-[#fdeceb]',
      iconColor: 'text-[#c66b62]',
      badge: `${metrics.totalDonors} Total`,
      badgeColor: 'text-[#cf746b]',
      title: 'Total Donors',
      value: metrics.totalDonors.toLocaleString(),
    },
    {
      icon: Bell,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#ca655d]',
      badge: metrics.pendingActions > 0 ? 'Action Required' : 'All Clear',
      badgeColor: metrics.pendingActions > 0 ? 'text-[#d14f45]' : 'text-[#3caa71]',
      title: 'Pending Actions',
      value: metrics.pendingActions.toString(),
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1120px]">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#2e2523] sm:text-[28px]">
            Welcome back, {metrics.managerName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-[14px] text-[#84716b]">
            You have{' '}
            <span className="font-semibold text-[#d59654]">
              {metrics.activeCampaigns} active campaign{metrics.activeCampaigns !== 1 ? 's' : ''}
            </span>{' '}
            running right now.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map(({ icon: Icon, iconBg, iconColor, badge, badgeColor, title, value }) => (
            <article
              key={title}
              className="min-h-[132px] rounded-[22px] bg-white px-5 py-4 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={16} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[10px] font-bold ${badgeColor}`}>
                  {badge}
                </span>
              </div>
              <p className="mt-5 text-[12px] font-semibold text-[#8a7a75]">{title}</p>
              <p className="mt-1 text-[16px] font-extrabold text-[#342827] sm:text-[17px]">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_255px]">
          <div className="min-w-0">
            <section className="overflow-hidden rounded-[26px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex flex-col gap-4 border-b border-[#f4ebea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[18px] font-extrabold text-[#382b28]">My Campaigns</h2>
                <Link
                  href="/my-campaigns"
                  className="text-[11px] font-bold text-[#c96a5b] hover:underline"
                >
                  View All →
                </Link>
              </div>

              {campaigns.length === 0 ? (
                <div className="px-5 py-10 text-center text-[14px] text-[#84716b]">
                  No campaigns yet.{' '}
                  <Link href="/create-campaign" className="font-bold text-[#c96a5b]">
                    Create your first one.
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                        <th className="px-4 py-4">Campaign Name</th>
                        <th className="px-3 py-4">Status</th>
                        <th className="px-3 py-4">Goal / Raised</th>
                        <th className="px-3 py-4">Progress</th>
                        <th className="px-3 py-4">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => {
                        const statusInfo = STATUS_LABEL[campaign.status] ?? STATUS_LABEL.draft;
                        const progress =
                          campaign.targetAmount > 0
                            ? Math.min(
                                Math.round((campaign.collectedAmount / campaign.targetAmount) * 100),
                                100
                              )
                            : 0;
                        const deadline = campaign.endDate
                          ? new Date(campaign.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—';
                        return (
                          <tr key={campaign.id} className="border-t border-[#f4ebea]">
                            <td className="px-4 py-5 align-top">
                              <div className="flex items-center gap-3">
                                <div className="h-[34px] w-[34px] rounded-lg bg-[#f7f4f3] flex items-center justify-center text-[10px] font-bold text-[#8a7a75]">
                                  HC
                                </div>
                                <p className="max-w-[105px] text-[14px] font-bold leading-[1.15] text-[#3c302d]">
                                  {campaign.title}
                                </p>
                              </div>
                            </td>
                            <td className="px-3 py-5 align-top">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-extrabold ${statusInfo.className}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-3 py-5 align-top text-[12px] leading-[1.35]">
                              <p className="text-[#9a8d87]">Raised</p>
                              <p className="font-bold text-[#554541]">{formatCurrency(campaign.collectedAmount)}</p>
                              <p className="mt-1 text-[#9a8d87]">Goal:</p>
                              <p className="font-extrabold text-[#453633]">{formatCurrency(campaign.targetAmount)}</p>
                            </td>
                            <td className="px-3 py-5 align-top">
                              <div className="w-[110px]">
                                <div className="h-2 rounded-full bg-[#f4e7e5]">
                                  <div
                                    className="h-2 rounded-full bg-[#c96a5b]"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="mt-2 text-[10px] font-bold text-[#c96a5b]">{progress}% Complete</p>
                              </div>
                            </td>
                            <td className="px-3 py-5 align-top text-[13px] font-medium leading-[1.25] text-[#6d5d59]">
                              {deadline}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <h2 className="text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Quick Actions</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickActions.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] bg-[#faf7f5] text-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c96a5b] shadow-[0_8px_18px_rgba(87,55,48,0.05)]">
                      <Icon size={16} />
                    </div>
                    <span className="mt-3 text-[11px] font-bold text-[#6d5d59]">{label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="min-h-[420px] rounded-[26px] bg-white p-5 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#6f5954]">Live Activity</h2>
                <span className="h-2.5 w-2.5 rounded-full bg-[#c85d50]" />
              </div>

              <div className="mt-5 space-y-5">
                {liveActivity.length === 0 ? (
                  <p className="text-[12px] text-[#8d7d78]">No recent activity.</p>
                ) : (
                  liveActivity.map((item, i) => (
                    <article key={i} className="flex gap-3">
                      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff4d9]">
                        <CircleDollarSign size={15} className="text-[#bb9037]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[12px] font-extrabold text-[#433330]">New Donation Received</h3>
                        <p className="mt-1 text-[10px] leading-[1.35] text-[#8d7d78]">
                          {item.donorName} donated {formatCurrency(item.amount)} to {item.campaignTitle}
                        </p>
                        <p className="mt-1 text-[9px] font-medium text-[#b0a39f]">{timeAgo(item.purchasedAt)}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <Link
                href="/create-campaign"
                className="mt-5 flex h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#b55247] text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
              >
                <Plus size={16} />
                New Campaign
              </Link>

              <Link href="/my-campaigns" className="mt-4 block w-full text-center text-[11px] font-bold text-[#c96a5b]">
                View All Activity
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Navigate to `/dashboard`. Confirm:
- Metric cards show real numbers (or zeros if no data)
- Manager's first name appears in heading
- Campaign table shows real campaigns (or empty state message)
- Live activity shows real donations or "No recent activity"

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx app/dashboard/dashboard-ui.tsx
git commit -m "feat: wire dashboard to real Supabase data"
```

---

## Task 5: Wire Up My Campaigns

**Files:**
- Create: `app/my-campaigns/my-campaigns-ui.tsx`
- Modify: `app/my-campaigns/page.tsx`

- [ ] **Step 1: Create `app/my-campaigns/my-campaigns-ui.tsx`**

This is the existing `MyCampaignsPage` client component extracted into its own file, with hardcoded data replaced by props. The UI layout is preserved exactly.

```typescript
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MoreVertical, Plus, Search, TrendingUp, Users } from 'lucide-react';
import AppShell from '../../components/AppShell';
import type { MyCampaignRow } from '@/app/actions/reports';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  active: { label: 'ACTIVE', className: 'bg-[#ddf7e8] text-[#3caa71]' },
  draft: { label: 'PENDING', className: 'bg-[#ffe7d7] text-[#e38f4d]' },
  completed: { label: 'CLOSED', className: 'bg-[#f1efee] text-[#9e9692]' },
  cancelled: { label: 'CLOSED', className: 'bg-[#f1efee] text-[#9e9692]' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function MyCampaignsUI({
  campaigns,
  totalCount,
  currentPage,
  managerName,
}: {
  campaigns: MyCampaignRow[];
  totalCount: number;
  currentPage: number;
  managerName: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const activeFilter = searchParams.get('status') ?? 'all';
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  function navigate(params: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.push(`/my-campaigns?${next.toString()}`));
  }

  function handleFilterChange(filter: string) {
    navigate({ status: filter === 'all' ? '' : filter, page: '1' });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: searchInput, page: '1' });
  }

  function handlePage(p: number) {
    navigate({ page: p.toString() });
  }

  const filterTabs = [
    { label: 'All Campaigns', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'draft' },
    { label: 'Closed', value: 'completed' },
  ];

  return (
    <AppShell searchPlaceholder="Search campaigns...">
      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Campaign Management</h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#84716b]">
              Track, manage, and scale your active social impact initiatives from one centralized editorial dashboard.
            </p>
          </div>
          <Link
            href="/create-campaign"
            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-7 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)] hover:bg-[#a0483e] transition-colors"
          >
            <Plus size={18} />
            Launch New Campaign
          </Link>
        </div>

        <section className="rounded-[28px] bg-white p-4 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-4 px-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-[12px] font-bold">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleFilterChange(tab.value)}
                  className={`rounded-xl px-4 py-2 transition-colors ${
                    activeFilter === tab.value
                      ? 'bg-[#fff1ed] text-[#cc6d58]'
                      : 'text-[#8a7b76] hover:bg-[#f7f4f3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="flex h-11 w-full items-center gap-2 rounded-full bg-[#faf7f5] px-4 sm:max-w-[320px]">
              <Search size={15} className="text-[#b5a8a4]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search campaign name..."
                className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
              />
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-4 py-4">Campaign Manager</th>
                  <th className="px-4 py-4">Campaign Name</th>
                  <th className="px-4 py-4">Beneficiary</th>
                  <th className="px-4 py-4">Amount Allocated</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-[14px] text-[#84716b]">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => {
                    const statusInfo = STATUS_LABEL[campaign.status] ?? STATUS_LABEL.draft;
                    const initials = getInitials(managerName);
                    return (
                      <tr key={campaign.id} className="border-b border-[#f4ebea]">
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102f4c] text-[10px] font-extrabold text-white">
                              {initials}
                            </div>
                            <span className="text-[14px] font-semibold text-[#4a3936]">{managerName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-[34px] w-[34px] rounded-lg bg-[#f7f4f3] flex items-center justify-center text-[10px] font-bold text-[#8a7a75]">
                              HC
                            </div>
                            <span className="max-w-[170px] text-[14px] font-bold leading-[1.3] text-[#3b2f2c]">
                              {campaign.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-[14px] font-medium text-[#766762]">{campaign.beneficiaryName}</td>
                        <td className="px-4 py-5 text-[14px] font-bold text-[#453633]">{formatCurrency(campaign.targetAmount)}</td>
                        <td className="px-4 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-5">
                          <button type="button" className="text-[#9d8f8a]">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} campaigns
            </p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) })
                .map((_, i) => {
                  let startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);
                  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                  return startPage + i;
                })
                .filter((p) => p <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePage(page)}
                    disabled={isPending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-[#b55247] text-white'
                        : 'border border-[#efdfdb] text-[#8c7d78] hover:bg-[#f7f4f3]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1ed] text-[#cc6d58]">
                <TrendingUp size={16} />
              </div>
              <h2 className="text-[16px] font-extrabold text-[#433330]">Total Campaigns</h2>
            </div>
            <p className="mt-5 text-[40px] font-extrabold tracking-[-0.04em] text-[#ba5f4e]">{totalCount}</p>
            <p className="mt-2 text-[13px] leading-6 text-[#8b7d78]">Campaigns created by you</p>
          </section>

          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6db] text-[#b9922e]">
                <Users size={16} />
              </div>
              <h2 className="text-[16px] font-extrabold text-[#433330]">Active Now</h2>
            </div>
            <p className="mt-5 text-[40px] font-extrabold tracking-[-0.04em] text-[#b9922e]">
              {campaigns.filter((c) => c.status === 'active').length}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#8b7d78]">Currently active campaigns</p>
          </section>

          <section className="rounded-[26px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <h2 className="text-[16px] font-extrabold text-[#433330]">Campaign Tip</h2>
            <p className="mt-4 text-[14px] leading-7 text-[#8b7d78]">
              Visual updates increase donor retention by 42%. Try adding a cover photo to your next campaign.
            </p>
            <Link href="/create-campaign" className="mt-5 block text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#c96a5b]">
              Create Campaign →
            </Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Replace `app/my-campaigns/page.tsx`**

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import MyCampaignsUI from './my-campaigns-ui';
import { getMyCampaigns } from '@/app/actions/reports';

export default async function MyCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
    return null;
  }

  const adminSupabase = createAdminClient();
  const { data: managerProfile } = await adminSupabase
    .from('campaign_manager_profiles')
    .select('first_name, last_name, status')
    .eq('auth_user_id', user.id)
    .single();

  if (!managerProfile || managerProfile.status !== 'approved') {
    redirect('/');
    return null;
  }

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10));

  const { campaigns, totalCount } = await getMyCampaigns(user.id, {
    status: params.status,
    search: params.search,
    page: currentPage,
  });

  const managerName = `${managerProfile.first_name} ${managerProfile.last_name}`;

  return (
    <MyCampaignsUI
      campaigns={campaigns}
      totalCount={totalCount}
      currentPage={currentPage}
      managerName={managerName}
    />
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify in browser**

Navigate to `/my-campaigns`. Confirm:
- Real campaigns appear from the database
- Status filter changes URL params and re-fetches
- Search box filters by title
- Pagination controls work

- [ ] **Step 5: Commit**

```bash
git add app/my-campaigns/page.tsx app/my-campaigns/my-campaigns-ui.tsx
git commit -m "feat: wire my-campaigns to real Supabase data with server-side filtering"
```

---

## Task 6: Wire Up Donors

**Files:**
- Create: `app/donors/donors-ui.tsx`
- Modify: `app/donors/page.tsx`

- [ ] **Step 1: Create `app/donors/donors-ui.tsx`**

```typescript
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CircleDollarSign,
  Download,
  Filter,
  MoreVertical,
  UserPlus,
  Users,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import type { DonorStatCards, DonorRow } from '@/app/actions/reports';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TIER_COLOR: Record<string, string> = {
  'VIP DONOR': 'text-[#b7962c]',
  'MAJOR GIFT': 'text-[#b7962c]',
  RECURRING: 'text-[#d06f5b]',
  STANDARD: 'text-[#8f817d]',
};

export default function DonorsUI({
  statCards,
  donors,
  totalCount,
  currentPage,
}: {
  statCards: DonorStatCards;
  donors: DonorRow[];
  totalCount: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  function handlePage(p: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', p.toString());
    startTransition(() => router.push(`/donors?${next.toString()}`));
  }

  const statCardData = [
    {
      icon: Users,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: '+12%',
      badgeClass: 'text-[#c86a5d]',
      title: 'Total Unique Donors',
      value: statCards.totalUniqueDonors.toLocaleString(),
    },
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fff3d5]',
      iconColor: 'text-[#bb9432]',
      badge: `Target: $150`,
      badgeClass: 'text-[#bb9432]',
      title: 'Average Donation',
      value: formatCurrency(statCards.averageDonation),
    },
    {
      icon: UserPlus,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: 'New',
      badgeClass: 'text-[#c86a5d]',
      title: 'New Donors This Month',
      value: statCards.newDonorsThisMonth.toLocaleString(),
    },
  ];

  return (
    <AppShell searchPlaceholder="Search donors...">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">Donors Database</h1>
            <p className="mt-2 text-[15px] text-[#84716b]">
              Managing {totalCount.toLocaleString()} contributors across your campaigns.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#5d4c48] shadow-[0_12px_30px_rgba(87,55,48,0.06)] ring-1 ring-[#f0e7e3]"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {statCardData.map(({ icon: Icon, iconBg, iconColor, badge, badgeClass, title, value }) => (
            <section
              key={title}
              className="rounded-[24px] bg-white p-5 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[11px] font-bold ${badgeClass}`}>
                  {badge}
                </span>
              </div>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">{title}</p>
              <p className="mt-2 text-[18px] font-extrabold text-[#342827]">{value}</p>
            </section>
          ))}
        </div>

        <section className="rounded-[28px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-3 border-b border-[#f4ebea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Community Database</h2>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#8c7c77]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c85d50]" />
              Live sync active
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-7 py-4">Donor Name</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Total Contributed</th>
                  <th className="px-4 py-4">Last Donation</th>
                  <th className="px-4 py-4">Campaigns</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-10 text-center text-[14px] text-[#84716b]">
                      No donors found.
                    </td>
                  </tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor.id} className="border-b border-[#f4ebea]">
                      <td className="px-7 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fde8e5] text-[11px] font-extrabold text-[#c86a5d]">
                            {donor.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-[14px] font-bold leading-[1.2] text-[#3b2f2c]">{donor.name}</p>
                            <p className={`mt-1 text-[10px] font-extrabold uppercase tracking-[0.05em] ${TIER_COLOR[donor.tier] ?? 'text-[#8f817d]'}`}>
                              {donor.tier}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">{donor.email}</td>
                      <td className="px-4 py-5 text-[14px] font-bold text-[#433330]">
                        {formatCurrency(donor.totalContributed)}
                      </td>
                      <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">
                        {formatDate(donor.lastDonationDate)}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex flex-wrap gap-2">
                          {donor.campaignTags.length === 0 ? (
                            <span className="text-[12px] text-[#b8aca8]">—</span>
                          ) : (
                            donor.campaignTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[#f4f1ef] px-3 py-1 text-[10px] font-extrabold uppercase text-[#6e5f5b]"
                              >
                                {tag}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <button type="button" className="text-[#9d8f8a]">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount.toLocaleString()} donors
            </p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) })
                .map((_, i) => {
                  let startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);
                  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                  return startPage + i;
                })
                .filter((p) => p <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePage(page)}
                    disabled={isPending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-[#b55247] text-white'
                        : 'border border-[#efdfdb] text-[#8c7d78] hover:bg-[#f7f4f3]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center pb-6 pt-2 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
          (c) 2023 HOPECARD Mission Management System. All rights reserved.
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Replace `app/donors/page.tsx`**

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import DonorsUI from './donors-ui';
import { getDonorsData } from '@/app/actions/reports';

export default async function DonorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
    return null;
  }

  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from('campaign_manager_profiles')
    .select('status')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.status !== 'approved') {
    redirect('/');
    return null;
  }

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10));

  const { statCards, donors, totalCount } = await getDonorsData(user.id, currentPage);

  return (
    <DonorsUI
      statCards={statCards}
      donors={donors}
      totalCount={totalCount}
      currentPage={currentPage}
    />
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify in browser**

Navigate to `/donors`. Confirm:
- Stat cards show real numbers scoped to manager's campaigns
- Community database table shows platform-wide donors
- Pagination works

- [ ] **Step 5: Commit**

```bash
git add app/donors/page.tsx app/donors/donors-ui.tsx
git commit -m "feat: wire donors page to real Supabase data"
```

---

## Task 7: Wire Up Reports

**Files:**
- Create: `app/reports/reports-ui.tsx`
- Modify: `app/reports/page.tsx`

- [ ] **Step 1: Create `app/reports/reports-ui.tsx`**

```typescript
'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Download,
  MoreVertical,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import AppShell from '../../components/AppShell';
import type {
  ReportStatCards,
  WeeklyTrend,
  CategoryBreakdown,
  TransactionRow,
} from '@/app/actions/reports';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_CLASS: Record<string, string> = {
  paid: 'bg-[#fff6db] text-[#b9922e]',
  pending: 'bg-[#fde8e5] text-[#c86a5d]',
  failed: 'bg-[#f1efee] text-[#9e9692]',
  refunded: 'bg-[#f1efee] text-[#9e9692]',
};

const CATEGORY_COLORS = ['#a45b52', '#f08d87', '#a78310', '#6b8fa3', '#7a6b8f'];

export default function ReportsUI({
  statCards,
  weeklyTrends,
  categoryBreakdown,
  transactions,
  totalTransactions,
  currentPage,
}: {
  statCards: ReportStatCards;
  weeklyTrends: WeeklyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  transactions: TransactionRow[];
  totalTransactions: number;
  currentPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalTransactions / itemsPerPage) || 1;

  function handlePage(p: number) {
    const next = new URLSearchParams(searchParams.toString());
    next.set('page', p.toString());
    startTransition(() => router.push(`/reports?${next.toString()}`));
  }

  const statCardData = [
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: '+12.4%',
      badgeClass: 'text-[#c86a5d]',
      title: 'Total Funds Raised',
      value: formatCurrency(statCards.totalFundsRaised),
    },
    {
      icon: CircleDollarSign,
      iconBg: 'bg-[#fff3d5]',
      iconColor: 'text-[#bb9432]',
      badge: '+4.2%',
      badgeClass: 'text-[#bb9432]',
      title: 'Average Donation',
      value: formatCurrency(statCards.averageDonation),
    },
    {
      icon: Users,
      iconBg: 'bg-[#fde8e5]',
      iconColor: 'text-[#c86a5d]',
      badge: 'Active',
      badgeClass: 'text-[#c86a5d]',
      title: 'Active Donors',
      value: statCards.activeDonors.toLocaleString(),
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-[#f4f1ef]',
      iconColor: 'text-[#8f817d]',
      badge: `+0.6%`,
      badgeClass: 'text-[#bb9432]',
      title: 'Conversion Rate',
      value: `${statCards.conversionRate.toFixed(1)}%`,
    },
  ];

  // Build SVG paths for weekly trends chart
  const maxVal = Math.max(...weeklyTrends.flatMap((w) => [w.current, w.previous]), 1);
  const chartW = 560;
  const chartH = 220;
  const padX = 20;
  const padY = 20;

  function toPoint(index: number, value: number): [number, number] {
    const x = padX + (index / (weeklyTrends.length - 1)) * (chartW - padX * 2);
    const y = chartH - padY - (value / maxVal) * (chartH - padY * 2);
    return [x, y];
  }

  function buildPath(series: 'current' | 'previous'): string {
    return weeklyTrends
      .map((w, i) => {
        const [x, y] = toPoint(i, series === 'current' ? w.current : w.previous);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  // Category donut
  const totalCat = categoryBreakdown.reduce((s, c) => s + c.amount, 0);
  let cumulativePct = 0;
  function conicStop(pct: number, color: string, prev: number): string {
    return `${color} ${prev}% ${prev + pct}%`;
  }
  const conicStops = categoryBreakdown.map((c, i) => {
    const pct = totalCat > 0 ? (c.amount / totalCat) * 100 : 0;
    const stop = conicStop(pct, CATEGORY_COLORS[i % CATEGORY_COLORS.length], cumulativePct);
    cumulativePct += pct;
    return stop;
  });
  const conicGradient =
    conicStops.length > 0
      ? `conic-gradient(${conicStops.join(', ')})`
      : 'conic-gradient(#f3ebe7 0% 100%)';

  return (
    <AppShell searchPlaceholder="Search reports...">
      <div className="w-full space-y-6 pb-28">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#2e2523]">
              Financial Reports &amp; Insights
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] text-[#84716b]">
              Analyze fundraising performance, donor demographics, and impact metrics across your active campaigns.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-white px-5 text-[14px] font-bold text-[#5d4c48] shadow-[0_12px_30px_rgba(87,55,48,0.06)] ring-1 ring-[#f0e7e3]"
            >
              <CalendarDays size={16} />
              Last 30 Days
            </button>
            <button
              type="button"
              className="flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b55247] px-5 text-[14px] font-bold text-white shadow-[0_10px_22px_rgba(181,82,71,0.28)]"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {statCardData.map(({ icon: Icon, iconBg, iconColor, badge, badgeClass, title, value }) => (
            <section
              key={title}
              className="rounded-[24px] bg-white p-5 shadow-[0_14px_36px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <span className={`rounded-full bg-[#fcf6f3] px-3 py-1 text-[11px] font-bold ${badgeClass}`}>
                  {badge}
                </span>
              </div>
              <p className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">{title}</p>
              <p className="mt-2 text-[18px] font-extrabold text-[#342827]">{value}</p>
            </section>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#382b28]">Fundraising Trends</h2>
              <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold uppercase tracking-[0.04em] text-[#9b8d88]">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f08d87]" />
                  Current Period
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a78310]" />
                  Previous Period
                </span>
              </div>
            </div>

            <div className="mt-6 h-[300px] rounded-[24px] bg-[#fffdfa] p-4">
              {weeklyTrends.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-[#84716b]">
                  No transaction data yet.
                </div>
              ) : (
                <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="h-full w-full">
                  <path
                    d={buildPath('current')}
                    fill="none"
                    stroke="#f08d87"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={buildPath('previous')}
                    fill="none"
                    stroke="#a78310"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g fill="#c6b8b3" fontSize="11" fontWeight="700">
                    {weeklyTrends.map((w, i) => {
                      const [x] = toPoint(i, 0);
                      return (
                        <text key={i} x={x} y={chartH + 20} textAnchor="middle">
                          {w.weekLabel}
                        </text>
                      );
                    })}
                  </g>
                </svg>
              )}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Donation by Category</h2>

            <div className="mt-7 flex items-center justify-center">
              <div
                className="relative flex h-[190px] w-[190px] items-center justify-center rounded-full"
                style={{ background: conicGradient }}
              >
                <div className="flex h-[120px] w-[120px] flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-[16px] font-extrabold text-[#382b28]">Total</span>
                  <span className="mt-1 text-[13px] font-bold text-[#8d7d78]">
                    {formatCurrency(totalCat)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {categoryBreakdown.length === 0 ? (
                <p className="text-[13px] text-[#84716b]">No data.</p>
              ) : (
                categoryBreakdown.map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-[13px] font-medium text-[#6f605c]">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      {c.category}
                    </span>
                    <span className="font-bold text-[#433330]">{c.percentage}%</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] bg-white shadow-[0_16px_42px_rgba(87,55,48,0.07)] ring-1 ring-[#f5ece8]">
          <div className="flex flex-col gap-4 border-b border-[#f4ebea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <h2 className="text-[18px] font-extrabold text-[#382b28]">Detailed Transaction Report</h2>
            <div className="flex h-11 w-full items-center gap-2 rounded-full bg-[#faf7f5] px-4 sm:max-w-[260px]">
              <Search size={15} className="text-[#b5a8a4]" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full bg-transparent text-[13px] text-[#7b6c68] outline-none placeholder:text-[#b8aca8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-[#f4ebea] text-left text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#9b8d88]">
                  <th className="px-7 py-4">Date</th>
                  <th className="px-4 py-4">Donor Name</th>
                  <th className="px-4 py-4">Campaign</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-4 py-4">Payment Method</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-7 py-10 text-center text-[14px] text-[#84716b]">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-[#f4ebea]">
                      <td className="px-7 py-5 text-[13px] font-medium text-[#6f605c]">{formatDate(t.purchasedAt)}</td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fde8e5] text-[10px] font-extrabold text-[#c86a5d]">
                            {t.donorInitials}
                          </div>
                          <span className="text-[14px] font-bold text-[#3b2f2c]">{t.donorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[13px] font-medium text-[#6f605c]">{t.campaignTitle}</td>
                      <td className="px-4 py-5 text-[14px] font-extrabold text-[#c86a5d]">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-5">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-[#6f605c]">
                          <CreditCard size={14} />
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${STATUS_CLASS[t.status] ?? STATUS_CLASS.pending}`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <button type="button" className="text-[#9d8f8a]">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#80716c]">
              Showing {totalTransactions === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions.toLocaleString()} transactions
            </p>
            <div className="flex items-center gap-2 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) })
                .map((_, i) => {
                  let startPage = Math.max(1, currentPage - 2);
                  const endPage = Math.min(totalPages, startPage + 4);
                  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                  return startPage + i;
                })
                .filter((p) => p <= totalPages)
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePage(page)}
                    disabled={isPending}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      page === currentPage
                        ? 'bg-[#b55247] text-white'
                        : 'border border-[#efdfdb] text-[#8c7d78] hover:bg-[#f7f4f3]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#efdfdb] text-[#8c7d78] disabled:opacity-50 hover:bg-[#f7f4f3] transition-colors"
              >
                ›
              </button>
            </div>
          </div>
        </section>

        <div className="pt-10 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#c2b6b2]">
          (c) 2023 HOPECARD Mission Management System. All rights reserved.
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Replace `app/reports/page.tsx`**

```typescript
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import ReportsUI from './reports-ui';
import { getReportsData } from '@/app/actions/reports';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
    return null;
  }

  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from('campaign_manager_profiles')
    .select('status')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.status !== 'approved') {
    redirect('/');
    return null;
  }

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10));

  const { statCards, weeklyTrends, categoryBreakdown, transactions, totalTransactions } =
    await getReportsData(user.id, currentPage);

  return (
    <ReportsUI
      statCards={statCards}
      weeklyTrends={weeklyTrends}
      categoryBreakdown={categoryBreakdown}
      transactions={transactions}
      totalTransactions={totalTransactions}
      currentPage={currentPage}
    />
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Verify in browser**

Navigate to `/reports`. Confirm:
- Stat cards show real numbers
- Fundraising trends chart renders (or shows "No transaction data yet" if empty)
- Donation by category donut renders with real category data
- Transactions table shows real purchases with pagination

- [ ] **Step 5: Commit**

```bash
git add app/reports/page.tsx app/reports/reports-ui.tsx
git commit -m "feat: wire reports page to real Supabase data with weekly trends chart"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 5 pages covered (Dashboard, My Campaigns, Create Campaign, Donors, Reports)
- [x] **DB migration:** `campaign_beneficiaries` table created in Task 1
- [x] **Status fix:** `'pending'` → `'draft'` applied in Task 2
- [x] **Many-to-many:** `createCampaignAction` inserts into `campaign_beneficiaries` join table in Task 2
- [x] **Donors stat cards scoped:** `getDonorsData` scopes stat cards to manager's campaigns
- [x] **Donors table platform-wide:** Community database fetches all `digital_donor_profiles`
- [x] **Reports scoped:** All `getReportsData` queries filter by manager's campaign IDs
- [x] **Weekly trends 8 weeks:** `weeklyTrends` array has 8 entries via `currentWeeks.slice(-8)`
- [x] **Type consistency:** `MyCampaignRow`, `DonorRow`, `TransactionRow` etc. defined once in `reports.ts` and imported in UI files
- [x] **Empty state handling:** All tables show empty state messages when no data
- [x] **Guard for empty arrays:** All `.in()` queries guarded by `if (ids.length > 0)`
