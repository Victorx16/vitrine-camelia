import Link from "next/link";
import { Foto } from "@/components/peca/foto";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY, LOJA } from "@/lib/constants";

/**
 * A capa.
 *
 * A tese da página em três linhas: o que está aqui está na loja hoje, e o que
 * sai não volta. É a rotatividade dita antes de ser demonstrada — as araras
 * logo abaixo é que provam.
 *
 * A foto é a arara da própria loja, não campanha com modelo. A diferença é o
 * projeto inteiro: campanha promete uma vida, arara mostra o que tem.
 */
export function Capa() {
  return (
    <section className="border-fio border-b">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14 lg:py-20">
        <div className="flex flex-col gap-6">
          <Rotulo tom="musgo">{COPY.capa.rotulo}</Rotulo>
          <h1 className="text-display font-display max-w-[14ch]">
            {COPY.capa.titulo}
          </h1>
          <p className="text-sepia max-w-[52ch] leading-relaxed text-pretty">
            {COPY.capa.subtitulo}
          </p>
          <Link
            href="#chegou"
            className="text-rotulo decoration-fio hover:decoration-tinta inline-flex min-h-11 w-fit items-center uppercase underline underline-offset-[6px] transition-colors"
          >
            {COPY.capa.acao}
            <span aria-hidden="true" className="ml-2">&darr;</span>
          </Link>
        </div>

        {/* Corte mais baixo no celular: a foto tem chão claro embaixo, e em
            4:5 num telefone o último terço da tela virava parede vazia. */}
        <div className="bg-papel aspect-4/3 overflow-hidden lg:aspect-3/4">
          <Foto
            src="/pecas/loja-arara.webp"
            alt={`Arara de peças em tons neutros na ${LOJA.nome}, com um vaso de folhas secas ao lado.`}
            width={900}
            height={1200}
            sizes="(min-width: 1024px) 33vw, 100vw"
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
