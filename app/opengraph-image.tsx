import { ImageResponse } from "next/og";
import { COPY, LOJA } from "@/lib/constants";
import {
  ASSINATURA_OG,
  AVISO_OG,
  fontesOg,
  fotoParaOg,
  OG,
  OG_SIZE,
  TrilhoOg,
} from "@/lib/og";

export const alt = `${LOJA.nome}, ${LOJA.descritor} em ${LOJA.cidade} — modelo de demonstração`;
export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * A imagem é gerada uma vez, no build, e vira um PNG no disco.
 *
 * Sem esta linha o export estático falha: o Next trata rota de imagem como
 * dinâmica por padrão e recusa gerar o site sem servidor. Como o conteúdo aqui
 * não depende de requisição nenhuma, declarar `force-static` é a verdade.
 */
export const dynamic = "force-static";

/**
 * O cartão da home é a capa em miniatura: a mesma frase, a mesma arara, os
 * mesmos trilhos. Quem clica no link já chega tendo visto a página.
 */
export default async function Image() {
  const [fontes, foto] = await Promise.all([
    fontesOg(),
    fotoParaOg("/pecas/loja-arara.webp"),
  ]);

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: 64,
          }}
        >
          <TrilhoOg esquerda={ASSINATURA_OG} direita={AVISO_OG} emCima />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: OG.tinta,
              fontFamily: "Fraunces",
              fontWeight: 600,
              fontSize: 76,
              letterSpacing: -1.8,
              lineHeight: 1.02,
              maxWidth: 620,
            }}
          >
            {COPY.capa.titulo}
          </div>

          <TrilhoOg esquerda={COPY.capa.rotulo} direita={LOJA.regiao} />
        </div>

        {/* A arara ocupa a direita em 3:4, a mesma proporção de toda foto do
            site. eslint-disable porque isto não roda num navegador: o Satori
            transforma esta árvore em PNG durante o build e não conhece
            next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto}
          alt=""
          width={472}
          height={OG_SIZE.height}
          style={{ objectFit: "cover" }}
        />
      </div>
    ),
    { ...size, fonts: fontes },
  );
}
