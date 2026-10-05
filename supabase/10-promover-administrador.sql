-- ============================================================
-- ORDEM 10 de 10 · promover-administrador
-- Quando: SÓ DEPOIS de criar seu acesso em /cadastro, confirmar o e-mail e rodar o 08
-- O que faz: torna o e-mail abaixo administrador e já aprovado (libera o menu Administração)
-- Pode rodar de novo sem problema: sim
-- ============================================================

update public.perfis
set tipo = 'admin', aprovado = true
where id = (select id from auth.users where email = 'paulonascimento@feevale.br');

-- conferir: deve aparecer 1 linha com tipo = admin e aprovado = true
select p.nome, p.tipo, p.aprovado, u.email
from public.perfis p join auth.users u on u.id = p.id
where u.email = 'paulonascimento@feevale.br';
