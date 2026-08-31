import Image from "next/image";

/**
 * Toda foto do site passa por aqui.
 *
 * O site tem duas origens de imagem ao mesmo tempo, e elas querem tratamentos
 * opostos:
 *
 * · **CDN da Sanity** — redimensiona por parâmetro de URL. Aqui o `loader` de
 *   lib/sanity/loader.ts trabalha, e o next/image monta um srcset de verdade
 *   com uma largura para cada tamanho de tela.
 *
 * · **Arquivo local em /public/pecas** — já saiu do build em 900×1200 e WebP.
 *   Não existe versão maior nem menor para pedir.
 *
 * Sem esta distinção o next/image gerava, para as fotos locais, um srcset com
 * dez larguras apontando todas para o mesmo arquivo — e avisava, com razão, que
 * o loader não implementa `width`. `unoptimized` diz a verdade: esta imagem tem
 * um tamanho só.
 *
 * A troca é automática. No dia em que o catálogo vier da Sanity, as fotos
 * passam a ter srcset sem ninguém tocar em componente nenhum.
 */

type FotoProps = Omit<React.ComponentProps<typeof Image>, "unoptimized">;

/**
 * `alt` é desestruturado em vez de vir no espalhamento, e não é preciosismo: o
 * lint de acessibilidade não enxerga através de `{...resto}` e passaria a
 * avisar em toda imagem do site. Aqui a obrigação fica escrita.
 */
export function Foto({ src, alt, ...resto }: FotoProps) {
  const naSanity =
    typeof src === "string" && src.startsWith("https://cdn.sanity.io/");

  return <Image src={src} alt={alt} unoptimized={!naSanity} {...resto} />;
}
