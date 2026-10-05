import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const next = req.nextUrl.searchParams.get('next') ?? '/inicio';
  const destino = next.startsWith('/') && !next.startsWith('//') ? next : '/inicio';
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL('/login?erro=1', req.url));
  }
  return NextResponse.redirect(new URL(destino, req.url));
}
