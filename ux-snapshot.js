window.ORCAH_UX_SNAPSHOT = (() => {
  const commit = "5c20190a6324bdbf8c82581c9da4c7df328071b8";
  const origin = "GitHub ORÇAH";

  const block = (type, label, text = "", props = {}) => ({
    id: "blk_" + Math.random().toString(36).slice(2, 10),
    type,
    label,
    text,
    visible: true,
    group: "",
    props
  });

  const screen = (name, route, device, paths, blocks) => ({
    id: "screen_" + route.replace(/[^a-z0-9]+/gi, "_"),
    name,
    route,
    device,
    version: "Atual",
    status: "Atual",
    origin,
    sourceCommit: commit,
    sourcePaths: paths,
    protected: true,
    blocks,
    comments: []
  });

  const painelNav = () => block("NAVBAR", "Navegação do painel", "Início · Pedidos · Clientes · Página · Mais");
  const painelHeader = () => block("HEADER", "Cabeçalho da empresa", "Olá, [nome] · [empresa] · [ramo] · [região]");
  const planBanner = () => block("ALERTA", "Status do plano", "Banner de trial/plano quando aplicável");

  return {
    repository: "AdrielSchimit/orcah-clone",
    branch: "main",
    commit,
    generatedAt: "2026-09-24T18:30:00-03:00",
    screens: [
      screen("Site institucional", "/", "Responsivo", ["src/app/page.tsx"], [
        block("HEADER", "Topo", "Logo ORÇAH · Como funciona · Sua página · Orçamentos · Plano · Perguntas · Entrar · Começar grátis"),
        block("SEÇÃO", "Hero", "Para quem vive de serviço"),
        block("TÍTULO", "Título principal", "Orçamento bonito no WhatsApp. Cliente aprova com um toque."),
        block("TEXTO", "Descrição", "Monte o orçamento pelo celular, mande o link no WhatsApp e veja quando o cliente abriu."),
        block("BOTÃO", "CTA principal", "Criar meu primeiro orçamento", { action: "/cadastro" }),
        block("BOTÃO", "CTA secundário", "Ver como funciona"),
        block("CARD", "Demonstração", "Veja uma página pronta · Pintura Norte"),
        block("SEÇÃO", "Profissões", "Feito para quem vive de serviço · +80 profissões"),
        block("SEÇÃO", "Sua página", "Página pública, fotos, pedido de orçamento e link da bio"),
        block("SEÇÃO", "Como funciona", "Fluxo de criação e envio"),
        block("SEÇÃO", "Orçamentos", "Demonstração do orçamento e resposta"),
        block("SEÇÃO", "Plano", "Preço e teste grátis"),
        block("SEÇÃO", "Perguntas", "FAQ")
      ]),

      screen("Cadastro", "/cadastro", "Responsivo", ["src/app/cadastro/page.tsx", "src/components/auth-form.tsx"], [
        block("HEADER", "BrandBar", "ORÇAH"),
        block("TÍTULO", "Título", "Criar conta"),
        block("SUBTÍTULO", "Introdução", "Um minuto. Depois você escolhe o ramo e o estado."),
        block("INPUT", "Seu nome", "João da Silva"),
        block("INPUT", "Telefone", "49 99999-0000"),
        block("INPUT", "E-mail", "voce@email.com"),
        block("INPUT", "Senha", "Mínimo 6 caracteres"),
        block("BOTÃO", "Criar conta", "Criar conta", { action: "Registrar e seguir para onboarding" }),
        block("TEXTO", "Acesso existente", "Já tem conta?"),
        block("BOTÃO", "Entrar", "Entrar", { action: "/login" })
      ]),

      screen("Login", "/login", "Responsivo", ["src/app/login/page.tsx", "src/components/auth-form.tsx"], [
        block("HEADER", "BrandBar", "ORÇAH"),
        block("TÍTULO", "Título", "Entrar"),
        block("SUBTÍTULO", "Introdução", "Abra o painel da sua empresa."),
        block("INPUT", "E-mail", "voce@email.com"),
        block("INPUT", "Senha", "Sua senha"),
        block("BOTÃO", "Entrar", "Entrar", { action: "Autenticar e abrir painel" }),
        block("BOTÃO", "Esqueci a senha", "Esqueci a senha", { action: "/recuperar-senha" }),
        block("TEXTO", "Sem conta", "Ainda não tem conta?"),
        block("BOTÃO", "Criar agora", "Criar agora", { action: "/cadastro" })
      ]),

      screen("Recuperar senha", "/recuperar-senha", "Responsivo", ["src/app/recuperar-senha/page.tsx"], [
        block("HEADER", "BrandBar", "ORÇAH"),
        block("TÍTULO", "Título", "Recuperar senha"),
        block("ALERTA", "Estado atual", "O envio de e-mail ainda não está ligado. A tela informa que o reset depende de desenvolvimento/banco."),
        block("BOTÃO", "Voltar ao login", "Voltar ao login", { action: "/login" })
      ]),

      screen("Onboarding", "/onboarding", "Responsivo", ["src/app/onboarding/page.tsx", "src/components/onboarding-form.tsx"], [
        block("HEADER", "BrandBar", "ORÇAH"),
        block("TÍTULO", "Título", "Sua empresa"),
        block("SUBTÍTULO", "Introdução", "Olá, [nome]. Escolha o ramo e o estado para começar."),
        block("INPUT", "Nome da empresa", "João Elétrica"),
        block("SELECT", "Ramo", "Ramo profissional ou ramo personalizado"),
        block("INPUT", "WhatsApp", "49 99999-0000"),
        block("SELECT", "Estado", "Selecione"),
        block("INPUT", "Cidade", "Opcional · liberada após escolher estado"),
        block("CHECKBOX", "Trabalho na região", "Atendo também as cidades próximas"),
        block("BOTÃO", "Entrar no Orçah", "Entrar no Orçah", { action: "/painel" })
      ]),

      screen("Início", "/painel", "Responsivo", ["src/app/painel/page.tsx", "src/app/painel/layout.tsx", "src/components/painel-nav.tsx", "src/components/create-budget-cta.tsx"], [
        painelHeader(),
        planBanner(),
        block("BOTÃO", "Criar orçamento", "Criar orçamento", { action: "/painel/orcamentos/novo" }),
        block("CARD", "Enviados no mês", "Quantidade enviada"),
        block("CARD", "Visualizados", "Quantidade visualizada"),
        block("CARD", "Aprovados", "Quantidade aprovada"),
        block("CARD", "Total aprovado", "Valor aprovado no mês"),
        block("SEÇÃO", "Por cidade neste mês", "Cidade · quantidade · total · barra proporcional"),
        block("LISTA", "Últimos orçamentos", "Cliente · número · valor · status"),
        painelNav()
      ]),

      screen("Clientes", "/painel/clientes", "Responsivo", ["src/app/painel/clientes/page.tsx", "src/components/clientes-panel.tsx", "src/components/customer-form.tsx"], [
        painelHeader(),
        planBanner(),
        block("TÍTULO", "Título", "Clientes"),
        block("BOTÃO", "Novo cliente", "+ Novo cliente"),
        block("SEÇÃO", "Formulário de novo cliente", "Nome · Telefone · Mais dados (WhatsApp, e-mail, estado, cidade, bairro, endereço, observações) · Cadastrar cliente", { conditional: true }),
        block("INPUT", "Busca", "Buscar por nome ou telefone"),
        block("LISTA", "Clientes", "Nome · telefone · cidade/UF"),
        block("EMPTY STATE", "Sem clientes", "Nenhum cliente ainda. / Nenhum resultado."),
        painelNav()
      ]),

      screen("Novo orçamento", "/painel/orcamentos/novo", "Responsivo", ["src/app/painel/orcamentos/novo/page.tsx", "src/components/budget-form.tsx"], [
        painelHeader(),
        planBanner(),
        block("TÍTULO", "Título", "Criar orçamento / título definido pelo molde"),
        block("SEÇÃO", "Cliente", "Buscar cliente por nome/telefone ou cadastrar novo cliente"),
        block("INPUT", "Buscar cliente", "Buscar por nome ou telefone"),
        block("BOTÃO", "Novo cliente", "+ Novo cliente"),
        block("SEÇÃO", "Serviço / dados do ramo", "Campos variam conforme o molde: tipo, escopo, placa, equipamento, ano, quilometragem, marca/modelo, diagnóstico, cor, demãos, área, endereço, cidade, data, acesso e outros"),
        block("SEÇÃO", "Itens", "Sugestões do ramo/catálogo + itens do orçamento"),
        block("ITEM", "Item do orçamento", "Grupo/tipo · serviço/descrição · quantidade · unidade · valor · desconto · campos específicos do ramo"),
        block("BOTÃO", "Adicionar item", "+ Adicionar item"),
        block("SEÇÃO", "Resumo", "Validade/prazo quando aplicável · deslocamento quando aplicável · desconto · observações"),
        block("SUBTOTAL", "Subtotal", "Subtotal calculado"),
        block("TOTAL", "Total", "Total calculado"),
        block("BOTÃO", "Salvar orçamento", "Salvar orçamento", { action: "Criar orçamento e abrir detalhe" }),
        painelNav()
      ]),

      screen("Detalhe orçamento", "/painel/orcamentos/[id]", "Responsivo", ["src/app/painel/orcamentos/[id]/page.tsx", "src/components/budget-form.tsx", "src/components/budget-photos-form.tsx", "src/components/send-whatsapp-button.tsx"], [
        painelHeader(),
        planBanner(),
        block("BOTÃO", "Voltar", "Voltar", { action: "/painel" }),
        block("HEADER", "Resumo do orçamento", "Número · cliente · status · visualização · cidade do serviço"),
        block("TOTAL", "Total", "Valor total em destaque"),
        block("ALERTA", "Pedido de alteração", "Mensagem do cliente quando houver", { conditional: true }),
        block("WHATSAPP", "Enviar no WhatsApp", "Enviar orçamento pelo WhatsApp"),
        block("BOTÃO", "Baixar PDF", "Baixar PDF"),
        block("BOTÃO", "Copiar link", "Copiar link"),
        block("IMAGEM", "Fotos", "Galeria/fotos do orçamento"),
        block("SEÇÃO", "Edição", "BudgetForm completo quando status permite edição", { conditional: true }),
        block("LISTA", "Itens em modo leitura", "Itens agrupados, detalhes e valores quando edição não é permitida", { conditional: true }),
        block("SEÇÃO", "Histórico", "Eventos recentes do orçamento"),
        painelNav()
      ]),

      screen("Pedidos", "/painel/pedidos", "Responsivo", ["src/app/painel/pedidos/page.tsx", "src/components/pedidos-list.tsx"], [
        painelHeader(),
        planBanner(),
        block("TÍTULO", "Título", "Pedidos de orçamento"),
        block("LISTA", "Pedidos", "Nome · telefone · status · tempo · serviço desejado · descrição · cidade/bairro · horário"),
        block("WHATSAPP", "Responder no WhatsApp", "Responder no WhatsApp"),
        block("BOTÃO", "Marcar como contatado", "Marcar como contatado"),
        block("BOTÃO", "Arquivar", "Arquivar"),
        block("EMPTY STATE", "Sem pedidos", "Nenhum pedido ainda. Compartilhe o link da sua página."),
        painelNav()
      ]),

      screen("Página da empresa", "/painel/empresa", "Responsivo", ["src/app/painel/empresa/page.tsx", "src/components/company-profile-form.tsx", "src/components/company-gallery-form.tsx"], [
        painelHeader(),
        planBanner(),
        block("TÍTULO", "Título", "Sua página"),
        block("CARD", "Prévia", "Logo · nome · ramo · região · até duas fotos · botão Pedir orçamento"),
        block("TEXTO", "Link da bio", "URL pública da empresa"),
        block("BOTÃO", "Copiar link da bio", "Copiar link da bio"),
        block("BOTÃO", "Ver página", "Ver página"),
        block("SEÇÃO", "Perfil público", "Logo · descrição · horário · WhatsApp · telefone · Instagram · site · Facebook · Salvar perfil"),
        block("SEÇÃO", "Galeria — nossos trabalhos", "Foto · título · Adicionar foto · grade de fotos · Remover"),
        painelNav()
      ]),

      screen("Plano", "/painel/plano", "Responsivo", ["src/app/painel/plano/page.tsx"], [
        painelHeader(),
        block("TÍTULO", "Título", "Plano"),
        block("SUBTÍTULO", "Descrição", "Um plano só. R$ 29/mês. Sem tabela confusa."),
        block("CARD", "Plano único", "R$ 29/mês · status e detalhe do plano"),
        block("LISTA", "Benefícios", "Orçamentos e clientes ilimitados · Link público + WhatsApp · PDF profissional · Página da empresa na bio · PWA"),
        block("SEÇÃO", "Pagamento", "Plano ativo / checkout Asaas / aviso de configuração"),
        painelNav()
      ]),

      screen("Mais", "/painel/mais", "Responsivo", ["src/app/painel/mais/page.tsx"], [
        painelHeader(),
        planBanner(),
        block("TÍTULO", "Título", "Mais"),
        block("LISTA", "Opções", "Plano · Ver página pública · Conta"),
        block("BOTÃO", "Sair", "Sair"),
        painelNav()
      ]),

      screen("Página pública", "/empresa/[slug]", "Responsivo", ["src/app/empresa/[slug]/page.tsx", "src/components/quote-request-form.tsx"], [
        block("HEADER", "Empresa", "Logo · nome · ramo · região · descrição"),
        block("BOTÃO", "Pedir orçamento", "Pedir orçamento"),
        block("IMAGEM", "Nossos trabalhos", "Galeria de trabalhos com título"),
        block("CARD", "Entre em contato", "WhatsApp · Instagram · Site · Ligar · Horário"),
        block("SEÇÃO", "Solicitação de orçamento", "Precisa de um orçamento?"),
        block("INPUT", "Seu nome", "Seu nome"),
        block("INPUT", "WhatsApp", "WhatsApp"),
        block("INPUT", "Serviço desejado", "Serviço desejado"),
        block("TEXTAREA", "Descrição", "Descreva o que precisa"),
        block("SELECT", "Estado", "Estado (opcional)"),
        block("INPUT", "Cidade", "Cidade (opcional)"),
        block("INPUT", "Bairro", "Bairro"),
        block("INPUT", "Melhor horário", "Melhor horário para contato"),
        block("BOTÃO", "Solicitar orçamento", "Solicitar orçamento"),
        block("TEXTO", "Rodapé", "Página feita com Orçah")
      ]),

      screen("Orçamento público", "/orcamento/[token]", "Responsivo", ["src/app/orcamento/[token]/page.tsx", "src/components/public-budget-actions.tsx", "src/components/public-photo-gallery.tsx"], [
        block("HEADER", "Empresa", "Logo · nome · ramo · região"),
        block("TÍTULO", "Orçamento", "Título do molde para [cliente] · serviço · número"),
        block("TOTAL", "Total principal", "Valor total em destaque"),
        block("TEXTO", "Validade", "Válido até [data]"),
        block("IMAGEM", "Galeria", "Fotos antes ou depois dos itens conforme o molde", { conditional: true }),
        block("SEÇÃO", "Serviços", "Itens agrupados por grupo/ambiente"),
        block("ITEM", "Item", "Tipo · descrição · detalhes · quantidade × valor · subtotal"),
        block("SUBTOTAL", "Quebra de valores", "Subtotais por tipo · subtotal · deslocamento · desconto", { conditional: true }),
        block("CARD", "Contexto do serviço", "Cidade/endereço · detalhes extras · prazo", { conditional: true }),
        block("CARD", "Observações", "Observações do orçamento", { conditional: true }),
        block("BOTÃO", "Quero alterar", "Quero alterar"),
        block("BOTÃO", "Não tenho interesse", "Não tenho interesse"),
        block("TEXTAREA", "Pedido de alteração", "O que gostaria de mudar?", { conditional: true }),
        block("LISTA", "Motivo da recusa", "Preço · Prazo · Serviço não será realizado · Escolhi outra empresa · Outro", { conditional: true }),
        block("TOTAL", "Barra fixa total", "Total"),
        block("BOTÃO", "Aprovar", "Aprovar"),
        block("BOTÃO", "Ver página da empresa", "Ver página da empresa"),
        block("BOTÃO", "Baixar PDF", "Baixar PDF"),
        block("TEXTO", "Rodapé", "Feito com Orçah")
      ])
    ]
  };
})();