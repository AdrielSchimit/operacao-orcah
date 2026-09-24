# Operação ORÇAH

Kanban operacional do projeto **ORÇAH**, criado para dividir execução entre **Adriel** e **Cesar** e manter o roadmap visível por prioridade, pontos e status.

## O que já funciona

- 5 colunas: Backlog, Planejado, Em andamento, Revisão e Concluído.
- Drag-and-drop entre colunas.
- Pontos por tarefa.
- Prioridade: Crítica, Alta, Média e Baixa.
- Responsável: Adriel ou Cesar.
- Filtro por responsável e prioridade.
- Busca por tarefa, frente, descrição, checklist e comentários.
- Modal completo de edição.
- Checklist por tarefa.
- Comentários dentro de cada item do checklist.
- Botão verde de conclusão.
- Menu de ações por card.
- Cards duplicáveis.
- Exportação e importação do board em JSON.
- Persistência via `localStorage`.
- Dashboard de pontos e progresso.
- Layout responsivo.

## Roadmap inicial já carregado

O seed inclui as frentes levantadas na auditoria do ORÇAH:

1. Produção / banco.
2. Migrations e seed.
3. Storage externo.
4. Ciclo de pedido de alteração.
5. Segurança das contas administrativas.
6. Asaas / assinatura.
7. Recuperação de senha e rate limit.
8. WhatsApp.
9. Instagram.
10. Lista de orçamentos.
11. CRM de clientes.
12. Salvar e enviar.
13. Orçamento a partir de pedido.
14. Observações padrão.
15. Testes de regras financeiras.
16. E2E de produção.
17. PWA / cache.
18. Follow-up.
19. Pagamento Pix do cliente final.
20. Financeiro.
21. Ordem de serviço.
22. Agenda.
23. Orçamento por voz.
24. NFS-e.
25. Pós-venda.

Também existem cards concluídos representando melhorias já feitas na auditoria.

## Divisão inicial sugerida

**Adriel**
- Produto e UX.
- WhatsApp.
- Instagram.
- CRM.
- Orçamentos.
- Fluxos de operação.
- Follow-up, agenda, voz e pós-venda.

**Cesar**
- Banco e produção.
- Storage.
- Auth e segurança.
- Asaas / pagamentos.
- CI e testes.
- Infraestrutura, PWA e integrações financeiras/fiscais.

A divisão não é fixa: qualquer card pode ter o responsável alterado.

## Rodar localmente

Não existe build.

Abra `index.html` diretamente no navegador ou rode qualquer servidor estático:

```bash
npx serve .
```

ou:

```bash
python -m http.server 8080
```

## Deploy na Vercel

O projeto é estático. Importe este repositório na Vercel e publique sem comando de build.

## Persistência atual

A versão inicial usa `localStorage`, então alterações ficam salvas no navegador em que foram feitas.

Para trabalhar em dois PCs agora:

1. Um dev usa **Exportar**.
2. Envia o JSON.
3. O outro usa **Importar**.

### Próxima evolução recomendada

Trocar a camada local por uma API/Supabase para ter:

- login de Adriel e Cesar;
- sincronização em tempo real;
- comentários com autor real;
- histórico de alterações;
- anexos;
- notificações;
- auditoria;
- board compartilhado sem export/import.

A interface atual pode ser mantida; basta substituir a camada de persistência do `app.js`.

## Arquivos

- `index.html` — estrutura da interface.
- `styles.css` — design responsivo.
- `app.js` — dados, persistência e comportamento.
- `vercel.json` — configuração mínima para hospedagem estática.
