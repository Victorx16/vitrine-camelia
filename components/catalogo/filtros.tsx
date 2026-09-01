"use client";

import { useEffect, useState } from "react";
import { COPY } from "@/lib/constants";
import { semAcento, urlDaCategoria, type Faceta } from "@/lib/filtro";
import type { Categoria, Tamanho } from "@/lib/tipos";
import { cn } from "@/lib/utils";

/**
 * O filtro do catálogo.
 *
 * ------------------------------------------------------------------------
 * Ele NÃO redesenha a lista de peças.
 *
 * As peças são geradas no build, uma vez, e ficam no HTML. Este componente só
 * acende e apaga `hidden` nelas. A alternativa — passar as peças como
 * propriedade e deixar o React montar a grade — escreveria o catálogo duas
 * vezes dentro do HTML (uma como página, outra como dado) e jogaria fora a
 * foto já carregada a cada mudança de filtro.
 *
 * Com cento e cinquenta peças essa diferença deixa de ser detalhe.
 * ------------------------------------------------------------------------
 *
 * Sem JavaScript, os controles não aparecem (regra em globals.css) e o catálogo
 * inteiro fica visível. É a mesma escolha da revelação por rolagem: o conteúdo
 * nasce visível, e o script só tira coisa da frente.
 *
 * **Toda a filtragem acontece no manipulador do clique, nunca num efeito.** O
 * filtro é reação a uma ação de quem está ali; efeito é para sincronizar com o
 * mundo de fora. O único efeito aqui é o da montagem, que lê o endereço.
 */

interface FiltrosProps {
  categorias: Faceta<Categoria>[];
  tamanhos: Faceta<Tamanho>[];
  total: number;
  /** Categoria já fixada pela página. Some dos controles e não é desmarcável. */
  categoriaFixa?: Categoria;
}

interface Selecao {
  categoria: Categoria | null;
  tamanho: Tamanho | null;
  busca: string;
}

const VAZIA: Selecao = { categoria: null, tamanho: null, busca: "" };

/** Acende e apaga as peças no HTML já gerado. Devolve quantas sobraram. */
function pintar({ categoria, tamanho, busca }: Selecao): number {
  const termo = semAcento(busca.trim());
  let contagem = 0;

  for (const alvo of document.querySelectorAll<HTMLElement>("[data-peca]")) {
    const serve =
      (!categoria || alvo.dataset.categoria === categoria) &&
      (!tamanho || (alvo.dataset.tamanhos ?? "").includes(` ${tamanho} `)) &&
      (!termo || (alvo.dataset.busca ?? "").includes(termo));

    alvo.hidden = !serve;
    if (serve) contagem++;
  }

  return contagem;
}

/**
 * Escreve a seleção no endereço da página.
 *
 * É o que transforma uma escolha em link, e link em mensagem de WhatsApp: a
 * dona manda "os vestidos que servem em você" para uma cliente sem montar nada.
 * O filtro deixa de ser só ferramenta de quem visita e vira ferramenta de quem
 * vende — que é o motivo pelo qual ele existe neste site.
 *
 * `replaceState` e não `pushState`: cada tecla digitada na busca viraria uma
 * entrada no histórico, e o botão "voltar" do celular passaria a desfazer
 * letras em vez de sair da página.
 */
function escreverEndereco({ categoria, tamanho, busca }: Selecao, fixa?: Categoria) {
  const params = new URLSearchParams();
  // A categoria vai como apelido sem acento ("tricos"), nunca com o valor
  // cru ("tricô"). Acento em endereço é frágil: o mesmo "ô" viaja como um
  // caractere ou como dois dependendo do aparelho que copiou o link, e o
  // filtro simplesmente não aplicava — sem erro, sem aviso, só a página
  // inteira aparecendo como se ninguém tivesse escolhido nada.
  if (categoria && !fixa) params.set("categoria", urlDaCategoria(categoria));
  if (tamanho) params.set("tamanho", tamanho);
  if (busca.trim()) params.set("q", busca.trim());

  const consulta = params.toString();
  window.history.replaceState(
    null,
    "",
    consulta ? `${window.location.pathname}?${consulta}` : window.location.pathname,
  );
}

export function Filtros({ categorias, tamanhos, total, categoriaFixa }: FiltrosProps) {
  const [selecao, setSelecao] = useState<Selecao>(VAZIA);
  const [visiveis, setVisiveis] = useState(total);

  /**
   * O único efeito, e ele roda uma vez.
   *
   * Existe porque o endereço da página é um sistema de fora: quem abre um link
   * com `?tamanho=G` precisa ver a página já filtrada. Ler isso durante a
   * renderização daria divergência com o HTML gerado no build, onde nada está
   * selecionado.
   */
  /*
   * A regra `set-state-in-effect` está desligada aqui, e não por preguiça.
   *
   * Ela existe para impedir efeito que recalcula estado derivado — e está certa
   * em todo o resto deste arquivo, onde a filtragem acontece no clique. Este
   * caso é o que a própria regra descreve como legítimo: puxar estado de um
   * sistema de fora, o endereço da página.
   *
   * Não dá para ler durante a renderização: o HTML é gerado no build, sem
   * endereço nenhum, e um `?tamanho=G` lido na primeira renderização faria o
   * navegador encontrar botões diferentes dos que recebeu. Divergência de
   * hidratação é pior do que este comentário.
   */
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("categoria");
    const tam = params.get("tamanho");
    const q = params.get("q") ?? "";

    // Aceita as duas formas — "tricos" (o que escrevemos) e "trico" (o que
    // alguém digitaria à mão) — porque link é coisa que se edita no meio da
    // conversa.
    const chave = cat ? semAcento(cat) : null;
    const achada = chave
      ? categorias.find(
          (c) => urlDaCategoria(c.valor) === chave || semAcento(c.valor) === chave,
        )
      : undefined;

    const inicial: Selecao = {
      categoria: !categoriaFixa && achada ? achada.valor : null,
      tamanho: tam && tamanhos.some((t) => t.valor === tam) ? (tam as Tamanho) : null,
      busca: q,
    };

    setSelecao(inicial);
    setVisiveis(pintar(inicial));
    // Uma vez só, na montagem. As mudanças seguintes vêm dos cliques.
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  /** Todo caminho de mudança passa por aqui: estado, HTML e endereço juntos. */
  function escolher(mudanca: Partial<Selecao>) {
    const nova = { ...selecao, ...mudanca };
    setSelecao(nova);
    setVisiveis(pintar(nova));
    escreverEndereco(nova, categoriaFixa);
  }

  const { categoria, tamanho, busca } = selecao;
  const limpo = !categoria && !tamanho && !busca.trim();

  return (
    <div data-so-com-script="" className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2.5 sm:gap-4">
        {!categoriaFixa && categorias.length > 1 && (
          <Fileira rotulo={COPY.filtro.categoria}>
            {categorias.map((c) => (
              <Ficha
                key={c.valor}
                ativa={categoria === c.valor}
                onClick={() =>
                  escolher({ categoria: categoria === c.valor ? null : c.valor })
                }
              >
                {c.rotulo}
                <Conta>{c.quantas}</Conta>
              </Ficha>
            ))}
          </Fileira>
        )}

        {tamanhos.length > 1 && (
          <Fileira rotulo={COPY.filtro.tamanho}>
            {tamanhos.map((t) => (
              <Ficha
                key={t.valor}
                ativa={tamanho === t.valor}
                onClick={() => escolher({ tamanho: tamanho === t.valor ? null : t.valor })}
              >
                <span className="tnum">{t.rotulo}</span>
              </Ficha>
            ))}
          </Fileira>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <label className="min-w-[13rem] flex-1">
          <span className="sr-only">{COPY.filtro.buscar}</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => escolher({ busca: e.target.value })}
            placeholder={COPY.filtro.buscarDica}
            className="border-fio focus-visible:border-tinta placeholder:text-sepia/70 w-full border-b bg-transparent py-2 text-sm outline-none transition-colors"
          />
        </label>

        <p className="text-sepia text-xs tracking-[0.14em] uppercase" aria-live="polite">
          <span className="tnum">{visiveis}</span>
          {visiveis === 1 ? COPY.filtro.contaUma : COPY.filtro.contaMuitas}
        </p>

        {!limpo && (
          <button
            type="button"
            onClick={() => escolher(VAZIA)}
            className="text-musgo hover:text-tinta text-xs tracking-[0.14em] uppercase underline underline-offset-4 transition-colors"
          >
            {COPY.filtro.limpar}
          </button>
        )}
      </div>

      {visiveis === 0 && <p className="text-sepia text-sm">{COPY.filtro.vazio}</p>}
    </div>
  );
}

function Fileira({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0 sm:gap-y-1">
      <span className="text-sepia w-full shrink-0 text-[0.7rem] leading-6 tracking-[0.16em] uppercase sm:w-auto">
        {rotulo}
      </span>
      {children}
    </div>
  );
}

/**
 * Alvo de toque com 44px de altura mínima, mesmo com o texto pequeno.
 *
 * Filtro se usa com o polegar, andando na rua. Uma fileira de alvos de 28px é
 * onde se erra o "M" e se acerta o "GG".
 */
function Ficha({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativa}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 border-b px-1 text-sm transition-colors",
        ativa
          ? "border-tinta text-tinta"
          : "text-sepia hover:text-tinta hover:border-fio border-transparent",
      )}
    >
      {children}
    </button>
  );
}

function Conta({ children }: { children: React.ReactNode }) {
  return <span className="text-sepia/70 tnum text-[0.72rem]">{children}</span>;
}
