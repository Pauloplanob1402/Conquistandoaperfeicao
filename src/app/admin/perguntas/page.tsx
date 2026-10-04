import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type Linha = { id: number; pergunta: string; resposta_id: string | null; pontuacao: number | null; criado_em: string };

export default async function Perguntas({ searchParams }: { searchParams: Promise<{ todas?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase.from('conversas').select('id,pergunta,resposta_id,pontuacao,criado_em').order('criado_em', { ascending: false }).limit(200);
  if (!sp.todas) query = query.is('resposta_id', null);
  const { data } = await query;
  const linhas = (data ?? []) as Linha[];
  return (
    <main className="pagina">
      <h1>Perguntas dos usuários</h1>
      <p>{sp.todas ? <Link href="/admin/perguntas">Ver só as sem resposta</Link> : <Link href="/admin/perguntas?todas=1">Ver todas</Link>}</p>
      <p style={{ color: 'var(--cinza)' }}>As perguntas sem resposta mostram onde falta conteúdo. Crie ou ajuste uma resposta e acrescente as palavras que a pessoa usou.</p>
      {linhas.length === 0 ? <p className="aviso ok">Nenhuma pergunta para mostrar.</p> : (
        <div className="rolagem"><table>
          <thead><tr><th>Data</th><th>Pergunta</th><th>Resposta sugerida</th><th>Pontos</th></tr></thead>
          <tbody>{linhas.map(l => (
            <tr key={l.id}><td>{new Date(l.criado_em).toLocaleString('pt-BR')}</td><td>{l.pergunta}</td>
              <td>{l.resposta_id ? <Link href={`/admin/respostas/${l.resposta_id}`}>{l.resposta_id}</Link> : 'nenhuma'}</td><td>{l.pontuacao ?? 0}</td></tr>
          ))}</tbody>
        </table></div>
      )}
    </main>
  );
}
