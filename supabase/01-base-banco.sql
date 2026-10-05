-- ============================================================
-- ORDEM 1 de 8 · base-banco
-- Quando: primeiro de todos
-- O que faz: cria unidades, perfis, respostas, fontes internas, histórico e as regras de segurança
-- Pode rodar de novo sem problema: sim
-- ============================================================

create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cidade text,
  criado_em timestamptz not null default now()
);
do $$ begin create type public.perfil_tipo as enum ('lideranca','supervisao','admin'); exception when duplicate_object then null; end $$;
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  unidade_id uuid references public.unidades(id),
  tipo public.perfil_tipo not null default 'lideranca',
  criado_em timestamptz not null default now()
);
create table if not exists public.respostas (
  id text primary key,
  tema text not null,
  camada text not null,
  pergunta text not null,
  palavras_chave text not null,
  reflexao text not null,
  orientacao text not null,
  relacionados text,
  status text not null default 'rascunho' check (status in ('rascunho','em_revisao','aprovada')),
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid references auth.users(id)
);
-- Fonte interna fica separada: só administradores enxergam
create table if not exists public.respostas_fontes (
  resposta_id text primary key references public.respostas(id) on delete cascade,
  origem_interna text
);
create table if not exists public.respostas_historico (
  id bigserial primary key,
  resposta_id text not null references public.respostas(id) on delete cascade,
  campos jsonb not null,
  alterado_por uuid references auth.users(id),
  alterado_em timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from public.perfis where id = auth.uid() and tipo = 'admin') $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, unidade_id)
  values (new.id, new.raw_user_meta_data->>'nome', nullif(new.raw_user_meta_data->>'unidade_id','')::uuid);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.unidades enable row level security;
alter table public.perfis enable row level security;
alter table public.respostas enable row level security;
alter table public.respostas_fontes enable row level security;
alter table public.respostas_historico enable row level security;

drop policy if exists "unidades: todos leem" on public.unidades;
create policy "unidades: todos leem" on public.unidades for select to anon, authenticated using (true);
drop policy if exists "unidades: admin altera" on public.unidades;
create policy "unidades: admin altera" on public.unidades for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "perfis: ver o próprio ou admin" on public.perfis;
create policy "perfis: ver o próprio ou admin" on public.perfis for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "perfis: editar o próprio sem mudar o tipo" on public.perfis;
create policy "perfis: editar o próprio sem mudar o tipo" on public.perfis for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and tipo = (select p.tipo from public.perfis p where p.id = auth.uid()));
drop policy if exists "perfis: admin altera" on public.perfis;
create policy "perfis: admin altera" on public.perfis for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "respostas: aprovadas para logados" on public.respostas;
create policy "respostas: aprovadas para logados" on public.respostas for select to authenticated using (status = 'aprovada' or public.is_admin());
drop policy if exists "respostas: admin altera" on public.respostas;
create policy "respostas: admin altera" on public.respostas for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "fontes: só admin" on public.respostas_fontes;
create policy "fontes: só admin" on public.respostas_fontes for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "histórico: só admin" on public.respostas_historico;
create policy "histórico: só admin" on public.respostas_historico for all to authenticated using (public.is_admin()) with check (public.is_admin());
