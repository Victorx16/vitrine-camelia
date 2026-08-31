import { Rotulo } from "@/components/ui/rotulo";
import { AVISO_MODELO, COPY, LOJA } from "@/lib/constants";
import { mensagemLoja } from "@/lib/whatsapp";

/**
 * Rodapé.
 *
 * É a única superfície musgo do site inteiro — o acento aparece em três lugares
 * (marca de novidade, anel de foco e aqui), e é por aparecer pouco que ele
 * manda. Texto linho sobre musgo mede 8,04:1.
 *
 * O aviso de demonstração aparece por extenso aqui, não só encurtado na tarja
 * do topo: quem chegou ao fim da página merece a frase inteira, incluindo a
 * parte que diz que este projeto não conta no placar do estúdio.
 */
export function Rodape() {
  return (
    <footer className="bg-musgo text-linho">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="font-display text-[1.6rem] leading-none font-semibold">
              {LOJA.nome}
            </p>
            <address className="text-[0.9375rem] not-italic opacity-90">
              {LOJA.endereco}
            </address>
            <a
              href={mensagemLoja()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-rotulo decoration-linho/40 hover:decoration-linho inline-flex min-h-11 items-center uppercase underline underline-offset-[6px] transition-colors"
            >
              {COPY.rodape.conversa}
            </a>
          </div>

          <div className="flex flex-col gap-2">
            <Rotulo tom="linho" className="opacity-70">
              {COPY.visite.horario}
            </Rotulo>
            <ul className="flex flex-col gap-1 text-[0.9375rem] opacity-90">
              {LOJA.horario.map((faixa) => (
                <li key={faixa.dias} className="flex gap-3">
                  <span className="min-w-36">{faixa.dias}</span>
                  <span className="tnum">{faixa.horas}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-linho/20 flex flex-col gap-4 border-t pt-8">
          <p className="max-w-[62ch] text-[0.9375rem] leading-relaxed opacity-90">
            {AVISO_MODELO.longo}
          </p>
          <p className="text-rotulo uppercase opacity-70">
            {AVISO_MODELO.creditoLabel}{" "}
            <a
              href={AVISO_MODELO.creditoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="decoration-linho/40 hover:decoration-linho underline underline-offset-4 transition-colors"
            >
              {AVISO_MODELO.credito}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
