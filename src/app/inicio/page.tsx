import Link from 'next/link';
import { getPerfil } from '@/lib/supabase/server';

const AREAS = [
  { nome: 'Conhecimento', texto: 'Cultura, ética, liderança, excelência e mais.', cor: '#c9962b' },
  { nome: 'Conversa de liderança', texto: 'Descreva uma situação real e receba orientação prática.', cor: '#6b3fa0', href: '/conversa' },
  { nome: 'Conquistando a Perfeição', texto: 'Práticas do período, tarefas e checklists.', cor: '#1e8e5a' },
  { nome: 'Minha jornada', texto: 'Seu progresso, histórico e evolução.', cor: '#2a9bd6' },
  { nome: 'Newsletter', texto: 'Boas práticas e destaques das unidades.', cor: '#e8730c' },
];

export default async function Inicio() {
  const { perfil } = await getPerfil();
  const primeiro = (perfil?.nome ?? '').split(' ')[0];
  return (
    <main className="pagina">
      <h1>{primeiro ? `Olá, ${primeiro}.` : 'Olá.'}</h1>
      <p style={{ color: 'var(--cinza)' }}>Cultura que entra na rotina da liderança. As demais áreas serão liberadas nas próximas etapas.</p>
      <div className="grade">
        {AREAS.map(a => (
          <div className="area" key={a.nome} style={{ ['--cor' as string]: a.cor }}>
            <h3>{a.nome}</h3><p>{a.texto}</p>{'href' in a ? <p><Link className="botao" href={a.href as string}>Abrir</Link></p> : <p><small>Em construção</small></p>}
          </div>
        ))}
      </div>
    </main>
  );
}
