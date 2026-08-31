import Link from "next/link";
import { Rotulo } from "@/components/ui/rotulo";
import { AVISO_MODELO, LOJA, NAV_LINKS } from "@/lib/constants";

/**
 * Cabeçalho, e antes dele a tarja de demonstração.
 *
 * A tarja vem primeiro no documento e não some ao rolar junto com o resto: ela
 * é a primeira coisa que o visitante lê. Um modelo apresentado como se fosse
 * loja de verdade derrubaria o argumento inteiro do estúdio, que é construído
 * sobre o que dá para conferir.
 *
 * Não há menu sanfona no celular. São três destinos: um menu escondido atrás de
 * um ícone, aqui, esconderia três palavras atrás de um toque.
 */
export function Cabecalho() {
  return (
    <header>
      <div className="bg-tinta">
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-2 sm:px-8">
          <Rotulo tom="linho">
            {LOJA.nome} · {LOJA.descritor} · {LOJA.cidade}
          </Rotulo>
          <Rotulo tom="linho" className="opacity-70">
            {AVISO_MODELO.curto}
          </Rotulo>
        </div>
      </div>

      <div className="border-fio border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-1 px-5 py-4 sm:items-baseline sm:px-8 sm:py-5">
          <Link
            href="/"
            className="font-display text-[1.6rem] leading-none font-semibold tracking-tight"
          >
            {LOJA.nome}
          </Link>

          <nav aria-label="Navegação principal">
            <ul className="flex flex-wrap items-center gap-x-5 sm:items-baseline sm:gap-x-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-rotulo text-sepia hover:text-tinta inline-flex min-h-11 items-center uppercase transition-colors"
                  >
                    <span className="sm:hidden">{link.curto}</span>
                    <span className="hidden sm:inline">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
