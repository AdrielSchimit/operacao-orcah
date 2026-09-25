(() => {
  "use strict";

  const STORAGE_KEY = "operacao-orcah-kanban-v3";
  const MIND_KEY = "operacao-orcah-mindmap-v1";
  const UI_STATE_KEY = "operacao-orcah-ui-state-v1";
  const LEGACY_KEYS = ["operacao-orcah-board-v1"];

  const COLUMNS = [
    { key: "backlog", title: "Backlog", color: "#95a199" },
    { key: "planned", title: "Planejado", color: "#4a7bd8" },
    { key: "doing", title: "Em andamento", color: "#d38a22" },
    { key: "review", title: "Revisão", color: "#7d63d2" },
    { key: "done", title: "Concluído", color: "#1fa463" }
  ];
  const COLUMN_META_KEY = "operacao-orcah-columns-v1";
  const COLUMN_PALETTE = [
    "#95a199", "#4a7bd8", "#d38a22", "#7d63d2", "#1fa463",
    "#d4537e", "#2a9d8f", "#c4554d", "#3d4a7a", "#8a6a3b"
  ];

  const STRATEGY_CARD_ID = "orcah-norte-produto-2026";

  function makeStrategyCard() {
    return {
      id: STRATEGY_CARD_ID,
      variant: "strategy",
      title: "NORTE DO PRODUTO — proposta profissional antes de novas firulas",
      epic: "Norte do produto",
      assignee: "Adriel",
      priority: "critical",
      points: 13,
      status: "backlog",
      description: "Transformar um preço cru em uma proposta profissional: identidade da empresa, fechamento comercial, condições de pagamento, preview, link, PDF e aprovação — sem perder a simplicidade para quem trabalha pelo celular.",
      notes: "Este card resume o que é imprescindível antes de expandir o ORÇAH para dezenas de módulos. Usar como filtro para decidir novas features.",
      subcards: [
        {
          id: "norte-fechamento",
          title: "Fechamento comercial do orçamento",
          assignee: "Adriel",
          points: 5,
          status: "planned",
          description: "Transformar o final do orçamento em fechamento comercial claro, e não em campos de sistema.",
          checklist: makeChecks(
            "Desconto com escolha entre % e R$ + valor real descontado",
            "Exibir Subtotal → Desconto → Total final",
            "Formas aceitas: Pix, cartão, boleto, dinheiro e transferência",
            "Condição: à vista, entrada + saldo, 2x, 3x ou personalizado",
            "Entrada/sinal em % ou R$ com saldo restante automático",
            "Validade da proposta, prazo de execução e observações com presets úteis"
          )
        },
        {
          id: "norte-ux-mobile",
          title: "UX mobile radicalmente simples",
          assignee: "Adriel",
          points: 3,
          status: "planned",
          description: "O app precisa funcionar para pedreiro, pintor, eletricista, serralheiro e autônomo sem treinamento.",
          checklist: makeChecks(
            "Pouquíssimos campos obrigatórios",
            "Campos avançados escondidos em Mais opções",
            "Linguagem simples, sem termos de ERP/SaaS",
            "Botões grandes e fáceis de tocar no celular",
            "Fluxo principal inteiro testado primeiro no mobile"
          )
        },
        {
          id: "norte-branding",
          title: "Branding, logos e temas de proposta",
          assignee: "Adriel",
          points: 5,
          status: "backlog",
          description: "Dar identidade profissional à empresa sem virar um Canva.",
          checklist: makeChecks(
            "Configurações → Identidade Visual: logo, cores, fonte e modelo",
            "Upload de logo com preview e storage externo",
            "Templates de logo em SVG: Minimal, Modern, Classic, Bold, Elegant e Tech",
            "Começar com temas Clean, Modern e Premium",
            "Gerador de logo por IA fica posterior, com 1 geração grátis por empresa"
          )
        },
        {
          id: "norte-renderer",
          title: "Preview + Proposal Renderer único + PDF",
          assignee: "Adriel",
          points: 5,
          status: "backlog",
          description: "Preview, página pública e PDF precisam ser três saídas do mesmo documento visual.",
          checklist: makeChecks(
            "Preview em tempo real: é isso que meu cliente vai receber",
            "Criar ProposalData → ProposalRenderer único",
            "Mesmo renderer alimenta preview, página pública e PDF",
            "Componentes: header, cliente, itens, pagamento, notas e footer",
            "PDF respeita logo, cores, fonte, template e condições comerciais"
          )
        },
        {
          id: "norte-historico-storage",
          title: "Snapshot, versões e assets duráveis",
          assignee: "Adriel",
          points: 5,
          status: "backlog",
          description: "Orçamentos antigos devem continuar exatamente como foram enviados.",
          checklist: makeChecks(
            "Estrutura própria de CompanyBranding",
            "Salvar snapshot visual ao publicar/enviar orçamento",
            "Aproveitar budget_versions para preservar orçamento + branding de cada versão",
            "Assets fora do filesystem da Vercel",
            "Separar company-assets e budget-assets por empresa/orçamento"
          )
        },
        {
          id: "norte-beta",
          title: "Fechar MVP, beta e ordem de lançamento",
          assignee: "Adriel",
          points: 5,
          status: "planned",
          description: "Não expandir o produto antes do fluxo principal estar redondo.",
          checklist: makeChecks(
            "Fluxo obrigatório: Cadastro → Onboarding → Cliente → Serviço/Item → Orçamento → Proposta → Link → resposta",
            "Beta completo com conta nova, mobile, aprovação, recusa e revisão",
            "Colocar empresas reais para usar antes do lançamento maior",
            "Ordem: Preview → fluxo → UX/mobile → link público → branding → logo → templates → PDF → beta → cobrança → main → domínio → produção",
            "IA e automações entram depois do fluxo comercial estar sólido"
          )
        }
      ],
      checklist: makeChecks(
        "Usar este card como norte para priorização",
        "Não adicionar módulos que atrapalhem o fluxo principal do MVP"
      )
    };
  }

  function ensureStrategyCard(list) {
    const existing = list.find(card => card.id === STRATEGY_CARD_ID);
    if (existing) return { list, added: false };
    return { list: [...list, makeStrategyCard()], added: true };
  }

  const VERIFIED_DONE_CHECKS = new Set([
    "Desconto com escolha entre % e R$ + valor real descontado",
    "Exibir Subtotal → Desconto → Total final",
    "Formas aceitas: Pix, cartão, boleto, dinheiro e transferência",
    "Condição: à vista, entrada + saldo, 2x, 3x ou personalizado",
    "Entrada/sinal em % ou R$ com saldo restante automático",
    "Validade da proposta, prazo de execução e observações com presets úteis",
    "Pouquíssimos campos obrigatórios",
    "Campos avançados escondidos em Mais opções",
    "Linguagem simples, sem termos de ERP/SaaS",
    "Botões grandes e fáceis de tocar no celular",
    "Fluxo obrigatório: Cadastro → Onboarding → Cliente → Serviço/Item → Orçamento → Proposta → Link → resposta",
    "Casos com decimais",
    "Casos com desconto"
  ]);

  function applyVerifiedProgress(list) {
    let changed = false;

    const next = list.map(card => {
      let nextCard = card;

      if (card.id === STRATEGY_CARD_ID) {
        const subcards = (card.subcards || []).map(sub => {
          const checklist = (sub.checklist || []).map(item => {
            if (!item.done && VERIFIED_DONE_CHECKS.has(item.text)) {
              changed = true;
              return { ...item, done: true };
            }
            return item;
          });

          let status = sub.status;
          if (sub.id === "norte-fechamento" && checklist.length && checklist.every(item => item.done)) {
            if (status !== "done") changed = true;
            status = "done";
          } else if (
            sub.id === "norte-ux-mobile" &&
            checklist.some(item => item.done) &&
            status === "planned"
          ) {
            changed = true;
            status = "doing";
          }

          return { ...sub, checklist, status };
        });

        nextCard = { ...card, subcards };
      }

      if (card.title === "Testes automáticos das regras de dinheiro") {
        const checklist = (card.checklist || []).map(item => {
          if (!item.done && VERIFIED_DONE_CHECKS.has(item.text)) {
            changed = true;
            return { ...item, done: true };
          }
          return item;
        });
        const status =
          checklist.some(item => item.done) && card.status === "planned"
            ? "doing"
            : card.status;
        if (status !== card.status) changed = true;
        nextCard = { ...nextCard, checklist, status };
      }

      return nextCard;
    });

    return { list: next, changed };
  }

  const PRIORITIES = {
    critical: { label: "Crítica" },
    high: { label: "Alta" },
    medium: { label: "Média" },
    low: { label: "Baixa" }
  };

  const $ = selector => document.querySelector(selector);
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const makeCheck = text => ({ id: uid(), text, done: false, comments: [] });
  const makeChecks = (...items) => items.map(makeCheck);

  const makeSubcard = (title, assignee, points, description, status = "planned", checks = []) => ({
    id: uid(),
    title,
    assignee,
    points,
    status,
    description,
    checklist: checks.map(makeCheck)
  });

  function seedCards() {
    return [
      {
        id: uid(),
        title: "Subir MySQL de produção e configurar DATABASE_URL",
        epic: "Produção / Banco",
        assignee: "Cesar",
        priority: "critical",
        points: 5,
        status: "doing",
        description: "Banco de produção funcional, conectado à Vercel e separado dos deploys de preview.",
        notes: "Bloqueio direto de produção.",
        subcards: [
          makeSubcard("Criar banco de produção", "Cesar", 2, "Instância MySQL exclusiva de produção.", "doing", ["Criar instância", "Validar acesso"]),
          makeSubcard("Configurar Vercel", "Cesar", 2, "Cadastrar DATABASE_URL em Production.", "planned", ["Adicionar variável", "Redeploy"]),
          makeSubcard("Separar Preview", "Cesar", 1, "Evitar que preview use o banco real.", "planned", ["Criar banco de preview", "Configurar ambiente"])
        ],
        checklist: makeChecks("Validar login em produção", "Validar cadastro em produção")
      },
      {
        id: uid(),
        title: "Aplicar migrations e seed em produção",
        epic: "Produção / Banco",
        assignee: "Cesar",
        priority: "critical",
        points: 3,
        status: "planned",
        description: "Produção precisa iniciar com todas as tabelas e dados iniciais obrigatórios.",
        notes: "",
        subcards: [],
        checklist: makeChecks("Rodar prisma migrate deploy", "Rodar prisma db seed", "Validar estados, ramos e moldes")
      },
      {
        id: uid(),
        title: "Storage externo para logo e fotos",
        epic: "Infra / Storage",
        assignee: "Cesar",
        priority: "critical",
        points: 7,
        status: "planned",
        description: "Parar de gravar arquivos no disco efêmero da Vercel e persistir tudo em storage externo.",
        notes: "Vercel Blob é uma boa opção inicial.",
        subcards: [
          makeSubcard("Adapter de storage", "Cesar", 2, "Criar camada única para upload e remoção.", "planned", ["Interface de storage", "Tratamento de erro"]),
          makeSubcard("Logo da empresa", "Cesar", 2, "Migrar upload, troca e remoção da logo.", "planned", ["Upload", "Troca", "Remoção"]),
          makeSubcard("Fotos de orçamento", "Cesar", 3, "Persistir fotos e garantir leitura pública.", "planned", ["Upload múltiplo", "URL persistente", "Validar página pública"])
        ],
        checklist: makeChecks("Validar upload em produção")
      },
      {
        id: uid(),
        title: "Destravar ciclo de pedido de alteração",
        epic: "Orçamentos",
        assignee: "Adriel",
        priority: "critical",
        points: 5,
        status: "planned",
        description: "Depois que o cliente pede alteração e o prestador edita, o orçamento precisa voltar a ser aprovável.",
        notes: "",
        subcards: [
          makeSubcard("Estados do orçamento", "Adriel", 2, "Fechar fluxo completo de estados.", "planned", ["Mapear estados", "Definir transições"]),
          makeSubcard("Reenvio após edição", "Adriel", 2, "Cliente recebe nova versão e pode aprovar novamente.", "planned", ["Liberar nova aprovação", "Atualizar visual público"]),
          makeSubcard("Histórico de versões", "Adriel", 1, "Registrar alterações importantes.", "backlog", ["Definir histórico mínimo"])
        ],
        checklist: makeChecks("Testar dois ciclos consecutivos de alteração")
      },
      {
        id: uid(),
        title: "Blindar contas administrativas",
        epic: "Auth / Segurança",
        assignee: "Cesar",
        priority: "critical",
        points: 5,
        status: "planned",
        description: "Remover dependência frágil de contas privilegiadas fixas e impedir apropriação de e-mails administrativos.",
        notes: "",
        subcards: [],
        checklist: makeChecks("Mapear regra atual", "Definir bootstrap seguro", "Revisar permissões", "Documentar criação de admin")
      },
      {
        id: uid(),
        title: "Fechar cobrança ORÇAH no Asaas",
        epic: "Asaas / Assinatura",
        assignee: "Cesar",
        priority: "critical",
        points: 8,
        status: "backlog",
        description: "Usuário com teste vencido precisa conseguir pagar e voltar ao produto sem ficar preso.",
        notes: "Sandbox primeiro, produção depois.",
        subcards: [
          makeSubcard("Sandbox", "Cesar", 3, "Cobrança completa em ambiente de teste.", "backlog", ["Criar cobrança", "Validar retorno"]),
          makeSubcard("Webhook", "Cesar", 2, "Atualizar assinatura por evento.", "backlog", ["Criar endpoint", "Validar assinatura"]),
          makeSubcard("Produção", "Cesar", 3, "Chaves reais e fluxo de desbloqueio.", "backlog", ["Configurar chave", "Testar pagamento", "Testar desbloqueio"])
        ],
        checklist: []
      },
      {
        id: uid(),
        title: "Recuperação de senha e limite de tentativas",
        epic: "Auth / Segurança",
        assignee: "Cesar",
        priority: "high",
        points: 8,
        status: "backlog",
        description: "Adicionar recuperação segura de senha e proteção contra força bruta.",
        notes: "",
        subcards: [],
        checklist: makeChecks("Escolher e-mail transacional", "Criar token com expiração", "Adicionar rate limit", "Testar abuso")
      },
      {
        id: uid(),
        title: "WhatsApp: redesenhar experiência de envio",
        epic: "WhatsApp",
        assignee: "Adriel",
        priority: "high",
        points: 8,
        status: "planned",
        description: "Deixar o WhatsApp com contexto certo, mensagem boa, estados claros e envio rápido.",
        notes: "",
        subcards: [
          makeSubcard("Mensagens por estado", "Adriel", 3, "Textos para orçamento novo, alteração, aprovação e follow-up.", "planned", ["Mapear estados", "Escrever mensagens", "Revisar tom"]),
          makeSubcard("CTA de envio", "Adriel", 3, "Ação consistente em mobile e desktop.", "planned", ["Mobile", "Desktop", "Número inválido"]),
          makeSubcard("Fallback", "Adriel", 2, "Copiar mensagem e link quando o WhatsApp não abrir.", "planned", ["Copiar mensagem", "Copiar link"])
        ],
        checklist: makeChecks("Testar fluxo cliente novo até WhatsApp")
      },
      {
        id: uid(),
        title: "Instagram: definir função real no produto",
        epic: "Instagram",
        assignee: "Adriel",
        priority: "high",
        points: 8,
        status: "backlog",
        description: "Definir se Instagram será aquisição, prova social, compartilhamento ou combinação desses usos.",
        notes: "",
        subcards: [
          makeSubcard("Objetivo principal", "Adriel", 2, "Fechar job-to-be-done do Instagram.", "backlog", ["Auditar estado atual", "Escolher função"]),
          makeSubcard("Preview compartilhável", "Adriel", 3, "Criar card visual do orçamento ou empresa.", "backlog", ["Layout", "Dados dinâmicos", "Mobile"]),
          makeSubcard("Tracking", "Adriel", 3, "Medir origem e uso.", "backlog", ["Eventos", "Origem", "Métrica"])
        ],
        checklist: []
      },
      {
        id: uid(),
        title: "Lista de orçamentos com filtros",
        epic: "CRM / Orçamentos",
        assignee: "Adriel",
        priority: "high",
        points: 5,
        status: "planned",
        description: "Localizar orçamento por cliente, status, período e valor sem depender do dashboard.",
        notes: "",
        subcards: [
          makeSubcard("Lista operacional", "Adriel", 2, "Cliente, status, valor e última atualização.", "planned", ["Campos essenciais", "Responsivo"]),
          makeSubcard("Filtros e busca", "Adriel", 3, "Busca, status, período e ordenação.", "planned", ["Busca", "Status", "Período", "Ordenação"])
        ],
        checklist: []
      },
      {
        id: uid(),
        title: "Cliente clicável com histórico e edição",
        epic: "CRM / Clientes",
        assignee: "Adriel",
        priority: "high",
        points: 8,
        status: "planned",
        description: "Transformar cliente em entidade útil: editar cadastro, ver histórico e criar orçamento em contexto.",
        notes: "",
        subcards: [
          makeSubcard("Perfil do cliente", "Adriel", 2, "Tela única com dados e ações.", "planned", ["Abrir detalhe", "Exibir dados"]),
          makeSubcard("Edição", "Adriel", 2, "Editar sem duplicar cliente.", "planned", ["Salvar", "Validar dados"]),
          makeSubcard("Histórico", "Adriel", 4, "Orçamentos anteriores e criação contextual.", "planned", ["Listar histórico", "Abrir orçamento", "Criar orçamento"])
        ],
        checklist: []
      },
      {
        id: uid(),
        title: "Salvar e enviar em um passo",
        epic: "Orçamentos / UX",
        assignee: "Adriel",
        priority: "high",
        points: 3,
        status: "backlog",
        description: "Salvar o orçamento e abrir o envio imediatamente, mantendo rascunho como alternativa.",
        notes: "",
        subcards: [],
        checklist: makeChecks("Definir CTA principal", "Garantir persistência", "Abrir WhatsApp", "Tratar erro sem perder dados")
      },
      {
        id: uid(),
        title: "Criar orçamento a partir de pedido",
        epic: "Leads / Pedidos",
        assignee: "Adriel",
        priority: "high",
        points: 3,
        status: "backlog",
        description: "Pedido recebido pela página da empresa deve virar orçamento sem redigitar cliente e contexto.",
        notes: "",
        subcards: [],
        checklist: makeChecks("Adicionar CTA", "Pré-preencher cliente", "Pré-preencher contexto", "Marcar pedido convertido")
      },
      {
        id: uid(),
        title: "Testes automáticos das regras de dinheiro",
        epic: "Qualidade / CI",
        assignee: "Cesar",
        priority: "high",
        points: 5,
        status: "planned",
        description: "Cobrir subtotal, desconto, quantidade decimal, total e arredondamento no CI.",
        notes: "",
        subcards: [],
        checklist: makeChecks("Casos com decimais", "Casos com desconto", "Arredondamento", "Rodar no CI")
      },
      {
        id: uid(),
        title: "Teste E2E completo em produção",
        epic: "Qualidade / Release",
        assignee: "Cesar",
        priority: "critical",
        points: 5,
        status: "backlog",
        description: "Validar cadastro, onboarding, cliente, orçamento, envio, alteração, aprovação e PDF.",
        notes: "Executar depois dos bloqueios críticos.",
        subcards: [],
        checklist: makeChecks("Cadastro e onboarding", "Criar cliente", "Criar orçamento", "Abrir página pública", "Alterar e reenviar", "Aprovar", "Gerar PDF")
      },
      {
        id: uid(),
        title: "Estruturar ramos e moldes profissionais",
        epic: "Produto / Ramos e Moldes",
        assignee: "Adriel",
        priority: "medium",
        points: 13,
        status: "backlog",
        description: "Organizar os ramos por família e garantir que cada molde tenha campos, regras, preview e cobertura claros.",
        notes: "Evitar dezenas de cards soltos. Este bloco concentra a estrutura.",
        subcards: [
          makeSubcard("Inventário de ramos", "Adriel", 3, "Catalogar ramos e duplicidades.", "backlog", ["Exportar catálogo", "Agrupar famílias", "Marcar duplicidades"]),
          makeSubcard("Ramo para molde", "Adriel", 3, "Garantir vínculo correto.", "backlog", ["Mapear vínculos", "Validar exceções"]),
          makeSubcard("Campos e regras", "Adriel", 3, "Documentar campos e unidades.", "backlog", ["Campos obrigatórios", "Unidades", "Regras específicas"]),
          makeSubcard("Preview", "Adriel", 2, "Conferir cliente final.", "backlog", ["Desktop", "Mobile", "PDF"]),
          makeSubcard("Regressão", "Cesar", 2, "Matriz mínima de testes.", "backlog", ["Casos principais", "Seed de teste", "CI"])
        ],
        checklist: []
      },
      {
        id: uid(),
        title: "Corrigir redirecionamento pós-login",
        epic: "Produção / Login",
        assignee: "Cesar",
        priority: "critical",
        points: 3,
        status: "done",
        description: "Manter páginas das empresas em /empresa/<slug> e cookie no mesmo domínio.",
        notes: "Concluído.",
        subcards: [],
        checklist: [
          { id: uid(), text: "Remover subdomínio inexistente", done: true, comments: [] },
          { id: uid(), text: "Ajustar cookie", done: true, comments: [] }
        ]
      },
      {
        id: uid(),
        title: "Reestruturar PDF do orçamento",
        epic: "PDF",
        assignee: "Adriel",
        priority: "high",
        points: 5,
        status: "done",
        description: "Totais, observações, cabeçalho, logo e formatação corrigidos.",
        notes: "Concluído.",
        subcards: [],
        checklist: [
          { id: uid(), text: "Corrigir layout", done: true, comments: [] },
          { id: uid(), text: "Logo do prestador", done: true, comments: [] },
          { id: uid(), text: "Formato brasileiro", done: true, comments: [] }
        ]
      },
      {
        id: uid(),
        title: "Melhorar página pública e aprovação",
        epic: "Página pública",
        assignee: "Adriel",
        priority: "high",
        points: 3,
        status: "done",
        description: "Confirmação antes de aprovar, contato em todos os estados e ajuste mobile.",
        notes: "Concluído.",
        subcards: [],
        checklist: [
          { id: uid(), text: "Confirmação", done: true, comments: [] },
          { id: uid(), text: "Contato", done: true, comments: [] }
        ]
      }
    ];
  }

  function sanitizeCheck(item) {
    return {
      id: item?.id || uid(),
      text: String(item?.text || ""),
      done: Boolean(item?.done),
      comments: Array.isArray(item?.comments) ? item.comments.map(comment => ({
        id: comment?.id || uid(),
        text: String(comment?.text || ""),
        author: String(comment?.author || "Equipe"),
        at: comment?.at || new Date().toISOString()
      })) : []
    };
  }

  function sanitizeSubcard(sub, parentAssignee = "Adriel") {
    return {
      id: sub?.id || uid(),
      title: String(sub?.title || "Subcard"),
      assignee: sub?.assignee === "Cesar" ? "Cesar" : (sub?.assignee === "Adriel" ? "Adriel" : parentAssignee),
      points: [1,2,3,5,8,13].includes(Number(sub?.points)) ? Number(sub.points) : 3,
      status: COLUMNS.some(column => column.key === sub?.status) ? sub.status : "planned",
      description: String(sub?.description || ""),
      checklist: Array.isArray(sub?.checklist) ? sub.checklist.map(sanitizeCheck) : []
    };
  }

  function cardTags(card) {
    const source = Array.isArray(card?.tags)
      ? card.tags
      : String(card?.epic || "").split("/");
    const tags = [];
    source.forEach(item => {
      const text = String(item || "").replace(/\s+/g, " ").trim().slice(0, 40);
      if (!text || text.toLowerCase() === "geral") return;
      if (tags.some(tag => tag.toLowerCase() === text.toLowerCase())) return;
      tags.push(text);
    });
    return tags.slice(0, 6);
  }

  function sanitizeCard(card) {
    const assignee = card?.assignee === "Cesar" ? "Cesar" : "Adriel";
    const tags = cardTags(card);
    return {
      id: card?.id || uid(),
      title: String(card?.title || "Tarefa"),
      epic: tags.join(" / "),
      tags,
      assignee,
      priority: PRIORITIES[card?.priority] ? card.priority : "medium",
      points: [1,2,3,5,8,13].includes(Number(card?.points)) ? Number(card.points) : 3,
      status: COLUMNS.some(column => column.key === card?.status) ? card.status : "backlog",
      description: String(card?.description || ""),
      notes: String(card?.notes || ""),
      variant: card?.variant === "strategy" ? "strategy" : "",
      subcards: Array.isArray(card?.subcards) ? card.subcards.map(sub => sanitizeSubcard(sub, assignee)) : [],
      checklist: Array.isArray(card?.checklist) ? card.checklist.map(sanitizeCheck) : [],
      comments: Array.isArray(card?.comments) ? card.comments.map(comment => ({
        id: comment?.id || uid(),
        text: String(comment?.text || "").trim(),
        author: String(comment?.author || "Equipe"),
        at: comment?.at || new Date().toISOString()
      })).filter(comment => comment.text) : []
    };
  }

  function loadCards() {
    const candidates = [STORAGE_KEY, ...LEGACY_KEYS];
    for (const key of candidates) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const list = Array.isArray(parsed) ? parsed : parsed?.cards;
        if (Array.isArray(list) && list.length) {
          const sanitized = list.map(sanitizeCard);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          return sanitized;
        }
      } catch {}
    }

    const initial = seedCards().map(sanitizeCard);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  let suppressSharedEvents = false;
  const initialCards = ensureStrategyCard(loadCards()).list.map(sanitizeCard);
  const initialProgress = applyVerifiedProgress(initialCards);
  let cards = initialProgress.list.map(sanitizeCard);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  let activeCardId = null;
  let workingCard = null;

  const board = $("#board");
  const cardModal = $("#cardModal");
  const newCardModal = $("#newCardModal");

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    if (!suppressSharedEvents) {
      window.dispatchEvent(new CustomEvent("orcah:shared-change", { detail: { document: "kanban" } }));
    }
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(value = "") {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function cardPoints(card) {
    if ((card.subcards || []).length) {
      return card.subcards.reduce((sum, sub) => sum + Number(sub.points || 0), 0);
    }
    return Number(card.points || 0);
  }

  function donePoints(card) {
    if ((card.subcards || []).length) {
      return card.subcards
        .filter(sub => sub.status === "done")
        .reduce((sum, sub) => sum + Number(sub.points || 0), 0);
    }
    return card.status === "done" ? Number(card.points || 0) : 0;
  }

  function allChecks(card) {
    return [
      ...(card.checklist || []),
      ...(card.subcards || []).flatMap(sub => sub.checklist || [])
    ];
  }

  function progressFor(card) {
    const checks = allChecks(card);
    if (!checks.length) {
      if ((card.subcards || []).length) {
        const done = card.subcards.filter(sub => sub.status === "done").length;
        return { done, total: card.subcards.length, percent: card.subcards.length ? Math.round(done / card.subcards.length * 100) : 0 };
      }
      return { done: card.status === "done" ? 1 : 0, total: 1, percent: card.status === "done" ? 100 : 0 };
    }
    const done = checks.filter(item => item.done).length;
    return { done, total: checks.length, percent: Math.round(done / checks.length * 100) };
  }

  function getFilters() {
    return {
      search: normalize($("#searchInput").value.trim()),
      assignee: $("#assigneeFilter").value,
      priority: $("#priorityFilter").value
    };
  }

  function cardMatches(card, filters) {
    if (filters.assignee !== "all" && card.assignee !== filters.assignee && !(card.subcards || []).some(sub => sub.assignee === filters.assignee)) return false;
    if (filters.priority !== "all" && card.priority !== filters.priority) return false;
    if (!filters.search) return true;

    const text = [
      card.title, card.epic, ...(card.tags || []), card.description, card.notes, card.assignee,
      ...(card.comments || []).flatMap(comment => [comment.text, comment.author]),
      ...(card.checklist || []).flatMap(item => [item.text, ...(item.comments || []).map(comment => comment.text)]),
      ...(card.subcards || []).flatMap(sub => [
        sub.title, sub.description, sub.assignee,
        ...(sub.checklist || []).flatMap(item => [item.text, ...(item.comments || []).map(comment => comment.text)])
      ])
    ].join(" ");

    return normalize(text).includes(filters.search);
  }

  function columnByKey(key) {
    return COLUMNS.find(column => column.key === key) || null;
  }

  function sanitizeColumnTitle(value, fallback) {
    const text = String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 48);
    return text || fallback;
  }

  function sanitizeColumnDescription(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 180);
  }

  function sanitizeColumnColor(value, fallback) {
    const raw = String(value ?? "").trim();
    const hex = /^#([0-9a-fA-F]{6})$/.exec(raw);
    if (hex) return `#${hex[1].toLowerCase()}`;
    const short = /^#([0-9a-fA-F]{3})$/.exec(raw);
    if (short) {
      const [r, g, b] = short[1].split("");
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return String(fallback || "#95a199").toLowerCase();
  }

  function sanitizeColumnMeta(source) {
    const next = {};
    if (!source || typeof source !== "object" || Array.isArray(source)) return next;
    COLUMNS.forEach(column => {
      const item = source[column.key];
      if (!item || typeof item !== "object" || Array.isArray(item)) return;
      const title = sanitizeColumnTitle(item.title, column.title);
      const description = sanitizeColumnDescription(item.description);
      const color = sanitizeColumnColor(item.color, column.color);
      if (title === column.title && !description && color === column.color.toLowerCase()) return;
      next[column.key] = { title, description, color };
    });
    return next;
  }

  function readColumnDocument(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    const source = payload.version === 1 && payload.columns && typeof payload.columns === "object" && !Array.isArray(payload.columns)
      ? payload.columns
      : payload;
    return sanitizeColumnMeta(source);
  }

  function loadColumnMeta() {
    try {
      return sanitizeColumnMeta(JSON.parse(localStorage.getItem(COLUMN_META_KEY) || "{}"));
    } catch {
      return {};
    }
  }

  function columnView(column) {
    const saved = columnMeta[column.key];
    if (!saved) return { key: column.key, title: column.title, description: "", color: column.color.toLowerCase() };
    return { key: column.key, title: saved.title, description: saved.description, color: saved.color };
  }

  function columnDocument() {
    return { version: 1, columns: JSON.parse(JSON.stringify(columnMeta)) };
  }

  function persistColumns() {
    try {
      localStorage.setItem(COLUMN_META_KEY, JSON.stringify(columnMeta));
    } catch {}
    if (!suppressSharedEvents) {
      window.dispatchEvent(new CustomEvent("orcah:shared-change", { detail: { document: "columns" } }));
    }
  }

  let columnMeta = loadColumnMeta();
  let columnEditor = null;
  let columnPaletteOpen = false;
  let ignoreColumnEditorClick = false;
  let cardTitleEditing = false;
  let descriptionEditing = false;
  let descriptionSnapshot = "";
  let ignoreCardTitleClick = false;

  function beginColumnEdit(key) {
    if (columnEditor?.key === key) return;
    if (columnEditor) commitColumnEdit();
    const column = columnByKey(key);
    if (!column) return;
    const view = columnView(column);
    columnEditor = { key, title: view.title, description: view.description, color: view.color };
    columnPaletteOpen = false;
    ignoreColumnEditorClick = true;
    renderBoard({ focusColumnEditor: true });
  }

  function cancelColumnEdit() {
    if (!columnEditor) return;
    columnEditor = null;
    columnPaletteOpen = false;
    renderBoard();
  }

  function commitColumnEdit() {
    if (!columnEditor) return;
    const draft = columnEditor;
    const nameInput = board.querySelector(".column-header.is-editing .column-name-input");
    const descriptionInput = board.querySelector(".column-header.is-editing .column-description-input");
    if (nameInput) draft.title = nameInput.value;
    if (descriptionInput) draft.description = descriptionInput.value;
    const column = columnByKey(draft.key);
    columnEditor = null;
    columnPaletteOpen = false;
    if (!column) {
      renderBoard();
      return;
    }
    const previous = columnView(column);
    const next = {
      title: sanitizeColumnTitle(draft.title, previous.title),
      description: sanitizeColumnDescription(draft.description),
      color: sanitizeColumnColor(draft.color, previous.color)
    };
    const changed = next.title !== previous.title || next.description !== previous.description || next.color !== previous.color;
    if (!changed) {
      renderBoard();
      return;
    }
    if (next.title === column.title && !next.description && next.color === column.color.toLowerCase()) delete columnMeta[column.key];
    else columnMeta[column.key] = next;
    persistColumns();
    renderBoard();
  }

  function applyColumnDraftColor(draft, color, dotButton, header) {
    draft.color = sanitizeColumnColor(color, draft.color);
    dotButton.style.background = draft.color;
    header.querySelectorAll(".column-color-swatch").forEach(swatch => {
      swatch.classList.toggle("is-active", swatch.dataset.color === draft.color);
    });
    const custom = header.querySelector(".column-color-custom input");
    if (custom && custom.value !== draft.color) custom.value = draft.color;
  }

  function placeColumnPalette(anchor, pop) {
    const rect = anchor.getBoundingClientRect();
    const width = pop.offsetWidth || 148;
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    pop.style.top = `${Math.round(rect.bottom + 6)}px`;
    pop.style.left = `${Math.round(Math.max(8, left))}px`;
  }

  function renderColumnHeader(column, visibleCount, points) {
    const view = columnView(column);
    const editing = columnEditor?.key === column.key;
    const header = document.createElement("header");
    header.className = `column-header${view.description && !editing ? " has-description" : ""}${editing ? " is-editing" : ""}`;

    if (!editing) {
      header.tabIndex = 0;
      header.setAttribute("role", "button");
      header.setAttribute("aria-label", `Editar seção ${view.title}`);
      header.innerHTML = `
        <div class="column-heading">
          <div class="column-title-wrap">
            <span class="column-dot" style="background:${view.color}"></span>
            <span class="column-title">${escapeHTML(view.title)}</span>
            <span class="column-count">${visibleCount}</span>
          </div>
          ${view.description ? `<p class="column-description">${escapeHTML(view.description)}</p>` : ""}
        </div>
        <span class="column-points">${points} pts</span>
      `;
      const open = () => beginColumnEdit(column.key);
      header.addEventListener("click", open);
      header.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open();
      });
      return header;
    }

    const draft = columnEditor;
    header.innerHTML = `
      <div class="column-edit">
        <div class="column-edit-top">
          <button class="column-dot-btn" type="button" aria-label="Trocar cor da seção" aria-expanded="${columnPaletteOpen ? "true" : "false"}" style="background:${draft.color}"></button>
          <input class="column-name-input" type="text" maxlength="48" aria-label="Nome da seção" value="${escapeHTML(draft.title)}" autocomplete="off" spellcheck="false">
          <span class="column-count">${visibleCount}</span>
          <span class="column-points">${points} pts</span>
        </div>
        <input class="column-description-input" type="text" maxlength="180" aria-label="Descrição da seção" placeholder="Adicionar descrição" value="${escapeHTML(draft.description)}" autocomplete="off">
        <div class="column-color-pop" ${columnPaletteOpen ? "" : "hidden"}>
          ${COLUMN_PALETTE.map(color => `
            <button class="column-color-swatch${color === draft.color ? " is-active" : ""}" type="button" data-color="${color}" style="background:${color}" aria-label="Usar cor ${color}"></button>
          `).join("")}
          <label class="column-color-custom">
            <input type="color" value="${draft.color}" aria-label="Cor personalizada">
            Personalizar
          </label>
        </div>
      </div>
    `;

    const nameInput = header.querySelector(".column-name-input");
    const descriptionInput = header.querySelector(".column-description-input");
    const dotButton = header.querySelector(".column-dot-btn");
    const pop = header.querySelector(".column-color-pop");

    nameInput.addEventListener("input", () => { draft.title = nameInput.value; });
    descriptionInput.addEventListener("input", () => { draft.description = descriptionInput.value; });
    header.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitColumnEdit();
    });
    dotButton.addEventListener("click", event => {
      event.preventDefault();
      columnPaletteOpen = !columnPaletteOpen;
      pop.hidden = !columnPaletteOpen;
      dotButton.setAttribute("aria-expanded", columnPaletteOpen ? "true" : "false");
      if (columnPaletteOpen) placeColumnPalette(dotButton, pop);
    });
    header.querySelectorAll(".column-color-swatch").forEach(swatch => {
      swatch.addEventListener("click", event => {
        event.preventDefault();
        applyColumnDraftColor(draft, swatch.dataset.color, dotButton, header);
        columnPaletteOpen = false;
        pop.hidden = true;
        dotButton.setAttribute("aria-expanded", "false");
        nameInput.focus();
      });
    });
    header.querySelector(".column-color-custom input").addEventListener("input", event => {
      applyColumnDraftColor(draft, event.target.value, dotButton, header);
    });

    return header;
  }

  function renderBoard(options = {}) {
    const filters = getFilters();
    board.innerHTML = "";

    COLUMNS.forEach(column => {
      const all = cards.filter(card => card.status === column.key);
      const visible = all.filter(card => cardMatches(card, filters));
      const points = visible.reduce((sum, card) => sum + cardPoints(card), 0);

      const section = document.createElement("section");
      section.className = "column";
      section.appendChild(renderColumnHeader(column, visible.length, points));
      const list = document.createElement("div");
      list.className = "column-list";
      list.dataset.status = column.key;
      section.appendChild(list);

      if (!visible.length) {
        list.innerHTML = `<div class="empty-column">${all.length ? "Nenhuma tarefa com esses filtros" : "Arraste uma tarefa para cá"}</div>`;
      } else {
        visible.forEach(card => list.appendChild(renderCard(card)));
      }

      list.addEventListener("dragover", event => {
        event.preventDefault();
        list.classList.add("drag-over");
      });

      list.addEventListener("dragleave", event => {
        if (!list.contains(event.relatedTarget)) list.classList.remove("drag-over");
      });

      list.addEventListener("drop", event => {
        event.preventDefault();
        list.classList.remove("drag-over");
        const id = event.dataTransfer.getData("text/plain");
        moveCard(id, column.key);
      });

      board.appendChild(section);
    });

    if (options.focusColumnEditor && columnEditor) {
      const input = board.querySelector(".column-header.is-editing .column-name-input");
      if (input) {
        input.focus();
        input.select();
      }
    }

    renderStats();
  }

  function renderCard(card) {
    const element = document.createElement("article");
    element.className = `task-card${card.variant === "strategy" ? " strategy-card" : ""}`;
    element.draggable = true;
    element.dataset.id = card.id;

    element.innerHTML = `
      ${card.variant === "strategy" ? '<div class="strategy-label">NORTE DO PRODUTO</div>' : ""}
      <div class="card-line">
        <span class="priority-pin ${card.priority}" title="${PRIORITIES[card.priority].label}"></span>
        <div class="card-copy">
          <h3>${escapeHTML(card.title)}</h3>
          ${renderCardSubtitle(card)}
        </div>
        <div class="card-menu-wrap">
          <button class="card-menu-btn" type="button" aria-label="Ações">⋮</button>
          <div class="card-menu" hidden>
            <button type="button" data-action="open">Abrir</button>
            <button type="button" data-action="next">Mover adiante</button>
            <button type="button" data-action="duplicate">Duplicar</button>
            <button type="button" class="danger" data-action="delete">Excluir</button>
          </div>
        </div>
      </div>
      <div class="card-meta">
        <span class="assignee-text">${escapeHTML(card.assignee)}</span>
        <span class="card-right">
          ${renderCardTags(card)}
          <span class="points-text">${cardPoints(card)} pts</span>
        </span>
      </div>
    `;

    const menu = element.querySelector(".card-menu");
    const menuButton = element.querySelector(".card-menu-btn");

    element.addEventListener("click", event => {
      if (event.target.closest(".card-menu-wrap")) return;
      openCard(card.id);
    });

    menuButton.addEventListener("click", event => {
      event.stopPropagation();
      document.querySelectorAll(".card-menu").forEach(other => {
        if (other !== menu) other.hidden = true;
      });
      menu.hidden = !menu.hidden;
    });

    menu.addEventListener("click", event => {
      event.stopPropagation();
      const action = event.target.dataset.action;
      if (!action) return;
      menu.hidden = true;
      if (action === "open") openCard(card.id);
      if (action === "next") moveNext(card.id);
      if (action === "duplicate") duplicateCard(card.id);
      if (action === "delete") deleteCard(card.id);
    });

    element.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", card.id);
      event.dataTransfer.effectAllowed = "move";
      requestAnimationFrame(() => element.classList.add("dragging"));
    });

    element.addEventListener("dragend", () => element.classList.remove("dragging"));

    return element;
  }

  function cardText(card) {
    const description = String(card?.description || "").trim();
    const notes = String(card?.notes || "").trim();
    if (!notes || description.includes(notes)) return description;
    if (!description) return notes;
    return `${description}\n\n${notes}`;
  }

  function renderCardSubtitle(card) {
    const text = cardText(card).replace(/\s+/g, " ").trim();
    if (!text) return "";
    return `<p class="card-subtitle" title="${escapeHTML(text)}">${escapeHTML(text)}</p>`;
  }

  function renderCardTags(card) {
    const tags = cardTags(card);
    if (!tags.length) return "";
    const label = tags.join(" · ");
    return `<span class="card-tags" title="${escapeHTML(label)}">
      <svg class="tag-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.4 3h4.7l6.3 6.2-4.4 4.4L2.4 7.5V3z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="5.2" cy="5.7" r=".8" fill="currentColor"/></svg>
      <span>${escapeHTML(label)}</span>
    </span>`;
  }

  function renderStats() {
    const visibleCount = cards.filter(card => cardMatches(card, getFilters())).length;
    const totalPoints = cards.reduce((sum, card) => sum + cardPoints(card), 0);
    const done = cards.filter(card => card.status === "done").length;
    $("#boardSummary").textContent = `${visibleCount} tarefas · ${totalPoints} pts · ${done} concluídas`;
  }

  function moveCard(id, status) {
    const card = cards.find(item => item.id === id);
    if (!card || card.status === status) return;
    card.status = status;
    if (status === "done") {
      card.subcards = (card.subcards || []).map(sub => ({ ...sub, status: "done", checklist: (sub.checklist || []).map(item => ({ ...item, done: true })) }));
      card.checklist = (card.checklist || []).map(item => ({ ...item, done: true }));
    }
    persist();
    renderBoard();
    const target = columnByKey(status);
    toast(`Tarefa movida para ${target ? columnView(target).title : status}.`);
  }

  function moveNext(id) {
    const card = cards.find(item => item.id === id);
    if (!card) return;
    const index = COLUMNS.findIndex(column => column.key === card.status);
    if (index < 0 || index >= COLUMNS.length - 1) return toast("Essa tarefa já está na última coluna.");
    moveCard(id, COLUMNS[index + 1].key);
  }

  function duplicateCard(id) {
    const original = cards.find(item => item.id === id);
    if (!original) return;
    const copy = typeof structuredClone === "function" ? structuredClone(original) : JSON.parse(JSON.stringify(original));
    copy.id = uid();
    copy.title = `${copy.title} — cópia`;
    copy.status = "planned";
    copy.comments = (copy.comments || []).map(comment => ({ ...comment, id: uid() }));
    copy.checklist = (copy.checklist || []).map(item => ({ ...item, id: uid(), done: false, comments: [] }));
    copy.subcards = (copy.subcards || []).map(sub => ({
      ...sub,
      id: uid(),
      status: "planned",
      checklist: (sub.checklist || []).map(item => ({ ...item, id: uid(), done: false, comments: [] }))
    }));
    cards.push(copy);
    persist();
    renderBoard();
    toast("Tarefa duplicada.");
  }

  function deleteCard(id) {
    const card = cards.find(item => item.id === id);
    if (!card) return;
    if (!confirm(`Excluir “${card.title}”?`)) return;
    cards = cards.filter(item => item.id !== id);
    persist();
    if (activeCardId === id) closeCardModal();
    renderBoard();
    toast("Tarefa excluída.");
  }

  function knownTags() {
    const tags = [];
    cards.forEach(card => {
      cardTags(card).forEach(tag => {
        if (!tags.some(item => item.toLowerCase() === tag.toLowerCase())) tags.push(tag);
      });
    });
    return tags.sort((a, b) => a.localeCompare(b, "pt"));
  }

  function addWorkingTag(text) {
    if (!workingCard) return false;
    const clean = String(text || "").replace(/\s+/g, " ").trim().slice(0, 40);
    if (!clean || clean.toLowerCase() === "geral") return false;
    if (!Array.isArray(workingCard.tags)) workingCard.tags = cardTags(workingCard);
    const known = knownTags().find(tag => tag.toLowerCase() === clean.toLowerCase());
    const next = known || clean;
    if (workingCard.tags.some(tag => tag.toLowerCase() === next.toLowerCase())) return false;
    if (workingCard.tags.length >= 6) {
      toast("Essa tarefa já tem 6 tags.");
      return false;
    }
    workingCard.tags.push(next);
    return true;
  }

  function commitTagInput() {
    const input = $("#tagInput");
    if (!input) return;
    const text = input.value;
    if (!text.trim()) return;
    input.value = "";
    addWorkingTag(text);
  }

  function availableTags() {
    const current = Array.isArray(workingCard?.tags) ? workingCard.tags : [];
    const query = normalize($("#tagInput")?.value || "");
    return knownTags().filter(tag => {
      if (current.some(item => item.toLowerCase() === tag.toLowerCase())) return false;
      return !query || normalize(tag).includes(query);
    });
  }

  let tagMenuOpen = false;
  let ignoreTagMenuClose = false;
  let pendingTagDelete = "";

  function hideTagMenu() {
    tagMenuOpen = false;
    const menu = $("#tagMenu");
    if (menu) {
      menu.hidden = true;
      menu.innerHTML = "";
    }
    $("#tagInput")?.setAttribute("aria-expanded", "false");
  }

  function renderTagMenu() {
    const menu = $("#tagMenu");
    const input = $("#tagInput");
    if (!menu || !workingCard) return;
    const tags = availableTags();
    if (!tagMenuOpen || !tags.length) {
      menu.innerHTML = "";
      menu.hidden = true;
      input?.setAttribute("aria-expanded", "false");
      return;
    }
    menu.innerHTML = tags.map(tag => `
      <div class="tag-option">
        <button type="button" class="tag-option-label" data-add-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>
        <button type="button" class="tag-remove" data-remove-tag="${escapeHTML(tag)}" aria-label="Remover tag ${escapeHTML(tag)} do programa">×</button>
      </div>
    `).join("");
    menu.hidden = false;
    input?.setAttribute("aria-expanded", "true");
  }

  function stripTag(card, tag) {
    const next = cardTags(card).filter(item => item.toLowerCase() !== tag.toLowerCase());
    card.tags = next;
    card.epic = next.join(" / ");
  }

  function closeTagDeleteConfirm() {
    pendingTagDelete = "";
    const dialog = $("#tagDeleteConfirm");
    if (dialog) dialog.hidden = true;
  }

  function askRemoveKnownTag(tag) {
    pendingTagDelete = tag;
    const text = $("#tagDeleteText");
    if (text) text.textContent = `Remover a tag “${tag}” do programa? Ela sai de todas as tarefas.`;
    const dialog = $("#tagDeleteConfirm");
    if (dialog) dialog.hidden = false;
    $("#tagDeleteCancel")?.focus();
  }

  function confirmRemoveKnownTag() {
    const tag = pendingTagDelete;
    if (!tag) return;
    closeTagDeleteConfirm();
    cards.forEach(card => stripTag(card, tag));
    if (workingCard) stripTag(workingCard, tag);
    persist();
    renderBoard();
    renderTagEditor();
    $("#tagInput")?.focus();
  }

  function renderTagEditor() {
    if (!workingCard) return;
    if (!Array.isArray(workingCard.tags)) workingCard.tags = cardTags(workingCard);
    const list = $("#tagList");
    list.innerHTML = "";
    workingCard.tags.forEach(tag => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.innerHTML = `<span>${escapeHTML(tag)}</span><button type="button" class="tag-remove" aria-label="Remover tag ${escapeHTML(tag)} desta tarefa">×</button>`;
      chip.querySelector("button").addEventListener("click", () => {
        workingCard.tags = workingCard.tags.filter(item => item.toLowerCase() !== tag.toLowerCase());
        renderTagEditor();
      });
      list.appendChild(chip);
    });
    renderTagMenu();
  }

  function openCard(id) {
    const card = cards.find(item => item.id === id);
    if (!card) return;

    activeCardId = id;
    workingCard = JSON.parse(JSON.stringify(card));
    workingCard.tags = cardTags(workingCard);

    const kicker = $("#modalEpic");
    if (kicker) kicker.hidden = true;
    const tagInput = $("#tagInput");
    if (tagInput) tagInput.value = "";
    renderTagEditor();
    showCardTitle(workingCard.title || "Detalhes da tarefa");
    fillStatusOptions(workingCard.status || "planned");
    $("#editAssignee").value = workingCard.assignee || "Adriel";
    $("#editPriority").value = workingCard.priority || "medium";
    paintCardPriority();
    $("#editPoints").value = String(workingCard.points || 3);
    $("#editDescription").value = cardText(workingCard);
    closeDescriptionEditor(true);

    renderSubcardsEditor();
    const commentInput = $("#cardCommentInput");
    if (commentInput) commentInput.value = "";
    renderCardComments();

    cardModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function fillStatusOptions(status) {
    const select = $("#editStatus");
    if (!select) return;
    select.innerHTML = COLUMNS.map(column => {
      const view = columnView(column);
      return `<option value="${column.key}">${escapeHTML(view.title)}</option>`;
    }).join("");
    select.value = COLUMNS.some(column => column.key === status) ? status : "planned";
    paintCardStatus();
  }

  function paintCardStatus() {
    const select = $("#editStatus");
    const column = columnByKey(select?.value);
    const color = column ? columnView(column).color : "#7863c9";
    select?.closest(".modal-status")?.style.setProperty("color", color);
  }

  function paintCardPriority() {
    const pin = $("#modalPriorityPin");
    if (!pin) return;
    const priority = $("#editPriority")?.value || "medium";
    pin.className = `priority-pin ${priority}`;
    pin.title = PRIORITIES[priority]?.label || "";
  }

  function showCardTitle(text) {
    const title = $("#modalTitle");
    const input = $("#editTitle");
    cardTitleEditing = false;
    ignoreCardTitleClick = false;
    if (title) {
      title.hidden = false;
      title.textContent = text;
    }
    if (input) {
      input.hidden = true;
      input.value = text === "Detalhes da tarefa" ? "" : text;
    }
  }

  function beginCardTitleEdit() {
    if (cardModal.hidden || !workingCard || cardTitleEditing) return;
    const title = $("#modalTitle");
    const input = $("#editTitle");
    cardTitleEditing = true;
    input.value = workingCard.title || "";
    title.hidden = true;
    input.hidden = false;
    input.focus();
    input.select();
  }

  function commitCardTitleEdit() {
    if (!cardTitleEditing) return;
    const input = $("#editTitle");
    const next = input.value.replace(/\s+/g, " ").trim().slice(0, 240);
    if (workingCard && next) workingCard.title = next;
    showCardTitle(workingCard?.title || "Detalhes da tarefa");
  }

  function cancelCardTitleEdit() {
    if (!cardTitleEditing) return;
    showCardTitle(workingCard?.title || "Detalhes da tarefa");
  }

  function paintDescriptionPreview() {
    const preview = $("#descriptionPreview");
    if (!preview) return;
    const value = $("#editDescription")?.value.trim() || "";
    preview.textContent = value || "Adicionar descrição";
    preview.classList.toggle("is-empty", !value);
  }

  function openDescriptionEditor() {
    if (descriptionEditing || cardModal.hidden) return;
    descriptionEditing = true;
    descriptionSnapshot = $("#editDescription").value;
    $("#descriptionPreview").hidden = true;
    $("#descriptionEditor").hidden = false;
    const area = $("#editDescription");
    area.focus();
    const end = area.value.length;
    area.setSelectionRange(end, end);
  }

  function closeDescriptionEditor(save) {
    const area = $("#editDescription");
    if (area && !save) area.value = descriptionSnapshot;
    descriptionEditing = false;
    const editor = $("#descriptionEditor");
    const preview = $("#descriptionPreview");
    if (editor) editor.hidden = true;
    if (preview) preview.hidden = false;
    paintDescriptionPreview();
  }

  function closeCardModal() {
    closeDescriptionEditor(false);
    showCardTitle($("#modalTitle")?.textContent || "Detalhes da tarefa");
    cardModal.hidden = true;
    activeCardId = null;
    workingCard = null;
    hideTagMenu();
    closeTagDeleteConfirm();
    document.body.style.overflow = "";
  }

  function syncFields() {
    if (!workingCard) return;
    if (cardTitleEditing) {
      const next = $("#editTitle").value.replace(/\s+/g, " ").trim().slice(0, 240);
      if (next) workingCard.title = next;
    }
    commitTagInput();
    workingCard.tags = cardTags(workingCard);
    workingCard.epic = workingCard.tags.join(" / ");
    workingCard.assignee = $("#editAssignee").value;
    workingCard.priority = $("#editPriority").value;
    workingCard.points = Number($("#editPoints").value);
    workingCard.status = $("#editStatus").value;
    workingCard.description = $("#editDescription").value.trim();
    workingCard.notes = "";
  }

  function saveCard({ complete = false } = {}) {
    if (!workingCard || !activeCardId) return;
    syncFields();

    if (!workingCard.title) {
      toast("Informe um título para a tarefa.");
      if (!cardTitleEditing) beginCardTitleEdit();
      else $("#editTitle").focus();
      return;
    }
    if (cardTitleEditing) showCardTitle(workingCard.title);

    if (complete) {
      workingCard.status = "done";
      workingCard.checklist = (workingCard.checklist || []).map(item => ({ ...item, done: true }));
      workingCard.subcards = (workingCard.subcards || []).map(sub => ({
        ...sub,
        status: "done",
        checklist: (sub.checklist || []).map(item => ({ ...item, done: true }))
      }));
    }

    const index = cards.findIndex(item => item.id === activeCardId);
    if (index < 0) return;
    cards[index] = sanitizeCard(workingCard);
    persist();
    closeCardModal();
    renderBoard();
    toast(complete ? "Tarefa concluída." : "Alterações salvas.");
  }

  function renderSubcardsEditor() {
    const container = $("#subcardsContainer");
    container.innerHTML = "";
    if (!workingCard) return;
    if (!Array.isArray(workingCard.subcards)) workingCard.subcards = [];

    const subCount = $("#subcardSummaryCount");
    if (subCount) {
      const done = workingCard.subcards.filter(sub => sub.status === "done").length;
      subCount.textContent = workingCard.subcards.length ? `${done}/${workingCard.subcards.length}` : "";
    }

    workingCard.subcards.forEach(sub => {
      const fragment = $("#subcardTemplate").content.cloneNode(true);
      const root = fragment.querySelector(".subtask");
      const check = fragment.querySelector(".subtask-check");
      const title = fragment.querySelector(".subtask-title");
      const subtitle = fragment.querySelector(".subtask-subtitle");
      const list = fragment.querySelector(".subcard-checklist");
      root.dataset.id = sub.id;

      title.value = sub.title || "";
      subtitle.value = sub.description || "";
      if (sub.status === "done") root.classList.add("done");

      title.addEventListener("input", () => { sub.title = title.value; });
      subtitle.addEventListener("input", () => { sub.description = subtitle.value; });
      check.addEventListener("click", () => {
        sub.status = sub.status === "done" ? "planned" : "done";
        renderSubcardsEditor();
      });

      fragment.querySelector(".remove-subcard").addEventListener("click", () => {
        workingCard.subcards = workingCard.subcards.filter(item => item.id !== sub.id);
        renderSubcardsEditor();
      });

      fragment.querySelector(".add-subcard-check").addEventListener("click", () => {
        if (!Array.isArray(sub.checklist)) sub.checklist = [];
        sub.checklist.push(makeCheck(""));
        renderSubcardsEditor();
        const row = $("#subcardsContainer").querySelector(`[data-id="${sub.id}"]`);
        const fields = row?.querySelectorAll(".check-text");
        const last = fields?.[fields.length - 1];
        if (last) {
          last.focus();
          last.select();
        }
      });

      renderCheckList(sub.checklist, list, () => renderSubcardsEditor());
      container.appendChild(fragment);
    });
  }

  function addSubcard() {
    if (!workingCard) return;
    if (!Array.isArray(workingCard.subcards)) workingCard.subcards = [];
    workingCard.subcards.push(makeSubcard(
      "",
      workingCard.assignee || "Adriel",
      1,
      "",
      "planned",
      []
    ));
    const fold = $("#subtasksFold");
    if (fold) fold.open = true;
    renderSubcardsEditor();

    const rows = $("#subcardsContainer").querySelectorAll(".subtask");
    const input = rows[rows.length - 1]?.querySelector(".subtask-title");
    if (input) {
      input.focus();
    }
  }

  function commentAuthor() {
    const user = window.ORCAH_ACCESS_USER;
    if (user === "Adriel" || user === "Cesar") return user;
    return workingCard?.assignee || "Equipe";
  }

  function renderCardComments() {
    const list = $("#cardCommentList");
    if (!list || !workingCard) return;
    if (!Array.isArray(workingCard.comments)) workingCard.comments = [];
    list.innerHTML = "";
    workingCard.comments.forEach(comment => {
      const node = document.createElement("div");
      node.className = "card-comment";
      node.innerHTML = `<strong>${escapeHTML(comment.author || "Equipe")}</strong><p>${escapeHTML(comment.text)}</p>`;
      list.appendChild(node);
    });
  }

  function addCardComment() {
    const input = $("#cardCommentInput");
    if (!workingCard || !input) return;
    const text = input.value.trim();
    if (!text) return;
    if (!Array.isArray(workingCard.comments)) workingCard.comments = [];
    workingCard.comments.push({
      id: uid(),
      text,
      author: commentAuthor(),
      at: new Date().toISOString()
    });
    input.value = "";
    renderCardComments();
  }

  function renderCheckList(list, container, rerender) {
    container.innerHTML = "";
    if (!Array.isArray(list)) return;

    list.forEach(item => {
      const fragment = $("#checkItemTemplate").content.cloneNode(true);
      const root = fragment.querySelector(".check-item");
      const toggle = fragment.querySelector(".check-toggle");
      const text = fragment.querySelector(".check-text");
      const remove = fragment.querySelector(".remove-check");

      if (item.done) root.classList.add("done");
      text.value = item.text || "";

      toggle.addEventListener("click", () => {
        item.done = !item.done;
        rerender();
      });

      text.addEventListener("input", () => { item.text = text.value; });

      remove.addEventListener("click", () => {
        const index = list.findIndex(check => check.id === item.id);
        if (index >= 0) list.splice(index, 1);
        rerender();
      });

      container.appendChild(fragment);
    });
  }

  function openNewCardModal() {
    $("#newCardForm").reset();
    const assignee = $("#newCardForm select[name='assignee']");
    if (assignee && (window.ORCAH_ACCESS_USER === "Adriel" || window.ORCAH_ACCESS_USER === "Cesar")) {
      assignee.value = window.ORCAH_ACCESS_USER;
    }
    newCardModal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#newCardForm input[name='title']").focus(), 20);
  }

  function closeNewCardModal() {
    newCardModal.hidden = true;
    document.body.style.overflow = "";
  }

  function createCard(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const card = sanitizeCard({
      id: uid(),
      title: form.get("title"),
      epic: "",
      tags: [],
      assignee: form.get("assignee") || window.ORCAH_ACCESS_USER || "Adriel",
      priority: form.get("priority") || "medium",
      points: Number(form.get("points") || 3),
      status: form.get("status") || "backlog",
      description: String(form.get("description") || ""),
      notes: "",
      subcards: [],
      checklist: []
    });

    cards.push(card);
    persist();
    closeNewCardModal();
    renderBoard();
    toast("Nova tarefa criada.");
  }

  function exportBoard() {
    const payload = {
      product: "ORÇAH",
      version: 3,
      exportedAt: new Date().toISOString(),
      cards,
      columns: columnDocument()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `operacao-orcah-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast("Kanban exportado.");
  }

  function importBoard(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const list = Array.isArray(parsed) ? parsed : parsed.cards;
        if (!Array.isArray(list)) throw new Error("Formato inválido");
        cards = list.map(sanitizeCard);
        persist();
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.columns) {
          const nextColumns = readColumnDocument(parsed.columns);
          if (nextColumns) {
            columnMeta = nextColumns;
            columnEditor = null;
            columnPaletteOpen = false;
            persistColumns();
          }
        }
        renderBoard();
        toast("Kanban importado.");
      } catch {
        toast("Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  }

  function toast(message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    $("#toastRegion").appendChild(node);
    setTimeout(() => node.remove(), 2500);
  }

  function closeMenus() {
    document.querySelectorAll(".card-menu").forEach(menu => { menu.hidden = true; });
    const topMenu = $("#topMenu");
    if (topMenu) topMenu.hidden = true;
  }


  let currentView = "kanban";
  let mindTool = "select";
  let selectedMindId = null;
  let connectorStartId = null;
  let mindInteraction = null;

  function loadMind() {
    try {
      const raw = localStorage.getItem(MIND_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return {
            zoom: Number(parsed.zoom || 1),
            panX: Number(parsed.panX ?? 120),
            panY: Number(parsed.panY ?? 80),
            elements: Array.isArray(parsed.elements) ? parsed.elements : [],
            connectors: Array.isArray(parsed.connectors) ? parsed.connectors : [],
            drawings: Array.isArray(parsed.drawings) ? parsed.drawings : []
          };
        }
      }
    } catch {}
    return { zoom: 1, panX: 120, panY: 80, elements: [], connectors: [], drawings: [] };
  }

  let mindState = loadMind();

  function persistMind() {
    localStorage.setItem(MIND_KEY, JSON.stringify(mindState));
    if (!suppressSharedEvents) {
      window.dispatchEvent(new CustomEvent("orcah:shared-change", { detail: { document: "mindmap" } }));
    }
  }

  function setView(view) {
    currentView = view;
    try {
      const current = JSON.parse(localStorage.getItem(UI_STATE_KEY) || "{}");
      localStorage.setItem(UI_STATE_KEY, JSON.stringify({ ...current, mainView: view }));
    } catch {}
    const isKanban = view === "kanban";
    $("#kanbanView").hidden = !isKanban;
    $("#mindmapView").hidden = isKanban;
    $("#kanbanSearch").hidden = !isKanban;
    ["#assigneeFilter","#priorityFilter","#clearFiltersBtn","#newCardBtn","#moreButton"].forEach(selector => {
      const node = $(selector);
      if (node) node.hidden = !isKanban;
    });
    document.querySelectorAll(".view-tab").forEach(button => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    if (!isKanban) {
      closeMenus();
      renderMind();
      requestAnimationFrame(() => $("#mindViewport")?.focus());
    }
  }

  function setMindTool(tool) {
    mindTool = tool;
    connectorStartId = null;
    document.querySelectorAll(".mind-tool").forEach(button => {
      button.classList.toggle("active", button.dataset.mindTool === tool);
    });
    const viewport = $("#mindViewport");
    if (!viewport) return;
    viewport.classList.remove("tool-hand","tool-draw","tool-eraser");
    if (tool === "hand") viewport.classList.add("tool-hand");
    if (tool === "draw") viewport.classList.add("tool-draw");
    if (tool === "eraser") viewport.classList.add("tool-eraser");
  }

  function applyMindTransform() {
    const world = $("#mindWorld");
    if (!world) return;
    world.style.transform = `translate(${mindState.panX}px, ${mindState.panY}px) scale(${mindState.zoom})`;
    $("#zoomLabel").textContent = `${Math.round(mindState.zoom * 100)}%`;
  }

  function worldPoint(clientX, clientY) {
    const rect = $("#mindViewport").getBoundingClientRect();
    return {
      x: (clientX - rect.left - mindState.panX) / mindState.zoom,
      y: (clientY - rect.top - mindState.panY) / mindState.zoom
    };
  }

  function mindCenterPoint() {
    const rect = $("#mindViewport").getBoundingClientRect();
    return {
      x: (rect.width / 2 - mindState.panX) / mindState.zoom,
      y: (rect.height / 2 - mindState.panY) / mindState.zoom
    };
  }

  function addMindElement(type, options = {}) {
    const center = mindCenterPoint();
    const defaults = {
      note: { w: 220, h: 120, text: "Nova ideia" },
      text: { w: 210, h: 54, text: "Novo texto" },
      frame: { w: 520, h: 340, text: "Novo frame" }
    };
    const base = defaults[type] || defaults.note;
    const element = {
      id: uid(),
      type,
      x: Number(options.x ?? center.x - base.w / 2),
      y: Number(options.y ?? center.y - base.h / 2),
      w: Number(options.w ?? base.w),
      h: Number(options.h ?? base.h),
      text: String(options.text ?? base.text),
      src: options.src || "",
      templateKind: options.templateKind || ""
    };
    mindState.elements.push(element);
    selectedMindId = element.id;
    persistMind();
    renderMind();
    return element;
  }

  function templateMarkup(kind) {
    if (kind === "mobile") {
      return `<div class="wf-phone"><div class="wf-phone-bar"></div><div class="wf-phone-body">
        <div class="wf-line sm"></div><div class="wf-line md"></div><div class="wf-box"></div><div class="wf-box"></div><div class="wf-button"></div>
      </div></div>`;
    }

    const configs = {
      login: ["Login", false, 1],
      dashboard: ["Dashboard", true, 3],
      list: ["Lista", true, 4],
      form: ["Formulário", false, 4],
      client: ["Cliente", true, 3],
      budget: ["Orçamento", true, 4],
      public: ["Página pública", false, 3]
    };
    const [title, sidebar, boxes] = configs[kind] || ["Tela", true, 3];
    return `<div class="wireframe">
      <div class="wf-top"><span class="wf-dot"></span><span class="wf-dot"></span><span class="wf-dot"></span><strong style="font-size:8px;margin-left:4px">${title}</strong></div>
      <div class="wf-body" style="${sidebar ? "" : "grid-template-columns:1fr"}">
        ${sidebar ? '<div class="wf-side"></div>' : ""}
        <div class="wf-main">
          <div class="wf-line sm"></div><div class="wf-line md"></div>
          <div class="wf-row">${Array.from({length:Math.min(3,boxes)},()=>'<div class="wf-box"></div>').join("")}</div>
          ${boxes > 3 ? '<div class="wf-box"></div>' : ""}
          <div class="wf-button"></div>
        </div>
      </div>
    </div>`;
  }

  function addMindTemplate(kind) {
    const sizes = {
      login: [360,260], dashboard:[520,330], list:[520,320], form:[420,330],
      client:[500,330], budget:[540,360], public:[430,340], mobile:[220,420]
    };
    const [w,h] = sizes[kind] || [480,320];
    addMindElement("template", { w, h, text: kind, templateKind: kind });
  }

  function renderMind() {
    const elementsLayer = $("#mindElements");
    const svg = $("#mindSvg");
    if (!elementsLayer || !svg) return;

    elementsLayer.innerHTML = "";
    svg.innerHTML = "";

    mindState.drawings.forEach(drawing => {
      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("class","mind-drawing");
      path.setAttribute("d", drawing.d || "");
      svg.appendChild(path);
    });

    mindState.connectors.forEach(connector => {
      const from = mindState.elements.find(item => item.id === connector.from);
      const to = mindState.elements.find(item => item.id === connector.to);
      if (!from || !to) return;
      const line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("class","mind-connector");
      line.setAttribute("x1", from.x + from.w / 2);
      line.setAttribute("y1", from.y + from.h / 2);
      line.setAttribute("x2", to.x + to.w / 2);
      line.setAttribute("y2", to.y + to.h / 2);
      svg.appendChild(line);
    });

    mindState.elements.forEach(element => {
      const node = document.createElement("article");
      node.className = `mind-node ${element.type}${selectedMindId === element.id ? " selected" : ""}`;
      node.dataset.id = element.id;
      node.style.left = `${element.x}px`;
      node.style.top = `${element.y}px`;
      node.style.width = `${element.w}px`;
      node.style.height = `${element.h}px`;

      if (element.type === "image") {
        const image = document.createElement("img");
        image.src = element.src;
        image.alt = element.text || "Imagem";
        node.appendChild(image);
      } else if (element.type === "template") {
        node.innerHTML = templateMarkup(element.templateKind);
      } else {
        const content = document.createElement("div");
        content.className = "mind-node-content";
        content.textContent = element.text;
        content.contentEditable = "false";
        content.spellcheck = false;
        content.addEventListener("dblclick", event => {
          event.stopPropagation();
          content.contentEditable = "true";
          content.focus();
          const range = document.createRange();
          range.selectNodeContents(content);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        });
        content.addEventListener("blur", () => {
          content.contentEditable = "false";
          element.text = content.textContent.trim() || "Sem título";
          persistMind();
        });
        node.appendChild(content);
      }

      const deleteButton = document.createElement("button");
      deleteButton.className = "mind-delete";
      deleteButton.type = "button";
      deleteButton.textContent = "×";
      deleteButton.addEventListener("pointerdown", event => event.stopPropagation());
      deleteButton.addEventListener("click", event => {
        event.stopPropagation();
        deleteMindElement(element.id);
      });
      node.appendChild(deleteButton);

      const resize = document.createElement("span");
      resize.className = "mind-resize";
      resize.addEventListener("pointerdown", event => startMindResize(event, element.id));
      node.appendChild(resize);

      node.addEventListener("pointerdown", event => startMindNodePointer(event, element.id));
      node.addEventListener("click", event => {
        event.stopPropagation();
        if (mindTool === "eraser") {
          deleteMindElement(element.id);
          return;
        }
        if (mindTool === "connector") {
          handleConnectorClick(element.id);
          return;
        }
        selectedMindId = element.id;
        renderMind();
      });

      elementsLayer.appendChild(node);
    });

    $("#mindEmpty").classList.toggle("hidden", mindState.elements.length > 0 || mindState.drawings.length > 0);
    applyMindTransform();
  }

  function startMindNodePointer(event, id) {
    if (event.button !== 0 || event.target.closest(".mind-resize") || event.target.closest(".mind-delete")) return;
    if (mindTool === "connector") return;
    if (mindTool !== "select") return;
    const element = mindState.elements.find(item => item.id === id);
    if (!element) return;
    selectedMindId = id;
    const start = worldPoint(event.clientX,event.clientY);
    mindInteraction = {
      type:"drag",
      id,
      startX:start.x,
      startY:start.y,
      originX:element.x,
      originY:element.y
    };
    event.preventDefault();
  }

  function startMindResize(event, id) {
    const element = mindState.elements.find(item => item.id === id);
    if (!element) return;
    selectedMindId = id;
    const start = worldPoint(event.clientX,event.clientY);
    mindInteraction = {
      type:"resize",
      id,
      startX:start.x,
      startY:start.y,
      originW:element.w,
      originH:element.h
    };
    event.preventDefault();
    event.stopPropagation();
  }

  function deleteMindElement(id) {
    mindState.elements = mindState.elements.filter(item => item.id !== id);
    mindState.connectors = mindState.connectors.filter(item => item.from !== id && item.to !== id);
    if (selectedMindId === id) selectedMindId = null;
    persistMind();
    renderMind();
  }

  function handleConnectorClick(id) {
    if (!connectorStartId) {
      connectorStartId = id;
      selectedMindId = id;
      renderMind();
      toast("Selecione o segundo bloco.");
      return;
    }
    if (connectorStartId === id) {
      connectorStartId = null;
      return;
    }
    const exists = mindState.connectors.some(item =>
      (item.from === connectorStartId && item.to === id) ||
      (item.from === id && item.to === connectorStartId)
    );
    if (!exists) mindState.connectors.push({ id:uid(), from:connectorStartId, to:id });
    connectorStartId = null;
    persistMind();
    renderMind();
  }

  function zoomMind(delta, anchorClientX = null, anchorClientY = null) {
    const viewport = $("#mindViewport");
    const rect = viewport.getBoundingClientRect();
    const ax = anchorClientX ?? rect.left + rect.width / 2;
    const ay = anchorClientY ?? rect.top + rect.height / 2;
    const before = worldPoint(ax,ay);
    const next = Math.min(2.2, Math.max(.35, mindState.zoom + delta));
    if (next === mindState.zoom) return;
    mindState.zoom = next;
    mindState.panX = ax - rect.left - before.x * next;
    mindState.panY = ay - rect.top - before.y * next;
    persistMind();
    applyMindTransform();
  }

  function resetMindView() {
    mindState.zoom = 1;
    mindState.panX = 120;
    mindState.panY = 80;
    persistMind();
    applyMindTransform();
  }

  function eraseMindAt(clientX, clientY, shouldPersist = true) {
    const point = worldPoint(clientX, clientY);
    let erased = false;

    const nearDrawing = drawing => {
      const nums = String(drawing.d || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const dx = nums[i] - point.x;
        const dy = nums[i + 1] - point.y;
        if (Math.hypot(dx, dy) <= 22 / mindState.zoom) return true;
      }
      return false;
    };

    const beforeDrawings = mindState.drawings.length;
    mindState.drawings = mindState.drawings.filter(drawing => !nearDrawing(drawing));
    erased = erased || beforeDrawings !== mindState.drawings.length;

    const hitElement = mindState.elements.find(element =>
      point.x >= element.x && point.x <= element.x + element.w &&
      point.y >= element.y && point.y <= element.y + element.h
    );
    if (hitElement) {
      mindState.elements = mindState.elements.filter(element => element.id !== hitElement.id);
      mindState.connectors = mindState.connectors.filter(item => item.from !== hitElement.id && item.to !== hitElement.id);
      erased = true;
    }

    if (erased) {
      if (shouldPersist) persistMind();
      renderMind();
    }
    return erased;
  }

  function mindPointerDown(event) {
    if (event.target !== $("#mindViewport") && event.target !== $("#mindWorld") && event.target !== $("#mindElements")) return;
    if (event.button === 1 || mindTool === "hand") {
      mindInteraction = { type:"pan", clientX:event.clientX, clientY:event.clientY, panX:mindState.panX, panY:mindState.panY };
      $("#mindViewport").classList.add("panning");
      event.preventDefault();
      return;
    }

    if (mindTool === "draw" && event.button === 0) {
      const point = worldPoint(event.clientX,event.clientY);
      const drawing = { id:uid(), d:`M ${point.x} ${point.y}` };
      mindState.drawings.push(drawing);
      mindInteraction = { type:"draw", id:drawing.id };
      renderMind();
      event.preventDefault();
      return;
    }

    if (event.button !== 0) return;

    if (mindTool === "eraser") {
      eraseMindAt(event.clientX, event.clientY, false);
      mindInteraction = { type: "erase" };
      event.preventDefault();
      return;
    }

    selectedMindId = null;
    if (mindTool === "note") addMindElement("note", { x:worldPoint(event.clientX,event.clientY).x - 110, y:worldPoint(event.clientX,event.clientY).y - 60 });
    if (mindTool === "text") addMindElement("text", { x:worldPoint(event.clientX,event.clientY).x - 105, y:worldPoint(event.clientX,event.clientY).y - 27 });
    if (mindTool === "frame") addMindElement("frame", { x:worldPoint(event.clientX,event.clientY).x - 260, y:worldPoint(event.clientX,event.clientY).y - 170 });
    if (mindTool === "select" || mindTool === "connector") renderMind();
  }

  function mindPointerMove(event) {
    if (!mindInteraction) return;

    if (mindInteraction.type === "pan") {
      mindState.panX = mindInteraction.panX + (event.clientX - mindInteraction.clientX);
      mindState.panY = mindInteraction.panY + (event.clientY - mindInteraction.clientY);
      applyMindTransform();
      return;
    }

    if (mindInteraction.type === "drag") {
      const element = mindState.elements.find(item => item.id === mindInteraction.id);
      if (!element) return;
      const point = worldPoint(event.clientX,event.clientY);
      element.x = Math.round(mindInteraction.originX + point.x - mindInteraction.startX);
      element.y = Math.round(mindInteraction.originY + point.y - mindInteraction.startY);
      renderMind();
      return;
    }

    if (mindInteraction.type === "resize") {
      const element = mindState.elements.find(item => item.id === mindInteraction.id);
      if (!element) return;
      const point = worldPoint(event.clientX,event.clientY);
      element.w = Math.max(80, Math.round(mindInteraction.originW + point.x - mindInteraction.startX));
      element.h = Math.max(40, Math.round(mindInteraction.originH + point.y - mindInteraction.startY));
      renderMind();
      return;
    }

    if (mindInteraction.type === "erase") {
      eraseMindAt(event.clientX, event.clientY, false);
      return;
    }

    if (mindInteraction.type === "draw") {
      const drawing = mindState.drawings.find(item => item.id === mindInteraction.id);
      if (!drawing) return;
      const point = worldPoint(event.clientX,event.clientY);
      drawing.d += ` L ${point.x} ${point.y}`;
      renderMind();
    }
  }

  function mindPointerUp() {
    if (!mindInteraction) return;
    mindInteraction = null;
    $("#mindViewport")?.classList.remove("panning");
    persistMind();
  }

  function handleMindImage(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const src = canvas.toDataURL("image/jpeg", 0.78);
        const ratio = canvas.width / canvas.height || 1.45;
        const w = 340;
        const h = Math.max(140, Math.round(w / ratio));
        addMindElement("image", { w, h, text:file.name, src });
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function exportMind() {
    const payload = {
      product:"ORÇAH",
      type:"mindmap",
      version:1,
      exportedAt:new Date().toISOString(),
      mindState
    };
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orcah-mapa-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function clearMind() {
    if (!confirm("Limpar todo o mapa mental?")) return;
    mindState = { zoom:1, panX:120, panY:80, elements:[], connectors:[], drawings:[] };
    selectedMindId = null;
    persistMind();
    renderMind();
  }

  function wireEvents() {
    document.querySelectorAll(".view-tab").forEach(button => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });
    document.querySelectorAll(".mind-tool[data-mind-tool]").forEach(button => {
      button.addEventListener("click", () => setMindTool(button.dataset.mindTool));
    });
    document.querySelectorAll(".template-item").forEach(button => {
      button.addEventListener("click", () => addMindTemplate(button.dataset.template));
    });

    $("#mindViewport").addEventListener("pointerdown", mindPointerDown);
    window.addEventListener("pointermove", mindPointerMove);
    window.addEventListener("pointerup", mindPointerUp);
    $("#mindViewport").addEventListener("wheel", event => {
      event.preventDefault();
      zoomMind(event.deltaY < 0 ? .1 : -.1, event.clientX, event.clientY);
    }, { passive:false });

    $("#zoomInBtn").addEventListener("click", () => zoomMind(.1));
    $("#zoomOutBtn").addEventListener("click", () => zoomMind(-.1));
    $("#zoomResetBtn").addEventListener("click", resetMindView);
    $("#mindImageButton").addEventListener("click", () => $("#mindImageInput").click());
    $("#mindImageInput").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) handleMindImage(file);
      event.target.value = "";
    });
    $("#mindExportBtn").addEventListener("click", exportMind);
    $("#mindClearBtn").addEventListener("click", clearMind);

    $("#newCardBtn").addEventListener("click", openNewCardModal);
    $("#moreButton").addEventListener("click", event => {
      event.stopPropagation();
      $("#topMenu").hidden = !$("#topMenu").hidden;
    });
    $("#closeNewCardModal").addEventListener("click", closeNewCardModal);
    $("#cancelNewCardBtn").addEventListener("click", closeNewCardModal);
    $("#newCardForm").addEventListener("submit", createCard);

    $("#closeCardModal").addEventListener("click", closeCardModal);
    $("#saveCardBtn").addEventListener("click", () => saveCard());
    $("#completeCardBtn").addEventListener("click", () => saveCard({ complete: true }));
    $("#deleteCardBtn").addEventListener("click", () => activeCardId && deleteCard(activeCardId));
    $("#addSubcardBtn").addEventListener("click", addSubcard);
    $("#cardCommentInput").addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      addCardComment();
    });

    $("#modalTitle").addEventListener("click", () => {
      ignoreCardTitleClick = true;
      beginCardTitleEdit();
    });
    $("#modalTitle").addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      beginCardTitleEdit();
    });
    $("#editTitle").addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitCardTitleEdit();
    });
    $("#descriptionPreview").addEventListener("click", openDescriptionEditor);
    $("#cancelDescriptionBtn").addEventListener("click", () => closeDescriptionEditor(false));
    $("#saveDescriptionBtn").addEventListener("click", () => closeDescriptionEditor(true));
    $("#editStatus").addEventListener("change", paintCardStatus);
    $("#editPriority").addEventListener("change", paintCardPriority);
    $("#tagDeleteCancel").addEventListener("click", closeTagDeleteConfirm);
    $("#tagDeleteOk").addEventListener("click", confirmRemoveKnownTag);
    $("#tagDeleteConfirm").addEventListener("click", event => {
      if (event.target === event.currentTarget) closeTagDeleteConfirm();
    });

    const tagInput = $("#tagInput");
    const tagMenu = $("#tagMenu");
    tagInput.addEventListener("mousedown", () => {
      ignoreTagMenuClose = true;
      tagMenuOpen = true;
      renderTagMenu();
    });
    tagInput.addEventListener("click", () => {
      tagMenuOpen = true;
      renderTagMenu();
    });
    tagInput.addEventListener("focus", () => {
      tagMenuOpen = true;
      renderTagMenu();
    });
    tagInput.addEventListener("input", () => {
      tagMenuOpen = true;
      renderTagMenu();
    });
    tagInput.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitTagInput();
      renderTagEditor();
      tagInput.focus();
    });
    tagMenu.addEventListener("mousedown", event => {
      const removeBtn = event.target.closest("[data-remove-tag]");
      const addBtn = event.target.closest("[data-add-tag]");
      if (!removeBtn && !addBtn) return;
      event.preventDefault();
      if (removeBtn) {
        askRemoveKnownTag(removeBtn.getAttribute("data-remove-tag"));
        return;
      }
      addWorkingTag(addBtn.getAttribute("data-add-tag"));
      tagInput.value = "";
      renderTagEditor();
      tagInput.focus();
    });

    $("#searchInput").addEventListener("input", renderBoard);
    $("#assigneeFilter").addEventListener("change", renderBoard);
    $("#priorityFilter").addEventListener("change", renderBoard);

    $("#clearFiltersBtn").addEventListener("click", () => {
      $("#searchInput").value = "";
      $("#assigneeFilter").value = "all";
      $("#priorityFilter").value = "all";
      renderBoard();
    });

    $("#exportBtn").addEventListener("click", exportBoard);
    $("#importBtn").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) importBoard(file);
      event.target.value = "";
    });

    document.addEventListener("click", event => {
      if (ignoreColumnEditorClick) {
        ignoreColumnEditorClick = false;
      } else if (columnEditor) {
        const editingHeader = board.querySelector(".column-header.is-editing");
        if (!editingHeader?.contains(event.target)) commitColumnEdit();
      }
      if (ignoreCardTitleClick) {
        ignoreCardTitleClick = false;
      } else if (cardTitleEditing) {
        if (!event.target.closest("#modalTitle") && !event.target.closest("#editTitle")) commitCardTitleEdit();
      }
      if (!event.target.closest(".card-menu-wrap") && !event.target.closest("#topMenu") && !event.target.closest("#moreButton")) closeMenus();
      if (ignoreTagMenuClose) {
        ignoreTagMenuClose = false;
      } else if (!event.target.closest(".tag-input-wrap") && !event.target.closest("#tagDeleteConfirm")) {
        hideTagMenu();
      }
    });

    [cardModal, newCardModal].forEach(backdrop => {
      backdrop.addEventListener("click", event => {
        if (event.target !== backdrop) return;
        if (backdrop === cardModal) closeCardModal();
        if (backdrop === newCardModal) closeNewCardModal();
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      if (columnEditor && columnPaletteOpen) {
        event.preventDefault();
        columnPaletteOpen = false;
        const pop = board.querySelector(".column-color-pop");
        const dot = board.querySelector(".column-dot-btn");
        if (pop) pop.hidden = true;
        if (dot) dot.setAttribute("aria-expanded", "false");
        return;
      }
      if (columnEditor) {
        event.preventDefault();
        cancelColumnEdit();
        return;
      }
      if (cardTitleEditing) {
        event.preventDefault();
        cancelCardTitleEdit();
        return;
      }
      if (descriptionEditing) {
        event.preventDefault();
        closeDescriptionEditor(false);
        return;
      }
      if (!$("#tagDeleteConfirm")?.hidden) {
        event.preventDefault();
        closeTagDeleteConfirm();
        return;
      }
      const tagMenu = $("#tagMenu");
      if (tagMenu && !tagMenu.hidden) {
        event.preventDefault();
        hideTagMenu();
        return;
      }
      closeMenus();
      if (!cardModal.hidden) closeCardModal();
      if (!newCardModal.hidden) closeNewCardModal();
    });
  }

  window.ORCAH_KANBAN_API = {
    createTask(payload = {}) {
      const card = sanitizeCard({
        id: uid(),
        title: payload.title || "Tarefa UX",
        epic: payload.epic || "UX Studio",
        assignee: payload.assignee || "Adriel",
        priority: payload.priority || "medium",
        points: Number(payload.points || 3),
        status: payload.status || "planned",
        description: payload.description || "",
        notes: payload.notes || "",
        subcards: Array.isArray(payload.subcards) ? payload.subcards : [],
        checklist: Array.isArray(payload.checklist) ? payload.checklist : []
      });
      cards.push(card);
      persist();
      renderBoard();
      return card.id;
    },
    getCards() {
      return JSON.parse(JSON.stringify(cards));
    },
    getColumns() {
      return columnDocument();
    },
    replaceColumns(payload) {
      const next = readColumnDocument(payload);
      if (!next) return;
      suppressSharedEvents = true;
      columnMeta = next;
      columnEditor = null;
      columnPaletteOpen = false;
      try {
        localStorage.setItem(COLUMN_META_KEY, JSON.stringify(columnMeta));
      } catch {}
      renderBoard();
      suppressSharedEvents = false;
    },
    replaceCards(nextCards) {
      suppressSharedEvents = true;
      const incoming = (Array.isArray(nextCards) ? nextCards : []).map(sanitizeCard);
      const ensured = ensureStrategyCard(incoming);
      const progress = applyVerifiedProgress(ensured.list);
      cards = progress.list.map(sanitizeCard);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      renderBoard();
      suppressSharedEvents = false;
      if (ensured.added || progress.changed) {
        setTimeout(() => persist(), 0);
      }
    },
    getMindState() {
      return JSON.parse(JSON.stringify(mindState));
    },
    replaceMindState(nextState) {
      suppressSharedEvents = true;
      const safe = nextState && typeof nextState === "object" ? nextState : {};
      mindState = {
        zoom: Number(safe.zoom || 1),
        panX: Number(safe.panX ?? 120),
        panY: Number(safe.panY ?? 80),
        elements: Array.isArray(safe.elements) ? safe.elements : [],
        connectors: Array.isArray(safe.connectors) ? safe.connectors : [],
        drawings: Array.isArray(safe.drawings) ? safe.drawings : []
      };
      localStorage.setItem(MIND_KEY, JSON.stringify(mindState));
      renderMind();
      suppressSharedEvents = false;
    }
  }
  wireEvents();
  renderBoard();
  renderMind();
  let initialView = "kanban";
  try {
    initialView = JSON.parse(localStorage.getItem(UI_STATE_KEY) || "{}").mainView || "kanban";
  } catch {}
  setView(initialView === "mindmap" ? "mindmap" : "kanban");
})();