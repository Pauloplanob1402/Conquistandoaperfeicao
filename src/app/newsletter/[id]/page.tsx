import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { carregarDestaques, paragrafos } from '@/lib/newsletter';

export default async function Edicao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: n } = await supabase.from('newsletters').select('*').eq('id', id).single();
  if (!n) notFound();
  const destaques = await carregarDestaques(supabase, id);
  return (
    <main className="pagina">
      <p><Link href="/newsletter">Todas as edições</Link></p>
      {n.status !== 'enviada' && <p className="aviso">Prévia: esta edição ainda não foi publicada.</p>}
      <article style={{ maxWidth: '42rem' }}>
        <h1>{n.titulo}</h1>
        {paragrafos(n.corpo).map((p: string, i: number) => <p key={i} style={{ whiteSpace: 'pre-line' }}>{p}</p>)}
        {destaques.length > 0 && (
          <>
            <h2>Destaques das unidades</h2>
            {destaques.map((d, i) => (
              <div className="cartao" key={i} style={{ marginBottom: '.8rem', borderLeft: '4px solid var(--vermelho-vivo)' }}>
                <small>{d.unidade}</small><p><strong>{d.titulo}</strong></p><p>{d.texto}</p>
              </div>
            ))}
          </>
        )}
      </article>
    </main>
  );
}
