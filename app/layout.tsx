import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import { Cabecalho } from "@/components/layout/cabecalho";
import { Rodape } from "@/components/layout/rodape";
import { Cloudflare } from "@/components/medicao/cloudflare";
import { ObservadorRevela } from "@/components/ui/observador-revela";
import { AVISO_MODELO, INDEXAR, LOJA } from "@/lib/constants";
import "./globals.css";

/**
 * As duas fontes são servidas pelo próprio domínio via next/font: o CSS entra
 * embutido no HTML e o navegador sai buscando os arquivos no primeiro instante,
 * na mesma conexão. Nenhuma requisição a terceiro bloqueando a renderização.
 *
 * Duas economias deliberadas, na linha do que o site do estúdio já faz:
 *
 * `latin` só. O português inteiro vive abaixo de U+00FF — á, ã, ç, é, ô e õ
 * estão todos lá. `latin-ext` seria pagar por glifos que nenhuma página serve.
 *
 * Da Fraunces, só o eixo SOFT. Ela tem três eixos variáveis (opsz, SOFT, WONK);
 * WONK é o que entorta a perna do g e do y, ficou em zero na direção de arte e
 * por isso não é pedido — eixo declarado engorda o arquivo mesmo sem ninguém
 * acionar.
 */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT"],
  style: ["normal", "italic"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

const title = `${LOJA.nome}, ${LOJA.descritor} em ${LOJA.cidade}`;
/**
 * A descrição é o que vira o resumo na página de resultados do Google, e por
 * isso ela carrega o aviso de demonstração — não o título. O título é o que o
 * modelo precisa demonstrar; o resumo é onde a honestidade cabe sem estragar a
 * demonstração.
 */
const description =
  "Modelo de demonstração da Code VX. Vitrine de uma boutique de bairro: o que entrou na arara essa semana, com preço, grade e cor. A conversa começa no WhatsApp, com a peça já escrita na mensagem.";

export const metadata: Metadata = {
  metadataBase: new URL(LOJA.url),
  title,
  description,
  alternates: { canonical: "/" },
  // Vale para o site inteiro. A decisão e o porquê estão em lib/constants.ts.
  robots: INDEXAR ? undefined : { index: false, follow: true },
  openGraph: {
    title,
    description,
    siteName: LOJA.nome,
    locale: "pt_BR",
    type: "website",
  },
  /**
   * Sem dados estruturados de LocalBusiness, de propósito.
   *
   * A Camélia não existe: declarar endereço, telefone e horário para o Google
   * seria plantar um negócio falso no índice dele. O site é honesto com o
   * visitante na tarja do topo, e tem que ser honesto com o buscador também.
   */
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${karla.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* Primeira parada do Tab, invisível até receber foco. */}
        <a
          href="#conteudo"
          className="bg-tinta text-linho sr-only px-4 py-2 text-sm font-semibold focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50"
        >
          Pular para o conteúdo
        </a>

        <Cabecalho />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Rodape />

        <ObservadorRevela />
        <Cloudflare />

        {/* O aviso também vive fora da tarja visual, para o leitor de tela
            encontrá-lo mesmo que a tarja seja rolada para fora da tela. */}
        <p className="sr-only">{AVISO_MODELO.longo}</p>
      </body>
    </html>
  );
}
