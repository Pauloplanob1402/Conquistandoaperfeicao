import Link from 'next/link';
import { getPerfil } from '@/lib/supabase/server';
import { periodoAtual, nomePeriodo } from '@/lib/periodo';

const mes = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);

function ultimosMeses(n: number): string[] {
  const [y, m] = periodoAtual().split('-').map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1)).toISOString().slice(0, 7));
}

export default async function Jornada() {
  const { supabase, user, perfil } = await getPerfil();
  const uid = user?.id ?? '';
  const periodo = periodoAtual();

  const { data: pr } = await supabase.from('praticas').select('id,titulo').eq('periodo', periodo).eq('ativa', true).order('ordem');
  const praticas = (pr ?? []) as { id: string; titulo: string }[];
  const { data: ts } = praticas.length ? await supabase.from('pratica_tarefas').select('id,pratica_id').in('pratica_id', praticas.map(p => p.id)) : { data: [] };
  const tarefas = (ts ?? []) as { id: string; pratica_id: string }[];
  const { data: cc } = await supabase.from('tarefas_concluidas').select('tarefa_id,concluida_em').eq('usuario_id', uid);
  const concl = (cc ?? []) as { tarefa_id: string; concluida_em: string }[];
  const feitas = new Set(concl.map(c => c.tarefa_id));
  const doMes = tarefas.filter(t => feitas.has(t.id)).length;

  const { data: ac } = await supabase.from('acessos').select('resposta_id,ultimo_acesso').eq('usuario_id', uid).order('ultimo_acesso', { ascending: false }).limit(8);
  const acessos = (ac ?? []) as { resposta_id: string; ultimo_acesso: string }[];
  const { data: rs } = acessos.length ? await supabase.from('respostas').select('id,pergunta').in('id', acessos.map(a => a.resposta_id)) : { data: [] };
  const titulo = new Map(((rs ?? []) as { id: string; pergunta: string }[]).map(r => [r.id, r.pergunta]));

  const { data: ao } = await supabase.from('acoes').select('id,periodo,o_que_fiz,aprendizado,criado_em').eq('usuario_id', uid).order('criado_em', { ascending: false }).limit(200);
  const acoes = (ao ?? []) as { id: string; periodo: string; o_que_fiz: string; aprendizado: string | null; criado_em: string }[];
  const { data: cv } = await supabase.from('conversas').select('criado_em').eq('usuario_id', uid).limit(1000);
  const conversas = (cv ?? []) as { criado_em: string }[];

  const meses = ultimosMeses(6);
  const serie = meses.map(m => ({ m, tarefas: concl.filter(c => mes(c.concluida_em) === m).length, acoes: acoes.filter(a => mes(a.criado_em) === m).length, conversas: conversas.filter(c => mes(c.criado_em) === m).length }));
  const maximo = Math.max(1, ...serie.flatMap(s => [s.tarefas, s.acoes, s.conversas]));

  return (
    <main className="pagina">
      <h1>{perfil?.nome ? `A jornada de ${perfil.nome.split(' ')[0]}` : 'Minha jornada'}</h1>
      <p style={{ color: 'var(--cinza)', maxWidth: '42rem' }}>Seu progresso e sua evolução.</p>

      <section style={{ maxWidth: '42rem' }}>
        <h2>Progresso de {nomePeriodo(periodo)}</h2>
        {tarefas.length === 0 ? <p>As práticas deste mês ainda não foram publicadas.</p> : (
          <>
            <p><strong>{doMes} de {tarefas.length} tarefas concluídas</strong><br /><progress value={doMes} max={tarefas.length} style={{ width: '100%', accentColor: 'var(--vermelho)' }} /></p>
            <ul>{praticas.map(p => { const t = tarefas.filter(x => x.pratica_id === p.id); const n = t.filter(x => feitas.has(x.id)).length; return <li key={p.id}>{p.titulo}: {n} de {t.length}</li>; })}</ul>
          </>
        )}
        <p><Link className="botao claro" href="/conquistando">Ir para as práticas</Link></p>
      </section>

      <section style={{ maxWidth: '42rem' }}>
        <h2>Evolução nos últimos 6 meses</h2>
        <div className="barras">
          {serie.map(s => (
            <div key={s.m} className="barra-linha">
              <span>{nomePeriodo(s.m).split(' de ')[0].slice(0, 3)}</span>
              <div>
                <i style={{ width: `${(s.tarefas / maximo) * 100}%`, background: '#1e8e5a' }} /><i style={{ width: `${(s.acoes / maximo) * 100}%`, background: '#a3162b' }} /><i style={{ width: `${(s.conversas / maximo) * 100}%`, background: '#6b3fa0' }} />
              </div>
              <small>{s.tarefas} · {s.acoes} · {s.conversas}</small>
            </div>
          ))}
        </div>
        <p><small><span style={{ color: '#1e8e5a' }}>■</span> tarefas concluídas · <span style={{ color: '#a3162b' }}>■</span> ações registradas · <span style={{ color: '#6b3fa0' }}>■</span> conversas</small></p>
      </section>

      <section style={{ maxWidth: '42rem' }}>
        <h2>Conteúdos acessados</h2>
        {acessos.length === 0 ? <p>Você ainda não abriu nenhuma orientação.</p> : (
          <ul className="lista">{acessos.map(a => <li key={a.resposta_id}><Link href={`/conversa?q=${encodeURIComponent(titulo.get(a.resposta_id) ?? '')}&r=${a.resposta_id}`}>{titulo.get(a.resposta_id) ?? a.resposta_id}</Link></li>)}</ul>
        )}
      </section>

      <section style={{ maxWidth: '42rem' }}>
        <h2>Reflexões e ações</h2>
        {acoes.length === 0 ? <p>Registre sua primeira ação em Conquistando a Perfeição.</p> : (
          <ul className="lista">{acoes.slice(0, 5).map(a => <li key={a.id}><div className="cartao"><small>{nomePeriodo(a.periodo)}</small><p><strong>{a.o_que_fiz}</strong></p>{a.aprendizado && <p>Aprendizado: {a.aprendizado}</p>}</div></li>)}</ul>
        )}
      </section>
    </main>
  );
}
