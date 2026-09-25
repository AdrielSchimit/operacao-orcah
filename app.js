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

  function sanitizeCard(card) {
    const assignee = card?.assignee === "Cesar" ? "Cesar" : "Adriel";
    return {
      id: card?.id || uid(),
      title: String(card?.title || "Tarefa"),
      epic: String(card?.epic || "Geral"),
      assignee,
      priority: PRIORITIES[card?.priority] ? card.priority : "medium",
      points: [1,2,3,5,8,13].includes(Number(card?.points)) ? Number(card.points) : 3,
      status: COLUMNS.some(column => column.key === card?.status) ? card.status : "backlog",
      description: String(card?.description || ""),
      notes: String(card?.notes || ""),
      variant: card?.variant === "strategy" ? "strategy" : "",
      subcards: Array.isArray(card?.subcards) ? card.subcards.map(sub => sanitizeSubcard(sub, assignee)) : [],
      checklist: Array.isArray(card?.checklist) ? card.checklist.map(sanitizeCheck) : []
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
  let cards = ensureStrategyCard(loadCards()).list.map(sanitizeCard);
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
      card.title, card.epic, card.description, card.notes, card.assignee,
      ...(card.checklist || []).flatMap(item => [item.text, ...(item.comments || []).map(comment => comment.text)]),
      ...(card.subcards || []).flatMap(sub => [
        sub.title, sub.description, sub.assignee,
        ...(sub.checklist || []).flatMap(item => [item.text, ...(item.comments || []).map(comment => comment.text)])
      ])
    ].join(" ");

    return normalize(text).includes(filters.search);
  }

  function renderBoard() {
    const filters = getFilters();
    board.innerHTML = "";

    COLUMNS.forEach(column => {
      const all = cards.filter(card => card.status === column.key);
      const visible = all.filter(card => cardMatches(card, filters));
      const points = visible.reduce((sum, card) => sum + cardPoints(card), 0);

      const section = document.createElement("section");
      section.className = "column";
      section.innerHTML = `
        <header class="column-header">
          <div class="column-title-wrap">
            <span class="column-dot" style="background:${column.color}"></span>
            <span class="column-title">${column.title}</span>
            <span class="column-count">${visible.length}</span>
          </div>
          <span class="column-points">${points} pts</span>
        </header>
        <div class="column-list" data-status="${column.key}"></div>
      `;

      const list = section.querySelector(".column-list");

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
        <h3>${escapeHTML(card.title)}</h3>
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
        <span class="card-block" title="${escapeHTML(card.epic)}">${escapeHTML(card.epic)}</span>
        <span class="card-right">
          <span class="assignee-text">${escapeHTML(card.assignee)}</span>
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
    toast(`Tarefa movida para ${COLUMNS.find(column => column.key === status)?.title || status}.`);
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

  function openCard(id) {
    const card = cards.find(item => item.id === id);
    if (!card) return;

    activeCardId = id;
    workingCard = JSON.parse(JSON.stringify(card));

    $("#modalEpic").textContent = workingCard.epic || "TAREFA";
    $("#modalTitle").textContent = workingCard.title || "Detalhes da tarefa";
    $("#editTitle").value = workingCard.title || "";
    $("#editEpic").value = workingCard.epic || "";
    $("#editAssignee").value = workingCard.assignee || "Adriel";
    $("#editPriority").value = workingCard.priority || "medium";
    $("#editPoints").value = String(workingCard.points || 3);
    $("#editStatus").value = workingCard.status || "planned";
    $("#editDescription").value = workingCard.description || "";
    $("#editNotes").value = workingCard.notes || "";

    renderSubcardsEditor();
    renderChecklistEditor();
    const subCount = $("#subcardSummaryCount");
    const checkCount = $("#checklistSummaryCount");
    if (subCount) subCount.textContent = workingCard.subcards?.length ? `(${workingCard.subcards.length})` : "";
    if (checkCount) checkCount.textContent = workingCard.checklist?.length ? `(${workingCard.checklist.length})` : "";

    cardModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCardModal() {
    cardModal.hidden = true;
    activeCardId = null;
    workingCard = null;
    document.body.style.overflow = "";
  }

  function syncFields() {
    if (!workingCard) return;
    workingCard.title = $("#editTitle").value.trim();
    workingCard.epic = $("#editEpic").value.trim();
    workingCard.assignee = $("#editAssignee").value;
    workingCard.priority = $("#editPriority").value;
    workingCard.points = Number($("#editPoints").value);
    workingCard.status = $("#editStatus").value;
    workingCard.description = $("#editDescription").value.trim();
    workingCard.notes = $("#editNotes").value.trim();
  }

  function saveCard({ complete = false } = {}) {
    if (!workingCard || !activeCardId) return;
    syncFields();

    if (!workingCard.title) {
      toast("Informe um título para a tarefa.");
      $("#editTitle").focus();
      return;
    }

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

    if (!workingCard.subcards.length) {
      container.innerHTML = '<div class="empty-column">Nenhum subcard. Use subcards quando a tarefa precisar ser quebrada em partes menores.</div>';
      return;
    }

    workingCard.subcards.forEach(sub => {
      const fragment = $("#subcardTemplate").content.cloneNode(true);
      const root = fragment.querySelector(".subcard");
      const collapse = fragment.querySelector(".subcard-toggle");
      const summary = fragment.querySelector(".subcard-summary");
      const title = fragment.querySelector(".subcard-title");
      const assignee = fragment.querySelector(".subcard-assignee");
      const points = fragment.querySelector(".subcard-points");
      const status = fragment.querySelector(".subcard-status");
      const description = fragment.querySelector(".subcard-description");
      const list = fragment.querySelector(".subcard-checklist");

      title.value = sub.title || "";
      assignee.value = sub.assignee || workingCard.assignee || "Adriel";
      points.value = String(sub.points || 3);
      status.value = sub.status || "planned";
      description.value = sub.description || "";

      title.addEventListener("input", () => { sub.title = title.value; });
      assignee.addEventListener("change", () => { sub.assignee = assignee.value; });
      points.addEventListener("change", () => { sub.points = Number(points.value); });
      status.addEventListener("change", () => { sub.status = status.value; });
      description.addEventListener("input", () => { sub.description = description.value; });

      const refreshSubcardSummary = () => {
        summary.textContent = `${sub.points} pts · ${sub.assignee}`;
      };
      refreshSubcardSummary();
      assignee.addEventListener("change", refreshSubcardSummary);
      points.addEventListener("change", refreshSubcardSummary);
      collapse.addEventListener("click", () => root.classList.toggle("open"));

      fragment.querySelector(".remove-subcard").addEventListener("click", () => {
        workingCard.subcards = workingCard.subcards.filter(item => item.id !== sub.id);
        renderSubcardsEditor();
      });

      fragment.querySelector(".add-subcard-check").addEventListener("click", () => {
        sub.checklist.push(makeCheck("Novo item"));
        renderSubcardsEditor();
      });

      renderCheckList(sub.checklist, list, sub.assignee, () => renderSubcardsEditor());
      container.appendChild(fragment);
    });
  }

  function addSubcard() {
    if (!workingCard) return;
    if (!Array.isArray(workingCard.subcards)) workingCard.subcards = [];
    workingCard.subcards.push(makeSubcard(
      "Novo subcard",
      workingCard.assignee || "Adriel",
      3,
      "Defina o que precisa ficar pronto nesta parte.",
      "planned",
      []
    ));
    renderSubcardsEditor();

    const subcards = $("#subcardsContainer").querySelectorAll(".subcard");
    const last = subcards[subcards.length - 1];
    if (last) last.classList.add("open");
    const input = last?.querySelector(".subcard-title");
    if (input) {
      input.focus();
      input.select();
    }
  }

  function renderChecklistEditor() {
    const container = $("#checklistContainer");
    if (!workingCard) return;
    if (!Array.isArray(workingCard.checklist)) workingCard.checklist = [];

    if (!workingCard.checklist.length) {
      container.innerHTML = '<div class="empty-column">Nenhum item no checklist geral.</div>';
      return;
    }

    renderCheckList(workingCard.checklist, container, workingCard.assignee || "Equipe", () => renderChecklistEditor());
  }

  function renderCheckList(list, container, author, rerender) {
    container.innerHTML = "";

    list.forEach(item => {
      const fragment = $("#checkItemTemplate").content.cloneNode(true);
      const root = fragment.querySelector(".check-item");
      const toggle = fragment.querySelector(".check-toggle");
      const text = fragment.querySelector(".check-text");
      const remove = fragment.querySelector(".remove-check");
      const comments = fragment.querySelector(".comment-list");
      const commentInput = fragment.querySelector(".comment-input");
      const commentSend = fragment.querySelector(".comment-send");

      if (item.done) root.classList.add("done");
      text.value = item.text || "";

      (item.comments || []).forEach(comment => {
        const node = document.createElement("div");
        node.className = "comment";
        node.innerHTML = `${escapeHTML(comment.text)} <small>${escapeHTML(comment.author || "Equipe")}</small>`;
        comments.appendChild(node);
      });

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

      const addComment = () => {
        const value = commentInput.value.trim();
        if (!value) return;
        if (!Array.isArray(item.comments)) item.comments = [];
        item.comments.push({ id: uid(), text: value, author, at: new Date().toISOString() });
        rerender();
      };

      commentSend.addEventListener("click", addComment);
      commentInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          addComment();
        }
      });

      container.appendChild(fragment);
    });
  }

  function addChecklistItem() {
    if (!workingCard) return;
    workingCard.checklist.push(makeCheck("Novo item"));
    renderChecklistEditor();
    const inputs = $("#checklistContainer").querySelectorAll(".check-text");
    const last = inputs[inputs.length - 1];
    if (last) {
      last.focus();
      last.select();
    }
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
      epic: String(form.get("epic") || "Geral"),
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
      cards
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
    $("#addChecklistBtn").addEventListener("click", addChecklistItem);

    $("#editTitle").addEventListener("input", event => {
      $("#modalTitle").textContent = event.target.value || "Detalhes da tarefa";
    });
    $("#editEpic").addEventListener("input", event => {
      $("#modalEpic").textContent = event.target.value || "TAREFA";
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
      if (!event.target.closest(".card-menu-wrap") && !event.target.closest("#topMenu") && !event.target.closest("#moreButton")) closeMenus();
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
    replaceCards(nextCards) {
      suppressSharedEvents = true;
      const incoming = (Array.isArray(nextCards) ? nextCards : []).map(sanitizeCard);
      const ensured = ensureStrategyCard(incoming);
      cards = ensured.list.map(sanitizeCard);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      renderBoard();
      suppressSharedEvents = false;
      if (ensured.added) {
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