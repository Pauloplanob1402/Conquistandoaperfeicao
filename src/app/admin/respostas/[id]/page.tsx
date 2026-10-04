import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getPerfil } from '@/lib/supabase/server';

export default async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await getPerfil();
  const { data: r } = await supabase.from('respostas').select('*').eq('id', id).single();
  if (!r) notFound();
  const { data: fonte } = await supabase.from('respostas_fontes').select('origem_interna').eq('resposta_id', id).single();
  const { data: hist } = await supabase.from('respostas_historico').select('alterado_em').eq('resposta_id', id).order('alterado_em', { ascending: false }).limit(5);

  async function salvar(fd: FormData) {
    'use server';
    const { supabase, user } = await getPerfil();
    const campos = {
      pergunta: String(fd.get('pergunta')), palavras_chave: String(fd.get('palavras_chave')), reflexao: String(fd.get('reflexao')),
      orientacao: String(fd.get('orientacao')), relacionados: String(fd.get('relacionados')), status: String(fd.get('status')),
    };
    await supabase.from('respostas').update({ ...campos, atualizado_em: new Date().toISOString(), atualizado_por: user?.id }).eq('id', id);
    await supabase.from('respostas_historico').insert({ resposta_id: id, campos, alterado_por: user?.id });
    redirect(`/admin/respostas?salvo=${id}`);
  }

  return (
    <main className="pagina">
      <p><Link href="/admin/respostas">Voltar para a lista</Link></p>
      <h1>{r.id}</h1>
      <div className="editor">
        <form action={salvar}>
          <label htmlFor="pergunta">Pergunta (situação real)</label><input id="pergunta" name="pergunta" defaultValue={r.pergunta} required />
          <label htmlFor="palavras_chave">Palavras-chave (separadas por ponto e vírgula)</label><input id="palavras_chave" name="palavras_chave" defaultValue={r.palavras_chave} required />
          <label htmlFor="reflexao">Reflexão</label><textarea id="reflexao" name="reflexao" defaultValue={r.reflexao} required />
          <label htmlFor="orientacao">Orientação prática</label><textarea id="orientacao" name="orientacao" defaultValue={r.orientacao} required />
          <label htmlFor="relacionados">Conteúdos relacionados</label><input id="relacionados" name="relacionados" defaultValue={r.relacionados ?? ''} />
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={r.status}>
            <option value="rascunho">Rascunho</option><option value="em_revisao">Em revisão</option><option value="aprovada">Aprovada</option>
          </select>
          <p><button type="submit">Salvar alterações</button></p>
        </form>
        <aside className="lateral">
          <p><strong>Tema:</strong> {r.tema}<br /><strong>Camada:</strong> {r.camada}</p>
          <p><strong>Fonte interna</strong> (só administradores):<br />{fonte?.origem_interna ?? 'sem registro'}</p>
          <p><strong>Últimas alterações</strong><br />{(hist ?? []).length === 0 ? 'Nenhuma ainda.' :
            (hist as { alterado_em: string }[]).map(h => <span key={h.alterado_em}>{new Date(h.alterado_em).toLocaleString('pt-BR')}<br /></span>)}</p>
        </aside>
      </div>
    </main>
  );
}
