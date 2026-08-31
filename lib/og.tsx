import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LOJA } from "@/lib/constants";

/**
 * Peças comuns das imagens de compartilhamento.
 *
 * Duas rotas geram PNG pelo Satori: a da home e a de cada peça. Sem um dono
 * comum, a paleta e o filete estariam escritos à mão nas duas e livres para
 * divergir no dia em que a cor mudasse.
 *
 * O Satori não roda o Tailwind, então os valores abaixo são cópias dos tokens
 * de app/globals.css e precisam ser trocados junto com eles.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG = {
  linho: "#e8e7df",
  papel: "#f1f0ea",
  tinta: "#16150f",
  musgo: "#3a4634",
  sepia: "#5c5a4f",
  fio: "#c9c6b6",
} as const;

/**
 * As fontes precisam ser entregues como bytes.
 *
 * O Satori roda no build, fora do navegador, e não enxerga o que o next/font
 * carrega: sem isto ele cai numa sans genérica do sistema e o cartão que abre
 * no WhatsApp deixa de parecer com o site. Os arquivos ficam em `assets/`, não
 * em `public/`, porque são insumo de build e nenhum visitante os baixa.
 *
 * TTF: o Satori não lê WOFF2 (Brotli) e engasgou também com WOFF. São os
 * subconjuntos `latin` — o português inteiro cabe abaixo de U+00FF.
 */
async function ler(arquivo: string) {
  return readFile(join(process.cwd(), "assets", "fonts", arquivo));
}

export async function fontesOg() {
  const [display, displayForte, displayItalico, texto, textoForte] =
    await Promise.all([
      ler("Fraunces-Medium.ttf"),
      ler("Fraunces-SemiBold.ttf"),
      ler("Fraunces-Italic.ttf"),
      ler("Karla-Regular.ttf"),
      ler("Karla-SemiBold.ttf"),
    ]);

  return [
    { name: "Fraunces", data: display, weight: 500 as const, style: "normal" as const },
    { name: "Fraunces", data: displayForte, weight: 600 as const, style: "normal" as const },
    { name: "Fraunces", data: displayItalico, weight: 500 as const, style: "italic" as const },
    { name: "Karla", data: texto, weight: 400 as const, style: "normal" as const },
    { name: "Karla", data: textoForte, weight: 600 as const, style: "normal" as const },
  ];
}

/**
 * A foto do cartão, sempre em JPEG.
 *
 * **O Satori não decodifica WebP.** Ele falha sem mensagem útil — o build morre
 * com "u2 is not iterable", que é ele tentando desestruturar o resultado vazio
 * do decodificador. Como o site inteiro serve WebP, este é o único lugar em que
 * o formato precisa ser outro.
 *
 * Por isso existe `assets/og/`: uma cópia em JPEG e em tamanho de cartão de
 * cada foto. Fica em `assets/` e não em `public/` porque é insumo de build —
 * nenhum visitante baixa esses arquivos, eles só entram nos PNGs gerados.
 * Regenerar é trabalho manual, e é o preço de o Satori não ler WebP.
 *
 * Vindo da Sanity, o CDN resolve na URL: `fm=jpg` força o formato e o recorte
 * já sai no tamanho certo, sem cópia local nenhuma. É mais um ponto em que o
 * CDN paga o próprio aluguel.
 */
export async function fotoParaOg(src: string) {
  if (src.startsWith("http")) {
    const url = new URL(src);
    url.searchParams.set("fm", "jpg");
    url.searchParams.set("w", "480");
    url.searchParams.set("h", "640");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }

  const nome = src.split("/").pop()!.replace(/\.\w+$/, ".jpg");
  const bytes = await readFile(join(process.cwd(), "assets", "og", nome));

  return `data:image/jpeg;base64,${bytes.toString("base64")}`;
}

/** Rótulo de etiqueta: Karla em caixa alta, entreletra aberta. */
export function RotuloOg({
  children,
  cor = OG.sepia,
}: {
  children: string;
  cor?: string;
}) {
  return (
    <span
      style={{
        display: "flex",
        color: cor,
        fontFamily: "Karla",
        fontWeight: 600,
        fontSize: 16,
        letterSpacing: 2.6,
        textTransform: "uppercase",
        // Sem isto os dois rótulos quebravam em duas linhas no cartão da peça,
        // onde a foto come 472px de largura — e o filete, que deveria correr
        // entre eles, ficava pendurado no meio do texto.
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/**
 * O trilho: rótulo à esquerda, rótulo à direita, filete entre os dois.
 *
 * É o mesmo gesto que organiza a home — o conteúdo pendura de um fio de 1px em
 * vez de morar dentro de um cartão. Quem abre o link no WhatsApp já viu a
 * página antes de chegar nela.
 */
export function TrilhoOg({
  esquerda,
  direita,
  emCima = false,
}: {
  esquerda: string;
  direita: string;
  emCima?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        ...(emCima
          ? { borderBottom: `1px solid ${OG.fio}`, paddingBottom: 20 }
          : { borderTop: `1px solid ${OG.fio}`, paddingTop: 20 }),
      }}
    >
      <RotuloOg>{esquerda}</RotuloOg>
      <div style={{ display: "flex", flex: 1, height: 1, background: OG.fio }} />
      <RotuloOg>{direita}</RotuloOg>
    </div>
  );
}

/**
 * O carimbo de demonstração aparece no cartão de compartilhamento também.
 *
 * É onde ele mais importa: o link circula solto no WhatsApp, longe da tarja do
 * topo do site, e a imagem costuma ser tudo o que a pessoa vê antes de decidir
 * se abre. Um cartão de loja fictícia sem aviso seria a única superfície do
 * projeto em que ele estaria faltando.
 *
 * É a forma curta: o cartão não tem largura para "modelo de demonstração — loja
 * fictícia" ao lado do nome da loja. A frase inteira continua no cabeçalho, no
 * rodapé e na descrição que vira o resumo na busca.
 */
export const AVISO_OG = "Modelo de demonstração";
export const ASSINATURA_OG = `${LOJA.nome} · ${LOJA.cidade}`;
