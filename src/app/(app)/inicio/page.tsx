import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getPerfil } from '@/lib/supabase/server';
import { periodoAtual, nomePeriodo } from '@/lib/periodo';
import estilos from './inicio.module.css';

const AREAS = [
  { nome: 'Conhecimento', texto: 'Situações por tema: cultura, ética, liderança e mais.', cor: '#c9962b', href: '/conhecimento' },
  { nome: 'Conversa de liderança', texto: 'Conte uma situação. Receba orientação prática.', cor: '#6b3fa0', href: '/conversa' },
  { nome: 'Conquistando a Perfeição', texto: 'Práticas do mês e sua ação para o encontro.', cor: '#1e8e5a', href: '/conquistando' },
  { nome: 'Minha jornada', texto: 'Seu progresso e sua evolução.', cor: '#2a9bd6', href: '/jornada' },
  { nome: 'Newsletter', texto: 'Boas práticas e destaques das unidades.', cor: '#e8730c', href: '/newsletter' },
];

async function concluir(fd: FormData) {
  'use server';
  const { supabase, user } = await getPerfil();
  if (!user) return;
  await supabase.from('tarefas_concluidas').upsert({ usuario_id: user.id, tarefa_id: String(fd.get('tarefa')) });
  revalidatePath('/inicio');
  revalidatePath('/conquistando');
  revalidatePath('/jornada');
}

type Tarefa = { id: string; pratica_id: string; texto: string; ordem: number };

export default async function Inicio() {
  const { supabase, user, perfil } = await getPerfil();
  const uid = user?.id ?? '';
  const primeiro = (perfil?.nome ?? '').split(' ')[0];
  const periodo = periodoAtual();

  const [conv, conc, acao, prat] = await Promise.all([
    supabase.from('conversas').select('criado_em', { count: 'exact' }).eq('usuario_id', uid).order('criado_em', { ascending: true }).limit(1),
    supabase.from('tarefas_concluidas').select('concluida_em', { count: 'exact' }).eq('usuario_id', uid).order('concluida_em', { ascending: true }).limit(1),
    supabase.from('acoes').select('criado_em', { count: 'exact' }).eq('usuario_id', uid).order('criado_em', { ascending: true }).limit(1),
    supabase.from('praticas').select('id,titulo').eq('periodo', periodo).eq('ativa', true).order('ordem'),
  ]);

  // Primeiros passos: calculados a partir do que a pessoa já fez (sem guardar nada novo)
  const passos = [
    { texto: 'Faça sua primeira pergunta', href: '/conversa', feito: (conv.count ?? 0) > 0 },
    { texto: 'Marque sua primeira tarefa', href: '/conquistando', feito: (conc.count ?? 0) > 0 },
    { texto: 'Registre sua primeira ação do mês', href: '/conquistando', feito: (acao.count ?? 0) > 0 },
  ];
  const feitos = passos.filter(p => p.feito).length;
  const datas = [
    (conv.data?.[0] as { criado_em?: string } | undefined)?.criado_em,
    (conc.data?.[0] as { concluida_em?: string } | undefined)?.concluida_em,
    (acao.data?.[0] as { criado_em?: string } | undefined)?.criado_em,
  ].filter(Boolean) as string[];
  const concluidoEm = feitos === 3 && datas.length === 3 ? Math.max(...datas.map(d => new Date(d).getTime())) : 0;
  const recemConcluido = concluidoEm > 0 && Date.now() - concluidoEm < 48 * 3600 * 1000;

  // Hoje: a próxima tarefa ainda não feita das práticas do mês
  const praticas = (prat.data ?? []) as { id: string; titulo: string }[];
  let proxima: { id: string; texto: string; pratica: string } | null = null;
  let total = 0;
  let feitas = 0;
  if (praticas.length > 0) {
    const [tt, cc] = await Promise.all([
      supabase.from('pratica_tarefas').select('id,pratica_id,texto,ordem').in('pratica_id', praticas.map(p => p.id)),
      supabase.from('tarefas_concluidas').select('tarefa_id').eq('usuario_id', uid),
    ]);
    const feitasSet = new Set(((cc.data ?? []) as { tarefa_id: string }[]).map(x => x.tarefa_id));
    const tarefas = (tt.data ?? []) as Tarefa[];
    total = tarefas.length;
    feitas = tarefas.filter(t => feitasSet.has(t.id)).length;
    for (const p of praticas) {
      const t = tarefas.filter(x => x.pratica_id === p.id).sort((a, b) => a.ordem - b.ordem).find(x => !feitasSet.has(x.id));
      if (t) { proxima = { id: t.id, texto: t.texto, pratica: p.titulo }; break; }
    }
  }

  return (
    <main className="pagina">
      <h1>{primeiro ? `Olá, ${primeiro}.` : 'Olá.'}</h1>
      <p style={{ color: 'var(--cinza)' }}>Cultura que entra na rotina da liderança.</p>

      {recemConcluido && <p className="aviso ok" style={{ maxWidth: '44rem' }}>Primeiros passos concluídos. Bom começo!</p>}

      {feitos < 3 && (
        <section className={estilos.passos} aria-label="Primeiros passos">
          <p className={estilos.rotulo}>PRIMEIROS PASSOS · {feitos} DE 3</p>
          <ol>
            {passos.map(p => (
              <li key={p.texto} className={p.feito ? estilos.feito : undefined}>
                <span className={estilos.marca} aria-hidden="true">{p.feito ? '✓' : '○'}</span>
                <Link href={p.href}>{p.texto}</Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {total > 0 && (
        <section className={estilos.hoje} aria-label="Hoje">
          <p className={estilos.rotulo}>HOJE</p>
          {proxima ? (
            <>
              <h2>{proxima.texto}</h2>
              <p>{proxima.pratica}</p>
              <div className={estilos.acoes}>
                <form action={concluir}>
                  <input type="hidden" name="tarefa" value={proxima.id} />
                  <button type="submit">Marcar como feita</button>
                </form>
                <Link className="botao claro" href="/conquistando">Ver práticas</Link>
              </div>
            </>
          ) : (
            <>
              <h2>Você concluiu as tarefas de {nomePeriodo(periodo)}.</h2>
              <div className={estilos.acoes}><Link className="botao" href="/conquistando">Registrar minha ação do mês</Link></div>
            </>
          )}
          <p><small>{feitas} de {total} tarefas em {nomePeriodo(periodo)}</small></p>
          <progress value={feitas} max={total} style={{ width: '100%', accentColor: 'var(--vermelho)' }} />
        </section>
      )}

      <div className="grade">
        {AREAS.map(a => (
          <Link className="area" key={a.nome} href={a.href} style={{ ['--cor' as string]: a.cor }}>
            <h3>{a.nome}</h3><p>{a.texto}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
