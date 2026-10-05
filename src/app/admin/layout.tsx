import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { perfil } = await getPerfil();
  if (perfil?.tipo !== 'admin') redirect('/inicio');
  return (
    <>
      <nav className="topo" style={{ background: '#f3f1ec' }}>
        <strong>Administração</strong>
        <span style={{ display: 'flex', gap: '1.2rem' }}>
          <Link href="/admin">Resumo</Link><Link href="/admin/usuarios">Usuários</Link><Link href="/admin/respostas">Respostas</Link><Link href="/admin/praticas">Práticas</Link><Link href="/admin/newsletter">Newsletter</Link><Link href="/admin/perguntas">Perguntas</Link><Link href="/admin/unidades">Unidades</Link>
        </span>
      </nav>
      {children}
    </>
  );
}
