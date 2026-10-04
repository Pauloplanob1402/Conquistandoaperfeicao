import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Resumo() {
  const supabase = await createClient();
  const { data } = await supabase.from('respostas').select('tema,status');
  const linhas = (data ?? []) as { tema: string; status: string }[];
  const temas = [...new Set(linhas.map(l => l.tema))];
  const conta = (t: string, s: string) => linhas.filter(l => l.tema === t && l.status === s).length;
  return (
    <main className="pagina">
      <h1>Resumo do conteúdo</h1>
      {temas.length === 0 ? (
        <p className="aviso">Nenhuma resposta cadastrada. Rode <code>npm run importar</code> para carregar as 200 respostas.</p>
      ) : (
        <div className="rolagem"><table>
          <thead><tr><th>Tema</th><th>Rascunho</th><th>Em revisão</th><th>Aprovadas</th><th>Total</th></tr></thead>
          <tbody>
            {temas.map(t => (
              <tr key={t}><td><Link href={`/admin/respostas?tema=${encodeURIComponent(t)}`}>{t}</Link></td>
                <td>{conta(t, 'rascunho')}</td><td>{conta(t, 'em_revisao')}</td><td>{conta(t, 'aprovada')}</td>
                <td>{linhas.filter(l => l.tema === t).length}</td></tr>
            ))}
          </tbody>
        </table></div>
      )}
    </main>
  );
}
