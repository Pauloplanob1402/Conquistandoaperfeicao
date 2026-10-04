-- Motor de conversa: registro das perguntas (rode no SQL Editor do Supabase depois do schema.sql)
create table if not exists public.conversas (
  id bigserial primary key,
  usuario_id uuid references auth.users(id) on delete set null,
  pergunta text not null,
  resposta_id text references public.respostas(id) on delete set null,
  pontuacao numeric,
  criado_em timestamptz not null default now()
);
alter table public.conversas enable row level security;
drop policy if exists "conversas: registrar a própria" on public.conversas;
create policy "conversas: registrar a própria" on public.conversas for insert to authenticated with check (usuario_id = auth.uid());
drop policy if exists "conversas: ver a própria ou admin" on public.conversas;
create policy "conversas: ver a própria ou admin" on public.conversas for select to authenticated using (usuario_id = auth.uid() or public.is_admin());
