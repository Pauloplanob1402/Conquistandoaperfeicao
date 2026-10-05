-- ============================================================
-- ORDEM 8 de 10 · usuarios-aprovacao-e-aceite
-- Quando: depois do 07 e ANTES de publicar a versão nova do site
-- O que faz: aprovação de acessos, domínios com aprovação automática, aceite dos termos e segurança extra nas regras de perfil
-- Pode rodar de novo sem problema: sim
-- ============================================================

do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'perfis' and column_name = 'aprovado') then
    alter table public.perfis add column aprovado boolean not null default false;
    update public.perfis set aprovado = true; -- quem já tinha acesso continua aprovado
  end if;
end $$;
alter table public.perfis add column if not exists aceitou_termos_em timestamptz;

create table if not exists public.dominios_permitidos (dominio text primary key check (dominio = lower(dominio)));
alter table public.dominios_permitidos enable row level security;
drop policy if exists "dominios: so admin" on public.dominios_permitidos;
create policy "dominios: so admin" on public.dominios_permitidos for all to authenticated using (public.is_admin()) with check (public.is_admin());

create or replace function public.acesso_aprovado() returns boolean
language sql security definer set search_path = public stable as
$$ select exists (select 1 from public.perfis where id = auth.uid() and aprovado) $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, email, unidade_id, aprovado, aceitou_termos_em)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    nullif(new.raw_user_meta_data->>'unidade_id', '')::uuid,
    exists (select 1 from public.dominios_permitidos d where d.dominio = lower(split_part(new.email, '@', 2))),
    case when new.raw_user_meta_data->>'aceite' = 'sim' then now() end
  );
  return new;
end $$;

-- O usuário não pode mudar o próprio perfil de acesso, a aprovação nem o e-mail
drop policy if exists "perfis: editar o próprio sem mudar o tipo" on public.perfis;
drop policy if exists "perfis: editar o próprio com limites" on public.perfis;
create policy "perfis: editar o próprio com limites" on public.perfis for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid()
    and tipo = (select p.tipo from public.perfis p where p.id = auth.uid())
    and aprovado = (select p.aprovado from public.perfis p where p.id = auth.uid())
    and email is not distinct from (select p.email from public.perfis p where p.id = auth.uid()));

-- Conteúdo só para quem foi aprovado
drop policy if exists "respostas: aprovadas para logados" on public.respostas;
create policy "respostas: aprovadas para logados" on public.respostas for select to authenticated using (public.is_admin() or (status = 'aprovada' and public.acesso_aprovado()));
drop policy if exists "praticas: logados leem ativas" on public.praticas;
create policy "praticas: logados leem ativas" on public.praticas for select to authenticated using (public.is_admin() or (ativa and public.acesso_aprovado()));
drop policy if exists "tarefas: logados leem" on public.pratica_tarefas;
create policy "tarefas: logados leem" on public.pratica_tarefas for select to authenticated using (public.is_admin() or public.acesso_aprovado());
drop policy if exists "newsletters: publicadas para logados" on public.newsletters;
create policy "newsletters: publicadas para logados" on public.newsletters for select to authenticated using (public.is_admin() or (status = 'enviada' and public.acesso_aprovado()));
