# Conquistando a Perfeição · Calçados Beira Rio

Base da plataforma (etapas 1 e 2): login com perfis, cadastro por unidade, painel administrativo e editor das 200 respostas.
Next.js 15 (App Router) + TypeScript + Supabase. Pronto para a Vercel.

## Conversa de liderança (etapa 4)
Rode também `supabase/migracao-02-conversas.sql` no SQL Editor. Depois, aprove respostas em `/admin/respostas` (só as aprovadas aparecem para os usuários; administradores veem todas) e teste em `/conversa`. As perguntas sem resposta aparecem em `/admin/perguntas`.

## Conquistando a Perfeição (etapa 5)
Rode `supabase/migracao-03-conquistando.sql` (cria as tabelas e 5 práticas iniciais de outubro/2026). Gerencie as práticas de cada mês em `/admin/praticas` (há botão para copiar do mês anterior).

## Pastas
- `src/app` páginas: `/` `/login` `/cadastro` `/inicio` `/conversa` `/admin` (resumo, respostas, perguntas, unidades)
- `src/lib/matcher.ts` motor de palavras-chave · `src/lib/supabase` conexão com o Supabase · `src/middleware.ts` proteção das rotas
- `supabase/schema.sql` tabelas, perfis e regras de segurança
- `data/respostas-beira-rio.csv` as 200 respostas · `scripts/importar-respostas.mjs` importador

## Ordem dos SQLs (pasta `supabase/`)
No Supabase, abra o **SQL Editor** e rode **um arquivo por vez, na ordem dos números**.

| Ordem | Arquivo | O que faz |
|---|---|---|
| 1 | `01-base-banco.sql` | Tabelas principais e regras de segurança |
| 2 | `02-unidades-filiais.sql` | Cadastra as 13 filiais |
| 3 | `03-respostas-200.sql` | Carrega as 200 respostas (aprovadas) |
| 4 | `04-registro-de-conversas.sql` | Registro das perguntas |
| 5 | `05-conquistando-a-perfeicao.sql` | Práticas, tarefas e ações do mês |
| 6 | `06-minha-jornada.sql` | Orientações acessadas por pessoa |
| 7 | `07-newsletter.sql` | Edições, destaques e envios |
| 8 | `08-usuarios-aprovacao-e-aceite.sql` | Aprovação de acessos, domínios, aceite dos termos |
| 9 | `09-limite-de-perguntas.sql` | Proteção contra excesso de perguntas |
| 10 | `10-promover-administrador.sql` | Só depois de criar seu acesso em `/cadastro` |

Regras: rode o **08 antes** de publicar a versão nova do site. Todos podem ser repetidos, mas o 03 sobrescreve edições feitas no painel, e se você repetir um arquivo de 1 a 7 depois do 08, rode o 08 de novo em seguida.

## Passo a passo
1. **Supabase:** crie o projeto e rode os SQLs 01 a 09. Copie a URL e a chave `anon` (Project Settings > API).
2. **Auth:** em Authentication > URL Configuration, ponha a URL do site em Site URL e `.../auth/callback` em Redirect URLs.
3. **GitHub e Vercel:** suba a pasta (sem `node_modules`, `.next`, `.env.local`), importe na Vercel e cadastre as variáveis do `.env.example`. As três primeiras bastam para tudo, menos o e-mail da newsletter.
4. Crie seu acesso em `/cadastro`, confirme o e-mail e rode o SQL 10.
5. Em `/admin/usuarios`, cadastre os domínios de aprovação automática; em `/admin`, confira as práticas do mês e crie a primeira newsletter.

## Login com Google (opcional)
1. No Google Cloud Console: APIs e serviços > Credenciais > Criar credenciais > ID do cliente OAuth (aplicativo da Web).
2. Em "URIs de redirecionamento autorizados", ponha `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
3. No Supabase: Authentication > Providers > Google. Ative e cole o Client ID e o Client Secret.
Quem entra com Google escolhe a unidade e aceita os termos no primeiro acesso, e passa pela mesma aprovação.

## Esqueci minha senha
Funciona pelo e-mail do Supabase. Confira em Authentication > URL Configuration se a URL do site e `.../auth/callback` estão cadastradas.

## Newsletter por e-mail (opcional)
Crie uma conta na Brevo, verifique o e-mail remetente e cadastre na Vercel `BREVO_API_KEY`, `NEWSLETTER_REMETENTE_EMAIL` e `NEWSLETTER_REMETENTE_NOME`. Use "Enviar teste para mim" antes do primeiro envio real. O **agendamento** usa o cron diário da Vercel e exige também `CRON_SECRET` e `SUPABASE_SERVICE_ROLE_KEY`, como variáveis de servidor (nunca com prefixo `NEXT_PUBLIC_`).

## Segurança
- Só respostas **aprovadas** aparecem para usuários; administradores veem todas.
- A fonte interna (`respostas_fontes`) só é lida por administradores.
- A chave `service_role` só é usada no envio agendado da newsletter, como variável de servidor da Vercel. Nunca use prefixo `NEXT_PUBLIC_` e nunca suba ao GitHub.

## Próximas etapas
Reconhecimento entre unidades, relatórios para a diretoria e login com Google.
