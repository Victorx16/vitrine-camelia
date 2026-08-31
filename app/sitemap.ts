import type { MetadataRoute } from "next";
import { LOJA } from "@/lib/constants";
import { pecasVisiveis } from "@/lib/peca";

/**
 * Gerado uma vez, no build. Sem isto o export estático falha: o Next trata rota
 * de metadata como dinâmica por padrão e recusa gerar o site sem servidor.
 */
export const dynamic = "force-static";

/**
 * O sitemap sai das mesmas funções que geram as páginas.
 *
 * Escrever o XML à mão significaria mantê-lo sincronizado à mão, e num catálogo
 * que troca toda semana isso sai de sincronia no primeiro mês. Aqui, publicar
 * uma peça já a coloca no sitemap — e uma peça que venceu sai dele sozinha,
 * porque `pecasVisiveis()` é a mesma fonte que monta o catálogo.
 *
 * As páginas de peça vencida continuam existindo e respondendo 200 (link que
 * circulou no WhatsApp não vira 404), mas não são anunciadas: pedir ao Google
 * que rastreie de novo uma peça que saiu da loja é gastar rastreio à toa.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pecas = await pecasVisiveis();

  // Sem histórico de edição por página, a data do build é a informação honesta
  // disponível — e num site que se refaz todo dia ela é verdadeira.
  const atualizado = new Date();

  return [
    {
      url: LOJA.url,
      lastModified: atualizado,
      // Diária não é exagero aqui: o build agendado roda todo dia e a home
      // muda de verdade quando uma peça entra ou vence.
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${LOJA.url}/pecas`,
      lastModified: atualizado,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${LOJA.url}/visite`,
      lastModified: atualizado,
      // Endereço e horário quase não mudam. Dizer o contrário só gastaria
      // rastreio numa página de seis linhas.
      changeFrequency: "yearly",
      priority: 0.7,
    },
    ...pecas.map((peca) => ({
      url: `${LOJA.url}/pecas/${peca.slug}`,
      lastModified: atualizado,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
