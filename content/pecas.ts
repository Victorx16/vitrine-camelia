import type { Peca } from "@/lib/tipos";

/**
 * O catálogo.
 *
 * Este é o único arquivo que o CMS vai substituir INTEIRO no build, quando a
 * Sanity entrar. Por isso ele não mora em lib/constants.ts junto com o resto: o
 * que é gerado por máquina fica separado do que é escrito por gente, senão uma
 * publicação da dona apaga uma frase do site.
 *
 * A ordem aqui não importa — quem ordena é lib/peca.ts. Escrever na ordem de
 * entrada só facilita a leitura por humano.
 *
 * ------------------------------------------------------------------------
 * Sobre as fotos: a ficha segue a foto, não o contrário.
 *
 * As imagens são do Pexels, escolhidas uma a uma contra o gosto óbvio — peça no
 * cabide, luz de loja, parede lisa; nada de campanha com modelo em estúdio nem
 * de vitrine de shopping. Depois de escolhidas, cada peça foi descrita a partir
 * do que aparece de fato na foto. O caminho contrário — inventar a peça e caçar
 * uma foto que sirva — é o que produz catálogo onde a descrição não bate com a
 * imagem, e é exatamente o que denuncia um modelo.
 *
 * Consequência disso: não há calça nenhuma nesta seleção. Não é decisão de
 * produto, é limite do banco de imagem — calça feminina no cabide com luz de
 * loja praticamente não existe no acervo. Ver DECISOES.md.
 * ------------------------------------------------------------------------
 */
export const PECAS: Peca[] = [
  // --- Entrada de 28 de agosto -------------------------------------------
  {
    slug: "vestido-de-alcinha-estampado",
    nome: "Vestido de alcinha estampado",
    fotos: [
      {
        src: "/pecas/vestido-de-alcinha-estampado-1.webp",
        alt: "Vestido longo de alcinha, estampa miúda verde sobre fundo claro, pendurado numa arara de parede branca.",
      },
      { src: "/pecas/vestido-de-alcinha-estampado-2.webp" },
    ],
    preco: 149,
    categoria: "vestido",
    tamanhos: ["P", "M", "G"],
    cores: ["estampado", "verde-musgo"],
    tecido: "viscose",
    medidas: "Busto 88 · comprimento 128",
    descricao:
      "Alcinha regulável e comprimento até o tornozelo. Não precisa de passar depois de lavar.",
    situacao: "disponivel",
    destaque: true,
    dataEntrada: "2026-08-28",
  },
  {
    slug: "camisa-de-linho-gola-padre",
    nome: "Camisa de linho gola padre",
    fotos: [
      {
        src: "/pecas/camisa-de-linho-gola-padre.webp",
        alt: "Camisa de linho cru com gola padre, aberta num cabide de madeira, contra parede clara.",
      },
      {
        src: "/pecas/camisa-de-linho-gola-padre-detalhe.webp",
        alt: "Detalhe da frente da camisa: linho cru, gola padre e botões forrados.",
      },
    ],
    preco: 139,
    categoria: "camisa",
    tamanhos: ["P", "M", "G"],
    cores: ["cru"],
    tecido: "linho",
    medidas: "Busto 96 · comprimento 68",
    situacao: "disponivel",
    destaque: true,
    dataEntrada: "2026-08-28",
  },
  {
    slug: "blusa-de-moletom-verde",
    nome: "Blusa de moletom verde",
    fotos: [
      { src: "/pecas/blusa-de-moletom-verde-1.webp" },
      { src: "/pecas/blusa-de-moletom-verde-2.webp" },
    ],
    preco: 99.9,
    categoria: "blusa",
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["verde-musgo"],
    tecido: "moletom flanelado",
    descricao: "Sem capuz e sem estampa. Boa para o friozinho da manhã.",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-28",
  },
  {
    slug: "casaco-trench-com-cinto",
    nome: "Casaco trench com cinto",
    fotos: [
      { src: "/pecas/casaco-trench-com-cinto.webp" },
      {
        src: "/pecas/casaco-trench-com-cinto-detalhe.webp",
        alt: "Detalhe do cinto do trench, com a laçada frouxa na cintura.",
      },
    ],
    preco: 259,
    categoria: "casaco",
    tamanhos: ["P", "M"],
    cores: ["caramelo"],
    tecido: "sarja de algodão",
    situacao: "esgotada",
    destaque: false,
    dataEntrada: "2026-08-28",
  },

  // --- Entrada de 24 de agosto -------------------------------------------
  {
    slug: "camisa-de-linho-oversized",
    nome: "Camisa de linho oversized",
    fotos: [
      { src: "/pecas/camisa-de-linho-oversized.webp" },
      {
        src: "/pecas/camisa-de-linho-oversized-detalhe.webp",
        alt: "Detalhe da gola e do botão da camisa de linho cru.",
      },
    ],
    preco: 149,
    categoria: "camisa",
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["cru"],
    tecido: "linho",
    descricao: "Serve como camisa ou como terceira peça por cima de uma regata.",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-24",
  },
  {
    slug: "blazer-de-alfaiataria-areia",
    nome: "Blazer de alfaiataria areia",
    fotos: [
      { src: "/pecas/blazer-de-alfaiataria-areia.webp" },
      {
        src: "/pecas/blazer-de-alfaiataria-areia-detalhe.webp",
        alt: "Detalhe do ombro e da manga do blazer areia.",
      },
    ],
    preco: 229,
    categoria: "casaco",
    tamanhos: ["P", "M", "G"],
    cores: ["areia"],
    tecido: "alfaiataria",
    medidas: "Ombro a ombro 40 · comprimento 66",
    situacao: "disponivel",
    destaque: true,
    dataEntrada: "2026-08-24",
  },
  {
    slug: "trico-canelado-bicolor",
    nome: "Tricô canelado bicolor",
    fotos: [
      { src: "/pecas/trico-canelado-bicolor.webp" },
      {
        src: "/pecas/trico-canelado-bicolor-detalhe.webp",
        alt: "Detalhe do ponto canelado, com as faixas roxa e vermelha.",
      },
    ],
    preco: 159,
    categoria: "tricô",
    tamanhos: ["U"],
    cores: ["vinho"],
    tecido: "tricô de algodão",
    descricao: "Tamanho único, veste do P ao G. Gola e punhos em contraste.",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-24",
  },
  {
    slug: "vestido-camisa-de-algodao",
    nome: "Vestido camisa de algodão",
    fotos: [
      { src: "/pecas/vestido-camisa-de-algodao.webp" },
      {
        src: "/pecas/vestido-camisa-de-algodao-detalhe.webp",
        alt: "Detalhe do algodão e do bolso do vestido-camisa.",
      },
    ],
    preco: 189,
    categoria: "vestido",
    tamanhos: ["P", "M", "G"],
    cores: ["off-white"],
    tecido: "algodão",
    medidas: "Busto 92 · comprimento 104",
    situacao: "disponivel",
    destaque: true,
    dataEntrada: "2026-08-24",
  },

  // --- Entrada de 17 de agosto -------------------------------------------
  {
    slug: "blusa-de-trico-rosa",
    nome: "Blusa de tricô rosa",
    fotos: [
      { src: "/pecas/blusa-de-trico-rosa.webp" },
      {
        src: "/pecas/blusa-de-trico-rosa-detalhe.webp",
        alt: "Detalhe do ponto da blusa de tricô rosa.",
      },
    ],
    preco: 89.9,
    categoria: "blusa",
    tamanhos: ["P", "M"],
    cores: ["rosa-seco"],
    tecido: "tricô",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-17",
  },
  {
    slug: "saia-midi-de-viscose",
    nome: "Saia midi de viscose",
    fotos: [{ src: "/pecas/saia-midi-de-viscose.webp" }],
    preco: 129,
    categoria: "saia",
    tamanhos: ["38", "40", "42"],
    cores: ["areia", "caramelo"],
    tecido: "viscose",
    medidas: "Cintura 68 · comprimento 78",
    situacao: "disponivel",
    destaque: true,
    dataEntrada: "2026-08-17",
  },
  {
    slug: "blazer-verde-agua",
    nome: "Blazer verde-água",
    fotos: [
      { src: "/pecas/blazer-verde-agua.webp" },
      {
        src: "/pecas/blazer-verde-agua-detalhe.webp",
        alt: "Detalhe da lapela e do bolso do blazer verde-água.",
      },
    ],
    preco: 219,
    categoria: "casaco",
    tamanhos: ["P", "M"],
    cores: ["verde-oliva"],
    tecido: "alfaiataria",
    situacao: "esgotada",
    destaque: false,
    dataEntrada: "2026-08-17",
  },
  {
    slug: "vestido-de-alca-cru",
    nome: "Vestido de alça cru",
    fotos: [{ src: "/pecas/vestido-de-alca-com-bolsa.webp" }],
    preco: 169,
    categoria: "vestido",
    tamanhos: ["P", "M", "G"],
    cores: ["cru"],
    tecido: "viscose",
    descricao: "A bolsa de palha e o chapéu da foto não acompanham a peça.",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-17",
  },

  // --- Entrada de 6 de agosto (já fora da janela de novidade) ------------
  {
    slug: "trico-gola-alta-cru",
    nome: "Tricô gola alta cru",
    fotos: [{ src: "/pecas/trico-gola-alta-cru.webp" }],
    preco: 149,
    categoria: "tricô",
    tamanhos: ["U"],
    cores: ["cru"],
    tecido: "tricô de algodão",
    descricao: "Não coça.",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-06",
  },
  {
    slug: "jaqueta-de-moletom-verde",
    nome: "Jaqueta de moletom verde",
    fotos: [
      { src: "/pecas/jaqueta-de-moletom-verde.webp" },
      {
        src: "/pecas/jaqueta-de-moletom-verde-detalhe.webp",
        alt: "Detalhe do capuz e da gola da jaqueta de moletom.",
      },
    ],
    preco: 129,
    categoria: "casaco",
    tamanhos: ["P", "M", "G"],
    cores: ["verde-musgo"],
    tecido: "moletom",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-08-06",
  },
  {
    /**
     * Esgotada há 25 dias: continua no catálogo com selo, e sai sozinha aos 30.
     * É a peça que mostra a regra funcionando no meio do caminho.
     */
    slug: "camisa-de-linho-com-jaqueta",
    nome: "Camisa de linho cru",
    fotos: [
      { src: "/pecas/camisa-de-linho-com-jaqueta.webp" },
      {
        src: "/pecas/camisa-de-linho-com-jaqueta-detalhe.webp",
        alt: "Detalhe do caimento do linho sob a jaqueta.",
      },
    ],
    preco: 145,
    categoria: "camisa",
    tamanhos: ["P", "M", "G"],
    cores: ["cru"],
    tecido: "linho",
    situacao: "esgotada",
    destaque: false,
    dataEntrada: "2026-08-06",
  },

  // --- Entrada de 22 de julho --------------------------------------------
  {
    slug: "camisa-de-tricoline-branca",
    nome: "Camisa de tricoline branca",
    fotos: [
      { src: "/pecas/camisa-de-tricoline-branca.webp" },
      {
        src: "/pecas/camisa-de-tricoline-branca-detalhe.webp",
        alt: "Detalhe do ombro e da manga da tricoline branca.",
      },
    ],
    preco: 119,
    categoria: "camisa",
    tamanhos: ["P", "M", "G", "GG"],
    cores: ["off-white"],
    tecido: "tricoline",
    descricao: "Modelagem reta. Boa para trabalhar e para sair depois.",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-07-22",
  },
  {
    slug: "trico-de-algodao-verde",
    nome: "Tricô de algodão verde",
    fotos: [{ src: "/pecas/trico-de-algodao-verde.webp" }],
    preco: 139,
    categoria: "tricô",
    tamanhos: ["P", "M", "G"],
    cores: ["verde-oliva"],
    tecido: "tricô de algodão",
    situacao: "disponivel",
    destaque: false,
    dataEntrada: "2026-07-22",
  },

  /**
   * Entrada de 10 de julho. Esgotada há mais de 30 dias: some da vitrine e do
   * catálogo sozinha, mas continua tendo página própria — link que já circulou
   * no WhatsApp não vira 404. Está aqui de propósito, para o vencimento ser
   * visível em desenvolvimento em vez de existir só na teoria.
   */
  {
    slug: "vestido-preto-midi",
    nome: "Vestido preto midi",
    fotos: [{ src: "/pecas/vestido-preto-midi.webp" }],
    preco: 179,
    categoria: "vestido",
    tamanhos: ["P", "M"],
    cores: ["preto"],
    tecido: "crepe",
    situacao: "esgotada",
    destaque: false,
    dataEntrada: "2026-07-10",
  },
];
