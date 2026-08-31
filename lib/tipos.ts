/**
 * O modelo de dados da vitrine.
 *
 * A régua para incluir um campo: ele muda a decisão de compra OU reduz a ida e
 * volta no WhatsApp? Se não muda nem reduz, fica de fora — cada campo aqui é um
 * campo que a dona da loja preenche umas quarenta vezes por ano, com a peça na
 * mão e cliente esperando.
 */

/**
 * Listas fechadas, não texto livre.
 *
 * Texto livre produz "blusa", "Blusa", "blusinha" e "blusa " no mesmo catálogo
 * em três meses, e qualquer agrupamento por categoria morre junto. No painel
 * isso vira uma lista para escolher, que também é mais rápido de preencher no
 * celular do que digitar.
 */
export type Categoria =
  | "vestido"
  | "blusa"
  | "camisa"
  | "calça"
  | "saia"
  | "short"
  | "macacão"
  | "conjunto"
  | "casaco"
  | "tricô"
  | "acessório";

/**
 * Letra e número na mesma lista de propósito.
 *
 * A loja vende vestido em P/M/G e jeans em 38/40/42, e obrigar os dois sistemas
 * a caber num só significaria inventar uma tradução que a cliente não faz de
 * cabeça. "U" é tamanho único, que existe de verdade em lenço, cinto e algumas
 * peças de malha.
 */
export type Tamanho =
  | "PP"
  | "P"
  | "M"
  | "G"
  | "GG"
  | "U"
  | "36"
  | "38"
  | "40"
  | "42"
  | "44"
  | "46";

/**
 * Nome de cor, não código hexadecimal.
 *
 * Amostra de cor exigiria que ela escolhesse um valor de cor para cada peça, e
 * cor de tela mente sobre cor de tecido de qualquer jeito. O nome escrito é
 * mais honesto, custa um toque e é o vocabulário que ela já usa no balcão —
 * incluindo "estampado" e "listrado", que não são cor mas é como se fala.
 */
export type CorConhecida =
  | "preto"
  | "off-white"
  | "cru"
  | "areia"
  | "caramelo"
  | "terracota"
  | "ferrugem"
  | "vinho"
  | "verde-oliva"
  | "verde-musgo"
  | "azul-marinho"
  | "jeans claro"
  | "jeans escuro"
  | "cinza-mescla"
  | "rosa-seco"
  | "mostarda"
  | "estampado"
  | "listrado";

/**
 * A lista acima é sugestão, não cerca.
 *
 * Ela tem a peça na mão. Se a cor for lilás e lilás não estiver na lista, a
 * alternativa a aceitar texto livre é ela desistir de cadastrar a peça ou
 * mentir a cor — e nenhuma das duas é aceitável por uma lista que eu escrevi
 * olhando vinte fotos.
 *
 * Custa pouco porque `cores` só vira TEXTO no site: a ficha, a linha do cartão,
 * o cartão de compartilhamento e o alt da foto. Não existe filtro por cor nem
 * amostra colorida — se existisse, texto livre fragmentaria o filtro e esta
 * decisão seria outra.
 *
 * O `& {}` preserva o autocompletar dos nomes conhecidos sem fechar o tipo.
 */
export type Cor = CorConhecida | (string & {});

export type Situacao = "disponivel" | "esgotada";

export interface Foto {
  /** Caminho a partir de /public. Vira URL do CDN quando o CMS entrar. */
  src: string;
  /**
   * Opcional de propósito: sem texto aqui, o alternativo é composto a partir do
   * nome, da categoria e das cores (ver `altDaFoto` em lib/peca.ts). Alt
   * obrigatório é um campo que se preenche mal quarenta vezes por ano; o
   * derivado é sempre razoável, e este campo fica para quando valer a pena
   * descrever a foto de verdade.
   */
  alt?: string;
}

export interface Peca {
  /** Vira a URL: /pecas/<slug> */
  slug: string;
  nome: string;
  /** De uma a quatro. A primeira é a que aparece na arara. */
  fotos: Foto[];
  /** Em reais. Número, nunca string — senão convivem "189", "189,00" e "R$189". */
  preco: number;
  categoria: Categoria;
  /** A grade que a peça veste. NUNCA quantidade — ver DECISOES.md, regra 1. */
  tamanhos: Tamanho[];
  cores: Cor[];
  /** Uma palavra: "viscose", "tricoline", "malha canelada". Responde caimento. */
  tecido?: string;
  /**
   * O campo mais valioso da ficha, e por isso opcional: obrigatório, viraria
   * tarefa e seria preenchido errado. "Serve em mim?" é a dúvida que trava a
   * compra numa boutique, e esta é a única linha que responde antes da conversa.
   */
  medidas?: string;
  descricao?: string;
  situacao: Situacao;
  /**
   * Fixa a peça no topo da home, independente da data de entrada.
   *
   * NÃO significa "aparece na home" — quem povoa a home é `dataEntrada`. Se
   * significasse, em três meses haveria quarenta peças em destaque e a home
   * voltaria a ser o catálogo inteiro, que é exatamente o que a curadoria
   * existe para evitar. Teto em TETO_DESTAQUE.
   */
  destaque: boolean;
  /** ISO, só a data: "2026-08-26". Alimenta os trilhos e o vencimento. */
  dataEntrada: string;
}
