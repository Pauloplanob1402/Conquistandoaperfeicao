-- ============================================================
-- ORDEM 5 de 10 · conquistando-a-perfeicao
-- Quando: depois do 01
-- O que faz: cria práticas, tarefas, conclusões e ações do mês, com 5 práticas iniciais de outubro/2026
-- Pode rodar de novo sem problema: sim (se repetir depois do 08, rode o 08 de novo em seguida)
-- ============================================================

create table if not exists public.praticas (
  id uuid primary key default gen_random_uuid(),
  periodo text not null check (periodo ~ '^\d{4}-\d{2}$'),
  titulo text not null,
  descricao text,
  ordem int not null default 0,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);
create table if not exists public.pratica_tarefas (
  id uuid primary key default gen_random_uuid(),
  pratica_id uuid not null references public.praticas(id) on delete cascade,
  texto text not null,
  ordem int not null default 0
);
create table if not exists public.tarefas_concluidas (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  tarefa_id uuid not null references public.pratica_tarefas(id) on delete cascade,
  concluida_em timestamptz not null default now(),
  primary key (usuario_id, tarefa_id)
);
create table if not exists public.acoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  periodo text not null,
  o_que_fiz text not null,
  resultado text,
  aprendizado text,
  melhoria text,
  criado_em timestamptz not null default now()
);
create index if not exists praticas_periodo_idx on public.praticas(periodo);
create index if not exists acoes_usuario_idx on public.acoes(usuario_id, periodo);

alter table public.praticas enable row level security;
alter table public.pratica_tarefas enable row level security;
alter table public.tarefas_concluidas enable row level security;
alter table public.acoes enable row level security;

drop policy if exists "praticas: logados leem ativas" on public.praticas;
create policy "praticas: logados leem ativas" on public.praticas for select to authenticated using (ativa or public.is_admin());
drop policy if exists "praticas: admin altera" on public.praticas;
create policy "praticas: admin altera" on public.praticas for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "tarefas: logados leem" on public.pratica_tarefas;
create policy "tarefas: logados leem" on public.pratica_tarefas for select to authenticated using (true);
drop policy if exists "tarefas: admin altera" on public.pratica_tarefas;
create policy "tarefas: admin altera" on public.pratica_tarefas for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "conclusoes: as proprias" on public.tarefas_concluidas;
create policy "conclusoes: as proprias" on public.tarefas_concluidas for all to authenticated using (usuario_id = auth.uid() or public.is_admin()) with check (usuario_id = auth.uid());
drop policy if exists "acoes: as proprias" on public.acoes;
create policy "acoes: as proprias" on public.acoes for all to authenticated using (usuario_id = auth.uid() or public.is_admin()) with check (usuario_id = auth.uid());

-- Práticas iniciais de outubro/2026 (ajuste ou apague em Administração > Práticas)
insert into public.praticas (id, periodo, titulo, descricao, ordem) values ('c3439afa-ec64-4a71-b03a-2f816a05c569', '2026-10', 'Reunião semanal de alinhamento', 'A equipe apresenta problemas e propostas, todos opinam e os responsáveis ficam definidos.', 1) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('74a01894-d340-4ebe-b10e-4244fd10b19c', 'c3439afa-ec64-4a71-b03a-2f816a05c569', 'Defina uma pauta curta com a equipe', 1) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('f4a5c578-7d36-4b16-b228-0cce8ce348ac', 'c3439afa-ec64-4a71-b03a-2f816a05c569', 'Peça que cada pessoa traga um problema e uma proposta', 2) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('c39417df-2eb0-4190-9306-afd30bf3b77a', 'c3439afa-ec64-4a71-b03a-2f816a05c569', 'Registre responsáveis e prazos', 3) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('f18f3f4f-3870-4626-8109-dade63618225', 'c3439afa-ec64-4a71-b03a-2f816a05c569', 'Acompanhe o que foi combinado na semana seguinte', 4) on conflict (id) do nothing;
insert into public.praticas (id, periodo, titulo, descricao, ordem) values ('7faf8879-7eee-42a6-b5ef-9c9fb474b38e', '2026-10', 'Uma melhoria neste mês', 'Primeiro se mantém o nível atingido; depois se melhora, começando pela inovação.', 2) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('6dec8af0-b1d3-4e10-a3c9-c37f5a4ae41b', '7faf8879-7eee-42a6-b5ef-9c9fb474b38e', 'Identifique um ponto do seu processo que pode melhorar', 1) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('0570b900-000a-4c24-9c97-ba36e85a772c', '7faf8879-7eee-42a6-b5ef-9c9fb474b38e', 'Teste a melhoria em pequena escala', 2) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('8c38e571-9061-4127-8ca4-058cee6160c3', '7faf8879-7eee-42a6-b5ef-9c9fb474b38e', 'Meça o resultado antes de ampliar', 3) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('4f60f0a2-dc1d-49ed-9710-8c602003db3b', '7faf8879-7eee-42a6-b5ef-9c9fb474b38e', 'Registre o aprendizado para o encontro mensal', 4) on conflict (id) do nothing;
insert into public.praticas (id, periodo, titulo, descricao, ordem) values ('998190b8-69af-4fda-93ec-d4f31f2a31c4', '2026-10', 'Dar o exemplo', 'A formação das pessoas passa pelo exemplo de quem lidera.', 3) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('e1bc198d-d6af-42d4-9759-02ce6f55b869', '998190b8-69af-4fda-93ec-d4f31f2a31c4', 'Escolha um comportamento que você cobra da equipe', 1) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('2201deab-381a-405b-9ed5-d64a7ae414a8', '998190b8-69af-4fda-93ec-d4f31f2a31c4', 'Pratique esse comportamento todos os dias', 2) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('750ef45d-fbf7-4c47-8855-b7375243f8e9', '998190b8-69af-4fda-93ec-d4f31f2a31c4', 'Peça feedback a uma pessoa da equipe', 3) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('27a05a5e-c8fe-4441-be99-af41c7434962', '998190b8-69af-4fda-93ec-d4f31f2a31c4', 'Ajuste o que ouvir', 4) on conflict (id) do nothing;
insert into public.praticas (id, periodo, titulo, descricao, ordem) values ('4993a5cf-ad5a-4ebc-8e07-8cca9d227406', '2026-10', 'Saber servir', 'Servir é organizar as relações para que o resultado chegue bem a quem depende do seu trabalho.', 4) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('014c1879-8031-488f-9d73-c3993d1ca760', '4993a5cf-ad5a-4ebc-8e07-8cca9d227406', 'Liste quem recebe o resultado do seu trabalho', 1) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('984a97a7-0d37-4dd2-ab0a-33910a2582c3', '4993a5cf-ad5a-4ebc-8e07-8cca9d227406', 'Pergunte a cada um o que precisa', 2) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('95e221b3-cd55-4f4c-b427-ff28fb8b704a', '4993a5cf-ad5a-4ebc-8e07-8cca9d227406', 'Ajuste uma rotina para atender melhor', 3) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('4ae67d5e-d9b6-4679-9316-679309ac33b8', '4993a5cf-ad5a-4ebc-8e07-8cca9d227406', 'Confira se melhorou', 4) on conflict (id) do nothing;
insert into public.praticas (id, periodo, titulo, descricao, ordem) values ('d49f7c3a-31c4-45f9-a2b8-d1db12399d5f', '2026-10', 'Reconhecer e compartilhar', 'Boas práticas reconhecidas viram referência para outras equipes.', 5) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('278d4e7e-3eb0-4c69-813a-fdbf6f9cfa27', 'd49f7c3a-31c4-45f9-a2b8-d1db12399d5f', 'Identifique uma boa prática da sua equipe', 1) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('04bd4a73-1cc0-40b8-aaf2-a65bd0c5424d', 'd49f7c3a-31c4-45f9-a2b8-d1db12399d5f', 'Descreva o antes, o depois e o aprendizado', 2) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('fad5924f-378c-46eb-ab6d-15902b5b3b73', 'd49f7c3a-31c4-45f9-a2b8-d1db12399d5f', 'Agradeça a quem contribuiu', 3) on conflict (id) do nothing;
insert into public.pratica_tarefas (id, pratica_id, texto, ordem) values ('02765173-5a40-4dd9-b236-d40e0971812b', 'd49f7c3a-31c4-45f9-a2b8-d1db12399d5f', 'Compartilhe a prática com outra equipe', 4) on conflict (id) do nothing;
