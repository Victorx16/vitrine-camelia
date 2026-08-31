// A exportação padrão do pacote está marcada como obsoleta desde a v2; a
// nomeada é a que continua.
import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

/**
 * Monta o endereço da foto no CDN da Sanity.
 *
 * É este arquivo que justifica a escolha da Sanity sobre um CMS baseado em git.
 * A dona sobe a foto de 4 MB do celular e nada é convertido no build: o CDN
 * entrega a versão redimensionada e em WebP na hora, por parâmetro de URL. Sem
 * servidor, sem etapa de processamento, sem o otimizador do Next — que não
 * existe num site exportado.
 *
 * O ponto de interesse (hotspot) marcado no painel entra no recorte: numa foto
 * na horizontal, é ele que decide se sobra peça ou sobra parede.
 */

const PROJETO = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const CONJUNTO = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/*
 * O prefixo "https://cdn.sanity.io/" também aparece, escrito à mão, em
 * loader.ts. A duplicação é deliberada: o loader roda no NAVEGADOR, e importar
 * uma constante daqui arrastaria o @sanity/image-url inteiro para o pacote que
 * toda visitante baixa. Duas linhas repetidas custam menos que isso.
 */

const construtor =
  PROJETO !== undefined && PROJETO !== ""
    ? createImageUrlBuilder({ projectId: PROJETO, dataset: CONJUNTO })
    : null;

/**
 * A base, em 3:4 e recortada no ponto de interesse.
 *
 * A largura aqui é só o padrão para quem não passar por um `loader` — o
 * `loader` do next/image reescreve `w` e `h` a cada largura do srcset,
 * mantendo a mesma proporção.
 */
export function urlDaFoto(fonte: SanityImageSource) {
  if (!construtor) {
    throw new Error(
      "urlDaFoto foi chamada sem NEXT_PUBLIC_SANITY_PROJECT_ID. O build deveria ter caído no catálogo local antes de chegar aqui.",
    );
  }

  return construtor
    .image(fonte)
    .width(1200)
    .height(1600)
    .fit("crop")
    .auto("format")
    .quality(78)
    .url();
}
