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
  const number = formData.get('contactNumber') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const secFile = formData.get('secRegistration') as File;
  const orgCertFile = formData.get('orgCertificate') as File;

  if (!firstName || !lastName || !organizationName || !email || !number || !password || !confirmPassword) {
    return { error: 'All fields are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (!secFile || secFile.size === 0) {
    return { error: 'Please upload your SEC Registration.' };
  }

  if (!orgCertFile || orgCertFile.size === 0) {
    return { error: 'Please upload your Organizational Certificate.' };
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
    return { error: `Failed to upload Organizational Certificate: ${orgCertUploadError.message}` };
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
      number,
      sec_registration: secKey,
      organization_certificate: orgCertKey,
      status: 'pending',
    });

  if (profileError) {
    await adminClient.storage.from('camp-man-files').remove([secKey, orgCertKey]);
    await adminClient.auth.admin.deleteUser(user.id);
    return { error: 'Failed to save profile. Please try again.' };
  }

  return null; // success — caller shows confirmation message
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();

  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !data.user) {
    return { error: 'Invalid email or password.' };
  }

  const user = data.user;

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
    await supabase.auth.signOut();
    return { error: 'Account not found. Please contact support.' };
  }

  if (profile.status === 'pending') {
    await supabase.auth.signOut();
    return { error: 'Your account is pending admin approval.' };
  }

  if (profile.status === 'rejected') {
    await supabase.auth.signOut();
    return { error: 'Your account has been rejected. Please contact support.' };
  }

  redirect('/dashboard');
}
