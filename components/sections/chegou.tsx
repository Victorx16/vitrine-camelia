import { Arara } from "@/components/sections/arara";
import { Revela } from "@/components/ui/revela";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY } from "@/lib/constants";
import { diaEMes } from "@/lib/formato";
import type { Trilho } from "@/lib/peca";

interface ChegouProps {
  trilhos: Trilho[];
}

/**
 * A seção principal da home: o que entrou, agrupado pelo dia em que entrou.
 *
 * Cada trilho é um dia de arara. Agrupar por dia, e não jogar tudo numa grade
 * só, é o que faz a rotatividade parecer fartura: três trilhos curtos leem como
 * "chega coisa toda hora", enquanto um bloco único de doze peças lê como
 * "postaram tudo de uma vez".
 *
 * A regra do vencimento fica visível aqui em vez de escondida: peça velha
 * caindo fora não deixa buraco na grade, só encurta o trilho mais antigo.
 */
export function Chegou({ trilhos }: ChegouProps) {
  return (
    <section id="chegou" className="border-fio border-b">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-16 sm:px-8 lg:py-20">
        <Revela className="flex flex-col gap-4">
          <Rotulo>{COPY.chegou.rotulo}</Rotulo>
          <h2 className="text-headline font-display max-w-[20ch]">
            {COPY.chegou.titulo}
          </h2>
          <p className="text-sepia max-w-[52ch] leading-relaxed">
            {COPY.chegou.subtitulo}
          </p>
        </Revela>

        {trilhos.length === 0 ? (
          <p className="text-sepia border-fio border-t pt-6">
            {COPY.chegou.vazio}
          </p>
        ) : (
          trilhos.map((trilho, t) => (
            <div key={trilho.data} className="flex flex-col gap-7">
              {/* O trilho: rótulo à esquerda, contagem à direita, e entre os
                  dois o fio de onde as peças pendem. */}
              <div className="border-tinta flex items-baseline gap-4 border-b pb-2">
                <Rotulo tom="musgo" className="flex shrink-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="bg-musgo inline-block size-[0.45rem]"
                  />
                  Entrou{" "}
                  <time dateTime={trilho.data}>{diaEMes(trilho.data)}</time>
                </Rotulo>
                <span aria-hidden="true" className="bg-fio h-px flex-1" />
                <Rotulo className="tnum shrink-0">
                  {trilho.pecas.length}{" "}
                  {trilho.pecas.length === 1 ? "peça" : "peças"}
                </Rotulo>
              </div>

              {/* O deslocamento acumula os trilhos anteriores para que só as
                  primeiras fotos da PÁGINA carreguem com prioridade — e não as
                  primeiras de cada trilho, que já estão abaixo da dobra. */}
              <Arara
                pecas={trilho.pecas}
                deslocamento={t === 0 ? 0 : 4}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
