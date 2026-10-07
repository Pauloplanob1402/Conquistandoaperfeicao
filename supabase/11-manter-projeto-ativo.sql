-- ============================================================
-- ORDEM 11 · manter-projeto-ativo
-- Quando: a qualquer momento depois do 01 (pode rodar já)
-- O que faz: cria uma tabelinha pública só de leitura que o GitHub consulta a cada 3 dias,
--            para o Supabase gratuito não pausar o projeto por 7 dias sem uso
-- Pode rodar de novo sem problema: sim
-- ============================================================

create table if not exists public.keep_alive (
  id int primary key,
  nota text
);
insert into public.keep_alive (id, nota) values (1, 'ping') on conflict (id) do nothing;

alter table public.keep_alive enable row level security;
drop policy if exists "keep_alive: leitura publica" on public.keep_alive;
create policy "keep_alive: leitura publica" on public.keep_alive for select to anon, authenticated using (true);
grant select on public.keep_alive to anon, authenticated;
