import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

async function salvar(fd: FormData) {
  'use server';
  const { supabase, user, perfil } = await getPerfil();
  if (!user) redirect('/login');
  const campos: Record<string, string | null> = { nome: String(fd.get('nome') ?? '').trim(), unidade_id: String(fd.get('unidade') || '') || null };
  if (!campos.nome || !campos.unidade_id) redirect('/perfil?erro=dados');
  if (!perfil?.aceitou_termos_em) {
    if (fd.get('aceite') !== 'on') redirect('/perfil?erro=aceite');
    campos.aceitou_termos_em = new Date().toISOString();
  }
  await supabase.from('perfis').update(campos).eq('id', user.id);
  redirect('/inicio');
}

export default async function Perfil({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const { supabase, perfil } = await getPerfil();
  const { data: unidades } = await supabase.from('unidades').select('id,nome').order('nome');
  const completar = !perfil?.aceitou_termos_em || !perfil?.unidade_id;
  return (
    <main className="pagina estreito">
      <h1>{completar ? 'Complete seu perfil' : 'Meu perfil'}</h1>
      {sp.erro === 'dados' && <p className="aviso">Informe seu nome e sua unidade.</p>}
      {sp.erro === 'aceite' && <p className="aviso">Para continuar, aceite os termos de uso e o aviso de privacidade.</p>}
      <form action={salvar}>
        <label htmlFor="nome">Nome</label><input id="nome" name="nome" defaultValue={perfil?.nome ?? ''} required />
        <label htmlFor="unidade">Unidade</label>
        <select id="unidade" name="unidade" defaultValue={perfil?.unidade_id ?? ''} required>
          <option value="">Selecione a unidade</option>
          {(unidades ?? []).map((u: { id: string; nome: string }) => <option key={u.id} value={u.id}>{u.nome}</option>)}
        </select>
        {!perfil?.aceitou_termos_em && (
          <p className="check"><input id="aceite" name="aceite" type="checkbox" required /><label htmlFor="aceite">Li e aceito os <Link href="/termos" target="_blank">termos de uso</Link> e o <Link href="/privacidade" target="_blank">aviso de privacidade</Link>.</label></p>
        )}
        <p><button type="submit">Salvar</button></p>
      </form>
    </main>
  );
}
