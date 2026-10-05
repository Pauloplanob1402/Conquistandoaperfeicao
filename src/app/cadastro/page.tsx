import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function cadastrar(fd: FormData) {
  'use server';
  if (fd.get('aceite') !== 'on') redirect('/cadastro?erro=aceite');
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(fd.get('email')),
    password: String(fd.get('senha')),
    options: {
      data: { nome: String(fd.get('nome')), unidade_id: String(fd.get('unidade') || ''), aceite: 'sim' },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) redirect('/cadastro?erro=1');
  redirect('/login?ok=1');
}

export default async function Cadastro({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: unidades } = await supabase.from('unidades').select('id,nome').order('nome');
  return (
    <main className="pagina estreito">
      <h1>Criar acesso</h1>
      {sp.erro === 'aceite' && <p className="aviso">Para criar o acesso, aceite os termos de uso e o aviso de privacidade.</p>}
      {sp.erro === '1' && <p className="aviso">Não foi possível criar o acesso. Use uma senha com 6 ou mais caracteres e confira o e-mail.</p>}
      <p style={{ color: 'var(--cinza)' }}>Depois de criar o acesso, ele passa por aprovação antes de liberar o conteúdo.</p>
      <form action={cadastrar}>
        <label htmlFor="nome">Nome</label><input id="nome" name="nome" autoComplete="name" required />
        <label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="unidade">Unidade</label>
        <select id="unidade" name="unidade" defaultValue="" required>
          <option value="">Selecione a unidade</option>
          {(unidades ?? []).map((u: { id: string; nome: string }) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
        <label htmlFor="senha">Senha</label><input id="senha" name="senha" type="password" minLength={6} autoComplete="new-password" required />
        <p className="check"><input id="aceite" name="aceite" type="checkbox" required /><label htmlFor="aceite">Li e aceito os <Link href="/termos" target="_blank">termos de uso</Link> e o <Link href="/privacidade" target="_blank">aviso de privacidade</Link>.</label></p>
        <p><button type="submit">Criar acesso</button></p>
      </form>
      <p>Já tem acesso? <Link href="/login">Entrar</Link></p>
    </main>
  );
}
