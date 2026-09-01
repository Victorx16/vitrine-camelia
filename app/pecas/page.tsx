import type { Metadata } from "next";
import { Filtros } from "@/components/catalogo/filtros";
import { Arara } from "@/components/sections/arara";
import { Revela } from "@/components/ui/revela";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY, LOJA } from "@/lib/constants";
import { facetas } from "@/lib/filtro";
import { pecasVisiveis } from "@/lib/peca";

export const metadata: Metadata = {
  title: `Todas as peças — ${LOJA.nome}`,
  description: COPY.catalogo.subtitulo,
  alternates: { canonical: "/pecas" },
};

/**
 * O catálogo inteiro, numa página só.
 *
 * **Sem paginação, e com filtro.** As duas coisas são decisões, e a segunda
 * mudou de ideia no caminho.
 *
 * Não ter filtro era defensável enquanto o catálogo era de trinta a sessenta
 * peças: rolar é mais rápido do que escolher um critério. Com cento e cinquenta
 * deixa de ser — a visitante rola até desistir, e o site falha exatamente na
 * única coisa que ele existe para fazer.
 *
 * A paginação continua fora. Numa vitrine, a peça da página 2 é uma peça que
 * ninguém vê; o filtro encurta a lista sem esconder nada atrás de um botão.
 *
 * O filtro por TAMANHO é o que mais vale, e não é o mais óbvio. "Tem no meu
 * tamanho?" é uma das três perguntas que travam a venda, e é a única que o site
 * pode responder antes de a conversa começar.
 *
 * A ordem é a de entrada, da mais nova para a mais velha — a mesma lógica da
 * home, sem os trilhos.
 */
export default async function Pecas() {
  const pecas = await pecasVisiveis();
  const { categorias, tamanhos } = facetas(pecas);

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
          <>
            <Filtros
              categorias={categorias}
              tamanhos={tamanhos}
              total={pecas.length}
            />
            <Arara pecas={pecas} filtravel />
          </>
        )}
      </div>
    </section>
  );
}
