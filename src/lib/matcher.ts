// Motor de conversa: identifica a situação descrita pela pessoa por palavras-chave.
export type Resposta = {
  id: string; tema: string; camada: string; pergunta: string; palavras_chave: string;
  reflexao: string; orientacao: string; relacionados: string | null; status: string;
};
export type Acerto = { resposta: Resposta; pontos: number };

export const LIMITE_MINIMO = 3; // abaixo disso a pergunta é tratada como "sem resposta"

const IGNORAR = new Set(('a o as os um uma uns umas de do da dos das em no na nos nas por para pra pro com sem que e eh ou se como mais mas ' +
  'meu minha meus minhas seu sua eu me te nao ja ao aos isso isto esta este esse essa ele ela eles elas qual quais quando onde ser estar ' +
  'tenho tem preciso quero posso devo fazer faco sobre muito muita ate foi sao vou vai').split(' '));

export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

export function tokens(texto: string): string[] {
  return normalizar(texto).split(' ').filter(t => t.length > 1 && !IGNORAR.has(t));
}

function prefixoComum(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

// duas palavras "casam" se forem iguais ou compartilharem um radical longo (delegar ~ delegação)
export function casam(a: string, b: string): boolean {
  if (a === b) return true;
  const menor = Math.min(a.length, b.length);
  return menor >= 5 && prefixoComum(a, b) >= Math.min(menor, 6);
}

export function pontuar(pergunta: string, r: Resposta): number {
  const texto = ` ${normalizar(pergunta)} `;
  const tq = tokens(pergunta);
  const frases = r.palavras_chave.split(';').map(s => s.trim()).filter(Boolean);
  const partes: number[] = [];
  for (const frase of frases) {
    const n = normalizar(frase);
    if (!n) continue;
    const tf = tokens(frase);
    if (texto.includes(` ${n} `)) { partes.push(tf.length > 1 ? 5 : 4); continue; }
    if (tf.length === 0) continue;
    const achados = tf.filter(t => tq.some(q => casam(q, t))).length;
    if (achados === tf.length) partes.push(3);
    else if (achados > 0) partes.push((achados / tf.length) * 1.5);
  }
  partes.sort((a, b) => b - a);
  let pontos = partes.slice(0, 3).reduce((s, p) => s + p, 0);
  const tp = tokens(r.pergunta);
  const comuns = tq.filter(q => tp.some(t => casam(q, t))).length;
  const parecido = comuns / Math.max(tq.length, tp.length, 1); // quanto a pergunta se parece com a situação cadastrada
  pontos += 5 * parecido;
  return Math.round(pontos * 100) / 100;
}

export function buscar(pergunta: string, base: Resposta[], max = 4): Acerto[] {
  return base
    .map(resposta => ({ resposta, pontos: pontuar(pergunta, resposta) }))
    .filter(a => a.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos || a.resposta.id.localeCompare(b.resposta.id))
    .slice(0, max);
}
