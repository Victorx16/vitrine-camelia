import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RotuloProps {
  children: ReactNode;
  className?: string;
  /** `span` por padrão. `h2` quando o rótulo é o título real da seção. */
  as?: ElementType;
  tom?: "sepia" | "musgo" | "linho";
  tamanho?: "normal" | "pequeno";
}

/**
 * A etiqueta de cabide do site.
 *
 * Karla em caixa alta com entreletra aberta. É o que faz o papel que numa
 * prancha técnica seria mono — e evita carregar uma terceira família de fonte
 * só para escrever "VESTE P · M · G".
 */
export function Rotulo({
  children,
  className,
  as: Tag = "span",
  tom = "sepia",
  tamanho = "normal",
}: RotuloProps) {
  return (
    <Tag
      className={cn(
        "font-sans uppercase",
        tamanho === "normal" ? "text-rotulo" : "text-rotulo-sm",
        tom === "sepia" && "text-sepia",
        tom === "musgo" && "text-musgo",
        tom === "linho" && "text-linho",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
