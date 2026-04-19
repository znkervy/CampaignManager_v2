'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { redirect } from 'next/navigation';

export type AuthActionResult = { error: string } | null;

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const organizationName = formData.get('organization') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('contactNumber') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const secFile = formData.get('secRegistration') as File;
  const orgCertFile = formData.get('orgCertificate') as File;

  if (!firstName || !lastName || !organizationName || !email || !phone || !password || !confirmPassword) {
    return { error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!secFile || secFile.size === 0) {
    return { error: 'Please upload your SEC Registration.' };
  }
  if (secFile.size > MAX_FILE_SIZE) {
    return { error: 'SEC Registration must be smaller than 5 MB.' };
  }

  if (!orgCertFile || orgCertFile.size === 0) {
    return { error: 'Please upload your Organizational Certificate.' };
  }
  if (orgCertFile.size > MAX_FILE_SIZE) {
    return { error: 'Organizational Certificate must be smaller than 5 MB.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return { error: 'Server misconfiguration. Please contact support.' };
  }

  const adminClient = createAdminClient();

  // Upload SEC Registration
  const secExt = secFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'bin';
  const secKey = `sec-registrations/${Date.now()}-${crypto.randomUUID()}.${secExt}`;
  const { error: secUploadError } = await adminClient.storage
    .from('camp-man-files')
    .upload(secKey, secFile);

  if (secUploadError) {
    return { error: `Failed to upload SEC Registration: ${secUploadError.message}` };
  }

  // Upload Org Certificate
  const orgCertExt = orgCertFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') ?? 'bin';
  const orgCertKey = `org-certificates/${Date.now()}-${crypto.randomUUID()}.${orgCertExt}`;
  const { error: orgCertUploadError } = await adminClient.storage
    .from('camp-man-files')
    .upload(orgCertKey, orgCertFile);

  if (orgCertUploadError) {
    await adminClient.storage.from('camp-man-files').remove([secKey]);
    return { error: 'Failed to upload Organizational Certificate. Please try again.' };
  }

  // Create auth user
  const supabase = await createClient();
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (signUpError) {
    await adminClient.storage.from('camp-man-files').remove([secKey, orgCertKey]);
    return { error: signUpError.message };
  }

  const user = data.user;
  if (!user) {
    return { error: 'Signup failed. Please try again.' };
  }

  // Insert profile row
  const { error: profileError } = await adminClient
    .from('campaign_manager_profiles')
    .insert({
      auth_user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      organization_name: organizationName,
      email,
      phone,
      sec_registration: secKey,
      organizational_certificate: orgCertKey,
      status: 'pending',
    });

  if (profileError) {
    console.error('[signUpAction] profile insertion failed:', profileError);
    await adminClient.storage.from('camp-man-files').remove([secKey, orgCertKey]);
    await adminClient.auth.admin.deleteUser(user.id);
    return { error: `Failed to save profile: ${profileError.message}` };
  }

  return null; // success — caller shows confirmation message
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createClient();

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: 'Invalid email or password.' };
  }
  if (!data.user) {
    await supabase.auth.signOut();
    return { error: 'Invalid email or password.' };
  }

  const user = data.user;

  // Belt-and-suspenders: Supabase also blocks unconfirmed sign-ins at the
  // project level, but we re-check here in case that setting is disabled.
  if (!user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { error: 'Please confirm your email before signing in.' };
  }

  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from('campaign_manager_profiles')
    .select('status')
    .eq('auth_user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[loginAction] profile query failed:', profileError?.message);
    await supabase.auth.signOut();
    return { error: 'Account not found. Please contact support.' };
  }

  if (profile.status !== 'approved') {
    await supabase.auth.signOut();
    const msg =
      profile.status === 'pending'
        ? 'Your account is pending admin approval.'
        : profile.status === 'rejected'
          ? 'Your account has been rejected. Please contact support.'
          : 'Your account is not active. Please contact support.';
    return { error: msg };
  }

  redirect('/dashboard');
}

export async function getProfileAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from('campaign_manager_profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (error || !profile) return null;

  return profile;
}

export async function updateProfileAction(formData: FormData): Promise<AuthActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const organizationName = formData.get('organizationName') as string;
  const phone = formData.get('phone') as string;

  if (!firstName || !lastName || !organizationName || !phone) {
    return { error: 'First name, last name, organization, and phone are required.' };
  }

  const adminClient = createAdminClient();
  const { error: profileError } = await adminClient
    .from('campaign_manager_profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      organization_name: organizationName,
      phone: phone,
    })
    .eq('auth_user_id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  return null;
}
