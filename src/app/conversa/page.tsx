import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';
import { buscar, LIMITE_MINIMO, type Resposta } from '@/lib/matcher';

async function perguntar(fd: FormData) {
  'use server';
  const texto = String(fd.get('pergunta') ?? '').trim().slice(0, 500);
  if (texto.length < 8) redirect('/conversa?curta=1');
  const { supabase, user } = await getPerfil();
  const { data } = await supabase.from('respostas').select('*');
  if (!data || data.length === 0) redirect(`/conversa?q=${encodeURIComponent(texto)}&vazio=1`);
  const [melhor] = buscar(texto, (data ?? []) as Resposta[], 1);
  const achou = melhor && melhor.pontos >= LIMITE_MINIMO;
  await supabase.from('conversas').insert({ usuario_id: user?.id, pergunta: texto, resposta_id: achou ? melhor.resposta.id : null, pontuacao: melhor?.pontos ?? 0 });
  redirect(`/conversa?q=${encodeURIComponent(texto)}${achou ? `&r=${melhor.resposta.id}` : '&sem=1'}`);
}

export default async function Conversa({ searchParams }: { searchParams: Promise<{ q?: string; r?: string; sem?: string; curta?: string; vazio?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getPerfil();
  let atual: Resposta | null = null;
  let parecidas: Resposta[] = [];
  if (sp.r) {
    const { data } = await supabase.from('respostas').select('*');
    const base = (data ?? []) as Resposta[];
    atual = base.find(b => b.id === sp.r) ?? null;
    parecidas = buscar(sp.q ?? '', base.filter(b => b.id !== sp.r), 3).filter(a => a.pontos >= LIMITE_MINIMO).map(a => a.resposta);
  }
  return (
    <main className="pagina">
      <h1>Conversa de liderança</h1>
      <p style={{ color: 'var(--cinza)', maxWidth: '42rem' }}>Descreva uma situação real do seu dia a dia. Você recebe uma reflexão e uma orientação prática.</p>
      <form action={perguntar} style={{ maxWidth: '42rem' }}>
        <label htmlFor="pergunta">Qual é a situação?</label>
        <textarea id="pergunta" name="pergunta" maxLength={500} defaultValue={sp.q ?? ''} placeholder="Ex.: Minha equipe resiste às mudanças. Como posso conduzir isso?" required />
        {sp.curta && <p className="aviso">Conte um pouco mais sobre a situação, com pelo menos uma frase.</p>}
        <p><button type="submit">Receber orientação</button></p>
      </form>
      {sp.vazio && (
        <p className="aviso" style={{ maxWidth: '42rem' }}>Ainda não há orientações liberadas. Quem administra a plataforma precisa aprovar as respostas em Administração &gt; Respostas.</p>
      )}
      {sp.sem && (
        <p className="aviso" style={{ maxWidth: '42rem' }}>Ainda não temos uma orientação para essa situação. Tente descrevê-la com outras palavras. Sua pergunta foi registrada para ampliarmos o conteúdo.</p>
      )}
      {atual && (
        <section style={{ maxWidth: '42rem', marginTop: '2rem' }}>
          <h2>{atual.pergunta}</h2>
          <h3>Reflexão</h3><p>{atual.reflexao}</p>
          <h3>Orientação prática</h3><p>{atual.orientacao}</p>
          {atual.relacionados && <p><small style={{ color: 'var(--cinza)' }}>Para aprofundar: {atual.relacionados.split(';').map(s => s.trim()).join(' · ')}</small></p>}
          {parecidas.length > 0 && (
            <>
              <h3>Situações parecidas</h3>
              <ul>{parecidas.map(p => <li key={p.id}><Link href={`/conversa?q=${encodeURIComponent(p.pergunta)}&r=${p.id}`}>{p.pergunta}</Link></li>)}</ul>
            </>
          )}
        </section>
      )}
    </main>
  );
}
