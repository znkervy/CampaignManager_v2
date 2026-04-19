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
