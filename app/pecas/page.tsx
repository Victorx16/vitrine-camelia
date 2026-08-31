import type { Metadata } from "next";
import { Arara } from "@/components/sections/arara";
import { Revela } from "@/components/ui/revela";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY, LOJA } from "@/lib/constants";
import { pecasVisiveis } from "@/lib/peca";

export const metadata: Metadata = {
  title: `Todas as peças — ${LOJA.nome}`,
  description: COPY.catalogo.subtitulo,
  alternates: { canonical: "/pecas" },
};

/**
 * O catálogo inteiro, numa página só.
 *
 * Sem paginação e sem filtro, de propósito: são algumas dezenas de peças, e
 * rolar é mais rápido do que decidir por qual critério filtrar. Filtro é
 * ferramenta de inventário grande; isto é curadoria.
 *
 * A ordem é a de entrada, da mais nova para a mais velha — a mesma lógica da
 * home, sem os trilhos.
 */
export default async function Pecas() {
  const pecas = await pecasVisiveis();

  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-14 sm:px-8 lg:py-20">
        <Revela className="flex flex-col gap-4">
          <Rotulo>{COPY.catalogo.rotulo}</Rotulo>
          <h1 className="text-headline font-display max-w-[18ch]">
            {COPY.catalogo.titulo}
          </h1>
          <p className="text-sepia max-w-[54ch] leading-relaxed text-pretty">
            {COPY.catalogo.subtitulo}
          </p>
        </Revela>

        <div className="border-tinta flex items-baseline gap-4 border-b pb-2">
          <Rotulo className="shrink-0">Na loja hoje</Rotulo>
          <span aria-hidden="true" className="bg-fio h-px flex-1" />
          <Rotulo className="tnum shrink-0">{pecas.length} peças</Rotulo>
        </div>

        {pecas.length === 0 ? (
          <p className="text-sepia">{COPY.catalogo.vazio}</p>
        ) : (
          <Arara pecas={pecas} />
        )}
      </div>
    </section>
  );
}
