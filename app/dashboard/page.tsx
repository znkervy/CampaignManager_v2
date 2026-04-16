import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardUI from './dashboard-ui';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  return <DashboardUI />;
}
