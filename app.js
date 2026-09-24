(() => {
  "use strict";

  const STORAGE_KEY = "operacao-orcah-board-v1";
  const MEETING_KEY = "operacao-orcah-meetings-v1";

  const COLUMNS = [
    { key: "backlog", title: "Backlog", color: "#778b80" },
    { key: "planned", title: "Planejado", color: "#62a5ff" },
    { key: "doing", title: "Em andamento", color: "#ffad42" },
    { key: "review", title: "Revisão", color: "#aa86ff" },
    { key: "done", title: "Concluído", color: "#35e07e" }
  ];

  const PRIORITIES = {
    critical: { label: "Crítica", short: "CRÍTICA" },
    high: { label: "Alta", short: "ALTA" },
    medium: { label: "Média", short: "MÉDIA" },
    low: { label: "Baixa", short: "BAIXA" }
  };

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

  const checklist = (...items) =>
    items.map(text => ({ id: uid(), text, done: false, comments: [] }));

  const makeSubcard = (title, assignee, points, description, items = [], status = "planned") => ({
    id: uid(),
    title,
    assignee,
    points,
    status,
    description,
    checklist: checklist(...items)
  });

  function defaultSubcardsFor(card) {
    const presets = {
      "Storage externo para logo e fotos": [
        makeSubcard("Adapter de storage", "Cesar", 2, "Criar uma camada única para upload, troca e remoção sem acoplar o app ao provedor.", ["Escolher interface", "Implementar provider Vercel Blob", "Tratar erros"]),
        makeSubcard("Logo da empresa", "Cesar", 2, "Migrar upload e substituição de logo para storage persistente.", ["Upload", "Troca", "Remoção"]),
        makeSubcard("Fotos do orçamento", "Cesar", 3, "Persistir fotos e garantir leitura na página pública/PDF.", ["Upload múltiplo", "URLs persistentes", "Validar página pública"])
      ],
      "WhatsApp: redesenhar experiência de envio": [
        makeSubcard("Mensagens por estado", "Adriel", 3, "Definir texto e contexto para orçamento novo, alteração, aprovado, recusado e follow-up.", ["Mapear estados", "Escrever mensagens", "Revisar tom"]),
        makeSubcard("CTA e abertura do WhatsApp", "Adriel", 3, "Unificar o botão principal e garantir abertura correta em mobile e desktop.", ["CTA padrão", "Mobile", "Desktop"]),
        makeSubcard("Fallback e observabilidade", "Adriel", 2, "Quando o WhatsApp não puder abrir, oferecer cópia de mensagem/link e registrar falhas.", ["Copiar mensagem", "Copiar link", "Mensagem de erro"])
      ],
      "Instagram: definir função real no produto": [
        makeSubcard("Job-to-be-done do Instagram", "Adriel", 2, "Fechar se o Instagram servirá prioritariamente para aquisição, prova social, compartilhamento ou combinação desses usos.", ["Auditar estado atual", "Escolher objetivo principal"]),
        makeSubcard("Preview compartilhável", "Adriel", 3, "Criar card/preview bonito do orçamento ou da empresa para compartilhamento.", ["Layout", "Dados dinâmicos", "Mobile"]),
        makeSubcard("Tracking de aquisição", "Adriel", 3, "Medir cliques e origem quando o Instagram gerar tráfego ou pedidos.", ["Definir eventos", "Registrar origem", "Exibir métrica"])
      ],
      "Lista de orçamentos com filtros": [
        makeSubcard("Tabela/lista operacional", "Adriel", 2, "Definir visual compacto com cliente, status, valor e última atualização.", ["Campos essenciais", "Responsivo"]),
        makeSubcard("Busca, filtros e ordenação", "Adriel", 3, "Encontrar orçamento por cliente, status, período e valor.", ["Busca", "Status", "Período", "Ordenação"])
      ],
      "Cliente clicável com histórico e edição": [
        makeSubcard("Perfil do cliente", "Adriel", 2, "Tela única com dados e ações principais.", ["Abrir detalhe", "Exibir dados"]),
        makeSubcard("Edição", "Adriel", 2, "Editar dados sem duplicar cliente.", ["Salvar", "Validar telefone/e-mail"]),
        makeSubcard("Histórico e novo orçamento", "Adriel", 4, "Listar orçamentos do cliente e iniciar um novo já preenchido.", ["Histórico", "Abrir orçamento", "Criar orçamento"])
      ]
    };
    return presets[card.title] ? presets[card.title].map(item => ({ ...item })) : [];
  }

  function makeRamosCard() {
    return {
      id: uid(),
      title: "Estruturar ramos e moldes profissionais",
      epic: "Produto / Ramos e Moldes",
      assignee: "Adriel",
      priority: "medium",
      points: 13,
      status: "backlog",
      description: "Organizar todos os ramos existentes como estrutura de produto, com definição clara do que cada molde pede, como aparece no orçamento e como será testado.",
      notes: "A ideia não é jogar dezenas de ramos como cards soltos no Kanban. Este bloco guarda a árvore e as auditorias por família/molde.",
      hierarchySeeded: true,
      subcards: [
        makeSubcard("Inventário de ramos", "Adriel", 3, "Catalogar os ramos existentes e identificar duplicidades ou nomes ruins.", ["Exportar catálogo atual", "Agrupar por família", "Marcar duplicidades"]),
        makeSubcard("Vínculo ramo → molde", "Adriel", 3, "Garantir que cada ramo usa o molde correto e os campos esperados.", ["Mapear vínculos", "Validar exceções", "Corrigir inconsistências"]),
        makeSubcard("Campos e regras de cada molde", "Adriel", 3, "Documentar quais campos aparecem e quais regras mudam por tipo profissional.", ["Campos obrigatórios", "Unidades", "Regras específicas"]),
        makeSubcard("Preview público por molde", "Adriel", 2, "Conferir como cada família aparece para o cliente final.", ["Desktop", "Mobile", "PDF"]),
        makeSubcard("Regressão dos moldes", "Cesar", 2, "Criar uma matriz mínima de testes para impedir quebra de ramo/molde.", ["Casos principais", "Seed de teste", "Executar no CI"])
      ],
      checklist: checklist("Fechar inventário", "Fechar matriz ramo → molde", "Definir cobertura mínima de testes")
    };
  }

  function migrateCards(list) {
    const migrated = list.map(card => {
      const next = { ...card };
      next.checklist = Array.isArray(next.checklist) ? next.checklist : [];
      next.subcards = Array.isArray(next.subcards) ? next.subcards : [];

      if (!next.hierarchySeeded) {
        const defaults = defaultSubcardsFor(next);
        if (defaults.length && !next.subcards.length) next.subcards = defaults;
        next.hierarchySeeded = true;
      }

      next.subcards = next.subcards.map(sub => ({
        id: sub.id || uid(),
        title: sub.title || "Subcard",
        assignee: sub.assignee || next.assignee || "Adriel",
        points: Number(sub.points || 3),
        status: sub.status || "planned",
        description: sub.description || "",
        checklist: (sub.checklist || []).map(item => ({
          id: item.id || uid(),
          text: item.text || "",
          done: Boolean(item.done),
          comments: Array.isArray(item.comments) ? item.comments : []
        }))
      }));
      return next;
    });

    if (!migrated.some(card => card.title === "Estruturar ramos e moldes profissionais")) {
      migrated.push(makeRamosCard());
    }
    return migrated;
  }

  const seedCards = () => [
    {
      id: uid(),
      title: "Subir MySQL de produção e ligar DATABASE_URL",
      epic: "Produção / Banco",
      assignee: "Cesar",
      priority: "critical",
      points: 5,
      status: "doing",
      description: "Banco de produção funcional, conectado à Vercel e isolado dos deploys de preview.",
      notes: "Bloqueio atual: login/cadastro podem retornar 500 enquanto a produção estiver sem banco funcional.",
      checklist: checklist(
        "Criar banco MySQL de produção",
        "Configurar DATABASE_URL em Production",
        "Separar banco de Preview do banco de Production",
        "Validar conexão a partir da Vercel"
      )
    },
    {
      id: uid(),
      title: "Aplicar migrations e seed em produção",
      epic: "Produção / Banco",
      assignee: "Cesar",
      priority: "critical",
      points: 3,
      status: "planned",
      description: "Produção deve iniciar com todas as tabelas, estados, ramos e dados-base obrigatórios.",
      notes: "",
      checklist: checklist(
        "Rodar prisma migrate deploy",
        "Rodar prisma db seed",
        "Validar estados no onboarding",
        "Validar os ~120 ramos e 9 moldes"
      )
    },
    {
      id: uid(),
      title: "Storage externo para logo e fotos",
      epic: "Infra / Storage",
      assignee: "Cesar",
      priority: "critical",
      points: 5,
      status: "planned",
      description: "Remover gravação em disco efêmero/read-only da Vercel e persistir uploads em storage externo.",
      notes: "Preferência inicial: Vercel Blob. Manter uma camada de storage para não acoplar a aplicação ao provedor.",
      checklist: checklist(
        "Criar storage e credenciais",
        "Criar adapter de upload",
        "Migrar upload de logo",
        "Migrar fotos dos orçamentos/empresa",
        "Validar exclusão e troca de arquivo"
      )
    },
    {
      id: uid(),
      title: "Destravar ciclo de pedido de alteração",
      epic: "Orçamentos",
      assignee: "Adriel",
      priority: "critical",
      points: 5,
      status: "planned",
      description: "Depois que o cliente pede alteração e o prestador edita, o orçamento precisa voltar ao estado aprovável e notificável.",
      notes: "Regra de produto sugerida: alteração solicitada → edição pelo prestador → nova versão enviada → cliente pode aprovar, recusar ou pedir nova alteração.",
      checklist: checklist(
        "Mapear estados atuais do orçamento",
        "Definir transição após edição",
        "Liberar nova aprovação pública",
        "Exibir histórico/versão ao cliente",
        "Testar 2 ciclos consecutivos de alteração"
      )
    },
    {
      id: uid(),
      title: "Blindar contas administrativas",
      epic: "Auth / Segurança",
      assignee: "Cesar",
      priority: "critical",
      points: 5,
      status: "planned",
      description: "Eliminar risco de alguém ocupar e-mails administrativos num banco novo e remover dependência frágil de contas fixas no código.",
      notes: "",
      checklist: checklist(
        "Mapear regra atual de ADMIN_EMAILS/empresa especial",
        "Definir bootstrap seguro de sócios",
        "Impedir apropriação de e-mail privilegiado",
        "Revisar permissões de admin",
        "Documentar processo de criação de admin"
      )
    },
    {
      id: uid(),
      title: "Fechar cobrança ORÇAH no Asaas",
      epic: "Asaas / Assinatura",
      assignee: "Cesar",
      priority: "critical",
      points: 8,
      status: "backlog",
      description: "Usuário com teste vencido precisa ter uma rota clara para pagar e voltar ao produto, sem ficar preso por configuração ausente.",
      notes: "Primeiro sandbox; depois produção e webhook.",
      checklist: checklist(
        "Mapear tela e estados de assinatura",
        "Testar criação de cobrança em sandbox",
        "Implementar tratamento quando chave não existe",
        "Configurar webhook",
        "Configurar produção",
        "Testar vencimento → pagamento → desbloqueio"
      )
    },
    {
      id: uid(),
      title: "Recuperação de senha + limite de tentativas",
      epic: "Auth / Segurança",
      assignee: "Cesar",
      priority: "high",
      points: 8,
      status: "backlog",
      description: "Adicionar recuperação segura de senha e rate limit no login.",
      notes: "Pode exigir tabela/token, provedor de e-mail e serviço de rate limiting.",
      checklist: checklist(
        "Escolher provedor de e-mail",
        "Criar fluxo de reset com expiração",
        "Adicionar rate limit",
        "Invalidar token após uso",
        "Testar enumeração de usuário e abuso"
      )
    },
    {
      id: uid(),
      title: "WhatsApp: redesenhar experiência de envio",
      epic: "WhatsApp",
      assignee: "Adriel",
      priority: "high",
      points: 8,
      status: "planned",
      description: "O WhatsApp precisa parecer parte central do ORÇAH: contexto certo, mensagem boa, estados claros e envio rápido.",
      notes: "Hoje funciona como saída do fluxo, mas a experiência ainda não está no nível do produto.",
      checklist: checklist(
        "Auditar todas as entradas de WhatsApp",
        "Definir mensagens por estado do orçamento",
        "Criar CTA consistente em mobile/desktop",
        "Adicionar copiar mensagem/link como fallback",
        "Testar número inválido e ausência de WhatsApp",
        "Validar fluxo cliente novo → enviar em poucos toques"
      )
    },
    {
      id: uid(),
      title: "Instagram: definir função real no produto",
      epic: "Instagram",
      assignee: "Adriel",
      priority: "high",
      points: 8,
      status: "backlog",
      description: "Redesenhar a presença/integração de Instagram para que ajude aquisição, prova social ou compartilhamento de orçamento — e não seja só um link solto.",
      notes: "Antes de codar, fechar objetivo: perfil profissional, share card, captação de lead ou combinação destes.",
      checklist: checklist(
        "Auditar Instagram atual",
        "Definir job-to-be-done principal",
        "Desenhar fluxo de compartilhamento",
        "Criar preview/card visual do orçamento",
        "Validar experiência mobile",
        "Instrumentar cliques/uso"
      )
    },
    {
      id: uid(),
      title: "Lista de orçamentos com filtros",
      epic: "CRM / Orçamentos",
      assignee: "Adriel",
      priority: "high",
      points: 5,
      status: "planned",
      description: "Criar visão operacional para localizar orçamento por cliente, status, período e valor sem depender do dashboard.",
      notes: "",
      checklist: checklist(
        "Definir colunas essenciais",
        "Filtro por status",
        "Busca por cliente",
        "Filtro por período",
        "Ordenação por atualização/valor",
        "Abrir orçamento direto da lista"
      )
    },
    {
      id: uid(),
      title: "Cliente clicável com histórico e edição",
      epic: "CRM / Clientes",
      assignee: "Adriel",
      priority: "high",
      points: 8,
      status: "planned",
      description: "Transformar cliente em entidade útil: editar cadastro, ver histórico e iniciar orçamento em contexto.",
      notes: "",
      checklist: checklist(
        "Abrir detalhe ao clicar no cliente",
        "Editar dados do cliente",
        "Mostrar histórico de orçamentos",
        "Criar orçamento a partir do cliente",
        "Exibir totais e último contato"
      )
    },
    {
      id: uid(),
      title: "Salvar e enviar em um passo",
      epic: "Orçamentos / UX",
      assignee: "Adriel",
      priority: "high",
      points: 3,
      status: "backlog",
      description: "Adicionar ação principal que salva o orçamento e abre o envio imediatamente, mantendo salvar rascunho como alternativa.",
      notes: "",
      checklist: checklist(
        "Definir CTA principal",
        "Garantir persistência antes de compartilhar",
        "Abrir WhatsApp com mensagem pronta",
        "Tratar erro sem perder dados"
      )
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
      checklist: checklist(
        "Adicionar CTA no pedido",
        "Pré-preencher cliente",
        "Pré-preencher contexto do pedido",
        "Marcar pedido como convertido"
      )
    },
    {
      id: uid(),
      title: "Observações padrão por empresa",
      epic: "Orçamentos / Produtividade",
      assignee: "Adriel",
      priority: "medium",
      points: 3,
      status: "backlog",
      description: "Permitir textos padrão para garantia, validade, condições e observações repetitivas.",
      notes: "",
      checklist: checklist(
        "Criar configuração por empresa",
        "Aplicar no novo orçamento",
        "Permitir editar sem alterar o padrão",
        "Exibir corretamente no PDF/página pública"
      )
    },
    {
      id: uid(),
      title: "Testes automáticos das regras de dinheiro",
      epic: "Qualidade / CI",
      assignee: "Cesar",
      priority: "high",
      points: 5,
      status: "planned",
      description: "Cobrir cálculos de subtotal, desconto, quantidade decimal, total e arredondamento, rodando no CI.",
      notes: "",
      checklist: checklist(
        "Mapear funções de cálculo",
        "Casos com quantidade decimal",
        "Casos com desconto",
        "Casos de arredondamento",
        "Executar testes no CI"
      )
    },
    {
      id: uid(),
      title: "Teste E2E completo em produção",
      epic: "Qualidade / Release",
      assignee: "Cesar",
      priority: "critical",
      points: 5,
      status: "backlog",
      description: "Validar o caminho real: cadastro → onboarding → cliente → orçamento → envio → visualização → alteração/aprovação → PDF.",
      notes: "Executar depois de banco, seed, storage e ciclo de alteração estarem fechados.",
      checklist: checklist(
        "Cadastro e onboarding",
        "Criar cliente",
        "Criar orçamento com foto/logo",
        "Abrir página pública",
        "Pedir alteração e reenviar",
        "Aprovar/recusar",
        "Gerar PDF"
      )
    },
    {
      id: uid(),
      title: "Revisar cache offline/PWA do painel",
      epic: "PWA / Confiabilidade",
      assignee: "Cesar",
      priority: "medium",
      points: 3,
      status: "backlog",
      description: "Evitar que o app entregue tela administrativa obsoleta ou comportamento confuso por cache offline.",
      notes: "",
      checklist: checklist(
        "Mapear service worker/cache atual",
        "Separar assets estáticos de dados privados",
        "Definir estratégia de invalidação",
        "Testar atualização de versão"
      )
    },
    {
      id: uid(),
      title: "Follow-up automático de orçamento",
      epic: "Crescimento / Follow-up",
      assignee: "Adriel",
      priority: "medium",
      points: 8,
      status: "backlog",
      description: "Ajudar o prestador a recuperar orçamentos visualizados e não respondidos com cadência simples e controlável.",
      notes: "Feature nova. Só entra depois do core de produção estável.",
      checklist: checklist(
        "Definir gatilhos e cadência",
        "Criar preferências por empresa",
        "Criar mensagens sugeridas",
        "Registrar follow-ups enviados",
        "Permitir pausar por orçamento"
      )
    },
    {
      id: uid(),
      title: "Pagamento do cliente final via Pix",
      epic: "Pagamentos",
      assignee: "Cesar",
      priority: "medium",
      points: 13,
      status: "backlog",
      description: "Permitir que o cliente pague o prestador pelo orçamento aprovado, com conciliação e status claro.",
      notes: "Não confundir com a assinatura do ORÇAH no Asaas.",
      checklist: checklist(
        "Definir modelo de pagamento",
        "Criar cobrança ligada ao orçamento",
        "Exibir Pix ao cliente",
        "Processar webhook",
        "Conciliar status no orçamento",
        "Tratar cancelamento/expiração"
      )
    },
    {
      id: uid(),
      title: "Módulo financeiro",
      epic: "Financeiro",
      assignee: "Cesar",
      priority: "medium",
      points: 13,
      status: "backlog",
      description: "Transformar orçamentos aprovados/pagos em visão financeira útil para o prestador.",
      notes: "Feature de fase 2.",
      checklist: checklist(
        "Definir entradas/saídas mínimas",
        "Recebíveis por orçamento",
        "Status de pagamento",
        "Resumo por período",
        "Exportação"
      )
    },
    {
      id: uid(),
      title: "Ordem de serviço",
      epic: "Operação",
      assignee: "Adriel",
      priority: "medium",
      points: 8,
      status: "backlog",
      description: "Converter orçamento aprovado em execução: escopo, status, responsável, datas e observações.",
      notes: "",
      checklist: checklist(
        "Definir entidade/estados",
        "Converter orçamento aprovado",
        "Tela de execução",
        "Histórico de mudanças",
        "Finalizar serviço"
      )
    },
    {
      id: uid(),
      title: "Agenda de serviços",
      epic: "Agenda",
      assignee: "Adriel",
      priority: "medium",
      points: 8,
      status: "backlog",
      description: "Agendar visita ou execução diretamente a partir do cliente/orçamento/ordem de serviço.",
      notes: "",
      checklist: checklist(
        "Visão diária/semanal",
        "Criar evento a partir de orçamento",
        "Vincular cliente e endereço",
        "Reagendamento",
        "Lembrete"
      )
    },
    {
      id: uid(),
      title: "Orçamento por voz",
      epic: "IA / Produtividade",
      assignee: "Adriel",
      priority: "low",
      points: 13,
      status: "backlog",
      description: "Prestador dita serviço, quantidades e observações; ORÇAH estrutura um rascunho editável.",
      notes: "Feature de fase posterior, depois de dados e fluxos estarem sólidos.",
      checklist: checklist(
        "Definir formato de comando",
        "Transcrever áudio",
        "Extrair itens e quantidades",
        "Mapear para molde profissional",
        "Tela de revisão antes de salvar"
      )
    },
    {
      id: uid(),
      title: "NFS-e",
      epic: "Fiscal",
      assignee: "Cesar",
      priority: "low",
      points: 13,
      status: "backlog",
      description: "Preparar arquitetura para emissão fiscal ligada ao serviço concluído/pago.",
      notes: "Depende de escopo fiscal e provedores; tratar como épico, não quick win.",
      checklist: checklist(
        "Escolher estratégia/provedor",
        "Mapear municípios alvo",
        "Definir dados fiscais necessários",
        "Criar fluxo de emissão",
        "Armazenar retorno/documento"
      )
    },
    {
      id: uid(),
      title: "Pós-venda e pedido de avaliação",
      epic: "Crescimento / Pós-venda",
      assignee: "Adriel",
      priority: "low",
      points: 8,
      status: "backlog",
      description: "Após conclusão, facilitar agradecimento, avaliação e nova oportunidade de serviço.",
      notes: "",
      checklist: checklist(
        "Definir gatilho de conclusão",
        "Mensagem de agradecimento",
        "Pedido de avaliação",
        "Registrar retorno do cliente",
        "Criar lembrete de recompra quando fizer sentido"
      )
    },

    {
      id: uid(),
      title: "Corrigir redirecionamento pós-login",
      epic: "Produção / Login",
      assignee: "Cesar",
      priority: "critical",
      points: 3,
      status: "done",
      description: "Manter páginas das empresas em /empresa/<slug> e cookie no mesmo endereço enquanto não existe domínio próprio.",
      notes: "Concluído na auditoria atual.",
      checklist: [
        { id: uid(), text: "Remover subdomínio inexistente", done: true, comments: [] },
        { id: uid(), text: "Ajustar cookie de sessão", done: true, comments: [] },
        { id: uid(), text: "Validar desenvolvimento local", done: true, comments: [] }
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
      description: "Totais e observações em largura correta, cabeçalho repetido, logo do prestador, máscaras e arquivo menor.",
      notes: "Concluído na auditoria atual.",
      checklist: [
        { id: uid(), text: "Corrigir largura dos blocos", done: true, comments: [] },
        { id: uid(), text: "Repetir cabeçalho por página", done: true, comments: [] },
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
      description: "Confirmação antes de aprovar, contato em todos os estados e correção de zoom no iPhone.",
      notes: "Concluído na auditoria atual.",
      checklist: [
        { id: uid(), text: "Confirmação de aprovação", done: true, comments: [] },
        { id: uid(), text: "Botão de contato", done: true, comments: [] },
        { id: uid(), text: "Corrigir input no iPhone", done: true, comments: [] }
      ]
    },
    {
      id: uid(),
      title: "Erros legíveis e formulário de orçamento robusto",
      epic: "UX / Formulários",
      assignee: "Adriel",
      priority: "high",
      points: 5,
      status: "done",
      description: "Erros visíveis, preview igual ao servidor, prevenção de cliente duplicado e formulários com melhor autocomplete/teclado.",
      notes: "Concluído na auditoria atual.",
      checklist: [
        { id: uid(), text: "Erro na barra fixa", done: true, comments: [] },
        { id: uid(), text: "Preview de valores corrigido", done: true, comments: [] },
        { id: uid(), text: "Evitar cliente duplicado", done: true, comments: [] },
        { id: uid(), text: "Erros do servidor legíveis", done: true, comments: [] }
      ]
    }
  ];

  let cards = loadCards();
  let meetings = loadMeetings();
  let workingCard = null;
  let activeCardId = null;

  const $ = selector => document.querySelector(selector);
  const board = $("#board");
  const cardModal = $("#cardModal");
  const newCardModal = $("#newCardModal");

  function loadCards() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          const migrated = migrateCards(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
          return migrated;
        }
      }
    } catch (error) {
      console.warn("Não foi possível carregar o board salvo.", error);
    }
    const initial = migrateCards(seedCards());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  function loadMeetings() {
    try {
      const raw = localStorage.getItem(MEETING_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistMeetings() {
    localStorage.setItem(MEETING_KEY, JSON.stringify(meetings));
  }

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
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function cardPointValue(card) {
    const subcards = Array.isArray(card.subcards) ? card.subcards : [];
    if (subcards.length) return subcards.reduce((sum, sub) => sum + Number(sub.points || 0), 0);
    return Number(card.points || 0);
  }

  function cardDonePoints(card) {
    const subcards = Array.isArray(card.subcards) ? card.subcards : [];
    if (subcards.length) {
      return subcards
        .filter(sub => sub.status === "done")
        .reduce((sum, sub) => sum + Number(sub.points || 0), 0);
    }
    return card.status === "done" ? Number(card.points || 0) : 0;
  }

  function allChecklistItems(card) {
    return [
      ...(card.checklist || []),
      ...(card.subcards || []).flatMap(sub => sub.checklist || [])
    ];
  }

  function getFilters() {
    return {
      search: normalize($("#searchInput").value.trim()),
      assignee: $("#assigneeFilter").value,
      priority: $("#priorityFilter").value
    };
  }

  function cardMatches(card, filters) {
    if (filters.assignee !== "all" && card.assignee !== filters.assignee) return false;
    if (filters.priority !== "all" && card.priority !== filters.priority) return false;
    if (!filters.search) return true;
    const haystack = [
      card.title,
      card.epic,
      card.description,
      card.notes,
      ...(card.checklist || []).map(item => item.text),
      ...(card.checklist || []).flatMap(item => (item.comments || []).map(comment => comment.text)),
      ...(card.subcards || []).flatMap(sub => [
        sub.title,
        sub.description,
        sub.assignee,
        ...(sub.checklist || []).map(item => item.text),
        ...(sub.checklist || []).flatMap(item => (item.comments || []).map(comment => comment.text))
      ])
    ].join(" ");
    return normalize(haystack).includes(filters.search);
  }

  function checklistStats(card) {
    const items = allChecklistItems(card);
    const total = items.length;
    const done = items.filter(item => item.done).length;
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }

  function renderBoard() {
    const filters = getFilters();
    board.innerHTML = "";

    COLUMNS.forEach(column => {
      const allInColumn = cards.filter(card => card.status === column.key);
      const visible = allInColumn.filter(card => cardMatches(card, filters));
      const points = visible.reduce((sum, card) => sum + cardPointValue(card), 0);

      const columnEl = document.createElement("section");
      columnEl.className = "kanban-column";
      columnEl.dataset.status = column.key;
      columnEl.innerHTML = `
        <header class="column-head">
          <div class="column-name">
            <i class="column-marker" style="background:${column.color}"></i>
            <span class="column-title">${column.title}</span>
            <span class="column-count">${visible.length}</span>
          </div>
          <span class="column-points">${points} pts</span>
        </header>
        <div class="column-list" data-drop-status="${column.key}"></div>
      `;

      const list = columnEl.querySelector(".column-list");

      if (!visible.length) {
        list.innerHTML = `<div class="empty-column">${allInColumn.length ? "Nenhum card com esses filtros" : "Solte uma tarefa aqui"}</div>`;
      } else {
        visible.forEach(card => list.appendChild(renderCard(card)));
      }

      list.addEventListener("dragover", event => {
        event.preventDefault();
        list.classList.add("drag-over");
      });
      list.addEventListener("dragleave", () => list.classList.remove("drag-over"));
      list.addEventListener("drop", event => {
        event.preventDefault();
        list.classList.remove("drag-over");
        const id = event.dataTransfer.getData("text/plain");
        moveCard(id, column.key);
      });

      board.appendChild(columnEl);
    });

    renderStats();
    renderStructure();
    renderMeetings();
  }

  function renderCard(card) {
    const task = document.createElement("article");
    const progress = checklistStats(card);
    task.className = `task-card priority-${card.priority}`;
    task.draggable = true;
    task.dataset.id = card.id;

    const description = card.description || "Sem definição de pronto.";
    task.innerHTML = `
      <div class="card-top">
        <span class="epic-pill" title="${escapeHTML(card.epic)}">${escapeHTML(card.epic)}</span>
        <div class="card-menu-wrap">
          <button class="card-menu-btn" type="button" aria-label="Ações">⋮</button>
          <div class="card-menu" hidden>
            <button type="button" data-action="open">Abrir detalhes</button>
            <button type="button" data-action="next">Mover adiante</button>
            <button type="button" data-action="duplicate">Duplicar</button>
            <button type="button" class="danger" data-action="delete">Excluir</button>
          </div>
        </div>
      </div>
      <h3>${escapeHTML(card.title)}</h3>
      <p>${escapeHTML(description)}</p>
      ${(card.subcards || []).length ? `
        <div class="card-subcards">
          <span class="subcard-count">${card.subcards.length} subcards</span>
          <span>${card.subcards.filter(sub => sub.status === "done").length}/${card.subcards.length} concluídos</span>
        </div>
      ` : ""}
      <div class="card-progress">
        <div class="progress-row">
          <span>Checklist</span>
          <span>${progress.done}/${progress.total}</span>
        </div>
        <div class="mini-track"><div class="mini-fill" style="width:${progress.percent}%"></div></div>
      </div>
      <footer class="card-foot">
        <div class="card-meta">
          <span class="pin ${card.priority}">${PRIORITIES[card.priority].short}</span>
          <span class="points-badge">${cardPointValue(card)} pts</span>
        </div>
        <span class="assignee-chip ${card.assignee}" title="${card.assignee}">${card.assignee.charAt(0)}</span>
      </footer>
    `;

    task.addEventListener("click", event => {
      if (event.target.closest(".card-menu-wrap")) return;
      openCard(card.id);
    });

    const menuButton = task.querySelector(".card-menu-btn");
    const menu = task.querySelector(".card-menu");

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

    task.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", card.id);
      event.dataTransfer.effectAllowed = "move";
      requestAnimationFrame(() => task.classList.add("dragging"));
    });

    task.addEventListener("dragend", () => task.classList.remove("dragging"));

    return task;
  }

  function renderStats() {
    const totalPoints = cards.reduce((sum, card) => sum + cardPointValue(card), 0);
    const donePoints = cards.reduce((sum, card) => sum + cardDonePoints(card), 0);
    const remaining = totalPoints - donePoints;
    const percent = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0;
    const doing = cards.filter(card => card.status === "doing").length;
    const critical = cards.filter(card => card.priority === "critical" && card.status !== "done").length;
    const done = cards.filter(card => card.status === "done").length;
    const openPointsFor = assignee => cards.reduce((sum, card) => {
      if ((card.subcards || []).length) {
        return sum + card.subcards
          .filter(sub => sub.assignee === assignee && sub.status !== "done")
          .reduce((subSum, sub) => subSum + Number(sub.points || 0), 0);
      }
      return sum + (card.assignee === assignee && card.status !== "done" ? Number(card.points || 0) : 0);
    }, 0);
    const adrielOpen = openPointsFor("Adriel");
    const cesarOpen = openPointsFor("Cesar");

    $("#missionPercent").textContent = `${percent}%`;
    $("#missionFill").style.width = `${percent}%`;
    $("#missionDone").textContent = `${donePoints} pts concluídos`;
    $("#missionTotal").textContent = `${totalPoints} pts totais`;
    $("#statRemaining").textContent = remaining;
    $("#statDoing").textContent = doing;
    $("#statCritical").textContent = critical;
    $("#statDone").textContent = done;
    $("#statAdriel").textContent = `${adrielOpen} pts`;
    $("#statCesar").textContent = `${cesarOpen} pts`;
  }

  function moveCard(id, status) {
    const card = cards.find(item => item.id === id);
    if (!card || card.status === status) return;
    card.status = status;
    persist();
    renderBoard();
    toast(`“${card.title}” movido para ${COLUMNS.find(col => col.key === status)?.title || status}.`);
  }

  function moveNext(id) {
    const card = cards.find(item => item.id === id);
    if (!card) return;
    const index = COLUMNS.findIndex(column => column.key === card.status);
    if (index < 0 || index === COLUMNS.length - 1) {
      toast("Essa tarefa já está concluída.");
      return;
    }
    moveCard(id, COLUMNS[index + 1].key);
  }

  function duplicateCard(id) {
    const source = cards.find(item => item.id === id);
    if (!source) return;
    const copy = JSON.parse(JSON.stringify(source));
    copy.id = uid();
    copy.title = `${copy.title} — cópia`;
    copy.status = "planned";
    copy.checklist = (copy.checklist || []).map(item => ({
      ...item,
      id: uid(),
      done: false,
      comments: []
    }));
    cards.push(copy);
    persist();
    renderBoard();
    toast("Tarefa duplicada.");
  }

  function deleteCard(id) {
    const card = cards.find(item => item.id === id);
    if (!card) return;
    if (!confirm(`Excluir “${card.title}”? Essa ação não pode ser desfeita.`)) return;
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
    $("#cardModalTitle").textContent = workingCard.title;
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

  function syncModalFieldsToWorkingCard() {
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

  function saveWorkingCard({ complete = false } = {}) {
    if (!workingCard || !activeCardId) return;
    syncModalFieldsToWorkingCard();

    if (!workingCard.title) {
      toast("A tarefa precisa de um título.");
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
    cards[index] = workingCard;
    persist();
    closeCardModal();
    renderBoard();
    toast(complete ? "Entrega concluída. Boa." : "Alterações salvas.");
  }

  function renderSubcardsEditor() {
    const container = $("#subcardsContainer");
    container.innerHTML = "";
    if (!workingCard) return;
    if (!Array.isArray(workingCard.subcards)) workingCard.subcards = [];

    if (!workingCard.subcards.length) {
      const empty = document.createElement("div");
      empty.className = "empty-column";
      empty.textContent = "Sem subcards. Use subcards quando este bloco tiver componentes ou implementações internas.";
      container.appendChild(empty);
      return;
    }

    workingCard.subcards.forEach(subcard => {
      const fragment = $("#subcardTemplate").content.cloneNode(true);
      const details = fragment.querySelector(".subcard-editor");
      const title = fragment.querySelector(".subcard-title");
      const assignee = fragment.querySelector(".subcard-assignee");
      const points = fragment.querySelector(".subcard-points");
      const status = fragment.querySelector(".subcard-status");
      const description = fragment.querySelector(".subcard-description");
      const summaryTitle = fragment.querySelector(".subcard-summary-title");
      const summaryPoints = fragment.querySelector(".subcard-summary-points");
      const summaryAssignee = fragment.querySelector(".subcard-summary-assignee");
      const stateDot = fragment.querySelector(".subcard-state-dot");
      const list = fragment.querySelector(".subcard-checklist");

      title.value = subcard.title || "";
      assignee.value = subcard.assignee || workingCard.assignee || "Adriel";
      points.value = String(subcard.points || 3);
      status.value = subcard.status || "planned";
      description.value = subcard.description || "";

      const refreshSummary = () => {
        summaryTitle.textContent = subcard.title || "Subcard sem nome";
        summaryPoints.textContent = `${subcard.points || 0} pts`;
        summaryAssignee.textContent = (subcard.assignee || "?").charAt(0);
        const color = COLUMNS.find(column => column.key === subcard.status)?.color || "#778b80";
        stateDot.style.background = color;
      };

      title.addEventListener("input", () => { subcard.title = title.value; refreshSummary(); });
      assignee.addEventListener("change", () => { subcard.assignee = assignee.value; refreshSummary(); });
      points.addEventListener("change", () => { subcard.points = Number(points.value); refreshSummary(); });
      status.addEventListener("change", () => { subcard.status = status.value; refreshSummary(); });
      description.addEventListener("input", () => { subcard.description = description.value; });

      fragment.querySelector(".add-subcard-check").addEventListener("click", () => {
        subcard.checklist.push({ id: uid(), text: "Novo item", done: false, comments: [] });
        renderSubcardsEditor();
      });

      fragment.querySelector(".remove-subcard").addEventListener("click", () => {
        workingCard.subcards = workingCard.subcards.filter(item => item.id !== subcard.id);
        renderSubcardsEditor();
      });

      renderNestedChecklist(subcard, list);
      refreshSummary();
      container.appendChild(fragment);
    });
  }

  function renderNestedChecklist(subcard, container) {
    container.innerHTML = "";
    if (!Array.isArray(subcard.checklist)) subcard.checklist = [];

    if (!subcard.checklist.length) {
      const empty = document.createElement("div");
      empty.className = "structure-empty";
      empty.textContent = "Sem checklist neste subcard.";
      container.appendChild(empty);
      return;
    }

    subcard.checklist.forEach(item => {
      const fragment = $("#checklistItemTemplate").content.cloneNode(true);
      const article = fragment.querySelector(".check-item");
      const toggle = fragment.querySelector(".check-toggle");
      const input = fragment.querySelector(".check-text");
      const remove = fragment.querySelector(".remove-check");
      const thread = fragment.querySelector(".comment-thread");
      const commentInput = fragment.querySelector(".comment-input");
      const commentSend = fragment.querySelector(".comment-send");

      if (item.done) article.classList.add("done");
      input.value = item.text || "";

      (item.comments || []).forEach(comment => {
        const element = document.createElement("div");
        element.className = "comment";
        element.innerHTML = `${escapeHTML(comment.text)} <small>· ${escapeHTML(comment.author || subcard.assignee || "Equipe")}</small>`;
        thread.appendChild(element);
      });

      toggle.addEventListener("click", () => {
        item.done = !item.done;
        renderSubcardsEditor();
      });
      input.addEventListener("input", () => { item.text = input.value; });
      remove.addEventListener("click", () => {
        subcard.checklist = subcard.checklist.filter(check => check.id !== item.id);
        renderSubcardsEditor();
      });

      const send = () => {
        const text = commentInput.value.trim();
        if (!text) return;
        if (!Array.isArray(item.comments)) item.comments = [];
        item.comments.push({ id: uid(), text, author: subcard.assignee || "Equipe", at: new Date().toISOString() });
        renderSubcardsEditor();
      };
      commentSend.addEventListener("click", send);
      commentInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          send();
        }
      });

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
      "Defina aqui o componente, implementação ou tecnologia que precisa ficar pronta.",
      []
    ));
    renderSubcardsEditor();
    const details = $("#subcardsContainer").querySelectorAll(".subcard-editor");
    const last = details[details.length - 1];
    if (last) {
      last.open = true;
      last.querySelector(".subcard-title")?.select();
    }
  }

  function renderChecklistEditor() {
    const container = $("#checklistContainer");
    container.innerHTML = "";

    if (!workingCard.checklist) workingCard.checklist = [];

    if (!workingCard.checklist.length) {
      const empty = document.createElement("div");
      empty.className = "empty-column";
      empty.textContent = "Sem checklist. Adicione os passos desta entrega.";
      container.appendChild(empty);
      return;
    }

    workingCard.checklist.forEach(item => {
      const fragment = $("#checklistItemTemplate").content.cloneNode(true);
      const article = fragment.querySelector(".check-item");
      const toggle = fragment.querySelector(".check-toggle");
      const input = fragment.querySelector(".check-text");
      const remove = fragment.querySelector(".remove-check");
      const thread = fragment.querySelector(".comment-thread");
      const commentInput = fragment.querySelector(".comment-input");
      const commentSend = fragment.querySelector(".comment-send");

      article.dataset.itemId = item.id;
      if (item.done) article.classList.add("done");
      input.value = item.text;

      (item.comments || []).forEach(comment => {
        const element = document.createElement("div");
        element.className = "comment";
        element.innerHTML = `${escapeHTML(comment.text)} <small>· ${escapeHTML(comment.author || "Equipe")}</small>`;
        thread.appendChild(element);
      });

      toggle.addEventListener("click", () => {
        item.done = !item.done;
        renderChecklistEditor();
      });

      input.addEventListener("input", () => {
        item.text = input.value;
      });

      remove.addEventListener("click", () => {
        workingCard.checklist = workingCard.checklist.filter(check => check.id !== item.id);
        renderChecklistEditor();
      });

      const sendComment = () => {
        const text = commentInput.value.trim();
        if (!text) return;
        if (!item.comments) item.comments = [];
        item.comments.push({
          id: uid(),
          text,
          author: workingCard.assignee || "Equipe",
          at: new Date().toISOString()
        });
        renderChecklistEditor();
      };

      commentSend.addEventListener("click", sendComment);
      commentInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
          event.preventDefault();
          sendComment();
        }
      });

      container.appendChild(fragment);
    });
  }

  function addChecklistItem() {
    if (!workingCard) return;
    if (!workingCard.checklist) workingCard.checklist = [];
    workingCard.checklist.push({
      id: uid(),
      text: "Novo item",
      done: false,
      comments: []
    });
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
    setTimeout(() => $("#newCardForm input[name='title']").focus(), 30);
  }

  function closeNewCardModal() {
    newCardModal.hidden = true;
    document.body.style.overflow = "";
  }

  function createCardFromForm(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const card = {
      id: uid(),
      title: String(form.get("title") || "").trim(),
      epic: String(form.get("epic") || "").trim(),
      assignee: String(form.get("assignee") || "Adriel"),
      priority: String(form.get("priority") || "medium"),
      points: Number(form.get("points") || 3),
      status: String(form.get("status") || "planned"),
      description: String(form.get("description") || "").trim(),
      notes: "",
      subcards: [],
      hierarchySeeded: true,
      checklist: []
    };
    cards.push(card);
    persist();
    closeNewCardModal();
    renderBoard();
    toast("Nova tarefa criada.");
  }

  function setView(view) {
    document.querySelectorAll(".view-tab").forEach(button => {
      button.classList.toggle("active", button.dataset.view === view);
    });
    $("#kanbanView").hidden = view !== "kanban";
    $("#structureView").hidden = view !== "structure";
    $("#meetingsView").hidden = view !== "meetings";
    if (view === "structure") renderStructure();
    if (view === "meetings") renderMeetings();
  }

  function renderStructure() {
    const tree = $("#structureTree");
    if (!tree) return;
    const groups = new Map();
    cards.forEach(card => {
      const key = card.epic || "Sem frente";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(card);
    });

    tree.innerHTML = "";
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
      .forEach(([epic, groupCards]) => {
        const section = document.createElement("section");
        section.className = "structure-epic";
        const points = groupCards.reduce((sum, card) => sum + cardPointValue(card), 0);
        section.innerHTML = `
          <header class="structure-epic-head">
            <h3>${escapeHTML(epic)}</h3>
            <span>${groupCards.length} blocos · ${points} pts</span>
          </header>
          <div class="structure-blocks"></div>
        `;
        const blocks = section.querySelector(".structure-blocks");

        groupCards.forEach(card => {
          const block = document.createElement("article");
          block.className = "structure-block";
          const subcards = card.subcards || [];
          block.innerHTML = `
            <div class="structure-block-main">
              <div class="structure-block-title">
                <strong>${escapeHTML(card.title)}</strong>
                <small>${escapeHTML(card.description || "")}</small>
              </div>
              <span class="points-badge">${cardPointValue(card)} pts</span>
              <button class="btn btn-ghost compact" type="button" data-open-card="${card.id}">Abrir bloco</button>
            </div>
            <div class="structure-subcards">
              ${subcards.length ? subcards.map(sub => `
                <div class="structure-subcard">
                  <div>
                    <strong>${escapeHTML(sub.title)}</strong>
                    <small>${escapeHTML(sub.description || "Sem pré-definição")}</small>
                  </div>
                  <span class="points-badge">${Number(sub.points || 0)} pts</span>
                  <span class="pin ${sub.status === "done" ? "low" : card.priority}">${escapeHTML(sub.assignee || card.assignee)}</span>
                </div>
              `).join("") : '<span class="structure-empty">Este bloco ainda não foi quebrado em subcards.</span>'}
            </div>
          `;
          block.querySelector("[data-open-card]").addEventListener("click", () => openCard(card.id));
          blocks.appendChild(block);
        });

        tree.appendChild(section);
      });
  }

  function renderMeetings() {
    const list = $("#meetingList");
    if (!list) return;
    $("#meetingCount").textContent = String(meetings.length);
    $("#meetingBadge").textContent = String(meetings.length);
    list.innerHTML = "";

    if (!meetings.length) {
      list.innerHTML = '<div class="empty-column">Nenhum assunto pendente. Ideias e pedidos de reunião aparecem aqui antes de entrarem no roadmap.</div>';
      return;
    }

    meetings
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(item => {
        const article = document.createElement("article");
        article.className = "meeting-item";
        article.innerHTML = `
          <div class="meeting-item-head">
            <div>
              <span class="meeting-origin">${escapeHTML(item.client)}</span>
              <h4>${escapeHTML(item.title)}</h4>
            </div>
            <span class="pin ${item.priority}">${PRIORITIES[item.priority]?.short || "MÉDIA"}</span>
          </div>
          <p>${escapeHTML(item.context || "Sem contexto adicional.")}</p>
          <div class="meeting-item-meta">
            <span>Triagem: ${escapeHTML(item.owner)}</span>
            <span>·</span>
            <span>${new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
          <div class="meeting-item-actions">
            <button class="btn btn-primary compact" type="button" data-convert>Virar card</button>
            <button class="btn btn-danger-ghost compact" type="button" data-remove>Descartar</button>
          </div>
        `;
        article.querySelector("[data-convert]").addEventListener("click", () => convertMeetingToCard(item.id));
        article.querySelector("[data-remove]").addEventListener("click", () => removeMeeting(item.id));
        list.appendChild(article);
      });
  }

  function addMeeting(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    meetings.push({
      id: uid(),
      client: String(form.get("client") || "").trim(),
      title: String(form.get("title") || "").trim(),
      context: String(form.get("context") || "").trim(),
      priority: String(form.get("priority") || "medium"),
      owner: String(form.get("owner") || "Adriel"),
      createdAt: new Date().toISOString()
    });
    persistMeetings();
    event.currentTarget.reset();
    renderMeetings();
    toast("Assunto adicionado à pré-produção.");
  }

  function convertMeetingToCard(id) {
    const item = meetings.find(entry => entry.id === id);
    if (!item) return;
    cards.push({
      id: uid(),
      title: item.title,
      epic: "Pré-produção / " + item.client,
      assignee: item.owner,
      priority: item.priority,
      points: 3,
      status: "planned",
      description: item.context || "Assunto convertido da área de reuniões/pré-produção.",
      notes: "Origem: " + item.client,
      subcards: [],
      hierarchySeeded: true,
      checklist: []
    });
    meetings = meetings.filter(entry => entry.id !== id);
    persist();
    persistMeetings();
    renderBoard();
    toast("Assunto convertido em card do Kanban.");
  }

  function removeMeeting(id) {
    meetings = meetings.filter(entry => entry.id !== id);
    persistMeetings();
    renderMeetings();
    toast("Assunto removido da pré-produção.");
  }

  function exportBoard() {
    const payload = {
      product: "ORÇAH",
      exportedAt: new Date().toISOString(),
      version: 2,
      cards,
      meetings
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
    toast("Board exportado em JSON.");
  }

  function importBoard(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const importedCards = Array.isArray(parsed) ? parsed : parsed.cards;
        if (!Array.isArray(importedCards)) throw new Error("Formato inválido");
        cards = migrateCards(importedCards);
        if (Array.isArray(parsed.meetings)) meetings = parsed.meetings;
        persist();
        persistMeetings();
        renderBoard();
        toast("Board importado com sucesso.");
      } catch {
        toast("Não foi possível importar esse arquivo.");
      }
    };
    reader.readAsText(file);
  }

  function toast(message) {
    const region = $("#toastRegion");
    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    region.appendChild(item);
    setTimeout(() => item.remove(), 2800);
  }

  function wireEvents() {
    document.querySelectorAll(".view-tab").forEach(button => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });
    $("#meetingForm").addEventListener("submit", addMeeting);

    $("#searchInput").addEventListener("input", renderBoard);
    $("#assigneeFilter").addEventListener("change", renderBoard);
    $("#priorityFilter").addEventListener("change", renderBoard);

    $("#resetFiltersBtn").addEventListener("click", () => {
      $("#searchInput").value = "";
      $("#assigneeFilter").value = "all";
      $("#priorityFilter").value = "all";
      renderBoard();
    });

    $("#newCardBtn").addEventListener("click", openNewCardModal);
    $("#closeNewCardModal").addEventListener("click", closeNewCardModal);
    $("#cancelNewCardBtn").addEventListener("click", closeNewCardModal);
    $("#newCardForm").addEventListener("submit", createCardFromForm);

    $("#closeCardModal").addEventListener("click", closeCardModal);
    $("#addSubcardBtn").addEventListener("click", addSubcard);
    $("#addChecklistBtn").addEventListener("click", addChecklistItem);
    $("#saveCardBtn").addEventListener("click", () => saveWorkingCard());
    $("#completeCardBtn").addEventListener("click", () => saveWorkingCard({ complete: true }));
    $("#deleteCardBtn").addEventListener("click", () => activeCardId && deleteCard(activeCardId));

    $("#editTitle").addEventListener("input", event => {
      $("#cardModalTitle").textContent = event.target.value || "Detalhes da tarefa";
    });
    $("#editEpic").addEventListener("input", event => {
      $("#modalEpic").textContent = event.target.value || "TAREFA";
    });

    $("#exportBtn").addEventListener("click", exportBoard);
    $("#importBtn").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (file) importBoard(file);
      event.target.value = "";
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".card-menu-wrap")) {
        document.querySelectorAll(".card-menu").forEach(menu => { menu.hidden = true; });
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
      if (!cardModal.hidden) closeCardModal();
      if (!newCardModal.hidden) closeNewCardModal();
    });
  }

  wireEvents();
  renderBoard();
  setView("kanban");
})();
