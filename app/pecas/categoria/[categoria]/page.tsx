import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Filtros } from "@/components/catalogo/filtros";
import { Arara } from "@/components/sections/arara";
import { Revela } from "@/components/ui/revela";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY, LOJA } from "@/lib/constants";
import { PLURAL, categoriaDaUrl, facetas, urlDaCategoria } from "@/lib/filtro";
import { pecasVisiveis } from "@/lib/peca";

/**
 * Uma página por tipo de peça: /pecas/categoria/vestidos.
 *
 * ------------------------------------------------------------------------
 * Por que existir, se o filtro do catálogo já faz isso?
 *
 * Porque filtro não tem endereço para o Google. Quem procura "vestido midi
 * Santo André" precisa cair numa página que já é sobre vestidos, com título,
 * descrição e conteúdo sobre vestidos — não numa página genérica que só vira
 * sobre vestidos depois que alguém clica num botão.
 *
 * É a diferença entre o site ser encontrado e o site ser navegado. As duas
 * coisas são necessárias, e são coisas diferentes.
 * ------------------------------------------------------------------------
 *
 * O endereço tem `categoria/` no meio de propósito. Sem esse segmento,
 * /pecas/vestidos disputaria com /pecas/vestido-preto-midi — a rota de peça já
 * ocupa esse lugar, e o dia em que uma peça se chamasse "vestidos" seria um
 * defeito impossível de achar.
 */

export const dynamicParams = false;

/** Só gera página para tipo que tem peça hoje. Categoria vazia não é página. */
export async function generateStaticParams() {
  const { categorias } = facetas(await pecasVisiveis());
  return categorias.map((c) => ({ categoria: urlDaCategoria(c.valor) }));
}

async function daUrl(apelido: string) {
  const categoria = categoriaDaUrl(decodeURIComponent(apelido));
  if (!categoria) return null;

  const pecas = (await pecasVisiveis()).filter((p) => p.categoria === categoria);
  if (pecas.length === 0) return null;

  return { categoria, pecas };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const dados = await daUrl((await params).categoria);
  if (!dados) return {};

  const tipo = PLURAL[dados.categoria];

  return {
    title: `${tipo} — ${LOJA.nome}`,
    /**
     * A descrição diz a cidade e quantas peças existem.
     *
     * Quantidade numa descrição é incomum e aqui é honesto: o número é o do
     * build de hoje, e o site se refaz quando o catálogo muda. É também o que
     * separa esta página de mil outras iguais na busca — "sete vestidos" diz
     * que existe uma loja de verdade atrás.
     */
    description: `${tipo} na ${LOJA.nome}, ${LOJA.descritor} em ${LOJA.cidade}. ${dados.pecas.length} ${dados.pecas.length === 1 ? "peça" : "peças"} na arara agora, com preço e grade. Atendimento pelo WhatsApp.`,
    alternates: {
      canonical: `/pecas/categoria/${urlDaCategoria(dados.categoria)}`,
    },
  };
}

export default async function PorCategoria({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const dados = await daUrl((await params).categoria);
  if (!dados) notFound();

  const { categoria, pecas } = dados;
  const tipo = PLURAL[categoria];
  const { tamanhos } = facetas(pecas);

  // As outras páginas, para quem chegou pelo Google e quer continuar olhando.
  // São links de verdade: é assim que a autoridade de uma página alcança as
  // vizinhas, e é assim que funciona sem JavaScript.
  const irmas = facetas(await pecasVisiveis()).categorias.filter(
    (c) => c.valor !== categoria,
  );

  return (
    <section>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-14 sm:px-8 lg:py-20">
        <Revela className="flex flex-col gap-4">
          <Rotulo>{COPY.categoria.rotulo}</Rotulo>
          <h1 className="text-headline font-display max-w-[18ch]">
            {COPY.categoria.titulo.replace("{tipo}", tipo)}
          </h1>
          <p className="text-sepia max-w-[54ch] leading-relaxed text-pretty">
            {COPY.categoria.subtitulo}
          </p>
        </Revela>

        <div className="border-tinta flex items-baseline gap-4 border-b pb-2">
          <Rotulo className="shrink-0">{tipo}</Rotulo>
          <span aria-hidden="true" className="bg-fio h-px flex-1" />
          <Rotulo className="tnum shrink-0">
            {pecas.length} {pecas.length === 1 ? "peça" : "peças"}
          </Rotulo>
        </div>

        <Filtros
          categorias={[]}
          tamanhos={tamanhos}
          total={pecas.length}
          categoriaFixa={categoria}
        />

        <Arara pecas={pecas} filtravel />

        <nav className="border-fio flex flex-col gap-4 border-t pt-8">
          <Rotulo>{COPY.categoria.outras}</Rotulo>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {irmas.map((c) => (
              <li key={c.valor}>
                <Elo href={`/pecas/categoria/${urlDaCategoria(c.valor)}`}>
                  {c.rotulo}
                  <span className="text-sepia/70 tnum ml-1.5 text-[0.72rem]">
                    {c.quantas}
                  </span>
                </Elo>
              </li>
            ))}
            <li>
              <Elo href="/pecas">{COPY.categoria.todas}</Elo>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}

function Elo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sepia hover:text-tinta hover:decoration-fio inline-flex min-h-11 items-center text-sm underline decoration-transparent underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}
