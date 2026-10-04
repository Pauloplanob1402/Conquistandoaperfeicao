import Link from 'next/link';
import { getPerfil } from '@/lib/supabase/server';

const AREAS = [
  { nome: 'Conversa de liderança', texto: 'Descreva uma situação real e receba orientação prática.', cor: '#6b3fa0', href: '/conversa' },
  { nome: 'Conhecimento', texto: 'Cultura, ética, liderança, excelência e mais, por tema.', cor: '#c9962b', href: '/conhecimento' },
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
