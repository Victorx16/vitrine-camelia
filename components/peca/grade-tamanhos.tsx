import { Rotulo } from "@/components/ui/rotulo";
import { COPY } from "@/lib/constants";
import { listar } from "@/lib/formato";
import type { Tamanho } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface GradeTamanhosProps {
  tamanhos: Tamanho[];
  className?: string;
  /** `true` na página da peça, onde cabe o rótulo "Veste" antes da grade. */
  comRotulo?: boolean;
}

/**
 * A grade que a peça veste — e só isso.
 *
 * Nunca quantidade. Não existe "resta 1 no M" aqui, nem em lugar nenhum do
 * site: a vitrine não tem como saber o estoque, e fingir que sabe é a forma
 * mais rápida de prometer o que a loja não tem. A confirmação acontece na
 * conversa, e o texto ao lado do botão diz isso em voz alta.
 *
 * A lista visual é separada por ponto médio, mas o leitor de tela recebe a
 * mesma informação em português corrente ("veste P, M e G") — ponto médio não
 * se lê.
 */
export function GradeTamanhos({
  tamanhos,
  className,
  comRotulo = false,
}: GradeTamanhosProps) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-3 gap-y-1", className)}>
      {comRotulo && <Rotulo>{COPY.peca.grade}</Rotulo>}

      <span className="sr-only">
        {COPY.peca.grade} {listar(tamanhos)}.
      </span>

      <span aria-hidden="true" className="text-rotulo tnum flex flex-wrap gap-x-2 text-sepia uppercase">
        {tamanhos.map((tamanho, i) => (
          <span key={tamanho}>
            {tamanho}
            {i < tamanhos.length - 1 && <span className="text-fio ml-2">·</span>}
          </span>
        ))}
      </span>
    </div>
  );
}
