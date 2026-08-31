/**
 * O `loader` do next/image.
 *
 * Num site exportado não existe o otimizador do Next — ele é um serviço de
 * servidor. Antes daqui, o projeto usava `images: { unoptimized: true }`, o que
 * quer dizer: uma imagem só, do mesmo tamanho para todo mundo, do celular de
 * entrada ao monitor grande.
 *
 * Este arquivo devolve o `srcset` de verdade sem servidor nenhum: quem
 * redimensiona é o CDN da Sanity, por parâmetro de URL, e o navegador escolhe a
 * largura que precisa. Numa página com vinte fotos, é a diferença entre 1,4 MB
 * e uns 300 KB no celular.
 *
 * Ele roda no navegador. Sem dependência, sem import, sem `process.env` —
 * qualquer uma das três o transformaria em JavaScript embarcado em toda página.
 */

interface Parametros {
  src: string;
  width: number;
  quality?: number;
}

export default function loader({ src, width, quality }: Parametros) {
  // Foto local (o catálogo de demonstração em /public/pecas). Não há nada para
  // redimensionar: os arquivos já saíram em 900×1200 e WebP. Devolver o caminho
  // intocado é o que mantém o site funcionando antes de a Sanity existir.
  if (!src.startsWith("https://cdn.sanity.io/")) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  // A altura acompanha para segurar o 3:4 em toda largura do srcset. Sem ela, o
  // CDN devolveria a proporção original e o `object-cover` recortaria por
  // conta própria — decepando a barra de um vestido no celular e não no
  // desktop, que é o tipo de defeito que ninguém reproduz.
  url.searchParams.set("h", String(Math.round((width * 4) / 3)));
  url.searchParams.set("fit", "crop");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", String(quality ?? 78));

  return url.toString();
}
