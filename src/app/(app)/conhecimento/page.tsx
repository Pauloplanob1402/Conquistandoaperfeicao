import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { TEMAS } from '@/lib/temas';

export default async function Conhecimento() {
  const supabase = await createClient();
  const { data } = await supabase.from('respostas').select('tema');
  const total = (t: string) => ((data ?? []) as { tema: string }[]).filter(d => d.tema === t).length;
  return (
    <main className="pagina">
      <h1>Conhecimento</h1>
      <p style={{ color: 'var(--cinza)', maxWidth: '42rem' }}>Escolha um tema e explore situações reais.</p>
      <div className="grade">
        {TEMAS.map(t => (
          <Link className="area" key={t.slug} href={`/conhecimento/${t.slug}`} style={{ ['--cor' as string]: t.cor }}>
            <h3>{t.nome}</h3><p>{t.texto}</p><p><small>{total(t.banco)} situações</small></p>
          </Link>
        ))}
      </div>
    </main>
  );
}
