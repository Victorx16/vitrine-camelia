import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotaoWhatsApp } from "@/components/peca/botao-whatsapp";
import { Foto } from "@/components/peca/foto";
import { GradeTamanhos } from "@/components/peca/grade-tamanhos";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY, LOJA } from "@/lib/constants";
import { dataPorExtenso, listar, preco as formatarPreco } from "@/lib/formato";
import { altDaFoto, buscarPeca, todosOsSlugs } from "@/lib/peca";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return todosOsSlugs();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const peca = await buscarPeca(slug);
  if (!peca) return {};

  const titulo = `${peca.nome} — ${formatarPreco(peca.preco)} | ${LOJA.nome}`;
  const descricao =
    peca.descricao ??
    `${peca.nome} em ${peca.tecido ?? peca.categoria}, ${listar(peca.cores)}. Veste ${listar(peca.tamanhos)}.`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/pecas/${peca.slug}` },
    openGraph: { title: titulo, description: descricao, type: "article" },
  };
}

/**
 * A página da peça.
 *
 * É aqui que a dúvida que trava a compra numa boutique — "serve em mim?" — tem
 * a melhor chance de ser respondida antes da conversa: grade, medidas da peça e
 * tecido ficam juntos, acima do botão.
 *
 * A página existe mesmo para peça vencida. Um link que já circulou no WhatsApp
 * não pode virar 404 porque a peça saiu da vitrine — ele mostra a peça com selo
 * e oferece a conversa de "quero uma parecida", que é lead em vez de beco.
 */
export default async function PaginaPeca({ params }: Props) {
  const { slug } = await params;
  const peca = await buscarPeca(slug);
  if (!peca) notFound();

  const esgotada = peca.situacao === "esgotada";

  const ficha = [
    { rotulo: COPY.peca.cores, valor: listar(peca.cores) },
    peca.tecido && { rotulo: COPY.peca.tecido, valor: peca.tecido },
    peca.medidas && { rotulo: COPY.peca.medidas, valor: peca.medidas },
  ].filter(Boolean) as { rotulo: string; valor: string }[];

  return (
    <article>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-16">
        {/* A galeria é uma coluna de fotos, não um carrossel. Carrossel esconde
            atrás de um gesto exatamente o que a cliente veio ver, e some com a
            segunda foto para quem usa teclado. Rolar mostra tudo. */}
        <div className="flex flex-col gap-3">
          {peca.fotos.map((foto, i) => (
            <div key={foto.src} className="bg-papel relative aspect-3/4 overflow-hidden">
              <Foto
                src={foto.src}
                alt={altDaFoto(peca, i)}
                width={900}
                height={1200}
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority={i === 0}
                className={cn(
                  "h-full w-full object-cover",
                  esgotada && "saturate-45 contrast-95",
                )}
              />
              {esgotada && i === 0 && (
                <p className="bg-tinta text-linho font-display absolute inset-x-0 top-[45%] py-2 text-center text-2xl italic">
                  {COPY.selo.esgotada}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-col gap-4">
            <Rotulo>{peca.categoria}</Rotulo>
            <h1 className="text-headline font-display">{peca.nome}</h1>
            <p className="text-headline font-display tnum">
              {formatarPreco(peca.preco)}
            </p>
          </div>

          {peca.descricao && (
            <p className="max-w-[46ch] leading-relaxed text-pretty">
              {peca.descricao}
            </p>
          )}

          <div className="border-fio flex flex-col gap-4 border-t pt-6">
            <GradeTamanhos tamanhos={peca.tamanhos} comRotulo />

            <dl className="flex flex-col gap-3">
              {ficha.map((linha) => (
                <div key={linha.rotulo} className="flex flex-col gap-0.5">
                  <dt>
                    <Rotulo>{linha.rotulo}</Rotulo>
                  </dt>
                  <dd className="text-[0.9375rem]">{linha.valor}</dd>
                </div>
              ))}

              <div className="flex flex-col gap-0.5">
                <dt>
                  <Rotulo>{COPY.peca.entrada}</Rotulo>
                </dt>
                <dd className="text-[0.9375rem]">
                  <time dateTime={peca.dataEntrada}>
                    {dataPorExtenso(peca.dataEntrada)}
                  </time>
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <BotaoWhatsApp peca={peca} />
            {/* A frase que substitui o estoque. A vitrine nunca diz quanto
                sobrou — diz onde a confirmação acontece. */}
            <p className="text-sepia max-w-[42ch] text-[0.8125rem] leading-relaxed">
              {esgotada ? COPY.selo.esgotadaAjuda : COPY.peca.disponibilidade}
            </p>
          </div>

          <Link
            href="/pecas"
            className="text-rotulo text-sepia hover:text-tinta decoration-fio hover:decoration-tinta inline-flex min-h-11 w-fit items-center uppercase underline underline-offset-[6px] transition-colors"
          >
            {COPY.peca.voltar}
          </Link>
        </div>
      </div>
    </article>
  );
}
