import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';
import { Frase } from '@/components/Frase';

const CICLO = [
  { nome: 'Conhecer', texto: 'Conhecimento e conversa', cor: '#c9962b' },
  { nome: 'Refletir', texto: 'Situações reais', cor: '#6b3fa0' },
  { nome: 'Praticar', texto: 'Práticas do mês', cor: '#1e8e5a' },
  { nome: 'Acompanhar', texto: 'Minha jornada', cor: '#2a9bd6' },
  { nome: 'Reconhecer', texto: 'Destaques das unidades', cor: '#e8730c' },
  { nome: 'Compartilhar', texto: 'Newsletter', cor: '#a3162b' },
  { nome: 'Desenvolver', texto: 'Evolução contínua', cor: '#3c5a6e' },
];

export default async function Home() {
  const { user } = await getPerfil();
  if (user) redirect('/inicio');
  return (
    <main className="pagina">
      <section className="hero">
        <p className="kicker">Calçados Beira Rio · Conquistando a Perfeição</p>
        <h1>A excelência não acontece por acaso. Ela é construída diariamente.</h1>
        <p style={{ maxWidth: '40rem', fontSize: '1.15rem', color: 'var(--cinza)' }}>
          Uma ferramenta para transformar liderança, responsabilidade e excelência em prática, em todo o ecossistema Beira Rio.
        </p>
        <div className="botoes">
          <Link className="botao" href="/login">Entrar na plataforma</Link>
          <Link className="botao claro" href="/cadastro">Criar acesso</Link>
        </div>
      </section>

      <Frase />

      <section className="historia">
        <h2>Como nasceu o Conquistando a Perfeição</h2>
        <p>Em 23 de maio de 2009, o fundador e presidente da Calçados Beira Rio, Roberto Argenta, lançou o primeiro Conquistando a Perfeição, na filial 12, em Roca Sales (RS). Um jardim e uma placa, com uma sibipiruna, lembram aquele dia.</p>
        <p>Desde então, o programa virou rotina nas unidades e setores. Todos os meses, colaboradores apresentam ações bem-sucedidas, analisam as experiências com os colegas e apontam melhorias para o futuro. Todos são alunos e professores.</p>
      </section>

      <Frase texto="“A fé sem obras é morta. Achei que deveria me empenhar em fazer coisas, gerar emprego e bem-estar.”" />

      <section>
        <h2>Um ciclo, não um site</h2>
        <p style={{ color: 'var(--cinza)', maxWidth: '40rem' }}>Esta plataforma leva essa rotina para o dia a dia da liderança. O ciclo nunca termina: depois de desenvolver, volta-se a conhecer.</p>
        <ol className="ciclo">
          {CICLO.map(c => <li key={c.nome} style={{ ['--cor' as string]: c.cor }}><strong>{c.nome}</strong><small>{c.texto}</small></li>)}
        </ol>
        <div className="botoes">
          <Link className="botao" href="/login">Entrar na plataforma</Link>
        </div>
      </section>
    </main>
  );
}
