'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

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

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (!secFile || secFile.size === 0) {
    return { error: 'Please upload your SEC Registration.' };
  }

  if (!orgCertFile || orgCertFile.size === 0) {
    return { error: 'Please upload your Organizational Certificate.' };
  }

  const adminClient = createAdminClient();

  // Upload SEC Registration
  const secKey = `sec-registrations/${Date.now()}-${secFile.name}`;
  const { error: secUploadError } = await adminClient.storage
    .from('camp-man-files')
    .upload(secKey, secFile);

  if (secUploadError) {
    return { error: `Failed to upload SEC Registration: ${secUploadError.message}` };
  }

  // Upload Org Certificate
  const orgCertKey = `org-certificates/${Date.now()}-${orgCertFile.name}`;
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (signUpError) {
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
    return { error: `Failed to save profile: ${profileError.message}` };
  }

  return null; // success — caller shows confirmation message
}
