import type { Metadata } from "next";
import { Foto } from "@/components/peca/foto";
import { Revela } from "@/components/ui/revela";
import { Rotulo } from "@/components/ui/rotulo";
import { COPY, LOJA } from "@/lib/constants";
import { mensagemLoja } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: `Visite a loja — ${LOJA.nome}`,
  description: COPY.visite.subtitulo,
  alternates: { canonical: "/visite" },
};

/**
 * A página da loja.
 *
 * Curta de propósito. Ela responde três coisas — onde fica, quando abre e como
 * falar — e não tenta ser sobre-a-marca. Boutique de bairro não precisa contar
 * a própria história para vender uma blusa; precisa dizer se está aberta agora.
 *
 * Não há mapa incorporado. Um iframe do Google Maps é um terceiro carregando
 * script e cookie numa página que hoje não carrega nenhum, e furaria a CSP para
 * entregar o que uma linha de endereço já entrega.
 */
export default function Visite() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-20">
        <Revela className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Rotulo tom="musgo">{COPY.visite.rotulo}</Rotulo>
            <h1 className="text-headline font-display max-w-[16ch]">
              {COPY.visite.titulo}
            </h1>
            <p className="text-sepia max-w-[50ch] leading-relaxed text-pretty">
              {COPY.visite.subtitulo}
            </p>
          </div>

          <div className="border-fio flex flex-col gap-6 border-t pt-8">
            <div className="flex flex-col gap-1">
              <Rotulo>{COPY.visite.endereco}</Rotulo>
              <address className="text-[1.0625rem] not-italic">
                {LOJA.endereco}
              </address>
            </div>

            <div className="flex flex-col gap-2">
              <Rotulo>{COPY.visite.horario}</Rotulo>
              <ul className="flex flex-col gap-1">
                {LOJA.horario.map((faixa) => (
                  <li key={faixa.dias} className="flex gap-4 text-[0.9375rem]">
                    <span className="min-w-36">{faixa.dias}</span>
                    <span className="tnum text-sepia">{faixa.horas}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href={mensagemLoja()}
            target="_blank"
            rel="noopener noreferrer"
            className="border-tinta bg-tinta text-linho hover:border-musgo hover:bg-musgo inline-flex min-h-11 w-fit items-center border px-6 py-3 text-[0.9375rem] font-semibold transition-colors"
          >
            {COPY.rodape.conversa}
          </a>
        </Revela>

        <div className="bg-papel aspect-4/5 overflow-hidden">
          <Foto
            src="/pecas/loja-interior.webp"
            alt={`Interior da ${LOJA.nome}: arara com casacos claros, banqueta de madeira e luz de janela.`}
            width={900}
            height={1200}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
