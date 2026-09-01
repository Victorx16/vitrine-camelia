"use client";

import { useSyncExternalStore } from "react";
import { LOJA, TETO_SEPARADAS } from "@/lib/constants";
import { preco } from "@/lib/formato";

/**
 * As peças que a visitante separou para perguntar de uma vez.
 *
 * ------------------------------------------------------------------------
 * **Isto não é um carrinho, e a diferença não é semântica.**
 *
 * Carrinho acumula com intenção de comprar: tem quantidade, tem total, tem
 * checkout, e obriga a loja a manter estoque correto. Nada disso existe aqui.
 * O que existe é o gesto que a atendente faz no balcão — separar duas ou três
 * peças para a cliente ver junto — e a conversa continua sendo com uma pessoa,
 * que confirma se ainda tem.
 *
 * A régua para o dia em que alguém propuser mais: se a próxima ideia obrigar a
 * saber QUANTAS peças existem, ela está do outro lado da linha.
 *
 * **Sem total, de propósito.** Somar os preços transforma "gostei destas três"
 * em "vou levar estas três", e é exatamente o sinal que faz a página deixar de
 * ser vitrine. Cada peça leva o seu preço; a soma é assunto da conversa.
 * ------------------------------------------------------------------------
 *
 * O estado vive no navegador de quem visita, e em lugar nenhum além dele. Não
 * há servidor para guardar, não há conta, e a dona da loja não vê seleção de
 * ninguém — ela vê a mensagem que a pessoa decidiu mandar.
 */

export interface Separada {
  slug: string;
  nome: string;
  preco: number;
}

const CHAVE = "camelia:separadas";

let lista: Separada[] = [];
let carregado = false;
const ouvintes = new Set<() => void>();

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

function gravar(nova: Separada[]) {
  lista = nova;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(nova));
  } catch {
    // Navegador anônimo, armazenamento cheio ou bloqueado: a seleção continua
    // valendo nesta aba e some ao fechar. Perder a lista é um aborrecimento;
    // quebrar a página por causa dela seria um defeito.
  }
  avisar();
}

function carregar() {
  if (carregado) return;
  carregado = true;
  try {
    const cru = window.localStorage.getItem(CHAVE);
    if (!cru) return;
    const lido: unknown = JSON.parse(cru);
    if (!Array.isArray(lido)) return;
    // Valida item a item: o que está no armazenamento pode ter sido gravado por
    // uma versão anterior do site, ou editado à mão.
    lista = lido.filter(
      (x): x is Separada =>
        !!x &&
        typeof x === "object" &&
        typeof (x as Separada).slug === "string" &&
        typeof (x as Separada).nome === "string" &&
        typeof (x as Separada).preco === "number",
    );
  } catch {
    lista = [];
  }
}

function inscrever(ouvinte: () => void) {
  // O primeiro inscrito acontece depois da montagem, no navegador. É o momento
  // certo de ler o armazenamento: durante a renderização não existe `window`,
  // e ler cedo demais daria divergência com o HTML gerado no build.
  const primeiro = ouvintes.size === 0;
  ouvintes.add(ouvinte);
  if (primeiro) {
    carregar();
    if (lista.length > 0) avisar();
  }
  return () => {
    ouvintes.delete(ouvinte);
  };
}

const VAZIA: Separada[] = [];

/** A lista atual. Vazia no HTML gerado; preenchida assim que o navegador assume. */
export function useSeparadas(): Separada[] {
  return useSyncExternalStore(
    inscrever,
    () => lista,
    () => VAZIA,
  );
}

export function separar(peca: Separada) {
  if (lista.some((p) => p.slug === peca.slug)) return;
  if (lista.length >= TETO_SEPARADAS) return;
  gravar([...lista, peca]);
}

export function devolver(slug: string) {
  gravar(lista.filter((p) => p.slug !== slug));
}

export function limpar() {
  gravar([]);
}

export function estaSeparada(slug: string, atual: Separada[]) {
  return atual.some((p) => p.slug === slug);
}

/**
 * A mensagem de várias peças.
 *
 * Uma linha por peça com o preço ao lado, e **um** endereço no fim — o catálogo
 * já filtrado nas peças escolhidas. Mandar um link por peça encheria a
 * mensagem de endereços iguais e ilegíveis; assim a dona abre uma página e vê
 * as três de uma vez, com foto.
 */
export function mensagemSeparadas(atual: Separada[]) {
  const linhas = atual
    .map((p) => `• ${p.nome} — ${preco(p.preco)}`)
    .join("\n");

  const endereco = `${LOJA.url}/pecas?separadas=${atual.map((p) => p.slug).join(",")}`;

  const texto =
    atual.length === 1
      ? `Oi! Separei esta peça no site:\n\n${linhas}\n\n${endereco}`
      : `Oi! Separei estas peças no site:\n\n${linhas}\n\n${endereco}`;

  return `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`;
}
