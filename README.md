# Conquistando a Perfeição · Calçados Beira Rio

Base da plataforma (etapas 1 e 2): login com perfis, cadastro por unidade, painel administrativo e editor das 200 respostas.
Next.js 15 (App Router) + TypeScript + Supabase. Pronto para a Vercel.

## Conversa de liderança (etapa 4)
Rode também `supabase/migracao-02-conversas.sql` no SQL Editor. Depois, aprove respostas em `/admin/respostas` (só as aprovadas aparecem para os usuários; administradores veem todas) e teste em `/conversa`. As perguntas sem resposta aparecem em `/admin/perguntas`.

## Pastas
- `src/app` páginas: `/` `/login` `/cadastro` `/inicio` `/conversa` `/admin` (resumo, respostas, perguntas, unidades)
- `src/lib/matcher.ts` motor de palavras-chave · `src/lib/supabase` conexão com o Supabase · `src/middleware.ts` proteção das rotas
- `supabase/schema.sql` tabelas, perfis e regras de segurança
- `data/respostas-beira-rio.csv` as 200 respostas · `scripts/importar-respostas.mjs` importador

## Passo a passo
1. **Supabase:** crie um projeto. No SQL Editor, cole e rode `supabase/schema.sql`.
2. **Chaves:** em Project Settings > API, copie a URL e a chave `anon`.
3. **Auth:** em Authentication > URL Configuration, ponha a URL do site (ex.: https://conquistandoaperfeicao.vercel.app) em Site URL e em Redirect URLs (`.../auth/callback`).
4. **GitHub:** suba esta pasta (sem `node_modules`, `.next` ou `.env.local`).
5. **Vercel:** importe o repositório e cadastre em Settings > Environment Variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL`. Faça o deploy.
6. **Importar as respostas, jeito mais simples:** cole `supabase/importar-respostas.sql` no SQL Editor e rode (já deixa as 200 como aprovadas).
   **Ou pelo computador:** `cp .env.example .env.local`, preencha as chaves (incluindo `SUPABASE_SERVICE_ROLE_KEY`), `npm install` e `npm run importar`.
7. **Primeiro administrador:** crie seu acesso em `/cadastro` e, no SQL Editor, rode:
   `update public.perfis set tipo = 'admin' where id = (select id from auth.users where email = 'seu@email.com');`
8. Rode `supabase/seed-unidades.sql` no SQL Editor para cadastrar as 13 filiais (ou use `/admin/unidades`).
9. Entre em `/admin`, confira as unidades e revise as respostas (status: rascunho, em revisão, aprovada).

## Segurança
- Só respostas **aprovadas** aparecem para usuários; administradores veem todas.
- A fonte interna (`respostas_fontes`) só é lida por administradores.
- A chave `service_role` é só para o importador local: nunca cadastre na Vercel nem suba ao GitHub.

## Próximas etapas
Conhecimento, conversa de liderança (motor de palavras-chave), práticas, jornada, newsletter e reconhecimento.
