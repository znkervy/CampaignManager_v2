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
