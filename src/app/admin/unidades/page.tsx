import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function adicionar(fd: FormData) {
  'use server';
  const supabase = await createClient();
  await supabase.from('unidades').insert({ nome: String(fd.get('nome')), cidade: String(fd.get('cidade') || '') || null });
  revalidatePath('/admin/unidades');
}

export default async function Unidades() {
  const supabase = await createClient();
  const { data } = await supabase.from('unidades').select('id,nome,cidade').order('nome');
  const lista = (data ?? []) as { id: string; nome: string; cidade: string | null }[];
  return (
    <main className="pagina">
      <h1>Unidades produtivas</h1>
      <form action={adicionar} style={{ maxWidth: 420 }}>
        <label htmlFor="nome">Nome da unidade</label><input id="nome" name="nome" required />
        <label htmlFor="cidade">Cidade</label><input id="cidade" name="cidade" />
        <p><button type="submit">Adicionar unidade</button></p>
      </form>
      {lista.length === 0 ? <p className="aviso">Nenhuma unidade cadastrada. Cadastre as unidades para que apareçam no cadastro de acesso.</p> : (
        <table><thead><tr><th>Unidade</th><th>Cidade</th></tr></thead>
          <tbody>{lista.map(u => <tr key={u.id}><td>{u.nome}</td><td>{u.cidade}</td></tr>)}</tbody></table>
      )}
    </main>
  );
}
