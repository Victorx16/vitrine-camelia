import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import { PECAS } from "../content/pecas.ts";

/**
 * Acrescenta às peças da Sanity as fotos que existem no catálogo local e ainda
 * não estão lá.
 *
 * **Por que não usar o importador.** `importar-catalogo.mts` faz
 * `createOrReplace`: ele reescreve o documento inteiro e desfaz qualquer edição
 * feita no painel. É script de carga inicial, e usar carga inicial para
 * acrescentar uma foto seria trocar o conteúdo de uma loja por causa de uma
 * imagem.
 *
 * Este aqui só empurra fotos novas para o fim da lista. Preço, nome, grade e
 * tudo o que ela tiver mexido no painel ficam intactos.
 *
 * Roda duas vezes sem estragar nada: a comparação é pelo nome do arquivo, e
 * foto que já está lá é pulada.
 *
 *     pnpm fotos          # ensaio: não escreve nada
 *     pnpm fotos --sim    # escreve de verdade
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
  useCdn: false,
});

interface FotoCrua {
  _key?: string;
  alt?: string;
  asset?: { _ref?: string };
}

async function acrescentar() {
  console.log(
    `\n  Projeto ${PROJETO} / ${CONJUNTO}` +
      (VALENDO ? "  — VALENDO\n" : "  — ensaio, nada será escrito\n"),
  );

  let novas = 0;
  let intactas = 0;

  for (const peca of PECAS) {
    const id = `peca-${peca.slug}`;
    const doc = await cliente.fetch<{ fotos?: FotoCrua[] } | null>(
      `*[_id == $id][0]{ fotos }`,
      { id },
    );

    if (!doc) {
      console.log(`  ${peca.slug}: não existe na Sanity — pulado`);
      continue;
    }

    // A comparação é pelo nome do arquivo original do asset, porque é o único
    // dado que sobrevive à viagem: o caminho local não vai junto.
    const jaLa = new Set(
      (doc.fotos ?? [])
        .map((f) => f.asset?._ref?.match(/^image-([0-9a-f]+)-/)?.[1])
        .filter(Boolean) as string[],
    );

    const faltando = [];
    for (const [i, foto] of peca.fotos.entries()) {
      const nome = foto.src.split("/").pop()!;
      const bytes = await readFile(join(process.cwd(), "public", foto.src));

      if (VALENDO) {
        const asset = await cliente.assets.upload("image", bytes, { filename: nome });
        // O hash do conteúdo é o que a Sanity usa como identidade do arquivo:
        // subir a mesma imagem duas vezes devolve o mesmo asset. É por isso que
        // dá para comparar depois de subir sem criar duplicata.
        const hash = asset._id.match(/^image-([0-9a-f]+)-/)?.[1];
        if (hash && jaLa.has(hash)) continue;
        faltando.push({
          _type: "image",
          _key: `${peca.slug}-${i}`,
          asset: { _type: "reference", _ref: asset._id },
          ...(foto.alt ? { alt: foto.alt } : {}),
        });
      } else if ((doc.fotos ?? []).length <= i) {
        faltando.push({ nome, alt: foto.alt });
      }
    }

    if (faltando.length === 0) {
      intactas++;
      continue;
    }

    console.log(`  ${peca.slug}: +${faltando.length} foto(s)`);
    for (const f of faltando) {
      console.log(`      ${"nome" in f ? f.nome : (f as { _key: string })._key}`);
    }

    if (VALENDO) {
      await cliente
        .patch(id)
        .setIfMissing({ fotos: [] })
        .insert("after", "fotos[-1]", faltando)
        .commit();
    }
    novas += faltando.length;
  }

  console.log(
    `\n  ${novas} foto(s) ${VALENDO ? "acrescentadas" : "seriam acrescentadas"}, ` +
      `${intactas} peça(s) já em dia.` +
      (VALENDO ? "\n" : "\n  Rode de novo com --sim para valer.\n"),
  );
}

acrescentar().catch((erro) => {
  console.error("\n  Parou:", erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
