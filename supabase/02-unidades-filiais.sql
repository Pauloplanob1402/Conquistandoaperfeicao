-- ============================================================
-- ORDEM 2 de 10 · unidades-filiais
-- Quando: depois do 01
-- O que faz: cadastra as 13 filiais que aparecem na lista do cadastro
-- Pode rodar de novo sem problema: sim (se repetir depois do 08, rode o 08 de novo em seguida)
-- ============================================================

insert into public.unidades (nome, cidade) values
  ('Filial 01 – Igrejinha', 'Igrejinha'),
  ('Filial 03 – Osório', 'Osório'),
  ('Filial 06 – Mato Leitão', 'Mato Leitão'),
  ('Filial 08 – Teutônia', 'Teutônia'),
  ('Filial 10 – Candelária', 'Candelária'),
  ('Filial 11 – Candelária', 'Candelária'),
  ('Filial 12 – Roca Sales', 'Roca Sales'),
  ('Filial 16 – Novo Hamburgo', 'Novo Hamburgo'),
  ('Filial 17 – Sapiranga', 'Sapiranga'),
  ('Filial 18 – Santa Clara do Sul', 'Santa Clara do Sul'),
  ('Filial 20 – Novo Hamburgo', 'Novo Hamburgo'),
  ('Filial 23 – Sapiranga', 'Sapiranga'),
  ('Filial 30 – Sapiranga', 'Sapiranga')
on conflict (nome) do nothing;
