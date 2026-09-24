(() => {
  "use strict";

  const STORAGE_KEY = "operacao-orcah-kanban-v3";
  const LEGACY_KEYS = ["operacao-orcah-board-v1"];

  const COLUMNS = [
    { key: "backlog", title: "Backlog", color: "#95a199" },
    { key: "planned", title: "Planejado", color: "#4a7bd8" },
    { key: "doing", title: "Em andamento", color: "#d38a22" },
    { key: "review", title: "Revisão", color: "#7d63d2" },
    { key: "done", title: "Concluído", color: "#1fa463" }
  ];

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

  let cards = loadCards();
  let activeCardId = null;
  let workingCard = null;

  const board = $("#board");
  const cardModal = $("#cardModal");
  const newCardModal = $("#newCardModal");

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
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
    element.className = "task-card";
    element.draggable = true;
    element.dataset.id = card.id;

    element.innerHTML = `
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
      epic: form.get("epic"),
      assignee: form.get("assignee"),
      priority: form.get("priority"),
      points: Number(form.get("points")),
      status: form.get("status"),
      description: form.get("description"),
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

  function wireEvents() {
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

  wireEvents();
  renderBoard();
})();