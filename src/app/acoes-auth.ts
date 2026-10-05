'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function entrarComGoogle() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` } });
  if (data?.url) redirect(data.url);
  redirect('/login?erro=1');
}
