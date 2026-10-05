-- ============================================================
-- ORDEM 9 de 10 · limite-de-perguntas
-- Quando: depois do 08
-- O que faz: acelera a contagem de perguntas por minuto (proteção contra abuso na Conversa de liderança)
-- Pode rodar de novo sem problema: sim
-- ============================================================

create index if not exists conversas_usuario_tempo_idx on public.conversas (usuario_id, criado_em desc);
