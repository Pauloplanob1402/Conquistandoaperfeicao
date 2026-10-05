import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function enviar(fd: FormData) {
  'use server';
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(fd.get('email')), { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/nova-senha` });
  redirect('/esqueci?enviado=1'); // mesma resposta exista ou não a conta
}

export default async function Esqueci({ searchParams }: { searchParams: Promise<{ enviado?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="pagina estreito">
      <h1>Esqueci minha senha</h1>
      {sp.enviado ? <p className="aviso ok">Se o e-mail estiver cadastrado, enviamos um link para criar nova senha. Confira o spam.</p> : (
        <form action={enviar}>
          <label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required />
          <p><button type="submit">Enviar link</button></p>
        </form>
      )}
      <p><Link href="/login">Voltar para entrar</Link></p>
    </main>
  );
}
