// Importa data/respostas-beira-rio.csv para o Supabase (rode no seu computador: npm run importar)
import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local'); process.exit(1); }
const db = createClient(url, key, { auth: { persistSession: false } });
const rows = parse(readFileSync('data/respostas-beira-rio.csv', 'utf8'), { columns: true, skip_empty_lines: true });

const respostas = rows.map(r => ({ id: r.id, tema: r.tema, camada: r.camada, pergunta: r.pergunta, palavras_chave: r.palavras_chave,
  reflexao: r.reflexao, orientacao: r.orientacao, relacionados: r.relacionados, status: r.status }));
const fontes = rows.map(r => ({ resposta_id: r.id, origem_interna: r.origem_interna }));

for (let i = 0; i < rows.length; i += 100) {
  const a = await db.from('respostas').upsert(respostas.slice(i, i + 100));
  if (a.error) { console.error(a.error.message); process.exit(1); }
  const b = await db.from('respostas_fontes').upsert(fontes.slice(i, i + 100));
  if (b.error) { console.error(b.error.message); process.exit(1); }
}
console.log(`${rows.length} respostas importadas.`);
