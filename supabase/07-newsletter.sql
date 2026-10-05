-- ============================================================
-- ORDEM 7 de 10 · newsletter
-- Quando: depois do 06
-- O que faz: cria as edições, os destaques das unidades e o registro de envios; guarda o e-mail de cada perfil para o envio
-- Pode rodar de novo sem problema: sim (se repetir depois do 08, rode o 08 de novo em seguida)
-- ============================================================

alter table public.perfis add column if not exists email text;
update public.perfis p set email = u.email from auth.users u where u.id = p.id and p.email is null;

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text,
  corpo text not null default '',
  status text not null default 'rascunho' check (status in ('rascunho','agendada','enviada')),
  agendada_para timestamptz,
  enviada_em timestamptz,
  criado_por uuid references auth.users(id),
  criado_em timestamptz not null default now()
);
create table if not exists public.newsletter_destaques (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references public.newsletters(id) on delete cascade,
  unidade_id uuid references public.unidades(id),
  titulo text not null,
  texto text not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.newsletter_envios (
  id bigserial primary key,
  newsletter_id uuid not null references public.newsletters(id) on delete cascade,
  destinatarios int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.newsletters enable row level security;
alter table public.newsletter_destaques enable row level security;
alter table public.newsletter_envios enable row level security;

drop policy if exists "newsletters: publicadas para logados" on public.newsletters;
create policy "newsletters: publicadas para logados" on public.newsletters for select to authenticated using (status = 'enviada' or public.is_admin());
drop policy if exists "newsletters: admin altera" on public.newsletters;
create policy "newsletters: admin altera" on public.newsletters for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "destaques: seguem a edicao" on public.newsletter_destaques;
create policy "destaques: seguem a edicao" on public.newsletter_destaques for select to authenticated
  using (exists (select 1 from public.newsletters n where n.id = newsletter_id and (n.status = 'enviada' or public.is_admin())));
drop policy if exists "destaques: admin altera" on public.newsletter_destaques;
create policy "destaques: admin altera" on public.newsletter_destaques for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "envios: so admin" on public.newsletter_envios;
create policy "envios: so admin" on public.newsletter_envios for all to authenticated using (public.is_admin()) with check (public.is_admin());
