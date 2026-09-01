import type { Categoria, Peca, Tamanho } from "@/lib/tipos";

/**
 * O que o filtro do catálogo precisa saber, calculado no build.
 *
 * A regra que manda em tudo aqui: **só entra na lista de filtros o que tem peça
 * agora.** Um botão "Macacão" que devolve nada é pior do que não existir — ele
 * promete uma prateleira vazia e faz a loja parecer menor do que é.
 *
 * Por isso nada disso vem das listas fechadas de lib/tipos.ts: vem do catálogo
 * de hoje, e muda sozinho quando ela cadastra ou esgota uma peça.
 */

/** Ordem de exibição dos tamanhos. Letra antes de número, como na arara. */
const ORDEM_TAMANHO: readonly Tamanho[] = [
  "PP", "P", "M", "G", "GG", "U",
  "36", "38", "40", "42", "44", "46",
];

/**
 * Plural das categorias, para o rótulo do filtro e para o endereço da página.
 *
 * O campo no painel é singular ("Tipo de peça: vestido") porque ali se descreve
 * UMA peça. No filtro é plural, porque ali se pede um conjunto. São textos
 * diferentes para funções diferentes, e escrever "vestido (12)" no filtro leria
 * como erro de digitação.
 */
export const PLURAL: Record<Categoria, string> = {
  vestido: "Vestidos",
  blusa: "Blusas",
  camisa: "Camisas",
  "calça": "Calças",
  saia: "Saias",
  short: "Shorts",
  "macacão": "Macacões",
  conjunto: "Conjuntos",
  casaco: "Casacos",
  "tricô": "Tricôs",
  "acessório": "Acessórios",
};

/** As marcas de acento que o NFD separa das letras. */
const RE_ACENTO = /[̀-ͯ]/g;

/** Vira endereço: "tricô" → "tricos". Sem acento, sem espaço. */
export function urlDaCategoria(categoria: Categoria): string {
  return PLURAL[categoria]
    .toLowerCase()
    .normalize("NFD")
    .replace(RE_ACENTO, "");
}

export interface Faceta<T extends string = string> {
  valor: T;
  rotulo: string;
  quantas: number;
}

export interface Facetas {
  categorias: Faceta<Categoria>[];
  tamanhos: Faceta<Tamanho>[];
}

/** Conta quantas peças existem por categoria e por tamanho, e ordena. */
export function facetas(pecas: readonly Peca[]): Facetas {
  const porCategoria = new Map<Categoria, number>();
  const porTamanho = new Map<Tamanho, number>();

  for (const peca of pecas) {
    porCategoria.set(peca.categoria, (porCategoria.get(peca.categoria) ?? 0) + 1);
    // Uma peça conta em cada tamanho que veste: a mesma camisa aparece no
    // filtro "P" e no "M". É o que a pergunta "tem no meu tamanho?" espera.
    for (const tamanho of peca.tamanhos) {
      porTamanho.set(tamanho, (porTamanho.get(tamanho) ?? 0) + 1);
    }
  }

  return {
    // Categoria por quantidade: o que a loja mais tem aparece primeiro, e a
    // ordem se reorganiza sozinha conforme o estoque dela muda de perfil.
    categorias: [...porCategoria.entries()]
      .map(([valor, quantas]) => ({ valor, rotulo: PLURAL[valor], quantas }))
      .sort((a, b) => b.quantas - a.quantas || a.rotulo.localeCompare(b.rotulo, "pt-BR")),

    // Tamanho NUNCA por quantidade: PP depois de G porque "tem mais G" seria
    // uma ordem que muda toda semana e que ninguém consegue percorrer com o
    // olho. Grade tem ordem própria, e ela é fixa.
    tamanhos: [...porTamanho.entries()]
      .map(([valor, quantas]) => ({ valor, rotulo: valor, quantas }))
      .sort((a, b) => ORDEM_TAMANHO.indexOf(a.valor) - ORDEM_TAMANHO.indexOf(b.valor)),
  };
}

/**
 * O texto que a busca varre, por peça.
 *
 * Vai para um atributo no HTML, junto com o cartão. Sem índice separado, sem
 * arquivo extra para baixar: quem procura já tem a página inteira na mão.
 *
 * Sem acento e em minúscula porque ninguém digita "tricô" com circunflexo no
 * celular — e uma busca que exige acerto de acento não é busca, é adivinhação.
 */
export function textoDeBusca(peca: Peca): string {
  return semAcento(
    [peca.nome, peca.categoria, peca.tecido, ...peca.cores, ...peca.tamanhos]
      .filter(Boolean)
      .join(" "),
  );
}

export function semAcento(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(RE_ACENTO, "");
}
