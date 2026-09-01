"use client";

import { limpar, mensagemSeparadas, useSeparadas } from "@/components/separar/estado";
import { COPY } from "@/lib/constants";

/**
 * A barra que aparece quando há peça separada.
 *
 * ------------------------------------------------------------------------
 * **Ela não existe até existir peça separada.** Uma barra fixa vazia, ou com um
 * "0", seria um pedaço de tela ocupado o tempo todo por uma função que a maioria
 * das visitantes nunca vai usar. A maior parte das pessoas vai clicar no botão
 * de uma peça só, e essa continua sendo a ação principal do site.
 * ------------------------------------------------------------------------
 *
 * **Ela não lista as peças, e isso foi uma correção.**
 *
 * A primeira versão mostrava cada peça com o preço dentro da barra. Com cinco
 * separadas ela cresceu para 191px e passou a cobrir o rodapé — inclusive o
 * aviso de que a loja é fictícia. A tentativa seguinte foi medir a altura com
 * `ResizeObserver` e reservar o vão certo; ele depende de quadro de animação e
 * não disparou de forma confiável nem num teste direto.
 *
 * A saída veio de olhar o que já existe em vez de consertar o que eu tinha
 * feito: **o WhatsApp mostra a mensagem inteira antes de enviar.** A revisão do
 * que foi separado já acontece lá, com nome e preço de cada peça. Repetir isso
 * numa barra fixa era duplicar uma tela que a pessoa vê de qualquer jeito — e
 * pagar por isso com o rodapé coberto.
 *
 * Sem a lista, a barra tem uma linha e altura previsível. O vão volta a ser uma
 * constante, e não há medição nenhuma para dar errado.
 *
 * Quem quiser conferir sem sair da página tem o "Separada ✓" no próprio cartão
 * de cada peça.
 *
 * Sem JavaScript nada disto aparece, e o botão de cada peça continua abrindo o
 * WhatsApp normalmente. Separar é conveniência; perguntar é o produto.
 */
export function Bandeja() {
  const atual = useSeparadas();
  if (atual.length === 0) return null;

  const uma = atual.length === 1;

  return (
    <>
      {/* Reserva o espaço da barra. Constante porque a barra é constante. */}
      <div aria-hidden="true" className="h-20" />

      <aside
        aria-label={COPY.separar.regiao}
        className="border-tinta bg-linho fixed inset-x-0 bottom-0 z-40 border-t"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-x-4 px-5 py-3 sm:px-8">
          <a
            href={mensagemSeparadas(atual)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-tinta bg-tinta text-linho hover:border-musgo hover:bg-musgo inline-flex min-h-11 flex-1 items-center justify-center border px-5 text-center text-[0.9375rem] font-semibold transition-colors sm:flex-none"
          >
            {uma
              ? COPY.separar.perguntarUma
              : COPY.separar.perguntarMuitas.replace("{n}", String(atual.length))}
          </a>

          <button
            type="button"
            onClick={limpar}
            className="text-sepia hover:text-tinta min-h-11 shrink-0 text-xs tracking-[0.14em] uppercase underline underline-offset-4 transition-colors"
          >
            {COPY.separar.limpar}
          </button>
        </div>
      </aside>
    </>
  );
}
