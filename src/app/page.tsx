import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

export default async function Home() {
  const { user } = await getPerfil();
  if (user) redirect('/inicio');
  return (
    <main className="pagina">
      <h1>A excelência não acontece por acaso. Ela é construída diariamente.</h1>
      <p style={{ maxWidth: '40rem', fontSize: '1.15rem', color: 'var(--cinza)' }}>
        Uma ferramenta para transformar liderança, responsabilidade e excelência em prática, em todo o ecossistema Beira Rio.
      </p>
      <p><Link className="botao" href="/login">Entrar na plataforma</Link></p>
    </main>
  );
}
