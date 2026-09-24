(() => {
  "use strict";

  const UX_KEY = "operacao-orcah-ux-studio-v1";
  const GITHUB_REPO = "AdrielSchimit/orcah-clone";
  const VERSION_OPTIONS = ["Atual", "V2 Adriel", "V2 César", "Final"];
  const STATUS_OPTIONS = ["Atual", "Em análise", "Proposta", "Em discussão", "Aprovada", "Pronta para implementar", "Implementada"];
  const BLOCK_TYPES = [
    "HEADER","LOGO","TEXTO","TÍTULO","SUBTÍTULO","BOTÃO","INPUT","SELECT","TEXTAREA","CHECKBOX",
    "CARD","LISTA","ITEM","TOTAL","SUBTOTAL","DESCONTO","FORMA DE PAGAMENTO","PIX","DINHEIRO",
    "CARTÃO","PARCELAMENTO","WHATSAPP","NAVBAR","MENU","EMPTY STATE","ALERTA","MODAL","SEÇÃO",
    "DIVISOR","IMAGEM"
  ];

  const $ = selector => document.querySelector(selector);
  const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const clone = value => JSON.parse(JSON.stringify(value));

  function blankState() {
    return {
      importedCommit: "",
      importedAt: "",
      frames: [],
      connectors: [],
      selectedFrameId: null,
      selectedBlockId: null,
      flowMode: false,
      flowStartFrameId: null
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(UX_KEY) || "null");
      return parsed && Array.isArray(parsed.frames) ? { ...blankState(), ...parsed } : blankState();
    } catch {
      return blankState();
    }
  }

  let state = loadState();
  let studioMode = "free";
  let frameDrag = null;

  function save() {
    localStorage.setItem(UX_KEY, JSON.stringify(state));
  }

  function sanitizeBlock(block) {
    return {
      id: block.id || uid("block"),
      type: BLOCK_TYPES.includes(block.type) ? block.type : "TEXTO",
      label: String(block.label || block.type || "Bloco"),
      text: String(block.text || ""),
      visible: block.visible !== false,
      group: String(block.group || ""),
      props: block.props && typeof block.props === "object" ? block.props : {},
      comments: Array.isArray(block.comments) ? block.comments : []
    };
  }

  function sanitizeFrame(frame, index = 0) {
    return {
      id: frame.id || uid("frame"),
      sourceScreenId: frame.sourceScreenId || frame.id || uid("source"),
      name: String(frame.name || "Tela"),
      route: String(frame.route || ""),
      device: String(frame.device || "Responsivo"),
      mobileWidth: Number(frame.mobileWidth || 390),
      version: VERSION_OPTIONS.includes(frame.version) ? frame.version : "Atual",
      status: STATUS_OPTIONS.includes(frame.status) ? frame.status : "Atual",
      origin: String(frame.origin || "UX Studio"),
      sourceCommit: String(frame.sourceCommit || ""),
      sourcePaths: Array.isArray(frame.sourcePaths) ? frame.sourcePaths : [],
      protected: frame.protected === true || frame.version === "Atual",
      x: Number(frame.x ?? (80 + (index % 3) * 520)),
      y: Number(frame.y ?? (80 + Math.floor(index / 3) * 1180)),
      blocks: Array.isArray(frame.blocks) ? frame.blocks.map(sanitizeBlock) : [],
      comments: Array.isArray(frame.comments) ? frame.comments : [],
      createdBy: String(frame.createdBy || ""),
      createdAt: frame.createdAt || new Date().toISOString()
    };
  }

  function getSelectedFrame() {
    return state.frames.find(frame => frame.id === state.selectedFrameId) || null;
  }

  function getSelectedBlock() {
    const frame = getSelectedFrame();
    return frame?.blocks.find(block => block.id === state.selectedBlockId) || null;
  }

  function setStudioMode(mode) {
    studioMode = mode;
    const product = mode === "product";
    $("#freeMindSidebar").hidden = product;
    $("#uxSidebar").hidden = !product;
    $("#mindViewport").hidden = product;
    $("#uxViewport").hidden = !product;
    $("#freeZoom").hidden = product;
    $("#uxToolbarHead").hidden = !product;
    $("#uxInspector").hidden = !product;
    $("#mindStageTitle").textContent = product ? "ORÇAH UX Studio" : "Mapa mental";
    $("#mindStageSubtitle").textContent = product
      ? "Estado atual do produto, versões propostas e handoff para o Kanban."
      : "Desenhe ideias, fluxos e telas do ORÇAH.";
    document.querySelectorAll(".studio-mode").forEach(button => {
      button.classList.toggle("active", button.dataset.studioMode === mode);
    });
    $("#mindmapView").classList.toggle("product-mode", product);
    if (product) renderAll();
  }

  async function latestGithubCommit() {
    try {
      const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits/main`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error("GitHub indisponível");
      const data = await response.json();
      return String(data.sha || "");
    } catch {
      return "";
    }
  }

  async function importSnapshot() {
    const snapshot = window.ORCAH_UX_SNAPSHOT;
    if (!snapshot?.screens?.length) {
      notify("Snapshot do ORÇAH não está disponível.");
      return;
    }

    const button = $("#uxImportBtn");
    const emptyButton = $("#uxEmptyImportBtn");
    [button, emptyButton].forEach(item => {
      if (item) {
        item.disabled = true;
        item.textContent = "Lendo GitHub...";
      }
    });

    const latest = await latestGithubCommit();
    const sourceCommit = latest || snapshot.commit;

    const proposalFrames = state.frames.filter(frame => frame.version !== "Atual");
    const imported = snapshot.screens.map((screen, index) => sanitizeFrame({
      ...clone(screen),
      id: `current_${screen.id}`,
      sourceScreenId: screen.id,
      sourceCommit: sourceCommit || screen.sourceCommit,
      version: "Atual",
      status: "Atual",
      protected: true,
      x: 70 + (index % 3) * 520,
      y: 80 + Math.floor(index / 3) * 1180
    }, index));

    state.frames = [...imported, ...proposalFrames];
    state.importedCommit = sourceCommit || snapshot.commit;
    state.importedAt = new Date().toISOString();
    state.selectedFrameId = imported[0]?.id || null;
    state.selectedBlockId = null;

    const validIds = new Set(state.frames.map(frame => frame.id));
    state.connectors = state.connectors.filter(connector => validIds.has(connector.from) && validIds.has(connector.to));

    save();
    renderAll();

    [button, emptyButton].forEach(item => {
      if (item) {
        item.disabled = false;
        item.textContent = item.id === "uxEmptyImportBtn" ? "Importar UX do ORÇAH" : "Importar / atualizar UX do GitHub";
      }
    });

    if (latest && latest !== snapshot.commit) {
      notify(`GitHub está em ${latest.slice(0,7)}. Frames atualizados e marcados com esse commit.`);
    } else {
      notify(`UX atual importada do commit ${state.importedCommit.slice(0,7)}.`);
    }
  }

  function duplicateFrame(frameId, author) {
    const source = state.frames.find(frame => frame.id === frameId);
    if (!source) return;

    const copyFrame = sanitizeFrame(clone(source));
    copyFrame.id = uid("frame");
    copyFrame.sourceScreenId = source.sourceScreenId;
    copyFrame.version = author === "Cesar" ? "V2 César" : "V2 Adriel";
    copyFrame.status = "Proposta";
    copyFrame.origin = "UX Studio";
    copyFrame.protected = false;
    copyFrame.createdBy = author;
    copyFrame.createdAt = new Date().toISOString();
    copyFrame.x = source.x + 430;
    copyFrame.y = source.y + 60;
    copyFrame.comments = [];
    copyFrame.blocks = copyFrame.blocks.map(block => ({ ...block, id: uid("block"), comments: [] }));

    state.frames.push(copyFrame);
    state.selectedFrameId = copyFrame.id;
    state.selectedBlockId = null;
    save();
    renderAll();
    focusFrame(copyFrame.id);
    notify(`${source.name} duplicada para ${copyFrame.version}.`);
  }

  function createBlock(type) {
    const defaults = {
      "TÍTULO": ["Título", "Novo título"],
      "TEXTO": ["Texto", "Novo texto"],
      "BOTÃO": ["Botão", "Nova ação"],
      "INPUT": ["Campo", "Digite aqui"],
      "SELECT": ["Seleção", "Selecione"],
      "TEXTAREA": ["Texto longo", "Escreva aqui"],
      "CHECKBOX": ["Opção", "Nova opção"],
      "CARD": ["Card", "Novo card"],
      "SEÇÃO": ["Seção", "Nova seção"],
      "DIVISOR": ["Divisor", ""],
      "ITEM": ["Item", "Novo item"],
      "SUBTOTAL": ["Subtotal", "R$ 0,00"],
      "TOTAL": ["Total", "R$ 0,00"],
      "DESCONTO": ["Desconto", "R$ 0,00"],
      "FORMA DE PAGAMENTO": ["Forma de pagamento", "Escolha como pagar"],
      "PIX": ["Pix", "Pix"],
      "DINHEIRO": ["Dinheiro", "Dinheiro"],
      "CARTÃO": ["Cartão", "Cartão"],
      "PARCELAMENTO": ["Parcelamento", "1x · 2x · 3x · 6x"],
      "WHATSAPP": ["WhatsApp", "Abrir WhatsApp"],
      "LISTA": ["Lista", "Novo item"],
      "IMAGEM": ["Imagem", "Imagem"],
      "HEADER": ["Header", "Cabeçalho"],
      "NAVBAR": ["Navbar", "Navegação"],
      "MENU": ["Menu", "Menu"],
      "ALERTA": ["Alerta", "Mensagem importante"],
      "EMPTY STATE": ["Estado vazio", "Nenhum item ainda."],
      "MODAL": ["Modal", "Janela modal"]
    };
    const [label, text] = defaults[type] || [type, type];
    return sanitizeBlock({ id: uid("block"), type, label, text, visible: true, props: {} });
  }

  function addComponent(type) {
    const frame = getSelectedFrame();
    if (!frame) return notify("Selecione um frame primeiro.");
    if (frame.protected) return notify("A versão Atual é protegida. Duplique a tela para editar.");
    const block = createBlock(type);
    frame.blocks.push(block);
    state.selectedBlockId = block.id;
    save();
    renderAll();
  }

  function selectFrame(frameId, blockId = null) {
    state.selectedFrameId = frameId;
    state.selectedBlockId = blockId;
    renderAll();
  }

  function deleteBlock(frameId, blockId) {
    const frame = state.frames.find(item => item.id === frameId);
    if (!frame || frame.protected) return;
    frame.blocks = frame.blocks.filter(block => block.id !== blockId);
    if (state.selectedBlockId === blockId) state.selectedBlockId = null;
    save();
    renderAll();
  }

  function duplicateBlock(frameId, blockId) {
    const frame = state.frames.find(item => item.id === frameId);
    if (!frame || frame.protected) return;
    const index = frame.blocks.findIndex(block => block.id === blockId);
    if (index < 0) return;
    const copyBlock = { ...clone(frame.blocks[index]), id: uid("block"), comments: [] };
    frame.blocks.splice(index + 1, 0, copyBlock);
    state.selectedBlockId = copyBlock.id;
    save();
    renderAll();
  }

  function toggleBlock(frameId, blockId) {
    const frame = state.frames.find(item => item.id === frameId);
    const block = frame?.blocks.find(item => item.id === blockId);
    if (!frame || !block || frame.protected) return;
    block.visible = !block.visible;
    save();
    renderAll();
  }

  function moveBlockToFrame(sourceFrameId, blockId, targetFrameId) {
    const source = state.frames.find(frame => frame.id === sourceFrameId);
    const target = state.frames.find(frame => frame.id === targetFrameId);
    if (!source || !target || source.protected || target.protected) return;
    const index = source.blocks.findIndex(block => block.id === blockId);
    if (index < 0) return;
    const [block] = source.blocks.splice(index, 1);
    target.blocks.push(block);
    state.selectedFrameId = target.id;
    state.selectedBlockId = block.id;
    save();
    renderAll();
  }

  function onBlockDragStart(event, frameId, blockId) {
    const frame = state.frames.find(item => item.id === frameId);
    if (!frame || frame.protected) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify({ frameId, blockId }));
  }

  function onBlockDrop(event, targetFrameId, targetBlockId = null) {
    event.preventDefault();
    const targetFrame = state.frames.find(frame => frame.id === targetFrameId);
    if (!targetFrame || targetFrame.protected) return;

    let payload;
    try { payload = JSON.parse(event.dataTransfer.getData("text/plain")); } catch { return; }
    if (!payload?.frameId || !payload?.blockId) return;

    const sourceFrame = state.frames.find(frame => frame.id === payload.frameId);
    if (!sourceFrame || sourceFrame.protected) return;
    const sourceIndex = sourceFrame.blocks.findIndex(block => block.id === payload.blockId);
    if (sourceIndex < 0) return;

    const [block] = sourceFrame.blocks.splice(sourceIndex, 1);
    const targetIndex = targetBlockId ? targetFrame.blocks.findIndex(item => item.id === targetBlockId) : targetFrame.blocks.length;

    if (sourceFrame.id === targetFrame.id && targetIndex > sourceIndex) {
      targetFrame.blocks.splice(Math.max(0, targetIndex - 1), 0, block);
    } else {
      targetFrame.blocks.splice(targetIndex < 0 ? targetFrame.blocks.length : targetIndex, 0, block);
    }

    state.selectedFrameId = targetFrame.id;
    state.selectedBlockId = block.id;
    save();
    renderAll();
  }

  function startFrameDrag(event, frameId) {
    if (event.button !== 0 || event.target.closest("button")) return;
    const frame = state.frames.find(item => item.id === frameId);
    if (!frame) return;
    const viewport = $("#uxViewport");
    const rect = viewport.getBoundingClientRect();
    frameDrag = {
      frameId,
      startX: event.clientX,
      startY: event.clientY,
      originX: frame.x,
      originY: frame.y,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      rect
    };
    state.selectedFrameId = frameId;
    state.selectedBlockId = null;
    event.preventDefault();
  }

  function moveFrameDrag(event) {
    if (!frameDrag) return;
    const frame = state.frames.find(item => item.id === frameDrag.frameId);
    if (!frame) return;
    frame.x = Math.max(20, frameDrag.originX + event.clientX - frameDrag.startX);
    frame.y = Math.max(20, frameDrag.originY + event.clientY - frameDrag.startY);
    const node = document.querySelector(`[data-ux-frame-id="${frame.id}"]`);
    if (node) {
      node.style.left = `${frame.x}px`;
      node.style.top = `${frame.y}px`;
    }
    renderConnectors();
  }

  function endFrameDrag() {
    if (!frameDrag) return;
    frameDrag = null;
    save();
  }

  function handleFlowFrame(frameId) {
    if (!state.flowMode) return false;
    if (!state.flowStartFrameId) {
      state.flowStartFrameId = frameId;
      state.selectedFrameId = frameId;
      renderAll();
      notify("Agora selecione a tela de destino.");
      return true;
    }
    if (state.flowStartFrameId === frameId) {
      state.flowStartFrameId = null;
      renderAll();
      return true;
    }
    const label = prompt("Nome da conexão (ex.: Salvar, Enviar, Aprovar):", "") ?? "";
    state.connectors.push({ id: uid("flow"), from: state.flowStartFrameId, to: frameId, label: label.trim() });
    state.flowStartFrameId = null;
    save();
    renderAll();
    return true;
  }

  function toggleFlowMode() {
    state.flowMode = !state.flowMode;
    state.flowStartFrameId = null;
    $("#uxFlowBtn").classList.toggle("active", state.flowMode);
    $("#uxFlowBtn").textContent = state.flowMode ? "Conectando..." : "Conectar telas";
    renderAll();
  }

  function conceptualDiff(current, proposal) {
    if (!current || !proposal) return [];
    const changes = [];
    const currentByKey = new Map(current.blocks.map((block, index) => [`${block.type}::${block.label}`, { block, index }]));
    const proposalByKey = new Map(proposal.blocks.map((block, index) => [`${block.type}::${block.label}`, { block, index }]));

    proposal.blocks.forEach((block, index) => {
      const key = `${block.type}::${block.label}`;
      const old = currentByKey.get(key);
      if (!old) {
        changes.push({ kind: "added", text: `Adicionar ${block.label}` });
      } else {
        if (old.index !== index) changes.push({ kind: "moved", text: `Mover ${block.label}` });
        if (old.block.text !== block.text) changes.push({ kind: "edited", text: `Alterar texto de ${block.label}` });
        if (old.block.visible !== block.visible) changes.push({ kind: block.visible ? "added" : "removed", text: `${block.visible ? "Mostrar" : "Ocultar"} ${block.label}` });
      }
    });

    current.blocks.forEach(block => {
      const key = `${block.type}::${block.label}`;
      if (!proposalByKey.has(key)) changes.push({ kind: "removed", text: `Remover ${block.label}` });
    });

    return changes;
  }

  function currentFor(frame) {
    return state.frames.find(item => item.sourceScreenId === frame.sourceScreenId && item.version === "Atual") || null;
  }

  function openCompare() {
    const frame = getSelectedFrame();
    if (!frame) return notify("Selecione uma tela para comparar.");
    const current = frame.version === "Atual" ? frame : currentFor(frame);
    const proposal = frame.version === "Atual"
      ? state.frames.find(item => item.sourceScreenId === frame.sourceScreenId && item.version !== "Atual")
      : frame;
    if (!current || !proposal) return notify("Duplique a tela para criar uma proposta antes de comparar.");

    const changes = conceptualDiff(current, proposal);
    $("#uxCompareTitle").textContent = `${current.name} · Atual vs ${proposal.version}`;
    $("#uxCompareBody").innerHTML = `
      <div class="ux-compare-columns">
        <div><h3>Atual</h3>${renderMiniFrame(current)}</div>
        <div><h3>${escapeHtml(proposal.version)}</h3>${renderMiniFrame(proposal)}</div>
      </div>
      <div class="ux-diff-list">
        <h3>Diferenças conceituais</h3>
        ${changes.length ? changes.map(change => `<p class="diff-${change.kind}">${diffSymbol(change.kind)} ${escapeHtml(change.text)}</p>`).join("") : "<p>Sem diferenças detectadas.</p>"}
      </div>
    `;
    $("#uxCompareModal").hidden = false;
  }

  function diffSymbol(kind) {
    return kind === "added" ? "+" : kind === "removed" ? "−" : kind === "moved" ? "↕" : "✎";
  }

  function renderMiniFrame(frame) {
    return `<div class="ux-mini-frame">
      ${frame.blocks.filter(block => block.visible).map(block => `<div class="ux-mini-block"><span>${escapeHtml(block.type)}</span><strong>${escapeHtml(block.label)}</strong></div>`).join("")}
    </div>`;
  }

  function approveFrame(frameId) {
    const frame = state.frames.find(item => item.id === frameId);
    if (!frame || frame.protected) return;
    frame.status = "Aprovada";
    save();
    renderAll();
    notify("Versão marcada como aprovada.");
  }

  function createKanbanTask(frameId) {
    const frame = state.frames.find(item => item.id === frameId);
    if (!frame) return;
    const current = currentFor(frame);
    const changes = current && frame.version !== "Atual" ? conceptualDiff(current, frame) : [];
    const description = [
      `UX Studio · Tela: ${frame.name}`,
      `Rota: ${frame.route}`,
      `Versão: ${frame.version}`,
      changes.length ? `Mudanças: ${changes.map(item => item.text).join("; ")}` : "Implementar a versão aprovada no UX Studio."
    ].join("\n");

    const checklist = changes.map(item => ({ id: uid("check"), text: item.text, done: false, comments: [] }));
    const created = window.ORCAH_KANBAN_API?.createTask({
      title: `UX · ${frame.name} · ${frame.version}`,
      epic: "UX Studio",
      assignee: frame.createdBy === "Cesar" ? "Cesar" : "Adriel",
      priority: "high",
      points: Math.min(13, Math.max(3, changes.length || 3)),
      status: "planned",
      description,
      notes: `Referência UX Studio: ${frame.name} | ${frame.route} | ${frame.version}`,
      checklist
    });

    if (created) notify("Tarefa criada no Kanban.");
    else notify("Não foi possível acessar o Kanban.");
  }

  function addComment(target, text, author = "Adriel") {
    if (!text.trim()) return;
    if (!Array.isArray(target.comments)) target.comments = [];
    target.comments.push({ id: uid("comment"), text: text.trim(), author, at: new Date().toISOString() });
    save();
    renderInspector();
  }

  function renderAll() {
    if (studioMode !== "product") return;
    renderImportMeta();
    renderScreenList();
    renderFrames();
    renderInspector();
  }

  function renderImportMeta() {
    const meta = $("#uxImportMeta");
    if (!meta) return;
    if (!state.importedCommit) {
      meta.textContent = "Estado atual ainda não importado.";
      return;
    }
    meta.textContent = `GitHub ORÇAH · main · ${state.importedCommit.slice(0,7)} · ${new Date(state.importedAt).toLocaleString("pt-BR")}`;
  }

  function renderScreenList() {
    const list = $("#uxScreenList");
    if (!list) return;
    const ordered = state.frames.slice().sort((a,b) => {
      if (a.route === b.route) return VERSION_OPTIONS.indexOf(a.version) - VERSION_OPTIONS.indexOf(b.version);
      return a.route.localeCompare(b.route);
    });
    $("#uxScreenCount").textContent = `${new Set(state.frames.map(frame => frame.sourceScreenId)).size} telas`;
    list.innerHTML = ordered.map(frame => `
      <button type="button" class="ux-screen-item ${state.selectedFrameId === frame.id ? "active" : ""}" data-screen-id="${frame.id}">
        <span><strong>${escapeHtml(frame.name)}</strong><small>${escapeHtml(frame.route)}</small></span>
        <em>${escapeHtml(frame.version)}</em>
      </button>
    `).join("");

    list.querySelectorAll("[data-screen-id]").forEach(button => {
      button.addEventListener("click", () => {
        selectFrame(button.dataset.screenId);
        focusFrame(button.dataset.screenId);
      });
    });
  }

  function renderFrames() {
    const layer = $("#uxFrames");
    if (!layer) return;
    layer.innerHTML = "";

    state.frames.forEach(frame => {
      const node = document.createElement("article");
      node.className = `ux-frame ${frame.protected ? "current" : "proposal"} ${state.selectedFrameId === frame.id ? "selected" : ""} ${state.flowStartFrameId === frame.id ? "flow-source" : ""}`;
      node.dataset.uxFrameId = frame.id;
      node.style.left = `${frame.x}px`;
      node.style.top = `${frame.y}px`;
      node.style.width = `${frame.mobileWidth || 390}px`;

      node.innerHTML = `
        <header class="ux-frame-head">
          <div class="ux-frame-title">
            <strong>${escapeHtml(frame.name)}</strong>
            <span>${escapeHtml(frame.route)}</span>
          </div>
          <div class="ux-frame-badges">
            <span class="ux-version-badge">${escapeHtml(frame.version)}</span>
            <span class="ux-status-badge">${escapeHtml(frame.status)}</span>
          </div>
        </header>
        <div class="ux-frame-meta">
          <span>${escapeHtml(frame.device)} · ${frame.mobileWidth}px</span>
          <span>${frame.sourceCommit ? escapeHtml(frame.sourceCommit.slice(0,7)) : "UX Studio"}</span>
        </div>
        <div class="ux-frame-actions">
          ${frame.protected ? `
            <button type="button" data-duplicate-author="Adriel">Duplicar para Adriel</button>
            <button type="button" data-duplicate-author="Cesar">Duplicar para César</button>
          ` : `
            <button type="button" data-approve>Marcar aprovada</button>
            <button type="button" data-kanban>Criar tarefa no Kanban</button>
          `}
          <button type="button" data-compare-frame>Comparar</button>
        </div>
        <div class="ux-frame-body ${frame.protected ? "locked" : ""}" data-frame-body="${frame.id}">
          ${frame.blocks.map(block => renderBlock(frame, block)).join("")}
          ${!frame.blocks.length ? '<div class="ux-no-blocks">Nenhum bloco.</div>' : ""}
        </div>
        ${frame.protected ? '<footer class="ux-frame-lock">Estado atual protegido · duplique para editar</footer>' : ""}
      `;

      node.addEventListener("click", event => {
        if (event.target.closest(".ux-block") || event.target.closest("button")) return;
        if (handleFlowFrame(frame.id)) return;
        selectFrame(frame.id);
      });

      node.querySelector(".ux-frame-head").addEventListener("pointerdown", event => startFrameDrag(event, frame.id));

      node.querySelectorAll("[data-duplicate-author]").forEach(button => {
        button.addEventListener("click", event => {
          event.stopPropagation();
          duplicateFrame(frame.id, button.dataset.duplicateAuthor);
        });
      });
      node.querySelector("[data-approve]")?.addEventListener("click", event => {
        event.stopPropagation();
        approveFrame(frame.id);
      });
      node.querySelector("[data-kanban]")?.addEventListener("click", event => {
        event.stopPropagation();
        createKanbanTask(frame.id);
      });
      node.querySelector("[data-compare-frame]")?.addEventListener("click", event => {
        event.stopPropagation();
        state.selectedFrameId = frame.id;
        openCompare();
      });

      const body = node.querySelector("[data-frame-body]");
      body.addEventListener("dragover", event => {
        if (!frame.protected) {
          event.preventDefault();
          body.classList.add("drop-target");
        }
      });
      body.addEventListener("dragleave", () => body.classList.remove("drop-target"));
      body.addEventListener("drop", event => {
        body.classList.remove("drop-target");
        onBlockDrop(event, frame.id);
      });

      node.querySelectorAll(".ux-block").forEach(blockNode => {
        const blockId = blockNode.dataset.blockId;
        blockNode.addEventListener("click", event => {
          event.stopPropagation();
          if (handleFlowFrame(frame.id)) return;
          selectFrame(frame.id, blockId);
        });
        blockNode.addEventListener("dragstart", event => onBlockDragStart(event, frame.id, blockId));
        blockNode.addEventListener("dragover", event => {
          if (!frame.protected) event.preventDefault();
        });
        blockNode.addEventListener("drop", event => onBlockDrop(event, frame.id, blockId));
        blockNode.querySelector("[data-block-duplicate]")?.addEventListener("click", event => {
          event.stopPropagation();
          duplicateBlock(frame.id, blockId);
        });
        blockNode.querySelector("[data-block-hide]")?.addEventListener("click", event => {
          event.stopPropagation();
          toggleBlock(frame.id, blockId);
        });
        blockNode.querySelector("[data-block-delete]")?.addEventListener("click", event => {
          event.stopPropagation();
          deleteBlock(frame.id, blockId);
        });
      });

      layer.appendChild(node);
    });

    $("#uxEmpty").hidden = state.frames.length > 0;
    renderConnectors();
  }

  function renderBlock(frame, block) {
    const selected = state.selectedBlockId === block.id;
    const editable = !frame.protected;
    return `
      <div class="ux-block ux-type-${cssType(block.type)} ${selected ? "selected" : ""} ${block.visible ? "" : "hidden-block"}"
           data-block-id="${block.id}" draggable="${editable}">
        <div class="ux-block-grip">${editable ? "⋮⋮" : ""}</div>
        <div class="ux-block-visual">
          ${blockVisual(block)}
        </div>
        ${editable ? `
          <div class="ux-block-actions">
            <button type="button" title="Duplicar" data-block-duplicate>Duplicar</button>
            <button type="button" title="Ocultar/mostrar" data-block-hide>${block.visible ? "Ocultar" : "Mostrar"}</button>
            <button type="button" title="Excluir" data-block-delete>Excluir</button>
          </div>
        ` : ""}
      </div>
    `;
  }

  function blockVisual(block) {
    const label = escapeHtml(block.label);
    const text = escapeHtml(block.text);
    switch (block.type) {
      case "TÍTULO": return `<h2 class="ux-v-title">${text || label}</h2>`;
      case "SUBTÍTULO": return `<p class="ux-v-subtitle">${text || label}</p>`;
      case "TEXTO": return `<p class="ux-v-text">${text || label}</p>`;
      case "INPUT": return `<label class="ux-v-field"><span>${label}</span><div>${text || "Digite aqui"}</div></label>`;
      case "SELECT": return `<label class="ux-v-field"><span>${label}</span><div>${text || "Selecione"} <b>⌄</b></div></label>`;
      case "TEXTAREA": return `<label class="ux-v-field"><span>${label}</span><div class="textarea">${text || "Escreva aqui"}</div></label>`;
      case "CHECKBOX": return `<div class="ux-v-check"><i></i><span><strong>${label}</strong><small>${text}</small></span></div>`;
      case "BOTÃO": return `<button class="ux-v-button" type="button">${text || label}</button>`;
      case "WHATSAPP": return `<button class="ux-v-button whatsapp" type="button">${text || "WhatsApp"}</button>`;
      case "TOTAL": return `<div class="ux-v-total"><span>${label}</span><strong>${text || "R$ 0,00"}</strong></div>`;
      case "SUBTOTAL": return `<div class="ux-v-money"><span>${label}</span><strong>${text || "R$ 0,00"}</strong></div>`;
      case "DESCONTO": return `<div class="ux-v-money"><span>${label}</span><strong>${text || "R$ 0,00"}</strong></div>`;
      case "DIVISOR": return '<div class="ux-v-divider"></div>';
      case "IMAGE": return `<div class="ux-v-image"><span>${label}</span></div>`;
      case "NAVBAR": return `<div class="ux-v-navbar">${(block.text || "Início · Pedidos · Clientes · Página · Mais").split("·").map(item=>`<span>${escapeHtml(item.trim())}</span>`).join("")}</div>`;
      case "HEADER": return `<div class="ux-v-header"><span class="ux-v-logo"></span><div><strong>${label}</strong><small>${text}</small></div></div>`;
      case "ALERTA": return `<div class="ux-v-alert"><strong>${label}</strong><span>${text}</span></div>`;
      case "EMPTY STATE": return `<div class="ux-v-empty"><strong>${label}</strong><span>${text}</span></div>`;
      case "ITEM": return `<div class="ux-v-item"><strong>${label}</strong><span>${text}</span></div>`;
      case "LISTA": return `<div class="ux-v-list"><strong>${label}</strong><span>${text}</span><i></i><i></i></div>`;
      case "CARD": return `<div class="ux-v-card"><strong>${label}</strong><span>${text}</span></div>`;
      case "SEÇÃO": return `<div class="ux-v-section"><strong>${label}</strong><span>${text}</span></div>`;
      case "FORMA DE PAGAMENTO":
      case "PIX":
      case "DINHEIRO":
      case "CARTÃO":
      case "PARCELAMENTO":
        return `<div class="ux-v-payment"><strong>${label}</strong><span>${text}</span></div>`;
      case "MODAL": return `<div class="ux-v-modal"><strong>${label}</strong><span>${text}</span></div>`;
      default: return `<div class="ux-v-generic"><strong>${label}</strong><span>${text}</span></div>`;
    }
  }

  function cssType(type) {
    return type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  function renderConnectors() {
    const svg = $("#uxFlowSvg");
    const canvas = $("#uxCanvas");
    if (!svg || !canvas) return;
    svg.setAttribute("width", canvas.scrollWidth || 6000);
    svg.setAttribute("height", canvas.scrollHeight || 7000);
    svg.innerHTML = "";

    state.connectors.forEach(connector => {
      const from = document.querySelector(`[data-ux-frame-id="${connector.from}"]`);
      const to = document.querySelector(`[data-ux-frame-id="${connector.to}"]`);
      if (!from || !to) return;

      const x1 = parseFloat(from.style.left) + from.offsetWidth;
      const y1 = parseFloat(from.style.top) + 70;
      const x2 = parseFloat(to.style.left);
      const y2 = parseFloat(to.style.top) + 70;
      const mid = (x1 + x2) / 2;

      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d", `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
      path.setAttribute("class","ux-flow-line");
      svg.appendChild(path);

      if (connector.label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg","text");
        text.setAttribute("x", String(mid));
        text.setAttribute("y", String((y1+y2)/2 - 6));
        text.setAttribute("class","ux-flow-label");
        text.textContent = connector.label;
        svg.appendChild(text);
      }
    });
  }

  function renderInspector() {
    const content = $("#uxInspectorContent");
    const empty = $("#uxInspectorEmpty");
    const frame = getSelectedFrame();
    const block = getSelectedBlock();

    if (!frame) {
      empty.hidden = false;
      content.hidden = true;
      return;
    }

    empty.hidden = true;
    content.hidden = false;

    if (block) {
      const editable = !frame.protected;
      content.innerHTML = `
        <div class="ux-inspector-head"><span>BLOCO</span><strong>${escapeHtml(block.type)}</strong></div>
        ${frame.protected ? '<div class="ux-readonly-note">Estado Atual protegido. Duplique a tela para editar.</div>' : ""}
        <label><span>Tipo</span><select id="uxPropType" ${editable ? "" : "disabled"}>${BLOCK_TYPES.map(type=>`<option ${type===block.type?"selected":""}>${type}</option>`).join("")}</select></label>
        <label><span>Nome</span><input id="uxPropLabel" value="${escapeAttr(block.label)}" ${editable ? "" : "disabled"}></label>
        <label><span>Texto</span><textarea id="uxPropText" rows="4" ${editable ? "" : "disabled"}>${escapeHtml(block.text)}</textarea></label>
        <label class="ux-check-label"><input id="uxPropVisible" type="checkbox" ${block.visible?"checked":""} ${editable ? "" : "disabled"}><span>Visível</span></label>
        <label><span>Grupo</span><input id="uxPropGroup" value="${escapeAttr(block.group)}" ${editable ? "" : "disabled"} placeholder="Opcional"></label>
        ${editable ? `
          <label><span>Mover para outra tela editável</span><select id="uxMoveFrame"><option value="">Manter nesta tela</option>${state.frames.filter(item=>!item.protected && item.id!==frame.id).map(item=>`<option value="${item.id}">${escapeHtml(item.name)} · ${escapeHtml(item.version)}</option>`).join("")}</select></label>
          <div class="ux-inspector-actions">
            <button class="button button-ghost" id="uxDuplicateBlock">Duplicar</button>
            <button class="button button-danger" id="uxDeleteBlock">Excluir</button>
          </div>
        ` : ""}
        ${renderComments(block, "block")}
      `;
      bindBlockInspector(frame, block);
      return;
    }

    const editable = !frame.protected;
    content.innerHTML = `
      <div class="ux-inspector-head"><span>TELA</span><strong>${escapeHtml(frame.name)}</strong></div>
      <div class="ux-route">${escapeHtml(frame.route)}</div>
      <label><span>Versão</span><select id="uxFrameVersion" ${editable ? "" : "disabled"}>${VERSION_OPTIONS.map(item=>`<option ${item===frame.version?"selected":""}>${item}</option>`).join("")}</select></label>
      <label><span>Status</span><select id="uxFrameStatus" ${editable ? "" : "disabled"}>${STATUS_OPTIONS.map(item=>`<option ${item===frame.status?"selected":""}>${item}</option>`).join("")}</select></label>
      <label><span>Tipo</span><input value="${escapeAttr(frame.device)}" disabled></label>
      <label><span>Largura mobile</span><select id="uxFrameWidth" ${editable ? "" : "disabled"}>${[320,360,375,390,430].map(width=>`<option value="${width}" ${width===frame.mobileWidth?"selected":""}>${width}px</option>`).join("")}</select></label>
      <div class="ux-source-info">
        <span>Origem</span><strong>${escapeHtml(frame.origin)}</strong>
        <span>Commit analisado</span><strong>${escapeHtml(frame.sourceCommit || "-")}</strong>
      </div>
      ${frame.protected ? `
        <div class="ux-version-buttons">
          <button class="button button-primary" id="uxDupAdriel">Duplicar para V2 Adriel</button>
          <button class="button button-ghost" id="uxDupCesar">Duplicar para V2 César</button>
        </div>
      ` : `
        <div class="ux-version-buttons">
          <button class="button button-success" id="uxApproveFrame">Aprovar versão</button>
          <button class="button button-primary" id="uxTaskFrame">Criar tarefa no Kanban</button>
          <button class="button button-ghost" id="uxCompareFrame">Comparar com Atual</button>
        </div>
      `}
      ${renderComments(frame, "frame")}
    `;
    bindFrameInspector(frame);
  }

  function renderComments(target, kind) {
    return `
      <div class="ux-comments">
        <div class="ux-comments-head"><strong>Comentários</strong><span>${target.comments?.length || 0}</span></div>
        <div class="ux-comments-list">
          ${(target.comments || []).map(comment=>`<div><strong>${escapeHtml(comment.author)}</strong><p>${escapeHtml(comment.text)}</p></div>`).join("") || "<p class='ux-no-comments'>Nenhum comentário.</p>"}
        </div>
        <div class="ux-comment-compose">
          <select id="uxCommentAuthor"><option>Adriel</option><option>Cesar</option></select>
          <textarea id="uxCommentText" rows="2" placeholder="Escreva um comentário"></textarea>
          <button class="button button-ghost" id="uxCommentSend" type="button">Comentar</button>
        </div>
      </div>
    `;
  }

  function bindBlockInspector(frame, block) {
    const editable = !frame.protected;
    if (editable) {
      $("#uxPropType").addEventListener("change", event => { block.type = event.target.value; save(); renderAll(); });
      $("#uxPropLabel").addEventListener("input", event => { block.label = event.target.value; save(); renderFrames(); });
      $("#uxPropText").addEventListener("input", event => { block.text = event.target.value; save(); renderFrames(); });
      $("#uxPropVisible").addEventListener("change", event => { block.visible = event.target.checked; save(); renderFrames(); });
      $("#uxPropGroup").addEventListener("input", event => { block.group = event.target.value; save(); });
      $("#uxMoveFrame").addEventListener("change", event => {
        if (event.target.value) moveBlockToFrame(frame.id, block.id, event.target.value);
      });
      $("#uxDuplicateBlock")?.addEventListener("click", () => duplicateBlock(frame.id, block.id));
      $("#uxDeleteBlock")?.addEventListener("click", () => deleteBlock(frame.id, block.id));
    }
    bindCommentComposer(block);
  }

  function bindFrameInspector(frame) {
    if (!frame.protected) {
      $("#uxFrameVersion").addEventListener("change", event => { frame.version = event.target.value; save(); renderAll(); });
      $("#uxFrameStatus").addEventListener("change", event => { frame.status = event.target.value; save(); renderAll(); });
      $("#uxFrameWidth").addEventListener("change", event => { frame.mobileWidth = Number(event.target.value); save(); renderAll(); });
      $("#uxApproveFrame")?.addEventListener("click", () => approveFrame(frame.id));
      $("#uxTaskFrame")?.addEventListener("click", () => createKanbanTask(frame.id));
      $("#uxCompareFrame")?.addEventListener("click", openCompare);
    } else {
      $("#uxDupAdriel")?.addEventListener("click", () => duplicateFrame(frame.id,"Adriel"));
      $("#uxDupCesar")?.addEventListener("click", () => duplicateFrame(frame.id,"Cesar"));
    }
    bindCommentComposer(frame);
  }

  function bindCommentComposer(target) {
    $("#uxCommentSend")?.addEventListener("click", () => {
      addComment(target, $("#uxCommentText").value, $("#uxCommentAuthor").value);
    });
  }

  function focusFrame(frameId) {
    const viewport = $("#uxViewport");
    const node = document.querySelector(`[data-ux-frame-id="${frameId}"]`);
    if (!viewport || !node) return;
    viewport.scrollTo({
      left: Math.max(0, parseFloat(node.style.left) - 40),
      top: Math.max(0, parseFloat(node.style.top) - 30),
      behavior: "smooth"
    });
  }

  function toggleFullscreen() {
    $("#mindmapView").classList.toggle("ux-fullscreen");
    $("#uxFullscreenBtn").textContent = $("#mindmapView").classList.contains("ux-fullscreen") ? "Sair do modo UX" : "Modo UX";
  }

  function notify(message) {
    const region = $("#toastRegion");
    if (!region) return;
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    region.appendChild(node);
    setTimeout(() => node.remove(), 3000);
  }

  function escapeHtml(value = "") {
    return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function escapeAttr(value = "") {
    return escapeHtml(value).replaceAll("\n"," ");
  }

  function wire() {
    document.querySelectorAll(".studio-mode").forEach(button => {
      button.addEventListener("click", () => setStudioMode(button.dataset.studioMode));
    });
    $("#uxImportBtn")?.addEventListener("click", importSnapshot);
    $("#uxEmptyImportBtn")?.addEventListener("click", importSnapshot);
    document.querySelectorAll("[data-ux-component]").forEach(button => {
      button.addEventListener("click", () => addComponent(button.dataset.uxComponent));
    });
    $("#uxFlowBtn")?.addEventListener("click", toggleFlowMode);
    $("#uxCompareBtn")?.addEventListener("click", openCompare);
    $("#uxFullscreenBtn")?.addEventListener("click", toggleFullscreen);
    $("#uxCompareClose")?.addEventListener("click", () => { $("#uxCompareModal").hidden = true; });
    $("#uxCompareModal")?.addEventListener("click", event => {
      if (event.target === $("#uxCompareModal")) $("#uxCompareModal").hidden = true;
    });
    window.addEventListener("pointermove", moveFrameDrag);
    window.addEventListener("pointerup", endFrameDrag);
    window.addEventListener("resize", () => { if (studioMode === "product") renderConnectors(); });

    $("#uxViewport")?.addEventListener("click", event => {
      if (event.target === $("#uxViewport") || event.target === $("#uxCanvas") || event.target === $("#uxFrames")) {
        state.selectedFrameId = null;
        state.selectedBlockId = null;
        renderAll();
      }
    });

    document.addEventListener("keydown", event => {
      if (studioMode !== "product") return;
      if (event.key === "Escape" && state.flowMode) {
        state.flowMode = false;
        state.flowStartFrameId = null;
        $("#uxFlowBtn").classList.remove("active");
        $("#uxFlowBtn").textContent = "Conectar telas";
        renderAll();
      }
    });

    setStudioMode("free");
  }

  wire();
})();