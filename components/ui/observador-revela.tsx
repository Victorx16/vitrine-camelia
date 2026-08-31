"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Um observador só para a página inteira.
 *
 * Ele não anima nada: só marca `data-revelado` quando o elemento entra na tela.
 * Quem anima é o CSS em globals.css, dentro de `@media (scripting: enabled)`.
 *
 * A divisão importa numa página que é catálogo. Se este componente nunca rodar
 * — script bloqueado, rede ruim, navegador antigo — a consulta de mídia não
 * casa, nada nasce escondido e o visitante vê a vitrine inteira sem a animação.
 * O contrário (esconder por padrão e revelar por script) troca uma animação por
 * um site em branco quando algo falha.
 *
 * ------------------------------------------------------------------------
 * Duas maneiras de este componente deixar conteúdo invisível para sempre, e
 * ambas aconteceram antes de virarem as duas regras abaixo:
 *
 * 1. **Navegação entre páginas.** O componente mora no layout, e o layout NÃO
 *    remonta quando se clica num link — só o conteúdo troca. Com a dependência
 *    vazia, o efeito rodava uma vez na primeira página e nunca mais: os
 *    elementos da página seguinte jamais eram observados e ficavam em
 *    `opacity: 0` para sempre. Era isso que deixava "Visite a loja" com só a
 *    foto (o único bloco fora de um `Revela`) e a home vazia ao voltar para
 *    ela. Daí `usePathname` na dependência.
 *
 * 2. **Rolar antes de o script rodar.** O IntersectionObserver avisa quando um
 *    elemento ENTRA na tela; para um elemento que já passou, ele nunca avisa. E
 *    entre o HTML chegar e o efeito rodar cabe muita rolagem em celular lento
 *    ou com o dedo já descendo. Daí a varredura inicial: qualquer elemento que
 *    a rolagem já alcançou nasce revelado, e só o que está mesmo abaixo entra
 *    na observação.
 * ------------------------------------------------------------------------
 */
export function ObservadorRevela() {
  // Muda a cada navegação de página. É o gatilho para observar o conteúdo novo.
  const caminho = usePathname();

  useEffect(() => {
    const alvos = Array.from(
      document.querySelectorAll<HTMLElement>("[data-revela]:not([data-revelado])"),
    );

    const revelar = (alvo: Element) => alvo.setAttribute("data-revelado", "");

    // Sem IntersectionObserver, revela tudo de uma vez e sai.
    if (typeof IntersectionObserver === "undefined") {
      alvos.forEach(revelar);
      return;
    }

    // Varredura inicial: o que a rolagem já alcançou não espera aviso nenhum.
    // `top < innerHeight` cobre os dois casos de uma vez — o que está na tela
    // agora e o que ficou acima dela.
    const pendentes = alvos.filter((alvo) => {
      if (alvo.getBoundingClientRect().top < window.innerHeight) {
        revelar(alvo);
        return false;
      }
      return true;
    });

    if (pendentes.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          revelar(entrada.target);
          // Uma vez revelado, para de observar: numa arara de sessenta peças,
          // manter todas sob observação custa quadro em celular de entrada.
          observador.unobserve(entrada.target);
        }
      },
      // A margem negativa embaixo evita que a peça revele quando só a primeira
      // fatia dela apareceu — a cascata fica sincronizada com o olho.
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    pendentes.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, [caminho]);

  return null;
}
