import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevelaProps {
  children: ReactNode;
  className?: string;
  /** Índice na lista. Vira o atraso da cascata — 45ms por item, teto de 8. */
  indice?: number;
}

/**
 * Marca um bloco para a revelação por scroll.
 *
 * Componente de servidor: não traz JavaScript nenhum para o cliente. Ele só põe
 * o atributo que o CSS observa e, quando faz parte de uma lista, o atraso da
 * cascata em variável CSS.
 */
export function Revela({ children, className, indice }: RevelaProps) {
  // O teto existe porque cascata sem limite vira espera: na trigésima peça de
  // uma arara, 45ms por item seriam um segundo e meio de tela parada.
  const atraso = indice === undefined ? undefined : Math.min(indice, 8) * 45;

  return (
    <div
      data-revela=""
      className={cn(className)}
      style={atraso ? ({ "--atraso": `${atraso}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
