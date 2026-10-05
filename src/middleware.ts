import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const base = new Headers(req.headers);
  base.delete('x-user-id'); // nunca confiar em cabeçalho vindo do navegador
  let res = NextResponse.next({ request: { headers: base } });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: { headers: base } });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const p = req.nextUrl.pathname;
  if (!user && (p.startsWith('/inicio') || p.startsWith('/admin') || p.startsWith('/conversa') || p.startsWith('/conhecimento') || p.startsWith('/conquistando') || p.startsWith('/jornada') || p.startsWith('/newsletter'))) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (user) {
    const h = new Headers(base);
    h.set('x-user-id', user.id);
    const novo = NextResponse.next({ request: { headers: h } });
    res.cookies.getAll().forEach(c => novo.cookies.set(c));
    res = novo;
  }
  return res;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest.webmanifest|api/cron).*)'] };
