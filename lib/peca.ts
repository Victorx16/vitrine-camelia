import { DIAS, TETO_DESTAQUE } from "@/lib/constants";
import { dataLocal, listar } from "@/lib/formato";
import { buscarPecas } from "@/lib/sanity/catalogo";
import type { Peca } from "@/lib/tipos";

/**
 * Toda a regra de "o que aparece onde" mora aqui.
 *
 * ------------------------------------------------------------------------
 * O relógio deste arquivo é o do BUILD, não o do visitante.
 *
 * O site é exportado como HTML estático: depois de publicado ele não tem
 * relógio nenhum, e "chegou essa semana" continua dizendo essa semana até
 * alguém gerar o site de novo. As duas alternativas foram consideradas e
 * descartadas: calcular no navegador com `new Date()` traz descasamento de
 * hidratação e um piscar de conteúdo, e enfia estado de execução numa página
 * que existe justamente para não ter; e deixar vencer só na próxima publicação
 * amarra a validade do site à disciplina de quem publica.
 *
 * Quem faz o tempo passar é o build agendado diário no Netlify. Sem ele, nada
 * aqui vence — é dependência de verdade, não detalhe de configuração.
 * ------------------------------------------------------------------------
 *
 * As funções são assíncronas porque a origem do catálogo é a Sanity, lida uma
 * vez por processo de build (ver lib/sanity/catalogo.ts). Nada disso alcança o
 * navegador: o que chega até a visitante é HTML pronto.
 */
const HOJE = new Date();

function diasDesde(iso: string) {
  const entrada = dataLocal(iso);
  const umDia = 24 * 60 * 60 * 1000;
  return Math.floor((HOJE.getTime() - entrada.getTime()) / umDia);
}

/**
 * Peça esgotada é conteúdo, não erro: ela fica, ganha selo e o botão vira
 * "quero uma parecida". Mas fica por um prazo. Sem prazo, em um ano o catálogo
 * é maioria de peça vendida e a loja passa a parecer que está fechando — a
 * prova de rotatividade se faz com um punhado de peças que saíram, não com
 * duzentas.
 */
function aindaVisivel(peca: Peca) {
  if (peca.situacao !== "esgotada") return true;
  return diasDesde(peca.dataEntrada) <= DIAS.esgotadaVisivel;
}

export function ehNovidade(peca: Peca) {
  return diasDesde(peca.dataEntrada) <= DIAS.novidade;
}

const maisNovaPrimeiro = (a: Peca, b: Peca) =>
  b.dataEntrada.localeCompare(a.dataEntrada);

/** O catálogo inteiro que o site mostra hoje, já sem o que venceu. */
export async function pecasVisiveis(): Promise<Peca[]> {
  const todas = await buscarPecas();
  return todas.filter(aindaVisivel).sort(maisNovaPrimeiro);
}

/**
 * As peças fixadas no topo da home.
 *
 * `destaque` fixa; quem povoa a home é a data de entrada. O corte em
 * TETO_DESTAQUE não é enfeite: sem ele, marcar tudo como destaque desfaz a
 * curadoria sem que ninguém perceba, e o sintoma aparece meses depois.
 */
export async function pecasEmDestaque(): Promise<Peca[]> {
  const visiveis = await pecasVisiveis();
  return visiveis.filter((peca) => peca.destaque).slice(0, TETO_DESTAQUE);
}

export interface Trilho {
  /** ISO da data de entrada. Serve de chave e de `dateTime` no <time>. */
  data: string;
  pecas: Peca[];
}

/**
 * Os trilhos da home: um por dia de entrada, do mais recente para o mais
 * antigo, dentro da janela de novidade.
 *
 * Agrupar por dia e não por semana é o que faz a rotatividade parecer fartura:
 * três trilhos curtos leem como "chega coisa toda hora", enquanto um bloco
 * único de doze peças lê como "postaram tudo de uma vez".
 */
export async function trilhos(
  excluir: ReadonlySet<string> = new Set(),
): Promise<Trilho[]> {
  const porData = new Map<string, Peca[]>();

  for (const peca of await pecasVisiveis()) {
    if (!ehNovidade(peca)) continue;
    // A home mostra as fixadas numa prateleira própria, acima. Sem este corte,
    // a mesma peça apareceria duas vezes na mesma tela — e repetição numa
    // vitrine não lê como ênfase, lê como catálogo mal montado.
    if (excluir.has(peca.slug)) continue;
    const lista = porData.get(peca.dataEntrada);
    if (lista) lista.push(peca);
    else porData.set(peca.dataEntrada, [peca]);
  }

  return [...porData.entries()]
    .map(([data, pecas]) => ({ data, pecas }))
    .sort((a, b) => b.data.localeCompare(a.data));
}

export async function buscarPeca(slug: string) {
  const todas = await buscarPecas();
  return todas.find((peca) => peca.slug === slug);
}

/**
 * Alimenta `generateStaticParams`.
 *
 * Inclui o que venceu de propósito: uma URL publicada não deve virar 404 só
 * porque a peça saiu da vitrine. Link de peça circula no WhatsApp e sobrevive
 * à peça.
 */
export async function todosOsSlugs() {
  const todas = await buscarPecas();
  return todas.map((peca) => ({ slug: peca.slug }));
}

/**
 * Texto alternativo da foto.
 *
 * Composto a partir do que já está preenchido, porque alt obrigatório é um
 * campo que se preenche mal quarenta vezes por ano — e alt mal preenchido é
 * pior para quem usa leitor de tela do que alt derivado e correto. Quando a
 * foto merece descrição de verdade, o campo `alt` da própria foto vence.
 */
export function altDaFoto(peca: Peca, indice: number) {
  const proprio = peca.fotos[indice]?.alt;
  if (proprio) return proprio;

  // "na cor X" foi tentado e descartado: `cores` aceita "estampado" e
  // "listrado", que não são cor, e a frase saía torta justamente nas peças
  // mais fáceis de descrever. O travessão não promete concordância nenhuma.
  const base = `${peca.nome} — ${peca.tecido ?? peca.categoria}, ${listar(peca.cores)}`;
  return indice === 0 ? base : `${base} (foto ${indice + 1})`;
}
