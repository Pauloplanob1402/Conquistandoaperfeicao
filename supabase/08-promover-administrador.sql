-- ============================================================
-- ORDEM 8 de 8 · promover-administrador
-- Quando: SÓ DEPOIS de criar seu acesso em /cadastro e confirmar o e-mail
-- O que faz: torna o e-mail abaixo administrador (libera o menu Administração)
-- Pode rodar de novo sem problema: sim
-- ============================================================

update public.perfis
set tipo = 'admin'
where id = (select id from auth.users where email = 'paulonascimento@feevale.br');

-- conferir: deve aparecer 1 linha com tipo = admin
select p.nome, p.tipo, u.email
from public.perfis p join auth.users u on u.id = p.id
where u.email = 'paulonascimento@feevale.br';
