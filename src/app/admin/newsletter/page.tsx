import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

async function nova(fd: FormData) {
  'use server';
  const { supabase, user } = await getPerfil();
  const { data } = await supabase.from('newsletters').insert({ titulo: String(fd.get('titulo') || 'Nova edição'), corpo: '', criado_por: user?.id }).select('id').single();
  redirect(data ? `/admin/newsletter/${data.id}` : '/admin/newsletter');
}

type Ed = { id: string; titulo: string; status: string; agendada_para: string | null; enviada_em: string | null };

export default async function AdminNewsletter() {
  const { supabase } = await getPerfil();
  const { data } = await supabase.from('newsletters').select('id,titulo,status,agendada_para,enviada_em').order('criado_em', { ascending: false });
  const lista = (data ?? []) as Ed[];
  return (
    <main className="pagina">
      <h1>Newsletter</h1>
      <form action={nova} style={{ maxWidth: 520 }}>
        <label htmlFor="titulo">Título da nova edição</label><input id="titulo" name="titulo" required />
        <p><button type="submit">Criar edição</button></p>
      </form>
      <div className="rolagem"><table>
        <thead><tr><th>Edição</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>{lista.map(e => (
          <tr key={e.id}><td><Link href={`/admin/newsletter/${e.id}`}>{e.titulo}</Link></td><td><span className={`selo ${e.status}`}>{e.status}</span></td>
            <td>{e.enviada_em ? new Date(e.enviada_em).toLocaleString('pt-BR') : e.agendada_para ? `agendada para ${new Date(e.agendada_para).toLocaleDateString('pt-BR')}` : ''}</td></tr>
        ))}</tbody>
      </table></div>
    </main>
  );
}
