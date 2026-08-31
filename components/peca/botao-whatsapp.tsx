import { COPY } from "@/lib/constants";
import type { Peca } from "@/lib/tipos";
import { cn } from "@/lib/utils";
import { mensagemPeca } from "@/lib/whatsapp";

interface BotaoWhatsAppProps {
  peca: Peca;
  className?: string;
  /**
   * `botao` na página da peça, onde é a ação principal e ocupa a largura toda.
   * `texto` na arara, onde dezoito botões cheios virariam um marketplace e
   * matariam a direção — ali a ação é uma linha discreta abaixo da grade, mas
   * continua sendo um alvo de toque de 44px.
   */
  variante?: "botao" | "texto";
}

/**
 * O único mecanismo de conversão do site.
 *
 * Duas decisões de propósito:
 *
 * 1. Não usa o verde do WhatsApp. O botão é tinta sobre linho, como todo botão
 *    do site. Verde de aplicativo dentro de uma paleta de linho e musgo é a
 *    marca de terceiro passando na frente da marca da loja — e ninguém precisa
 *    da cor para saber o que abre: o texto diz, e o rótulo acessível repete.
 *
 * 2. O peso muda com o estado. Peça disponível recebe o botão cheio; peça
 *    esgotada recebe o vazado, porque "quero uma parecida" é conversa mais fria
 *    e não deve competir com a peça ao lado que ainda existe.
 */
export function BotaoWhatsApp({
  peca,
  className,
  variante = "botao",
}: BotaoWhatsAppProps) {
  const esgotada = peca.situacao === "esgotada";
  const rotulo = esgotada ? COPY.acao.esgotada : COPY.acao.disponivel;

  return (
    <a
      href={mensagemPeca(peca)}
      target="_blank"
      rel="noopener noreferrer"
      // O nome da peça entra no rótulo acessível porque, numa arara com doze
      // ações iguais, "Falar sobre esta peça" sozinho não diz qual é a peça.
      aria-label={`${rotulo}: ${peca.nome}. Abre o WhatsApp da loja.`}
      className={cn(
        "font-sans font-semibold transition-colors duration-200",
        variante === "botao" && [
          // 44px de altura mínima: é alvo de toque, e é o alvo principal da
          // página inteira.
          "inline-flex min-h-11 w-full items-center justify-center border px-6 py-3 text-[0.9375rem]",
          esgotada
            ? "border-tinta text-tinta hover:bg-tinta hover:text-linho"
            : "border-tinta bg-tinta text-linho hover:border-musgo hover:bg-musgo",
        ],
        variante === "texto" && [
          // Alvo de toque mantido mesmo com aparência de link: a altura vem do
          // `min-h-11`, não do tamanho da letra.
          "text-rotulo inline-flex min-h-11 items-center uppercase",
          "decoration-fio underline underline-offset-[6px]",
          esgotada
            ? "text-sepia hover:text-tinta hover:decoration-tinta"
            : "text-musgo hover:decoration-musgo",
        ],
        className,
      )}
    >
      {/* Na variante de texto a seta faz parte do mesmo nó de texto, e não de
          um elemento irmão. Como irmã dentro de um inline-flex, ela ficava
          fixada no fim da linha do flex: quando o rótulo quebrava em duas
          linhas na coluna estreita do celular, a seta continuava sozinha lá na
          direita, longe da palavra. O leitor de tela não lê nenhuma das duas
          formas — o link inteiro é anunciado pelo aria-label. */}
      {variante === "texto" ? `${rotulo} →` : rotulo}
    </a>
  );
}
