import { createClient } from "@sanity/client";
import { PECAS } from "@/content/pecas";
import { urlDaFoto } from "@/lib/sanity/imagem";
import type { Peca } from "@/lib/tipos";

/**
 * De onde vem o catálogo.
 *
 * Uma função, dois caminhos:
 *
 *   com NEXT_PUBLIC_SANITY_PROJECT_ID  → busca na Sanity, em tempo de build
 *   sem ela                            → usa content/pecas.ts, o catálogo local
 *
 * O caminho local não é gambiarra de transição: é o que permite trabalhar no
 * layout sem rede, sem conta e sem esperar resposta de ninguém, e é o que faz
 * `pnpm build` funcionar na máquina de quem clonar o repositório amanhã. A
 * demonstração do portfólio roda por ele.
 *
 * A busca acontece SÓ NO BUILD. O site exportado não fala com a Sanity: quem
 * fala é o processo que gera o HTML. Depois de publicado não existe requisição,
 * chave nem latência de API entre a visitante e a foto do vestido.
 */

const PROJETO = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const CONJUNTO = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const cliente =
  PROJETO !== undefined && PROJETO !== ""
    ? createClient({
        projectId: PROJETO,
        dataset: CONJUNTO,
        // Data da versão da API, fixada de propósito: sem ela a Sanity usa a
        // mais recente, e uma mudança do lado deles quebraria um build que
        // ninguém tocou.
        apiVersion: "2024-10-01",
        // Sem CDN, de propósito.
        //
        // O CDN serve cópia, e cópia é justamente o que não serve aqui: este
        // build costuma ser disparado pelo webhook no segundo seguinte à
        // publicação de uma peça, e a resposta guardada pelo CDN ainda é a de
        // antes dela. O custo é uma requisição por build — não vinte, não uma
        // por visitante. Quem filtra rascunho é a consulta, não o CDN.
        useCdn: false,
      })
    : null;

/**
 * A consulta.
 *
 * Ela pede exatamente os campos que lib/tipos.ts declara, e nada mais — trazer
 * o documento inteiro faria o build carregar rascunho, histórico e metadado que
 * nenhuma página usa.
 *
 * `!(_id in path("drafts.**"))` corta os rascunhos. Sem isso, uma peça que ela
 * começou a cadastrar e não publicou apareceria na vitrine sem preço.
 */
const CONSULTA = `*[_type == "peca" && !(_id in path("drafts.**"))]{
  "slug": slug.current,
  nome,
  preco,
  categoria,
  tamanhos,
  cores,
  outraCor,
  tecido,
  medidas,
  descricao,
  situacao,
  destaque,
  "dataEntrada": dataEntrada,
  "fotos": fotos[]{ alt, asset }
}`;

/** O que a consulta devolve, antes de virar `Peca`. */
interface PecaCrua extends Omit<Peca, "fotos" | "destaque"> {
  destaque: boolean | null;
  /**
   * O escape da lista fechada de cores, e ele NÃO existe em `Peca`.
   *
   * Do lado do site, cor é uma lista só. Que uma delas tenha vindo de uma
   * caixa de texto e as outras de caixas de seleção é assunto do formulário,
   * não da vitrine — e vazar essa distinção para `Peca` obrigaria as cinco
   * telas que mostram cor a lembrar dela. Some aqui, em `paraPeca`.
   */
  outraCor: string | null;
  fotos: { alt?: string; asset: { _ref: string } }[];
}

function paraPeca({ outraCor, ...crua }: PecaCrua): Peca {
  const escrita = outraCor?.trim();

  return {
    ...crua,
    // `destaque` é booleano opcional no painel: uma peça cadastrada sem tocar
    // no campo chega como null, e null não é false para o filtro da vitrine.
    destaque: crua.destaque === true,
    // A cor escrita à mão entra por último: quando ela marcou "preto" e ainda
    // escreveu "com detalhe dourado", a ordem em que ela preencheu é a ordem
    // em que se lê.
    cores: escrita ? [...crua.cores, escrita] : crua.cores,
    fotos: crua.fotos.map((foto) => ({
      src: urlDaFoto(foto),
      alt: foto.alt,
    })),
  };
}

/**
 * Memória de processo.
 *
 * O Next gera as páginas em vários processos paralelos, e dentro de cada um
 * este módulo é carregado uma vez só. Sem o cache, cada uma das vinte páginas
 * de peça faria a própria requisição para a Sanity — vinte respostas idênticas
 * e um build lento por nada.
 */
let cache: Promise<Peca[]> | null = null;

async function buscar(): Promise<Peca[]> {
  if (!cliente) return PECAS;

  try {
    /**
     * O prazo de um segundo é a correção de um defeito observado.
     *
     * O Next guarda em disco, em `.next/cache/fetch-cache`, a resposta de todo
     * `fetch` do build, e a Netlify preserva essa pasta de um build para o
     * outro. Sem prazo declarado ele guarda por UM ANO. Foi o que aconteceu
     * aqui: a resposta vazia de antes da importação ficou gravada, e os builds
     * seguintes leram o disco em vez da Sanity — o site saía com o catálogo
     * local e a peça publicada não aparecia.
     *
     * O sintoma numa loja de verdade é o pior que este projeto pode ter: ela
     * publica a peça, o site é reconstruído, a peça não aparece, e não há erro
     * nenhum no log para explicar.
     *
     * `cache: "no-store"` seria o instinto, e está errado: ele marca a rota
     * como dinâmica, e rota dinâmica é proibida em `output: "export"` — o
     * build inteiro para. Um segundo de prazo é a diferença: dentro de um
     * build, as onze rotas que pedem o catálogo aproveitam a mesma resposta;
     * entre um build e outro, nunca sobra nada.
     *
     * As fotos continuam guardadas por um ano, e devem: a URL do CDN carrega o
     * hash do arquivo, então foto trocada é URL trocada.
     */
    const cruas = await cliente.fetch<PecaCrua[]>(CONSULTA, {}, { next: { revalidate: 1 } });
    // Conjunto vazio quase sempre significa configuração errada (projeto novo,
    // dataset trocado, peça nenhuma publicada) e não "a loja está sem peças".
    // Publicar uma vitrine vazia sem avisar seria o pior desfecho possível.
    if (cruas.length === 0) {
      throw new Error("a Sanity respondeu, mas não havia nenhuma peça publicada");
    }
    return cruas.map(paraPeca);
  } catch (erro) {
    /**
     * O build NÃO PODE parar aqui.
     *
     * Se a Sanity estiver fora do ar às cinco da manhã, quando o build agendado
     * roda, a alternativa a este catch é o site sair do ar inteiro por causa de
     * um vencimento de data. Cair para o catálogo local mantém a loja no ar com
     * conteúdo velho, que é infinitamente melhor do que um 404.
     *
     * O aviso é gritado no log do build de propósito: conteúdo velho servido em
     * silêncio é o mesmo tipo de defeito que a Cloudflare barrada na CSP.
     */
    console.error(
      "\n[catálogo] A busca na Sanity falhou. O site será gerado com o catálogo LOCAL, e o conteúdo publicado no painel NÃO vai aparecer.\n",
      erro,
    );
    return PECAS;
  }
}

export function buscarPecas(): Promise<Peca[]> {
  cache ??= buscar();
  return cache;
}
