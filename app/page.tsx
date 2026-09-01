import Link from "next/link";
import { Arara } from "@/components/sections/arara";
import { Capa } from "@/components/sections/capa";
import { Chegou } from "@/components/sections/chegou";
import { Revela } from "@/components/ui/revela";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY } from "@/lib/constants";
import { pecasEmDestaque, trilhos } from "@/lib/peca";

/**
 * A home.
 *
 * A ordem das seções é a regra de produto virando página:
 *
 *   Capa → A vitrine (fixadas) → Chegou agora (por data) → catálogo inteiro
 *
 * "Chegou agora" é a seção principal e ocupa o corpo da página. Acima dela, uma
 * prateleira curta com as peças fixadas — o equivalente ao manequim da porta,
 * que a dona troca quando quer, independente do que entrou essa semana. As
 * fixadas são retiradas dos trilhos para não aparecerem duas vezes.
 */
export default async function Home() {
  const fixadas = await pecasEmDestaque();
  const araras = await trilhos(new Set(fixadas.map((peca) => peca.slug)));

  return (
    <>
      <Capa />

      {fixadas.length > 0 && (
        <section className="border-fio border-b">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-16 sm:px-8 lg:py-20">
            <Revela className="border-tinta flex items-baseline gap-4 border-b pb-2">
              <Rotulo as="h2" className="shrink-0">
                A vitrine
              </Rotulo>
              <span aria-hidden="true" data-revela="" data-fio="" className="bg-fio h-px flex-1" />
              <Rotulo className="tnum shrink-0">
                {fixadas.length} peças
              </Rotulo>
            </Revela>

            <Arara pecas={fixadas} />
          </div>
        </section>
      )}

      <Chegou trilhos={araras} />

      <section className="border-fio border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-16 sm:px-8">
          <Revela className="flex flex-col gap-5">
            <h2 className="text-headline font-display max-w-[18ch]">
              {COPY.catalogo.titulo}
            </h2>
            <p className="text-sepia max-w-[52ch] leading-relaxed">
              {COPY.catalogo.subtitulo}
            </p>
            <Link
              href="/pecas"
              className="border-tinta bg-tinta text-linho hover:border-musgo hover:bg-musgo inline-flex min-h-11 w-fit items-center border px-6 py-3 text-[0.9375rem] font-semibold transition-colors"
            >
              {COPY.catalogo.rotulo}
            </Link>
          </Revela>
        </div>
      </section>
    </>
  );
}
