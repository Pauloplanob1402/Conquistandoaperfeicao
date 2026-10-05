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
      <section className="hero grande">
        <p className="kicker">Calçados Beira Rio · Conquistando a Perfeição</p>
        <h1 className="destaque">Dia a dia na <span>fronteira da perfeição</span></h1>
        <div className="botoes">
          <Link className="botao" href="/login">Entrar</Link>
          <Link className="botao claro" href="/cadastro">Criar acesso</Link>
        </div>
      </section>

      <Frase />

      <section className="historia">
        <h2>Como nasceu</h2>
        <p>Em 23 de maio de 2009, o fundador e presidente da Calçados Beira Rio, Sr. Roberto Argenta, lançou o primeiro Conquistando a Perfeição, na filial 12, em Roca Sales (RS).</p>
        <p>Hoje é rotina em todas as unidades e setores. Todo mês, as pessoas apresentam o que deu certo, analisam com os colegas e apontam melhorias. Todos são alunos e professores.</p>
      </section>

      <Frase texto="“A fé sem obras é morta. Achei que deveria me empenhar em fazer coisas, gerar emprego e bem-estar.”" />

      <section>
        <h2>Um ciclo, não um site</h2>
        <p style={{ color: 'var(--cinza)', maxWidth: '40rem' }}>Esta plataforma leva essa rotina ao dia a dia da liderança. O ciclo não termina: depois de desenvolver, volta a conhecer.</p>
        <ol className="ciclo">
          {CICLO.map(c => <li key={c.nome} style={{ ['--cor' as string]: c.cor }}><strong>{c.nome}</strong><small>{c.texto}</small></li>)}
        </ol>
        <div className="botoes">
          <Link className="botao" href="/login">Entrar</Link>
        </div>
      </section>
    </main>
  );
}
