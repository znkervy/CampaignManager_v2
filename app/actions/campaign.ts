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
