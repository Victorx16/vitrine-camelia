"use client";

import { devolver, estaSeparada, separar, useSeparadas } from "@/components/separar/estado";
import { COPY, TETO_SEPARADAS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Peca } from "@/lib/tipos";

/**
 * "Separar" / "Separada" — o gesto do balcão, não o do supermercado.
 *
 * Nada aqui empresta a linguagem visual de e-commerce: não há sacola, não há
 * carrinho, não há bolinha com número. É uma linha de texto sublinhada, do
 * mesmo peso do "quero esta peça" ao lado, porque as duas ações são irmãs —
 * perguntar agora ou juntar para perguntar depois.
 *
 * Peça esgotada não pode ser separada. Separar existe para montar uma pergunta
 * sobre o que dá para levar; uma peça que já foi entra na conversa por outro
 * caminho ("quero uma parecida"), que é uma conversa diferente.
 */
export function BotaoSeparar({ peca, className }: { peca: Peca; className?: string }) {
  const atual = useSeparadas();

  if (peca.situacao === "esgotada") return null;

  const dentro = estaSeparada(peca.slug, atual);
  const cheio = !dentro && atual.length >= TETO_SEPARADAS;

  return (
    <button
      type="button"
      disabled={cheio}
      aria-pressed={dentro}
      onClick={() =>
        dentro
          ? devolver(peca.slug)
          : separar({ slug: peca.slug, nome: peca.nome, preco: peca.preco })
      }
      className={cn(
        "inline-flex min-h-11 items-center text-[0.8125rem] underline-offset-4 transition-colors",
        dentro
          ? "text-musgo underline decoration-current"
          : "text-sepia hover:text-tinta underline decoration-transparent hover:decoration-current",
        cheio && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {cheio ? COPY.separar.cheio : dentro ? COPY.separar.dentro : COPY.separar.fora}
    </button>
  );
}
