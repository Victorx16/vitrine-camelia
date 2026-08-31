/**
 * Auditoria de contraste da paleta Camélia.
 *
 * Rode com `pnpm contrast`. Sai com código 1 se algum par que carrega texto
 * reprovar no mínimo AA (4,5:1) — dá para plugar em CI.
 *
 * A regra da casa é medir, não estimar no olho. Um par que "parece legível" num
 * monitor bom reprova no celular de quem está no sol — e o celular no sol é
 * exatamente onde alguém abre a vitrine de uma loja de rua.
 */

const TOKENS = {
  linho: "#e8e7df",
  papel: "#f1f0ea",
  tinta: "#16150f",
  musgo: "#3a4634",
  sepia: "#5c5a4f",
  fio: "#c9c6b6",
};

/** Luminância relativa conforme WCAG 2.1. */
function luminance(hex) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** `min: null` = par decorativo, medido para registro mas sem exigência. */
const PAIRS = [
  ["Texto sobre fundo", TOKENS.tinta, TOKENS.linho, 4.5],
  ["Texto sobre superfície", TOKENS.tinta, TOKENS.papel, 4.5],
  // `sepia` veste a grade, a data e a categoria: 11px em caixa alta. Não conta
  // como texto grande, então valem os 4,5:1 cheios nas duas superfícies.
  ["Texto secundário sobre fundo", TOKENS.sepia, TOKENS.linho, 4.5],
  ["Texto secundário sobre superfície", TOKENS.sepia, TOKENS.papel, 4.5],
  ["Acento sobre fundo", TOKENS.musgo, TOKENS.linho, 4.5],
  ["Acento sobre superfície", TOKENS.musgo, TOKENS.papel, 4.5],
  ["Botão: texto sobre tinta", TOKENS.linho, TOKENS.tinta, 4.5],
  ["Rodapé: texto sobre musgo", TOKENS.linho, TOKENS.musgo, 4.5],
  ["Anel de foco sobre fundo", TOKENS.musgo, TOKENS.linho, 3],
  ["Selo esgotada: texto sobre tinta", TOKENS.linho, TOKENS.tinta, 4.5],
  // O fio é filete de 1px e nunca carrega texto nem estado. Fica na lista para
  // que uma mudança futura de tom apareça no relatório em vez de passar batida.
  ["Fio da arara (decorativo)", TOKENS.fio, TOKENS.linho, null],
];

let falhas = 0;

for (const [nome, frente, fundo, minimo] of PAIRS) {
  const valor = ratio(frente, fundo);
  const reprovou = minimo !== null && valor < minimo;
  if (reprovou) falhas++;

  const marca = minimo === null ? "–" : reprovou ? "REPROVA" : "ok";
  const nivel =
    minimo === null ? "decorativo" : valor >= 7 ? "AAA" : valor >= 4.5 ? "AA" : "—";

  console.log(
    `${marca.padEnd(8)} ${nome.padEnd(36)} ${valor.toFixed(2).padStart(6)}:1  ${nivel}`,
  );
}

console.log(
  falhas === 0
    ? "\nTodos os pares com texto passam no mínimo exigido."
    : `\n${falhas} par(es) reprovando. Ajuste os tokens em app/globals.css.`,
);

process.exit(falhas === 0 ? 0 : 1);
