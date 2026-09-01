/**
 * Fonte única da loja e de toda a copy fixa do site.
 *
 * Nenhum texto de interface mora dentro de componente. Não é purismo: é o que
 * permite a dona (ou o próximo projeto) trocar uma frase sem abrir um arquivo
 * .tsx e sem risco de quebrar layout.
 */

export const LOJA = {
  nome: "Camélia",
  descritor: "boutique",
  cidade: "Santo André",
  regiao: "ABC Paulista",
  // O modelo mudou de hospedagem quando o crédito de build da Netlify acabou
  // no meio do ciclo. Este endereço alimenta o sitemap, os links canônicos e o
  // cartão de compartilhamento: apontar para o lugar errado não quebra nada de
  // forma visível e estraga tudo em silêncio.
  url: "https://vitrine-camelia.victorxavi418.workers.dev",

  /**
   * O WhatsApp da demonstração aponta para o Victor, não para um número
   * inventado nem para um número de loja que não existe.
   *
   * É a saída honesta: quem clicar no botão cai na conversa de quem de fato
   * está do outro lado. Número falso deixaria a peça central do site sem
   * funcionar, e número real de terceiro seria mandar estranho para o WhatsApp
   * de alguém. Num cliente de verdade, aqui entra o número da loja.
   */
  whatsapp: "5511966415434",

  endereco: "Rua das Figueiras, 218 — Jardim, Santo André/SP",
  horario: [
    { dias: "Segunda a sexta", horas: "10h às 19h" },
    { dias: "Sábado", horas: "10h às 16h" },
    { dias: "Domingo", horas: "fechado" },
  ],
  instagram: "https://www.instagram.com/",
} as const;

/**
 * Aviso de demonstração.
 *
 * Fica visível no topo e no rodapé, em toda página. O site do estúdio é
 * construído sobre o que dá para conferir; um modelo apresentado como case
 * entregue derrubaria isso inteiro. A loja é fictícia e o site diz isso antes
 * de dizer qualquer outra coisa.
 */
export const AVISO_MODELO = {
  curto: "Modelo de demonstração — loja fictícia",
  longo:
    "A Camélia não existe. Este site é um modelo construído pela Code VX para mostrar como uma vitrine de boutique funciona, e não é um trabalho entregue a cliente. Não entra no contador de projetos no ar do estúdio.",
  creditoLabel: "Construído por",
  credito: "Code VX",
  creditoUrl: "https://codevx.com.br",
} as const;

/**
 * Cada destino tem dois rótulos.
 *
 * Em caixa alta com entreletra aberta, "Chegou agora · Todas as peças · Visite
 * a loja" não cabe em 375px: a navegação quebrava em duas linhas e comia
 * duzentos pixels acima da dobra, justamente no aparelho em que a vitrine é
 * aberta. Truncar com reticências esconderia a palavra que importa, então cada
 * item tem uma forma curta escrita à mão para o celular.
 */
export const NAV_LINKS = [
  { label: "Chegou agora", curto: "Chegou", href: "/#chegou" },
  { label: "Todas as peças", curto: "Peças", href: "/pecas" },
  { label: "Visite a loja", curto: "A loja", href: "/visite" },
] as const;

/**
 * Regras de vencimento, em dias.
 *
 * Existem para que o site não precise de manutenção constante: sem elas, em um
 * ano a home tem peça de fevereiro e o catálogo é maioria de peça vendida.
 *
 * A conta é feita no BUILD, não no navegador — o site é exportado estático e
 * não tem relógio depois de publicado. Quem faz o tempo passar é o build
 * agendado diário no Netlify (ver netlify.toml e DECISOES.md).
 */
export const DIAS = {
  /** Depois disso, a peça sai dos trilhos da home e fica só no catálogo. */
  novidade: 21,
  /** Depois disso, a peça esgotada sai também do catálogo. */
  esgotadaVisivel: 30,
} as const;

/**
 * Se o site pode ser indexado pelo Google.
 *
 * Está `true`, e a decisão merece explicação porque a loja é fictícia.
 *
 * A favor de indexar: estrutura de SEO técnico é parte do que este modelo
 * demonstra, e um site com `noindex` não demonstra nada — não dá para abrir o
 * Search Console de um site que pediu para não ser lido. E o aviso de
 * demonstração aparece no cabeçalho de toda página, no rodapé, na descrição que
 * vira o resumo na busca e na própria imagem de compartilhamento: uma aparição
 * na busca não tem como enganar ninguém.
 *
 * Contra: um negócio fictício entra no índice local. O risco é pequeno — domínio
 * novo, sem link apontando, disputando com lojas reais que existem há anos — e
 * está mitigado pelos avisos acima.
 *
 * Se em algum momento parecer errado, inverter aqui basta: o `noindex` passa a
 * valer em todas as páginas de uma vez.
 */
export const INDEXAR = true;

/** Teto de peças fixadas no topo. Acima disso, "vitrine" virou "catálogo". */
export const TETO_DESTAQUE = 6;

export const COPY = {
  capa: {
    rotulo: "Vitrine da semana",
    titulo: "O que entrou na arara essa semana.",
    subtitulo:
      "Peça que você vê aqui está na loja hoje. Como quase tudo é peça única, o que sai não volta — e o que chega, chega toda semana.",
    acao: "Ver o que chegou",
  },

  chegou: {
    rotulo: "Chegou agora",
    titulo: "Organizado pelo dia em que entrou.",
    subtitulo:
      "Sem paginação e sem filtro: é a arara, na ordem em que foi montada.",
    vazio: "Nada novo essa semana. As peças anteriores continuam no catálogo.",
  },

  catalogo: {
    rotulo: "Todas as peças",
    titulo: "A seleção inteira.",
    subtitulo:
      "Uma curadoria do que está na loja, não o estoque completo. Se você procura algo que não está aqui, pergunte no WhatsApp — muita coisa não chega a ser fotografada.",
    vazio: "Nenhuma peça nesta categoria agora.",
  },

  /**
   * O filtro do catálogo.
   *
   * "Veste" e não "Tamanho": é o mesmo verbo do painel e o mesmo da ficha da
   * peça. A palavra que ela usa no balcão atravessa o sistema inteiro, do
   * formulário que ela preenche até o botão que a cliente aperta.
   */
  /** As páginas por tipo de peça. `{tipo}` vira "Vestidos", "Camisas"… */
  categoria: {
    rotulo: "Por tipo",
    titulo: "{tipo} na loja.",
    subtitulo:
      "O que está na arara agora. Se você procura algo que não está aqui, pergunte no WhatsApp — muita coisa não chega a ser fotografada.",
    todas: "Ver todas as peças",
    outras: "Outros tipos",
  },

  filtro: {
    categoria: "Procurando",
    tamanho: "Que veste",
    buscar: "Buscar no catálogo",
    buscarDica: "linho, preto, vestido…",
    contaUma: " peça",
    contaMuitas: " peças",
    limpar: "Limpar",
    vazio:
      "Nada com esses filtros. Tire um deles — ou pergunte no WhatsApp: muita coisa da loja não chega a ser fotografada.",
  },

  peca: {
    /** Rótulos da ficha. Vocabulário de loja, não de e-commerce. */
    grade: "Veste",
    cores: "Cores",
    tecido: "Tecido",
    medidas: "Medidas da peça",
    entrada: "Entrou na loja",
    /**
     * A frase que substitui o estoque. A vitrine nunca diz quanto sobrou —
     * diz que a confirmação é na conversa, que é onde ela realmente acontece.
     */
    disponibilidade:
      "Confirmo o tamanho na hora, pelo WhatsApp. Peça quase única: pode já ter saído.",
    voltar: "Ver todas as peças",
  },

  acao: {
    disponivel: "Falar sobre esta peça",
    esgotada: "Quero uma parecida",
    ajuda: "Abre o WhatsApp com a peça já escrita na mensagem.",
  },

  selo: {
    esgotada: "Já foi",
    esgotadaAjuda: "Esta peça já foi vendida.",
    novidade: "Novidade",
  },

  visite: {
    rotulo: "A loja",
    titulo: "Fica melhor provando.",
    subtitulo:
      "Grande parte do que a Camélia vende é peça única, e o espelho resolve em dois minutos o que a foto não resolve em dez mensagens.",
    endereco: "Endereço",
    horario: "Horário",
  },

  rodape: {
    conversa: "Falar com a loja",
  },
} as const;
