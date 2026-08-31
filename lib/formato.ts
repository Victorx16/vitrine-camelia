/**
 * Formatação de preço e data, em pt-BR.
 *
 * Os formatadores ficam em constante de módulo porque `Intl.NumberFormat` é
 * caro de construir e a home constrói um por peça se ele nascer dentro da
 * função — com sessenta peças na página, isso aparece no build.
 */

const MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const DIA_E_MES = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
});

const DIA_MES_ANO = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "R$ 189,00". Centavos sempre, mesmo quando são zero: é preço, não medida. */
export function preco(valor: number) {
  return MOEDA.format(valor);
}

/**
 * Converte "2026-08-26" numa data no fuso local.
 *
 * `new Date("2026-08-26")` é interpretado como meia-noite UTC. Em São Paulo
 * (UTC-3), isso é 21h do dia 25 — e o site passa a exibir "25 de agosto" para
 * uma peça que entrou no dia 26. O erro é de um dia e some no desenvolvimento,
 * onde ninguém confere; por isso a data nasce daqui e de mais nenhum lugar.
 */
export function dataLocal(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

/** "26 de agosto" — dentro do ano corrente, o ano é ruído. */
export function diaEMes(iso: string) {
  return DIA_E_MES.format(dataLocal(iso));
}

/** "26 de agosto de 2026" — para o `<time>` legível e para peça antiga. */
export function dataPorExtenso(iso: string) {
  return DIA_MES_ANO.format(dataLocal(iso));
}

/** Lista em português: "P, M e G". Nada de "P, M, G" com vírgula solta no fim. */
export function listar(itens: readonly string[]) {
  if (itens.length === 0) return "";
  if (itens.length === 1) return itens[0];
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}
