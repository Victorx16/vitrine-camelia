import type { MetadataRoute } from "next";
import { LOJA } from "@/lib/constants";

export const dynamic = "force-static";

/**
 * Tudo liberado, e o sitemap apontado.
 *
 * Uma vitrine não tem o que esconder de buscador: cada peça é uma página que
 * existe para ser encontrada. O valor deste arquivo está na última linha — é
 * por ela que o Google descobre o sitemap sem depender de alguém cadastrá-lo no
 * Search Console.
 *
 * Sobre indexar um modelo de loja fictícia: a decisão foi indexar, e ela está
 * explicada em lib/constants.ts, ao lado da chave que a inverte. O resumo é que
 * a estrutura de SEO é parte do que este modelo demonstra, e um site com
 * `noindex` não demonstra nada — enquanto o aviso de demonstração aparece no
 * cabeçalho, no rodapé, na descrição e na própria imagem de compartilhamento.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${LOJA.url}/sitemap.xml`,
  };
}
