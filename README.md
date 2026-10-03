# Nexus Dashboard

Painel SaaS genérico com a identidade visual Nexus (referência em `design-system.html`).
Next.js 16 (App Router) · Tailwind CSS 4 · TypeScript · next-intl (PT/EN) · Supabase (Auth, Postgres, Storage) · Recharts · GSAP.

Autenticação e dados vêm **somente do Supabase** (projeto `dashboard`, ref `lywclbctfzcctnysedxl`).
Não há cadastro público: o administrador cadastra cada usuário (e-mail + senha + papel) em `/admin/users`.

## Rodando

```bash
npm install
npm run dev
```

Configure o `.env.local` (modelo em `.env.example`) e abra http://localhost:3000.

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chave publishable (`sb_publishable_…`) — pode ir para o navegador |
| `NEXT_PUBLIC_SITE_URL` | URL do app, usada nos links dos e-mails |
| `SUPABASE_SECRET_KEY` | chave secreta — **só servidor**, necessária para cadastrar usuários |

## Páginas

| Rota | O que é |
| --- | --- |
| `/login` | Login com e-mail e senha (Supabase Auth) |
| `/forgot-password` | Envia o e-mail de redefinição de senha |
| `/auth/confirm` | Destino dos links de e-mail (convite, redefinição, troca de e-mail) — abre a sessão |
| `/reset-password` | Definir nova senha (redefinição e primeiro acesso de convidados) |
| `/home` | Métricas e gráfico (exemplo), atividade recente real (`audit_log`), atalhos |
| `/profile` | Dados do perfil (`profiles`) e foto (bucket `avatars`) |
| `/settings` | Conta (e-mail, idioma, fuso), Segurança (troca de senha), Notificações (`notification_preferences`) |
| `/admin/users` | Requer `users.read`: cadastrar (e-mail + senha), mudar papel, desativar/reativar |

Rotas sem login (exceto as de acesso) redirecionam para `/login` (via `src/proxy.ts`).

## Banco de dados (Supabase)

Migrações aplicadas (ver `list_migrations` no MCP): `01_roles_permissions` … `08_audit_user_create`.

| Tabela | Conteúdo |
| --- | --- |
| `roles` | tipos de usuário (`admin`, `user`; `is_system` não podem ser apagados) |
| `permissions` | `dashboard.platform_metrics`, `users.read`, `users.invite`, `users.update_role`, `users.disable`, `roles.manage`, `audit.read_all` |
| `role_permissions` | papel ↔ permissão |
| `profiles` | 1:1 com `auth.users` (nome, cargo, fone, bio, fuso, idioma, avatar, papel, status) |
| `invitations` | registro de cada cadastro (papel escolhido, quem cadastrou, status) |
| `notification_preferences` | preferências de e-mail por usuário |
| `audit_log` | atividade (login, convite, troca de papel, etc.) |

- Novo usuário no Auth → trigger cria `profiles` + `notification_preferences` (papel vem do convite pendente).
- Toda a segurança está na RLS: `private.has_permission()` checa o papel do usuário ativo. A interface só esconde o que a RLS já bloqueia.
- Ninguém altera o próprio papel/status; usuário desativado perde as permissões e é deslogado no próximo acesso.
- Tipos TypeScript em `src/lib/database.types.ts` — regenerar após cada migração.

**Novo admin:** depois de criar a conta, rodar no SQL Editor:
`update public.profiles set role_id = (select id from public.roles where key = 'admin'), status = 'active' where lower(email) = '<email>';`

## Configuração no painel do Supabase (obrigatória para os e-mails)

1. **Authentication › URL Configuration**
   - Site URL: `http://localhost:3000` (em produção, a URL da Vercel)
   - Redirect URLs: `http://localhost:3000/**` (e `https://<app>.vercel.app/**`)
2. **Authentication › Emails › Templates** — trocar o link `{{ .ConfirmationURL }}` por:
   - *Invite user*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/reset-password`
   - *Reset password*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
   - *Change email address*: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/settings`
3. **Authentication › Sign In / Providers › Email**: desativar *Allow new users to sign up*.
4. Recomendado: ativar *Leaked password protection* e senha mínima de 8 caracteres.
5. O SMTP padrão do Supabase tem limite baixo de envios por hora — para uso real, configurar um SMTP próprio.

## Estrutura

```
messages/{pt,en}.json        textos da interface (inclui errors.*)
src/proxy.ts                 renova a sessão e protege rotas
src/lib/supabase/            clientes: server (usuário), client (navegador), admin (chave secreta), proxy
src/lib/auth/session.ts      getCurrentUser(), listUsers(), listRoles(), listActivity()…
src/lib/auth/actions.ts      server actions (login, senha, perfil, preferências, convites, papéis)
src/lib/database.types.ts    tipos gerados do banco
src/lib/mock/dashboard.ts    números de exemplo da Home (métricas e gráfico)
src/app/auth/                rotas confirm (links de e-mail) e signout
```

## Deploy (Vercel)

Importar o repositório, configurar as 4 variáveis de ambiente (com `NEXT_PUBLIC_SITE_URL` = URL da Vercel)
e adicionar a URL da Vercel em *Site URL* / *Redirect URLs* no Supabase.

## Observação técnica

O `next.config.ts` configura o alias `next-intl/config` manualmente em vez de usar `next-intl/plugin`:
o plugin carrega o binário nativo do `@swc/core`, que se recusa a rodar quando a pasta herda permissão de
escrita de "Usuários autenticados" (padrão em pastas na raiz do `C:\`).
