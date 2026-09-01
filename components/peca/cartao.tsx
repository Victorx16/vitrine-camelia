import Link from "next/link";
import { BotaoWhatsApp } from "@/components/peca/botao-whatsapp";
import { BotaoSeparar } from "@/components/separar/botao";
import { Foto } from "@/components/peca/foto";
import { GradeTamanhos } from "@/components/peca/grade-tamanhos";
import { COPY } from "@/lib/constants";
import { listar, preco as formatarPreco } from "@/lib/formato";
import { altDaFoto } from "@/lib/peca";
import type { Peca } from "@/lib/tipos";
import { cn } from "@/lib/utils";

interface CartaoProps {
  peca: Peca;
  /** Posição na arara. Alimenta a cascata e decide quem carrega com prioridade. */
  indice?: number;
  className?: string;
}

/**
 * Uma peça na arara.
 *
 * Não existe cartão: não há borda, sombra, fundo nem canto arredondado. A foto
 * é o cartão. A separação entre uma peça e a vizinha é feita por espaço, e a
 * arara inteira pendura de um fio de 1px desenhado pela seção — que é como uma
 * arara de verdade funciona, e é o que impede a página de virar aquela grade de
 * caixinhas brancas que todo site de loja tem.
 *
 * A foto e o texto ficam dentro do mesmo link, e a ação do WhatsApp fica FORA
 * dele. Âncora dentro de âncora é HTML inválido e quebra a navegação por
 * teclado; sendo irmãs, as duas viram duas paradas de Tab claras — abrir a
 * peça, ou falar sobre ela.
 */
export function Cartao({ peca, indice = 0, className }: CartaoProps) {
  const esgotada = peca.situacao === "esgotada";
  const detalhe = [peca.tecido, listar(peca.cores)].filter(Boolean).join(" · ");

  return (
    <article className={cn("flex flex-col gap-3", className)}>
      <Link
        href={`/pecas/${peca.slug}`}
        className="group/peca flex flex-col gap-3"
      >
        {/* 3:4 é a proporção de uma peça no cabide — e é a que a dona da loja
            consegue repetir com o celular na mão, semana após semana. Declarada
            aqui, ela reserva o espaço antes de a imagem chegar: numa página com
            dezoito fotos, é a diferença entre rolar e ver a página pular. */}
        <div className="bg-papel relative aspect-3/4 overflow-hidden">
          <Foto
            src={peca.fotos[0].src}
            alt={altDaFoto(peca, 0)}
            width={900}
            height={1200}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            // As quatro primeiras estão acima da dobra em desktop. O resto
            // carrega preguiçoso — é o que salva o carregamento no celular.
            priority={indice < 4}
            loading={indice < 4 ? undefined : "lazy"}
            className={cn(
              "h-full w-full object-cover transition-[filter,transform] duration-500 ease-vitrine",
              "group-hover/peca:scale-[1.015]",
              // Esgotada perde a cor. Ausência de cor é a informação: cor é o
              // que está disponível.
              esgotada && "saturate-45 contrast-95",
            )}
          />

          {esgotada && (
            <p
              className={cn(
                "bg-tinta text-linho absolute inset-x-0 top-[42%] py-1.5 text-center",
                "font-display text-[1.35rem] italic",
              )}
            >
              {COPY.selo.esgotada}
              <span className="sr-only"> — {COPY.selo.esgotadaAjuda}</span>
            </p>
          )}
        </div>

        {/* Nome e preço na mesma serifada e no mesmo corpo — o oposto do padrão
            (preço menor, cinza, embaixo), e deliberado: preço escondido é a
            coisa que este site existe para acabar.

            Na mesma LINHA só a partir de 640px. Em duas colunas num telefone de
            375px sobram 160px por peça: "Vestido de alcinha estampado" quebrava
            em três linhas com o preço encostado no alto à direita, e o preço da
            coluna vizinha colava no nome desta. Empilhado, cada coluna volta a
            ler como uma peça só. */}
        <div className="flex flex-col gap-x-3 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <h3
            className={cn(
              "text-peca font-display font-medium",
              esgotada ? "text-sepia" : "text-tinta",
            )}
          >
            {peca.nome}
          </h3>
          <p
            className={cn(
              "text-peca font-display tnum shrink-0 font-semibold",
              esgotada ? "text-sepia" : "text-tinta",
            )}
          >
            {formatarPreco(peca.preco)}
          </p>
        </div>
      </Link>

      <GradeTamanhos tamanhos={peca.tamanhos} />

      {detalhe && (
        <p className="text-sepia text-[0.8125rem] leading-snug">{detalhe}</p>
      )}

      {/* As duas ações são irmãs: perguntar agora, ou juntar para perguntar
          depois. Mesmo peso, mesma linha, nenhuma com cara de e-commerce. */}
      <div className="-mt-1 flex flex-wrap items-center gap-x-4">
        <BotaoWhatsApp peca={peca} variante="texto" />
        <BotaoSeparar peca={peca} />
      </div>
    </article>
  );
}
