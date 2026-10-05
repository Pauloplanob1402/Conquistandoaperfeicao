import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

// Porta de entrada da área logada: perfil completo, termos aceitos e acesso aprovado.
export default async function AreaLogada({ children }: { children: React.ReactNode }) {
  const { user, perfil } = await getPerfil();
  if (!user) redirect('/login');
  if (!perfil || !perfil.aceitou_termos_em || !perfil.unidade_id) redirect('/perfil');
  if (!perfil.aprovado) redirect('/aguardando');
  return children;
}
