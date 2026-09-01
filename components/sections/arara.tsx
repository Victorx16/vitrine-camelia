import { Cartao } from "@/components/peca/cartao";
import { Revela } from "@/components/ui/revela";
import { textoDeBusca } from "@/lib/filtro";
import type { Peca } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface AraraProps {
  pecas: Peca[];
  className?: string;
  /** Deslocamento do índice, para a cascata não reiniciar a cada trilho. */
  deslocamento?: number;
  /**
   * Pendura em cada peça o que o filtro precisa ler.
   *
   * Só o catálogo pede isso. A home não filtra nada, e atributo que ninguém lê
   * é peso no HTML de toda visita.
   */
  filtravel?: boolean;
}

/**
 * A grade de peças.
 *
 * Duas colunas no celular, quatro no desktop. Duas e não uma: a rotatividade é
 * o argumento da loja, e uma coluna só faria oito peças parecerem quatro — a
 * sensação de fartura vem de ver o vizinho da peça que se está olhando.
 *
 * A separação é por espaço, nunca por borda. Não existe cartão aqui.
 */
export function Arara({
  pecas,
  className,
  deslocamento = 0,
  filtravel = false,
}: AraraProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-7",
        className,
      )}
    >
      {pecas.map((peca, i) => (
        <Revela
          key={peca.slug}
          indice={i}
          atributos={
            filtravel
              ? {
                  "data-peca": "",
                  "data-categoria": peca.categoria,
                  // Espaço nas pontas para o filtro poder procurar " M " e não
                  // casar "M" dentro de "GG". É o truque mais velho do mundo e
                  // evita uma expressão regular por peça a cada tecla digitada.
                  "data-tamanhos": ` ${peca.tamanhos.join(" ")} `,
                  "data-busca": textoDeBusca(peca),
                }
              : undefined
          }
        >
          <Cartao peca={peca} indice={deslocamento + i} />
        </Revela>
      ))}
    </div>
  );
}
