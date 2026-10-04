import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';

export async function createClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list: { name: string; value: string; options: CookieOptions }[]) {
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* chamado de Server Component */ }
      },
    },
  });
}

// O middleware já validou a sessão e informa o usuário no cabeçalho: evita uma segunda chamada de rede por página.
export const getPerfil = cache(async () => {
  const supabase = await createClient();
  const id = (await headers()).get('x-user-id');
  if (!id) return { supabase, user: null, perfil: null };
  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', id).single();
  return { supabase, user: { id }, perfil };
});
