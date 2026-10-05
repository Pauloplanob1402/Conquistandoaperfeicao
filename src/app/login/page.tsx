import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { entrarComGoogle } from '../acoes-auth';

async function entrar(fd: FormData) {
  'use server';
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: String(fd.get('email')), password: String(fd.get('senha')) });
  if (error) redirect('/login?erro=1');
  redirect('/inicio');
}

export default async function Login({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="pagina estreito">
      <h1>Entrar</h1>
      {sp.ok && <p className="aviso ok">Acesso criado. Confirme o e-mail que enviamos e entre em seguida.</p>}
      {sp.erro && <p className="aviso">Não foi possível entrar. Confira os dados e tente de novo.</p>}
      <form action={entrar}>
        <label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="senha">Senha</label><input id="senha" name="senha" type="password" autoComplete="current-password" required />
        <p><button type="submit">Entrar</button></p>
      </form>
      <form action={entrarComGoogle}><p><button className="claro" type="submit">Entrar com Google</button></p></form>
      <p><Link href="/esqueci">Esqueci minha senha</Link></p>
      <p>Ainda não tem acesso? <Link href="/cadastro">Criar acesso</Link></p>
    </main>
  );
}
