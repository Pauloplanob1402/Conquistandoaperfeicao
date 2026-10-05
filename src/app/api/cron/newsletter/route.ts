import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { publicarEdicao } from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

// Chamado todos os dias pela Vercel (vercel.json). Envia as edições agendadas para hoje ou antes.
export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET || req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 });
  }
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) return NextResponse.json({ erro: 'SUPABASE_SERVICE_ROLE_KEY não configurada' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, { auth: { persistSession: false } });
  const { data } = await db.from('newsletters').select('id').eq('status', 'agendada').lte('agendada_para', new Date().toISOString());
  const resultados = [];
  for (const e of (data ?? []) as { id: string }[]) resultados.push({ id: e.id, ...(await publicarEdicao(db, e.id, true)) });
  return NextResponse.json({ processadas: resultados.length, resultados });
}
