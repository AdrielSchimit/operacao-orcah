# Operação ORÇAH — correção do acesso público (15/10/2026)

> **RASCUNHO; NADA APLICADO NO BANCO OU NO SITE.**
>
> Este PR documenta a implementação em duas etapas e **não altera o cliente**.
> `01`/`02` ficam fora das migrations automáticas e NÃO podem rodar juntas sem o novo login.

## Falha confirmada

- `access.js` carrega hashes SHA-256 de dois códigos no JS entregue ao navegador; sessão de 30 dias fica no `localStorage` e o usuário em `window.ORCAH_ACCESS_USER`.
- `sync.js` usa `sb_publishable_...` (chave pública é normal) com `persistSession: false`, sem credencial Supabase Auth, e faz `upsert` no schema `ops_api`.
- RLS de `ops_api.orcah_ops_shared_documents` está ativa, **mas** as policies permitem `SELECT`, `INSERT` e `UPDATE` ao papel `anon`, verificando só `workspace_id` e algumas chaves. Qualquer cliente que consiga chamar a API com a chave publicável pode, em princípio, alterar o board, independentemente do código visual.
- Confirmação de perigo: depois da operação real a tabela tinha um documento `kanban` com 36 cards e revisão 38 (dados reais do workspace; **não sobrescrever** em testes).

## Correção segura (separada em etapas)

1. Implantar um login **Supabase Auth** com credenciais individuais de Adriel e César. O código de acesso atual é apenas proteção visual, não pode continuar como autorização de banco. Testar login, logout, expiração, reset e dispositivo móvel.
2. Criar `ops_api.orcah_ops_members` com duas identidades permitidas, populadas por SQL Editor com `auth.users.id`, usando `01-members-bootstrap.sql`. A tabela só permite `SELECT` do próprio usuário autenticado.
3. Atualizar `access.js` e `sync.js` em branch de implementação: `supabase.auth.signInWithPassword` / eventos de sessão; enviar JWT real em `SELECT`/`UPSERT` e canal Realtime; manter o board local como cache de indisponibilidade. Não guardar senha/secret/server role no browser.
4. Testar os dois usuários em Preview; consultar o board, fazer edição concorrente, desconectar/reconectar, atualizar filtros e proteger contra sobrescrita de revisões.
5. Após Preview verde, aplicar **fase B** `02-auth-only-cutover.sql` em janela coordenada: retirar policies `anon`, adicionar policies por `auth.uid()` e revogar permissões do papel `anon`.
6. Smoke-test sem dados reais: os dois usuários autorizados editam normalmente; um visitante sem sessão não consegue ler nem gravar; checar logs. Se falhar, restaurar apenas as policies antigas com aprovação (o rollback reabre o risco).

## Considerações obrigatórias

- Deixar o `service_role` **apenas no backend**. Publicável no browser é aceitável **somente com RLS restritiva e sessão autenticada**.
- `ops_api` precisa continuar entre os schemas expostos na API para o cliente, mas a tabela passa a aceitar só usuários permitidos.
- O usuário do app principal do Prisma **não** é o mesmo usuário Auth da Operação.
- Autorização de UI não é autorização de banco; nenhuma verificação puramente em JavaScript resolve.
- Testar RLS de membros para prevenir leitura da lista de outros usuários. Não inserir senhas/códigos em PR.
- Testar se Realtime respeita RLS; se não, manter sincronização por polling autenticado e não reabrir policies anônimas.
- Essa solução requer aceite dos dois usuários para usar contas Supabase Auth. Sem a etapa de cliente atualizada, **não aplicar fase B**.

## Situação

Proposta arquitetural, não patch pronto do frontend. A implementação cliente está pendente; por isso o PR continua em rascunho. Não aplicar SQL de teste em produção.
