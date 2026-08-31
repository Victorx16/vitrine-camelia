import { ImageResponse } from "next/og";
import { COPY } from "@/lib/constants";
import { listar, preco as formatarPreco } from "@/lib/formato";
import {
  ASSINATURA_OG,
  AVISO_OG,
  fontesOg,
  fotoParaOg,
  OG,
  OG_SIZE,
  RotuloOg,
  TrilhoOg,
} from "@/lib/og";
import { buscarPeca, todosOsSlugs } from "@/lib/peca";

export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamic = "force-static";

/**
 * Uma imagem por peça, gerada no build.
 *
 * Sem isto, mandar o link de um vestido no WhatsApp abre um cartão com a foto
 * da loja e o nome da marca — o mesmo cartão de qualquer outra peça. Com isto,
 * o cartão mostra a peça, o preço e a grade, e a conversa já começa com as duas
 * pessoas olhando para a mesma coisa. Numa loja que vende por conversa, este
 * arquivo é uma das partes mais úteis do site.
 */
export function generateStaticParams() {
  return todosOsSlugs();
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const peca = await buscarPeca(slug);
  const fontes = await fontesOg();

  // O Next não gera esta rota para slug inexistente, mas o tipo não sabe disso.
  if (!peca) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: OG.linho,
          }}
        />
      ),
      { ...size, fonts: fontes },
    );
  }

  const esgotada = peca.situacao === "esgotada";
  const foto = await fotoParaOg(peca.fotos[0].src);
  const detalhe = [peca.tecido, listar(peca.cores)].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: OG.linho,
          fontFamily: "Karla",
        }}
      >
        {/* A foto em 3:4 à esquerda: 472 de largura para 630 de altura é a
            mesma proporção de peça no cabide usada na arara. */}
        <div style={{ display: "flex", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori, não
              navegador: esta árvore vira PNG durante o build. */}
          <img
            src={foto}
            alt=""
            width={472}
            height={OG_SIZE.height}
            style={{ objectFit: "cover" }}
          />

          {/* Esgotada perde a cor aqui também — mas por um véu de linho, não
              por `filter`.

              Duas lições de uma vez. O Satori não implementa filtros CSS. E ele
              não ignora uma propriedade cujo valor é `undefined`: ele tenta
              processá-la, e o build inteiro morria com "Cannot read properties
              of undefined (reading 'trim')" — nas peças DISPONÍVEIS, que eram
              justamente as que caíam no ramo `undefined` do ternário.

              O véu chega ao mesmo lugar usando só o que ele sabe desenhar. */}
          {esgotada && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 472,
                height: OG_SIZE.height,
                display: "flex",
                background: "rgba(232, 231, 223, 0.5)",
              }}
            />
          )}

          {esgotada && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 270,
                display: "flex",
                justifyContent: "center",
                background: OG.tinta,
                paddingTop: 10,
                paddingBottom: 10,
              }}
            >
              <span
                style={{
                  display: "flex",
                  color: OG.linho,
                  fontFamily: "Fraunces",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 40,
                }}
              >
                {COPY.selo.esgotada}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: 56,
          }}
        >
          <TrilhoOg esquerda={ASSINATURA_OG} direita={AVISO_OG} emCima />

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <RotuloOg cor={OG.musgo}>{peca.categoria}</RotuloOg>

            <div
              style={{
                display: "flex",
                color: esgotada ? OG.sepia : OG.tinta,
                fontFamily: "Fraunces",
                fontWeight: 500,
                fontSize: peca.nome.length > 26 ? 52 : 62,
                letterSpacing: -1.2,
                lineHeight: 1.06,
              }}
            >
              {peca.nome}
            </div>

            <div
              style={{
                display: "flex",
                color: esgotada ? OG.sepia : OG.tinta,
                fontFamily: "Fraunces",
                fontWeight: 600,
                fontSize: 46,
              }}
            >
              {formatarPreco(peca.preco)}
            </div>

            {detalhe && (
              <div
                style={{
                  display: "flex",
                  color: OG.sepia,
                  fontSize: 24,
                  marginTop: 4,
                }}
              >
                {detalhe}
              </div>
            )}
          </div>

          <TrilhoOg
            esquerda={`${COPY.peca.grade} ${peca.tamanhos.join(" · ")}`}
            direita={esgotada ? COPY.acao.esgotada : COPY.acao.disponivel}
          />
        </div>
      </div>
    ),
    { ...size, fonts: fontes },
  );
}
