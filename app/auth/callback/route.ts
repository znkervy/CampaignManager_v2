import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=confirmation_failed`);
  }

  return NextResponse.redirect(`${origin}/?confirmed=true`);
}
