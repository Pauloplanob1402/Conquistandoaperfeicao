import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type Ed = { id: string; titulo: string; resumo: string | null; enviada_em: string | null };

export default async function Newsletter() {
  const supabase = await createClient();
  const { data } = await supabase.from('newsletters').select('id,titulo,resumo,enviada_em').eq('status', 'enviada').order('enviada_em', { ascending: false });
  const lista = (data ?? []) as Ed[];
  return (
    <main className="pagina">
      <h1>Newsletter</h1>
      <p style={{ color: 'var(--cinza)', maxWidth: '42rem' }}>Boas práticas, reflexões e destaques das unidades.</p>
      {lista.length === 0 ? <p className="aviso">Ainda não há edições publicadas.</p> : (
        <ul className="lista">
          {lista.map(e => (
            <li key={e.id}><Link href={`/newsletter/${e.id}`}>
              <small>{e.enviada_em ? new Date(e.enviada_em).toLocaleDateString('pt-BR') : ''}</small><br /><strong>{e.titulo}</strong>{e.resumo && <><br />{e.resumo}</>}
            </Link></li>
          ))}
        </ul>
      )}
    </main>
  );
}
