'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
  validationErrors?: Array<{ field: string; message: string }>;
};

interface CampaignValidationError {
  field: string;
  message: string;
}

function validateCampaignData(data: {
  title: string | null;
  category: string | null;
  description: string | null;
  targetAmount: number;
  endDate: string | null;
  beneficiaryIds: string[];
  managerId: File | null;
  proofOfAddress: File | null;
  agreedToTerms: string | null;
  agreedToPrivacy: string | null;
  agreedToCampaignAccuracy: string | null;
}): CampaignValidationError[] {
  const errors: CampaignValidationError[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Campaign title is required' });
  }

  const validCategories = ['Health', 'Education', 'Environment', 'Disaster'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push({ field: 'category', message: 'Please select a valid category' });
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Campaign description is required' });
  }

  if (isNaN(data.targetAmount) || data.targetAmount <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be greater than 0' });
  }

  if (!data.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' });
  } else {
    const endDate = new Date(data.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate <= today) {
      errors.push({ field: 'endDate', message: 'End date must be in the future' });
    }
  }

  if (data.beneficiaryIds.length === 0) {
    errors.push({ field: 'beneficiaries', message: 'At least one beneficiary must be selected' });
  }

  if (!data.managerId || data.managerId.size === 0) {
    errors.push({ field: 'managerId', message: 'Manager ID document is required' });
  }

  if (!data.proofOfAddress || data.proofOfAddress.size === 0) {
    errors.push({ field: 'proofOfAddress', message: 'Proof of Address document is required' });
  }

  if (data.agreedToTerms !== 'true') {
    errors.push({ field: 'agreements', message: 'You must agree to the Terms of Service' });
  }

  if (data.agreedToPrivacy !== 'true') {
    errors.push({ field: 'agreements', message: 'You must agree to the Privacy Policy' });
  }

  if (data.agreedToCampaignAccuracy !== 'true') {
    errors.push({ field: 'agreements', message: 'You must certify campaign accuracy' });
  }

  return errors;
}

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

    const managerId = formData.get('managerId') as File | null;
    const proofOfAddress = formData.get('proofOfAddress') as File | null;
    const agreedToTerms = formData.get('agreedToTerms') as string | null;
    const agreedToPrivacy = formData.get('agreedToPrivacy') as string | null;
    const agreedToCampaignAccuracy = formData.get('agreedToCampaignAccuracy') as string | null;

    // Validate campaign data
    const validationErrors = validateCampaignData({
      title,
      category,
      description,
      targetAmount,
      endDate,
      beneficiaryIds: selectedBeneficiaryIds,
      managerId,
      proofOfAddress,
      agreedToTerms,
      agreedToPrivacy,
      agreedToCampaignAccuracy,
    });

    if (validationErrors.length > 0) {
      return { success: false, error: 'Campaign validation failed', validationErrors };
    }

    let cover_image_key = null;

    if (coverImage && coverImage.size > 0) {
      const fileExt = coverImage.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `cover-images/campaigns/${fileName}`;

      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from('camp-man-files')
        .upload(`cover-images/${filePath}`, coverImage);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Failed to upload cover image. Ensure the camp-man-files bucket and cover-images folder exist.' };
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
        return { success: false, error: 'Campaign created but failed to link beneficiaries. Please try again.' };
      }

      // Send invitation emails
      const { data: beneficiaries } = await adminSupabase
        .from('beneficiary_profiles')
        .select('email, first_name, last_name')
        .in('id', selectedBeneficiaryIds);

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

export async function activateCampaignAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'active' })
      .eq('id', campaignId);

    if (error) {
      console.error('Activation error:', error);
      return { success: false, error: 'Failed to activate campaign.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error activating campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function completeCampaignAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId);

    if (error) {
      console.error('Completion error:', error);
      return { success: false, error: 'Failed to complete campaign.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error completing campaign:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelCampaignAction(campaignId: string): Promise<ActionResponse> {
  try {
    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('hc_campaigns')
      .update({ status: 'cancelled' })
      .eq('id', campaignId);

    if (error) {
      console.error('Cancellation error:', error);
      return { success: false, error: 'Failed to cancel campaign.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling campaign:', error);
    return { success: false, error: error.message };
  }
}
