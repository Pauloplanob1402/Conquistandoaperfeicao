import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';
import { enviarEmails, montarHtml, carregarDestaques, publicarEdicao } from '@/lib/newsletter';

export default async function Editor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> }) {
  const { id } = await params;
  const { m } = await searchParams;
  const { supabase, perfil } = await getPerfil();
  const { data: n } = await supabase.from('newsletters').select('*').eq('id', id).single();
  if (!n) notFound();
  const { data: unidades } = await supabase.from('unidades').select('id,nome').order('nome');
  const { data: dd } = await supabase.from('newsletter_destaques').select('id,titulo,texto,unidades(nome)').eq('newsletter_id', id).order('criado_em');
  const destaques = (dd ?? []) as unknown as { id: string; titulo: string; texto: string; unidades: { nome: string } | null }[];
  const ir = (msg: string) => redirect(`/admin/newsletter/${id}?m=${encodeURIComponent(msg)}`);

  async function salvar(fd: FormData) {
    'use server';
    const { supabase } = await getPerfil();
    await supabase.from('newsletters').update({ titulo: String(fd.get('titulo')), resumo: String(fd.get('resumo') ?? '') || null, corpo: String(fd.get('corpo') ?? '') }).eq('id', id);
    redirect(`/admin/newsletter/${id}?m=${encodeURIComponent('Salvo.')}`);
  }
  async function addDestaque(fd: FormData) {
    'use server';
    const { supabase } = await getPerfil();
    await supabase.from('newsletter_destaques').insert({ newsletter_id: id, unidade_id: String(fd.get('unidade') || '') || null, titulo: String(fd.get('dtitulo')), texto: String(fd.get('dtexto')) });
    redirect(`/admin/newsletter/${id}?m=${encodeURIComponent('Destaque adicionado.')}`);
  }
  async function delDestaque(fd: FormData) {
    'use server';
    const { supabase } = await getPerfil();
    await supabase.from('newsletter_destaques').delete().eq('id', String(fd.get('did')));
    redirect(`/admin/newsletter/${id}`);
  }
  async function teste() {
    'use server';
    const { supabase, perfil } = await getPerfil();
    const { data: e } = await supabase.from('newsletters').select('id,titulo,resumo,corpo').eq('id', id).single();
    if (!e || !perfil?.email) return redirect(`/admin/newsletter/${id}?m=${encodeURIComponent('Seu perfil não tem e-mail cadastrado (rode o SQL 07).')}`);
    const r = await enviarEmails(`[TESTE] ${e.titulo}`, montarHtml(e, await carregarDestaques(supabase, id), `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/${id}`), [perfil.email]);
    redirect(`/admin/newsletter/${id}?m=${encodeURIComponent(r.ok ? `Teste enviado para ${perfil.email}.` : r.erro)}`);
  }
  async function publicar(fd: FormData) {
    'use server';
    const { supabase } = await getPerfil();
    const r = await publicarEdicao(supabase, id, fd.get('email') === '1');
    redirect(`/admin/newsletter/${id}?m=${encodeURIComponent(r.ok ? (r.enviados ? `Publicada e enviada para ${r.enviados} pessoas.` : 'Publicada na plataforma.') : r.erro)}`);
  }
  async function agendar(fd: FormData) {
    'use server';
    const { supabase } = await getPerfil();
    const quando = String(fd.get('quando') ?? '');
    if (!quando) return redirect(`/admin/newsletter/${id}?m=${encodeURIComponent('Escolha a data.')}`);
    await supabase.from('newsletters').update({ status: 'agendada', agendada_para: new Date(`${quando}T11:00:00Z`).toISOString() }).eq('id', id);
    redirect(`/admin/newsletter/${id}?m=${encodeURIComponent('Agendada. O envio acontece de manhã, no dia escolhido.')}`);
  }
  async function rascunho() {
    'use server';
    const { supabase } = await getPerfil();
    await supabase.from('newsletters').update({ status: 'rascunho', agendada_para: null }).eq('id', id);
    redirect(`/admin/newsletter/${id}?m=${encodeURIComponent('Voltou para rascunho.')}`);
  }
  void ir; void perfil;

  return (
    <main className="pagina">
      <p><Link href="/admin/newsletter">Todas as edições</Link> · <Link href={`/newsletter/${id}`}>Ver prévia</Link> · <span className={`selo ${n.status}`}>{n.status}</span></p>
      {m && <p className="aviso ok">{m}</p>}
      <div className="editor">
        <div>
          <form action={salvar}>
            <label htmlFor="titulo">Título (assunto do e-mail)</label><input id="titulo" name="titulo" defaultValue={n.titulo} required />
            <label htmlFor="resumo">Resumo (aparece na lista)</label><input id="resumo" name="resumo" defaultValue={n.resumo ?? ''} />
            <label htmlFor="corpo">Texto (separe os parágrafos com uma linha em branco)</label><textarea id="corpo" name="corpo" defaultValue={n.corpo} style={{ minHeight: '14rem' }} />
            <p><button type="submit">Salvar</button></p>
          </form>
          <h2>Destaques das unidades</h2>
          {destaques.map(d => (
            <div className="cartao" key={d.id} style={{ marginBottom: '.6rem' }}>
              <small>{d.unidades?.nome ?? 'Sem unidade'}</small><p><strong>{d.titulo}</strong></p><p>{d.texto}</p>
              <form action={delDestaque}><input type="hidden" name="did" value={d.id} /><button className="claro" type="submit">Remover</button></form>
            </div>
          ))}
          <form action={addDestaque}>
            <label htmlFor="unidade">Unidade</label>
            <select id="unidade" name="unidade" defaultValue=""><option value="">Selecione</option>{(unidades ?? []).map((u: { id: string; nome: string }) => <option key={u.id} value={u.id}>{u.nome}</option>)}</select>
            <label htmlFor="dtitulo">Título do destaque</label><input id="dtitulo" name="dtitulo" required />
            <label htmlFor="dtexto">O que foi feito</label><textarea id="dtexto" name="dtexto" required />
            <p><button className="claro" type="submit">Adicionar destaque</button></p>
          </form>
        </div>
        <aside className="lateral">
          <h3>Publicar</h3>
          <form action={teste}><button className="claro" type="submit">Enviar teste para mim</button></form>
          <form action={publicar} style={{ marginTop: '.6rem' }}><input type="hidden" name="email" value="1" /><button type="submit">Publicar e enviar por e-mail</button></form>
          <form action={publicar} style={{ marginTop: '.6rem' }}><input type="hidden" name="email" value="0" /><button className="claro" type="submit">Publicar só na plataforma</button></form>
          <form action={agendar} style={{ marginTop: '1rem' }}>
            <label htmlFor="quando">Agendar para o dia</label><input id="quando" name="quando" type="date" defaultValue={n.agendada_para ? String(n.agendada_para).slice(0, 10) : ''} />
            <p><button className="claro" type="submit">Agendar envio</button></p>
          </form>
          {n.status !== 'rascunho' && <form action={rascunho}><button className="claro" type="submit">Voltar para rascunho</button></form>}
        </aside>
      </div>
    </main>
  );
}
