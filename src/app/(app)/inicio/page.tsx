import Link from 'next/link';
import { getPerfil } from '@/lib/supabase/server';

const AREAS = [
  { nome: 'Conhecimento', texto: 'Situações por tema: cultura, ética, liderança e mais.', cor: '#c9962b', href: '/conhecimento' },
  { nome: 'Conversa de liderança', texto: 'Conte uma situação. Receba orientação prática.', cor: '#6b3fa0', href: '/conversa' },
  { nome: 'Conquistando a Perfeição', texto: 'Práticas do mês e sua ação para o encontro.', cor: '#1e8e5a', href: '/conquistando' },
  { nome: 'Minha jornada', texto: 'Seu progresso e sua evolução.', cor: '#2a9bd6', href: '/jornada' },
  { nome: 'Newsletter', texto: 'Boas práticas e destaques das unidades.', cor: '#e8730c', href: '/newsletter' },
];

export default async function Inicio() {
  const { perfil } = await getPerfil();
  const primeiro = (perfil?.nome ?? '').split(' ')[0];
  return (
    <main className="pagina">
      <h1>{primeiro ? `Olá, ${primeiro}.` : 'Olá.'}</h1>
      <p style={{ color: 'var(--cinza)' }}>Cultura que entra na rotina da liderança.</p>
      <div className="grade">
        {AREAS.map(a => (
          <Link className="area" key={a.nome} href={a.href} style={{ ['--cor' as string]: a.cor }}>
            <h3>{a.nome}</h3><p>{a.texto}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
