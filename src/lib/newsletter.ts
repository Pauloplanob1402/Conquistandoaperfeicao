import type { SupabaseClient } from '@supabase/supabase-js';

export type Edicao = { id: string; titulo: string; resumo: string | null; corpo: string };
export type Destaque = { titulo: string; texto: string; unidade: string | null };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const paragrafos = (t: string) => t.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

export function montarHtml(e: Edicao, destaques: Destaque[], url: string): string {
  const corpo = paragrafos(e.corpo).map(p => `<p style="margin:0 0 14px;line-height:1.6">${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  const dest = destaques.length
    ? `<h2 style="font:700 18px Georgia,serif;margin:28px 0 10px;color:#a3162b">Destaques das unidades</h2>` +
      destaques.map(d => `<div style="border-left:4px solid #c8102e;padding:6px 12px;margin:0 0 12px;background:#faf7f5"><div style="font-size:12px;color:#5a6472">${esc(d.unidade ?? '')}</div><strong>${esc(d.titulo)}</strong><div style="margin-top:4px;line-height:1.5">${esc(d.texto)}</div></div>`).join('')
    : '';
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fbfaf8;font:16px system-ui,Segoe UI,Arial,sans-serif;color:#1b2430">
<div style="max-width:600px;margin:0 auto;padding:24px"><div style="font:700 14px Georgia,serif;color:#a3162b;letter-spacing:.5px">CONQUISTANDO A PERFEIÇÃO</div>
<h1 style="font:700 26px Georgia,serif;margin:8px 0 18px">${esc(e.titulo)}</h1><p style="margin:0 0 14px;line-height:1.6">Olá, {{params.NOME}}!</p>${corpo}${dest}
<p style="margin:28px 0 0"><a href="${url}" style="background:#a3162b;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:600">Ler na plataforma</a></p>
<p style="color:#5a6472;font-size:12px;margin-top:24px">Dia a dia na fronteira da perfeição.</p></div></body></html>`;
}

export type Destinatario = { email: string; nome?: string | null };
const primeiroNome = (n?: string | null) => (n ?? '').trim().split(/\s+/)[0] || 'leitor(a)';

export async function enviarEmails(assunto: string, html: string, destinatarios: Destinatario[]) {
  const key = process.env.BREVO_API_KEY, from = process.env.NEWSLETTER_REMETENTE_EMAIL;
  if (!key || !from) return { ok: false as const, enviados: 0, erro: 'Configure BREVO_API_KEY e NEWSLETTER_REMETENTE_EMAIL na Vercel.' };
  if (destinatarios.length === 0) return { ok: false as const, enviados: 0, erro: 'Nenhum destinatário com e-mail cadastrado.' };
  let enviados = 0;
  for (let i = 0; i < destinatarios.length; i += 200) {
    const lote = destinatarios.slice(i, i + 200);
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ sender: { name: process.env.NEWSLETTER_REMETENTE_NOME || 'Conquistando a Perfeição', email: from }, subject: assunto, htmlContent: html, messageVersions: lote.map(d => ({ to: [{ email: d.email, name: d.nome?.trim() || undefined }], params: { NOME: primeiroNome(d.nome) } })) }),
    });
    if (!r.ok) return { ok: false as const, enviados, erro: `O serviço de e-mail respondeu ${r.status}.` };
    enviados += lote.length;
  }
  return { ok: true as const, enviados };
}

export async function carregarDestaques(supabase: SupabaseClient, id: string): Promise<Destaque[]> {
  const { data } = await supabase.from('newsletter_destaques').select('titulo,texto,unidades(nome)').eq('newsletter_id', id).order('criado_em');
  return ((data ?? []) as unknown as { titulo: string; texto: string; unidades: { nome: string } | null }[]).map(d => ({ titulo: d.titulo, texto: d.texto, unidade: d.unidades?.nome ?? null }));
}

export async function publicarEdicao(supabase: SupabaseClient, id: string, porEmail: boolean) {
  const { data: n } = await supabase.from('newsletters').select('id,titulo,resumo,corpo').eq('id', id).single();
  if (!n) return { ok: false as const, enviados: 0, erro: 'Edição não encontrada.' };
  if (!n.corpo?.trim()) return { ok: false as const, enviados: 0, erro: 'A edição está sem texto. Escreva o texto, salve e publique de novo.' };
  let enviados = 0;
  if (porEmail) {
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/newsletter/${id}`;
    const { data: ps } = await supabase.from('perfis').select('nome,email').not('email', 'is', null);
    const unicos = new Map<string, Destinatario>();
    for (const p of (ps ?? []) as { nome: string | null; email: string }[]) if (!unicos.has(p.email)) unicos.set(p.email, { email: p.email, nome: p.nome });
    const r = await enviarEmails(n.titulo, montarHtml(n, await carregarDestaques(supabase, id), url), [...unicos.values()]);
    if (!r.ok) return r;
    enviados = r.enviados;
  }
  await supabase.from('newsletters').update({ status: 'enviada', enviada_em: new Date().toISOString() }).eq('id', id);
  await supabase.from('newsletter_envios').insert({ newsletter_id: id, destinatarios: enviados });
  return { ok: true as const, enviados };
}
