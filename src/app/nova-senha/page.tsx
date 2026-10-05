import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function salvar(fd: FormData) {
  'use server';
  const senha = String(fd.get('senha')), conf = String(fd.get('confirma'));
  if (senha.length < 6 || senha !== conf) redirect('/nova-senha?erro=1');
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) redirect('/nova-senha?erro=2');
  redirect('/inicio');
}

export default async function NovaSenha({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="pagina estreito">
      <h1>Criar nova senha</h1>
      {sp.erro === '1' && <p className="aviso">As senhas precisam ser iguais e ter 6 ou mais caracteres.</p>}
      {sp.erro === '2' && <p className="aviso">O link expirou. Peça um novo em &quot;Esqueci minha senha&quot;.</p>}
      <form action={salvar}>
        <label htmlFor="senha">Nova senha</label><input id="senha" name="senha" type="password" minLength={6} autoComplete="new-password" required />
        <label htmlFor="confirma">Repita a nova senha</label><input id="confirma" name="confirma" type="password" minLength={6} autoComplete="new-password" required />
        <p><button type="submit">Salvar nova senha</button></p>
      </form>
    </main>
  );
}
