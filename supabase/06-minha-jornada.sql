-- ============================================================
-- ORDEM 6 de 8 · minha-jornada
-- Quando: depois do 05
-- O que faz: guarda quais orientações cada pessoa já abriu (aparece em Minha jornada)
-- Pode rodar de novo sem problema: sim
-- ============================================================

create table if not exists public.acessos (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  resposta_id text not null references public.respostas(id) on delete cascade,
  ultimo_acesso timestamptz not null default now(),
  primary key (usuario_id, resposta_id)
);
alter table public.acessos enable row level security;
drop policy if exists "acessos: os proprios" on public.acessos;
create policy "acessos: os proprios" on public.acessos for all to authenticated
  using (usuario_id = auth.uid() or public.is_admin()) with check (usuario_id = auth.uid());
