import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import DashboardUI from './dashboard-ui';

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

  return <DashboardUI />;
}
