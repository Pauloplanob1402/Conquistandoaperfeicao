import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';
import { periodoAtual, periodoAnterior, nomePeriodo } from '@/lib/periodo';

const voltar = (p: string, ok?: string) => redirect(`/admin/praticas?periodo=${p}${ok ? `&ok=${ok}` : ''}`);

async function criar(fd: FormData) {
  'use server';
  const { supabase } = await getPerfil();
  const periodo = String(fd.get('periodo'));
  const titulo = String(fd.get('titulo') ?? '').trim();
  const linhas = String(fd.get('tarefas') ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  if (!titulo || linhas.length === 0) voltar(periodo, 'falta');
  const { data: nova } = await supabase.from('praticas').insert({ periodo, titulo, descricao: String(fd.get('descricao') ?? '').trim() || null }).select('id').single();
  if (nova) await supabase.from('pratica_tarefas').insert(linhas.map((texto, i) => ({ pratica_id: nova.id, texto, ordem: i + 1 })));
  voltar(periodo, 'criada');
}

async function alternarAtiva(fd: FormData) {
  'use server';
  const { supabase } = await getPerfil();
  await supabase.from('praticas').update({ ativa: fd.get('ativa') !== '1' }).eq('id', String(fd.get('id')));
  voltar(String(fd.get('periodo')));
}

async function excluir(fd: FormData) {
  'use server';
  const { supabase } = await getPerfil();
  await supabase.from('praticas').delete().eq('id', String(fd.get('id')));
  voltar(String(fd.get('periodo')), 'excluida');
}

async function copiar(fd: FormData) {
  'use server';
  const { supabase } = await getPerfil();
  const periodo = String(fd.get('periodo'));
  const { data: antigas } = await supabase.from('praticas').select('*').eq('periodo', periodoAnterior(periodo)).order('ordem');
  for (const a of (antigas ?? []) as { id: string; titulo: string; descricao: string | null; ordem: number }[]) {
    const { data: nova } = await supabase.from('praticas').insert({ periodo, titulo: a.titulo, descricao: a.descricao, ordem: a.ordem }).select('id').single();
    const { data: ts } = await supabase.from('pratica_tarefas').select('texto,ordem').eq('pratica_id', a.id);
    if (nova && ts?.length) await supabase.from('pratica_tarefas').insert(ts.map((t: { texto: string; ordem: number }) => ({ pratica_id: nova.id, texto: t.texto, ordem: t.ordem })));
  }
  voltar(periodo, 'copiada');
}

type Pratica = { id: string; titulo: string; descricao: string | null; ativa: boolean };

export default async function AdminPraticas({ searchParams }: { searchParams: Promise<{ periodo?: string; ok?: string }> }) {
  const sp = await searchParams;
  const periodo = /^\d{4}-\d{2}$/.test(sp.periodo ?? '') ? sp.periodo! : periodoAtual();
  const { supabase } = await getPerfil();
  const { data } = await supabase.from('praticas').select('id,titulo,descricao,ativa').eq('periodo', periodo).order('ordem');
  const lista = (data ?? []) as Pratica[];
  const { data: t } = lista.length ? await supabase.from('pratica_tarefas').select('pratica_id,texto').in('pratica_id', lista.map(l => l.id)).order('ordem') : { data: [] };
  const tarefas = (t ?? []) as { pratica_id: string; texto: string }[];
  const msg: Record<string, string> = { criada: 'Prática criada.', excluida: 'Prática excluída.', copiada: 'Práticas copiadas do mês anterior.', falta: 'Informe o título e ao menos uma tarefa.' };
  return (
    <main className="pagina">
      <h1>Práticas · {nomePeriodo(periodo)}</h1>
      {sp.ok && <p className={`aviso${sp.ok === 'falta' ? '' : ' ok'}`}>{msg[sp.ok]}</p>}
      <form method="get" className="filtros">
        <div><label htmlFor="periodo">Período</label><input id="periodo" name="periodo" type="month" defaultValue={periodo} /></div>
        <button type="submit">Abrir</button>
      </form>
      {lista.length === 0 && (
        <form action={copiar}><input type="hidden" name="periodo" value={periodo} />
          <p><button className="claro" type="submit">Copiar as práticas de {nomePeriodo(periodoAnterior(periodo))}</button></p></form>
      )}
      <div className="grade">
        {lista.map(p => (
          <section className="area" key={p.id}>
            <h3>{p.titulo} {!p.ativa && <span className="selo">oculta</span>}</h3>
            {p.descricao && <p>{p.descricao}</p>}
            <ul>{tarefas.filter(x => x.pratica_id === p.id).map(x => <li key={x.texto}>{x.texto}</li>)}</ul>
            <form action={alternarAtiva} style={{ display: 'inline' }}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="periodo" value={periodo} /><input type="hidden" name="ativa" value={p.ativa ? '1' : '0'} />
              <button className="claro" type="submit">{p.ativa ? 'Ocultar' : 'Publicar'}</button></form>{' '}
            <form action={excluir} style={{ display: 'inline' }}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="periodo" value={periodo} /><button className="claro" type="submit">Excluir</button></form>
          </section>
        ))}
      </div>
      <h2 style={{ marginTop: '2rem' }}>Nova prática</h2>
      <form action={criar} style={{ maxWidth: 560 }}>
        <input type="hidden" name="periodo" value={periodo} />
        <label htmlFor="titulo">Título</label><input id="titulo" name="titulo" required />
        <label htmlFor="descricao">Descrição (opcional)</label><input id="descricao" name="descricao" />
        <label htmlFor="tarefas">Tarefas (uma por linha)</label><textarea id="tarefas" name="tarefas" required />
        <p><button type="submit">Criar prática</button></p>
      </form>
    </main>
  );
}
