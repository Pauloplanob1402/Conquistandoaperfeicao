import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';
import { Frase } from '@/components/Frase';

const BENEFICIOS = [
  { titulo: 'Para as pessoas', texto: 'Quem aprende mais cresce por inteiro: ganha voz, responsabilidade e novas portas. Há quem tenha entrado como auxiliar de escritório e hoje seja gerente regional de vendas.' },
  { titulo: 'Para a empresa', texto: 'Gente bem formada erra menos e entrega mais. Cada setor com o seu objetivo, todos na mesma direção, com unidade de ação.' },
  { titulo: 'Para a continuidade do negócio', texto: 'Quanto mais gente se forma, mais gente aprende a fazer. O saber não fica com um só: hoje você é aluno, amanhã é professor.' },
  { titulo: 'Para a arte de servir o cliente', texto: 'Uma equipe alinhada, que busca superar suas metas e cuidar da qualidade, leva ao cliente um atendimento excepcional.' },
];

const PILARES = [
  { nome: 'Ser', lema: 'Fidelidade ao projeto da empresa', dia: 'Conheça a cultura e os valores que orientam a liderança.', onde: 'Conhecimento' },
  { nome: 'Saber', lema: 'Inteligência, estratégia e estudo', dia: 'Leve uma situação real do seu dia e receba uma orientação prática.', onde: 'Conversa de liderança' },
  { nome: 'Fazer', lema: 'Ação e trabalho de verdade', dia: 'Pratique as ações do mês, registre o que deu certo e leve ao encontro do Conquistando a Perfeição.', onde: 'Conquistando a Perfeição · Minha jornada' },
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
        <h2>O que o Conquistando constrói</h2>
        <p style={{ color: 'var(--cinza)', maxWidth: '40rem' }}>Desde 2009, formar pessoas dentro da própria empresa dá frutos em quatro lugares.</p>
        <div className="grade">
          {BENEFICIOS.map(b => (
            <section className="area" key={b.titulo}>
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </section>
          ))}
        </div>
        <Frase compacta texto="“[…] buscar a perfeição continuamente, em cada ação […]”" />
      </section>

      <section>
        <h2>Ser, saber e fazer: o ciclo do dia a dia</h2>
        <p style={{ color: 'var(--cinza)', maxWidth: '40rem' }}>Três pilares sustentam o crescimento de todos. É isso que a plataforma coloca na sua rotina.</p>
        <ol className="pilares">
          {PILARES.map(p => (
            <li key={p.nome}>
              <h3>{p.nome}</h3>
              <p className="lema">{p.lema}</p>
              <p>{p.dia}</p>
              <p className="onde">Na plataforma: {p.onde}</p>
            </li>
          ))}
        </ol>
        <p style={{ maxWidth: '40rem' }}>O que você faz vira apresentação no encontro do mês e volta para o ser e o saber. O ciclo não termina.</p>
        <div className="botoes">
          <Link className="botao" href="/login">Entrar</Link>
          <Link className="botao claro" href="/cadastro">Criar acesso</Link>
        </div>
      </section>
    </main>
  );
}
