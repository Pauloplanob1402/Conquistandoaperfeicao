import { revalidatePath } from 'next/cache';
import { getPerfil } from '@/lib/supabase/server';
import { periodoAtual, nomePeriodo } from '@/lib/periodo';

async function alternar(fd: FormData) {
  'use server';
  const { supabase, user } = await getPerfil();
  if (!user) return;
  const tarefa = String(fd.get('tarefa'));
  if (fd.get('feito') === '1') await supabase.from('tarefas_concluidas').delete().eq('usuario_id', user.id).eq('tarefa_id', tarefa);
  else await supabase.from('tarefas_concluidas').upsert({ usuario_id: user.id, tarefa_id: tarefa });
  revalidatePath('/conquistando');
}

async function registrar(fd: FormData) {
  'use server';
  const { supabase, user } = await getPerfil();
  const fiz = String(fd.get('o_que_fiz') ?? '').trim();
  if (!user || fiz.length < 5) return;
  const campo = (n: string) => String(fd.get(n) ?? '').trim().slice(0, 1000) || null;
  await supabase.from('acoes').insert({ usuario_id: user.id, periodo: periodoAtual(), o_que_fiz: fiz.slice(0, 1000), resultado: campo('resultado'), aprendizado: campo('aprendizado'), melhoria: campo('melhoria') });
  revalidatePath('/conquistando');
}

type Pratica = { id: string; titulo: string; descricao: string | null };
type Tarefa = { id: string; pratica_id: string; texto: string };
type Acao = { id: string; periodo: string; o_que_fiz: string; resultado: string | null; aprendizado: string | null; melhoria: string | null };

export default async function Conquistando() {
  const { supabase, user } = await getPerfil();
  const periodo = periodoAtual();
  const { data: p } = await supabase.from('praticas').select('id,titulo,descricao').eq('periodo', periodo).eq('ativa', true).order('ordem');
  const praticas = (p ?? []) as Pratica[];
  const ids = praticas.map(x => x.id);
  const { data: t } = ids.length ? await supabase.from('pratica_tarefas').select('id,pratica_id,texto').in('pratica_id', ids).order('ordem') : { data: [] };
  const tarefas = (t ?? []) as Tarefa[];
  const { data: c } = await supabase.from('tarefas_concluidas').select('tarefa_id').eq('usuario_id', user?.id ?? '');
  const feitas = new Set(((c ?? []) as { tarefa_id: string }[]).map(x => x.tarefa_id));
  const { data: a } = await supabase.from('acoes').select('*').eq('usuario_id', user?.id ?? '').order('criado_em', { ascending: false }).limit(10);
  const acoes = (a ?? []) as Acao[];
  const total = tarefas.length, concluidas = tarefas.filter(x => feitas.has(x.id)).length;

  return (
    <main className="pagina">
      <h1>Conquistando a Perfeição</h1>
      <p style={{ color: 'var(--cinza)', maxWidth: '42rem' }}>Práticas de {nomePeriodo(periodo)}. Pratique, registre o que deu certo e leve para o encontro mensal.</p>
      {total > 0 && (
        <p><strong>{concluidas} de {total} tarefas concluídas</strong><br /><progress value={concluidas} max={total} style={{ width: '100%', maxWidth: '42rem', accentColor: 'var(--vermelho)' }} /></p>
      )}
      {praticas.length === 0 && <p className="aviso">As práticas deste mês ainda não foram publicadas.</p>}
      <div className="grade">
        {praticas.map(pr => {
          const ts = tarefas.filter(x => x.pratica_id === pr.id);
          const n = ts.filter(x => feitas.has(x.id)).length;
          return (
            <section className="area" key={pr.id} style={{ ['--cor' as string]: '#1e8e5a' }}>
              <h3>{pr.titulo}</h3>
              {pr.descricao && <p>{pr.descricao}</p>}
              <p><small>{n} de {ts.length}</small></p>
              {ts.map(x => (
                <form action={alternar} key={x.id}>
                  <input type="hidden" name="tarefa" value={x.id} /><input type="hidden" name="feito" value={feitas.has(x.id) ? '1' : '0'} />
                  <button type="submit" className={`tarefa${feitas.has(x.id) ? ' feita' : ''}`} aria-pressed={feitas.has(x.id)}>
                    <span aria-hidden="true">{feitas.has(x.id) ? '✓' : '○'}</span><span>{x.texto}</span>
                  </button>
                </form>
              ))}
            </section>
          );
        })}
      </div>

      <section style={{ maxWidth: '42rem', marginTop: '2.5rem' }}>
        <h2>Minha ação para o encontro mensal</h2>
        <p style={{ color: 'var(--cinza)' }}>Registre uma ação bem-sucedida, o que aprendeu e uma melhoria para o próximo período.</p>
        <form action={registrar}>
          <label htmlFor="o_que_fiz">O que eu fiz</label><textarea id="o_que_fiz" name="o_que_fiz" maxLength={1000} required />
          <label htmlFor="resultado">Qual foi o resultado</label><textarea id="resultado" name="resultado" maxLength={1000} />
          <label htmlFor="aprendizado">O que aprendi</label><textarea id="aprendizado" name="aprendizado" maxLength={1000} />
          <label htmlFor="melhoria">Melhoria para o próximo período</label><textarea id="melhoria" name="melhoria" maxLength={1000} />
          <p><button type="submit">Registrar ação</button></p>
        </form>
        {acoes.length > 0 && (
          <>
            <h3>Minhas ações registradas</h3>
            <ul className="lista">
              {acoes.map(x => (
                <li key={x.id}><div className="cartao"><small>{nomePeriodo(x.periodo)}</small><p><strong>{x.o_que_fiz}</strong></p>
                  {x.resultado && <p>Resultado: {x.resultado}</p>}{x.aprendizado && <p>Aprendizado: {x.aprendizado}</p>}{x.melhoria && <p>Melhoria: {x.melhoria}</p>}</div></li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
