import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';
import { getPerfil } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Conquistando a Perfeição · Calçados Beira Rio',
  description: 'Cultura que entra na rotina da liderança.',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#a3162b' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, perfil } = await getPerfil();
  return (
    <html lang="pt-BR">
      <body>
        <header className="topo">
          <Link href={user ? '/inicio' : '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
            <strong>Conquistando a Perfeição</strong>
          </Link>
          <nav>
            {perfil?.tipo === 'admin' && <Link href="/admin">Administração</Link>}
            {user ? (
              <form action="/auth/sair" method="post"><button className="claro" type="submit">Sair</button></form>
            ) : (
              <><Link href="/login">Entrar</Link><Link className="botao" href="/cadastro">Criar acesso</Link></>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
