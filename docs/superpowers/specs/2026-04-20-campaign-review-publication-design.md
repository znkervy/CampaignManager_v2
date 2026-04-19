# Campaign Review & Publication Design
**Date:** 2026-04-20  
**Branch:** campaignmanager_backend  
**Scope:** Backend validation and publication workflow for create-campaign review step

---

## Overview

Implement a complete validation and publication workflow for the campaign review step (step 5). Campaigns are created with `status: 'draft'` and can be activated later. Full client and server-side validation ensures all required fields are present before publication.

---

## 1. Validation Rules

### Required Fields

**Campaign basics:**
- Campaign title (non-empty string)
- Category (one of: Health, Education, Environment, Disaster)
- Description (non-empty, recommend min 20 chars)

**Financial:**
- Target amount (must be > 0)
- End date (must be in future)

**Beneficiaries:**
- At least one beneficiary selected

**Documents:**
- Manager ID file uploaded (not null)
- Proof of Address file uploaded (not null)

**Agreements:**
- Terms of Service checked (true)
- Privacy Policy checked (true)
- Campaign Accuracy checked (true)

---

## 2. UI Changes

### Review Step (Step 5) Button & Messaging

**Button text:**
- Old: "Submit For Approval"
- New: "Publish Campaign"

**Step description update:**
- Old: "Almost there! Please double-check the details..."
- New: "Everything looks good? Publish your campaign to activate it as a draft. You can edit and activate it later from your campaigns dashboard."

**Button state:**
- Disabled if any validation fails
- Enabled only when all required fields are valid

### Validation Error Display

**Location:** Above the button, in review step

**Style:** 
- Red/warning background (use existing warning palette)
- List of missing/invalid items
- Clear, user-friendly language

**Example:**
```
⚠ Cannot publish campaign yet. Please complete:
• Campaign title is required
• At least one beneficiary must be selected
• Manager ID document is required
• You must agree to all terms before publishing
```

---

## 3. Backend Changes

### `createCampaignAction` Validation

**Add server-side validation:**
1. Check all required fields present in FormData
2. Validate document files are not null/empty
3. Validate agreement checkboxes are all true (string 'true')
4. Validate end_date is in future format
5. Validate target_amount > 0
6. Return specific error message if validation fails

**Error response format:**
```ts
{
  success: false,
  error: 'Campaign title is required',
  validationErrors?: ['title', 'beneficiaries'] // optional, for mapping to fields
}
```

**On success:**
- Create campaign with `status: 'draft'`
- Link beneficiaries via `campaign_beneficiaries` (existing behavior)
- Send beneficiary invitation emails (existing behavior)
- Return success with campaign id
- Frontend redirects to `/my-campaigns`

---

## 4. Client-Side Validation Logic

**Location:** `app/create-campaign/page.tsx`

**Validation function:**
```ts
function validateCampaignForPublication(): {
  isValid: boolean
  errors: string[]
}
```

Returns object with:
- `isValid`: boolean flag
- `errors`: array of user-friendly error messages

**Trigger points:**
1. When user clicks "Publish Campaign" button
2. On state changes (optional, for real-time validation as user fills form)

**Implementation:**
- Runs before calling `createCampaignAction`
- Shows errors in a summary box if validation fails
- Only calls server action if client validation passes

---

## 5. Error Handling Flow

```
User clicks "Publish Campaign"
    ↓
Client validation runs
    ↓
If invalid:
  - Display error summary above button
  - Button remains disabled
  - Do NOT call server action
    ↓
If valid:
  - Disable button ("Publishing...")
  - Call createCampaignAction
    ↓
    If server validation fails:
      - Show alert with specific error
      - Re-enable button
    ↓
    If server validation passes:
      - Create campaign (draft status)
      - Show success state (button changes to "✓ Published")
      - Redirect to /my-campaigns after 2s delay
```

---

## 6. Data Types

### Validation Error Object
```ts
interface ValidationError {
  field: string
  message: string
}

interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
```

### Campaign Form State (existing)
```ts
// Basic
title: string
activeCategory: string
description: string
coverImage: File | null

// Financial
targetAmount: string
minDonation: string
endDate: string

// Beneficiaries
selectedBeneficiaries: string[]

// Documents
managerId: File | null
proofOfAddress: File | null
agreedToTerms: boolean
agreedToPrivacy: boolean
agreedToCampaignAccuracy: boolean
```

---

## 7. Files to Update

| File | Change |
|------|--------|
| `app/create-campaign/page.tsx` | Add `validateCampaignForPublication()` function, update button text/logic, add error summary display |
| `app/actions/campaign.ts` | Add validation checks to `createCampaignAction`, return specific error messages |

---

## 8. Success Criteria

✓ All required fields validated before publication allowed
✓ Clear error messages guide user to fix validation failures
✓ Server-side validation prevents invalid campaigns from being created
✓ Campaign created with `status: 'draft'` on successful publication
✓ User redirected to My Campaigns page after successful publication
✓ Button text reflects actual workflow: "Publish Campaign"
✓ No approval step - campaigns are immediately available to manager in draft

---

## 9. Notes & Constraints

- Validation is case-sensitive for enum values (category must match: Health, Education, Environment, Disaster)
- End date validation: must be greater than today's date
- Target amount must be positive number, not zero
- All agreement checkboxes must be explicitly true (not just present)
- Document files must have size > 0 bytes (not empty)
- Server-side validation is final truth - never trust client validation alone
- No changes to database schema required
- Existing beneficiary email notifications remain unchanged
