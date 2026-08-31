import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { PECAS } from "../content/pecas.ts";

/**
 * Sobe o catálogo de demonstração para a Sanity — fotos e fichas.
 *
 * Existe por um motivo concreto: no instante em que o site é ligado ao painel,
 * o catálogo local para de ser usado. Sem este script, ligar a Sanity deixaria
 * a demonstração vazia até alguém digitar dezoito peças à mão, uma por uma, com
 * as fotos.
 *
 * Rode primeiro sem `--sim` para ver o que ele faria, e só depois com.
 *
 *     pnpm importar          # ensaio: não escreve nada
 *     pnpm importar --sim    # escreve de verdade
 *
 * Precisa de um token de escrita em SANITY_WRITE_TOKEN (ver README).
 */

const PROJETO = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const CONJUNTO = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const VALENDO = process.argv.includes("--sim");

function abortar(mensagem: string): never {
  console.error(`\n  ${mensagem}\n`);
  process.exit(1);
}

if (!PROJETO) abortar("Falta NEXT_PUBLIC_SANITY_PROJECT_ID. Ele vive em .env.local.");

// O token só é exigido para valer. O ensaio não escreve nada, e ter que criar
// uma credencial só para ver o que o script FARIA é a ordem errada das coisas.
if (VALENDO && !TOKEN) {
  abortar(
    "Falta SANITY_WRITE_TOKEN.\n" +
      "  Crie um token com permissão de Editor em sanity.io/manage > API > Tokens\n" +
      "  e coloque em .env.local. Não cole o token em conversa nenhuma.",
  );
}

const cliente = createClient({
  projectId: PROJETO,
  dataset: CONJUNTO,
  apiVersion: "2024-10-01",
  token: TOKEN,
  // Escrita nunca passa pelo CDN: ele serve cópia, e aqui o que interessa é o
  // original.
  useCdn: false,
});

/**
 * Cada foto sobe uma vez só.
 *
 * Três peças compartilham arquivo com outra (a segunda foto de uma peça é a
 * mesma cena), e sem esta memória o script subiria o mesmo arquivo duas vezes —
 * gerando dois assets idênticos que ninguém consegue distinguir depois.
 */
const enviadas = new Map<string, string>();

async function subirFoto(src: string): Promise<string> {
  const jaTem = enviadas.get(src);
  if (jaTem) return jaTem;

  const caminho = join(process.cwd(), "public", src);
  const bytes = await readFile(caminho);
  const nome = src.split("/").pop()!;

  const asset = await cliente.assets.upload("image", bytes, { filename: nome });
  enviadas.set(src, asset._id);
  console.log(`    foto  ${nome}  ->  ${asset._id}`);
  return asset._id;
}

async function importar() {
  console.log(
    `\n  Projeto ${PROJETO} / ${CONJUNTO}` +
      (VALENDO ? "  — VALENDO\n" : "  — ensaio, nada será escrito\n"),
  );

  if (!VALENDO) {
    for (const peca of PECAS) {
      console.log(`    ${peca.slug}  (${peca.fotos.length} foto(s))`);
    }
    console.log(
      `\n  ${PECAS.length} peças seriam criadas ou substituídas.` +
        "\n  Rode de novo com --sim para valer.\n",
    );
    return;
  }

  /**
   * O `_id` é derivado do slug, e isso é deliberado.
   *
   * Com id derivado, rodar o script duas vezes atualiza as mesmas dezoito
   * peças. Com id sorteado pela Sanity, a segunda execução criaria trinta e
   * seis — e descobrir isso depois de a dona já ter cadastrado coisa nova é
   * caro.
   *
   * O outro lado da moeda, e é sério: **isto sobrescreve.** Se ela já tiver
   * editado o preço da "Camisa de linho gola padre" pelo painel, rodar o script
   * de novo devolve o preço original. É script de carga inicial, não de
   * sincronização.
   */
  let n = 0;
  for (const peca of PECAS) {
    console.log(`  ${peca.slug}`);

    const fotos = [];
    for (const [i, foto] of peca.fotos.entries()) {
      const assetId = await subirFoto(foto.src);
      fotos.push({
        _type: "image",
        // A chave precisa ser estável entre execuções, senão o painel enxerga
        // as fotos como itens novos a cada carga.
        _key: `${peca.slug}-${i}`,
        asset: { _type: "reference", _ref: assetId },
        ...(foto.alt ? { alt: foto.alt } : {}),
      });
    }

    await cliente.createOrReplace({
      _id: `peca-${peca.slug}`,
      _type: "peca",
      nome: peca.nome,
      slug: { _type: "slug", current: peca.slug },
      fotos,
      preco: peca.preco,
      categoria: peca.categoria,
      tamanhos: peca.tamanhos,
      cores: peca.cores,
      situacao: peca.situacao,
      destaque: peca.destaque,
      dataEntrada: peca.dataEntrada,
      ...(peca.tecido ? { tecido: peca.tecido } : {}),
      ...(peca.medidas ? { medidas: peca.medidas } : {}),
      ...(peca.descricao ? { descricao: peca.descricao } : {}),
    });

    n++;
  }

  console.log(
    `\n  ${n} peças no ar, ${enviadas.size} fotos enviadas.` +
      "\n  Abra o painel para conferir, e rode `pnpm build` para ver o site lendo da Sanity.\n",
  );
}

importar().catch((erro) => {
  console.error("\n  A importação parou:", erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
