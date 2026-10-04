import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type Linha = { id: string; tema: string; camada: string; pergunta: string; status: string };

export default async function Respostas({ searchParams }: { searchParams: Promise<{ tema?: string; status?: string; q?: string; salvo?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('respostas').select('id,tema,camada,pergunta,status').order('id');
  if (sp.tema) query = query.eq('tema', sp.tema);
  if (sp.status) query = query.eq('status', sp.status);
  if (sp.q) query = query.ilike('pergunta', `%${sp.q}%`);
  const { data } = await query;
  const { data: todos } = await supabase.from('respostas').select('tema');
  const temas = [...new Set(((todos ?? []) as { tema: string }[]).map(t => t.tema))];
  const linhas = (data ?? []) as Linha[];
  return (
    <main className="pagina">
      <h1>Respostas</h1>
      {sp.salvo && <p className="aviso ok">Resposta {sp.salvo} salva.</p>}
      <form className="filtros" method="get">
        <div><label htmlFor="q">Buscar na pergunta</label><input id="q" name="q" defaultValue={sp.q ?? ''} /></div>
        <div><label htmlFor="tema">Tema</label>
          <select id="tema" name="tema" defaultValue={sp.tema ?? ''}><option value="">Todos</option>{temas.map(t => <option key={t}>{t}</option>)}</select></div>
        <div><label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ''}>
            <option value="">Todos</option><option value="rascunho">Rascunho</option><option value="em_revisao">Em revisão</option><option value="aprovada">Aprovada</option>
          </select></div>
        <button type="submit">Filtrar</button>
      </form>
      <p>{linhas.length} respostas</p>
      <table>
        <thead><tr><th>Id</th><th>Pergunta</th><th>Tema</th><th>Camada</th><th>Status</th></tr></thead>
        <tbody>
          {linhas.map(l => (
            <tr key={l.id}><td><Link href={`/admin/respostas/${l.id}`}>{l.id}</Link></td><td>{l.pergunta}</td><td>{l.tema}</td><td>{l.camada}</td>
              <td><span className={`selo ${l.status}`}>{l.status.replace('_', ' ')}</span></td></tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
