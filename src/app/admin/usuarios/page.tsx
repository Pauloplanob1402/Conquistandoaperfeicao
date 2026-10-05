import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

async function salvar(fd: FormData) {
  'use server';
  const { supabase, user } = await getPerfil();
  const id = String(fd.get('id'));
  const campos: Record<string, string | boolean | null> = { unidade_id: String(fd.get('unidade') || '') || null, aprovado: fd.get('aprovado') === 'on' };
  if (id !== user?.id) campos.tipo = String(fd.get('tipo'));
  await supabase.from('perfis').update(campos).eq('id', id);
  redirect(`/admin/usuarios?ok=salvo${fd.get('pendentes') ? '&pendentes=1' : ''}`);
}
async function addDominio(fd: FormData) {
  'use server';
  const { supabase } = await getPerfil();
  const dominio = String(fd.get('dominio') ?? '').trim().toLowerCase().replace(/^@/, '');
  if (dominio.includes('.')) await supabase.from('dominios_permitidos').upsert({ dominio });
  redirect('/admin/usuarios?ok=dominio');
}
async function delDominio(fd: FormData) {
  'use server';
  const { supabase } = await getPerfil();
  await supabase.from('dominios_permitidos').delete().eq('dominio', String(fd.get('dominio')));
  redirect('/admin/usuarios?ok=dominio');
}

type U = { id: string; nome: string | null; email: string | null; tipo: string; aprovado: boolean; unidade_id: string | null; criado_em: string };

export default async function Usuarios({ searchParams }: { searchParams: Promise<{ pendentes?: string; ok?: string }> }) {
  const sp = await searchParams;
  const { supabase, user } = await getPerfil();
  let q = supabase.from('perfis').select('id,nome,email,tipo,aprovado,unidade_id,criado_em').order('aprovado').order('criado_em', { ascending: false }).limit(500);
  if (sp.pendentes) q = q.eq('aprovado', false);
  const { data } = await q;
  const { data: un } = await supabase.from('unidades').select('id,nome').order('nome');
  const { data: dm } = await supabase.from('dominios_permitidos').select('dominio').order('dominio');
  const lista = (data ?? []) as U[];
  const unidades = (un ?? []) as { id: string; nome: string }[];
  const dominios = (dm ?? []) as { dominio: string }[];
  return (
    <main className="pagina">
      <h1>Usuários</h1>
      {sp.ok && <p className="aviso ok">Alteração salva.</p>}
      <section style={{ maxWidth: 560 }}>
        <h2>Domínios com aprovação automática</h2>
        <p style={{ color: 'var(--cinza)' }}>Quem se cadastrar com e-mail desses domínios entra aprovado. Os demais ficam aguardando a sua aprovação.</p>
        <p>{dominios.length === 0 ? 'Nenhum domínio cadastrado: todos os novos acessos aguardam aprovação.' : dominios.map(d => (
          <form action={delDominio} key={d.dominio} style={{ display: 'inline-block', marginRight: '.5rem' }}><input type="hidden" name="dominio" value={d.dominio} /><button className="claro" type="submit">@{d.dominio} ✕</button></form>
        ))}</p>
        <form action={addDominio} className="filtros"><div><label htmlFor="dominio">Novo domínio</label><input id="dominio" name="dominio" placeholder="empresa.com.br" /></div><button type="submit">Adicionar</button></form>
      </section>
      <p>{sp.pendentes ? <Link href="/admin/usuarios">Ver todos</Link> : <Link href="/admin/usuarios?pendentes=1">Ver só pendentes</Link>} · {lista.length} pessoas</p>
      {lista.map(u => (
        <form action={salvar} key={u.id} className="cartao usuario">
          <input type="hidden" name="id" value={u.id} />{sp.pendentes && <input type="hidden" name="pendentes" value="1" />}
          <div><strong>{u.nome || 'Sem nome'}</strong><br /><small>{u.email}</small></div>
          <select name="unidade" defaultValue={u.unidade_id ?? ''} aria-label="Unidade"><option value="">Sem unidade</option>{unidades.map(x => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
          <select name="tipo" defaultValue={u.tipo} aria-label="Perfil" disabled={u.id === user?.id}><option value="lideranca">Liderança</option><option value="supervisao">Supervisão</option><option value="admin">Administrador</option></select>
          <label className="check2"><input type="checkbox" name="aprovado" defaultChecked={u.aprovado} /> Aprovado</label>
          <button type="submit">Salvar</button>
        </form>
      ))}
    </main>
  );
}
