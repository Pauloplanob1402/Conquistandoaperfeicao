import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TEMAS } from '@/lib/temas';

export default async function Tema({ params, searchParams }: { params: Promise<{ tema: string }>; searchParams: Promise<{ q?: string }> }) {
  const { tema } = await params;
  const { q } = await searchParams;
  const t = TEMAS.find(x => x.slug === tema);
  if (!t) notFound();
  const supabase = await createClient();
  let query = supabase.from('respostas').select('id,pergunta').eq('tema', t.banco).order('id');
  if (q) query = query.ilike('pergunta', `%${q}%`);
  const { data } = await query;
  const lista = (data ?? []) as { id: string; pergunta: string }[];
  return (
    <main className="pagina">
      <p><Link href="/conhecimento">Todos os temas</Link></p>
      <h1 style={{ color: t.cor }}>{t.nome}</h1>
      <p style={{ color: 'var(--cinza)', maxWidth: '42rem' }}>{t.texto}</p>
      <form method="get" className="filtros">
        <div><label htmlFor="q">Buscar neste tema</label><input id="q" name="q" defaultValue={q ?? ''} /></div>
        <button type="submit">Buscar</button>
      </form>
      {lista.length === 0 ? <p className="aviso">Nenhuma situação encontrada. Tente outra palavra.</p> : (
        <ul className="lista">
          {lista.map(r => <li key={r.id}><Link href={`/conversa?q=${encodeURIComponent(r.pergunta)}&r=${r.id}`}>{r.pergunta}</Link></li>)}
        </ul>
      )}
    </main>
  );
}
