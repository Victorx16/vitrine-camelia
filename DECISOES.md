# Decisões

O que foi decidido neste projeto e por quê. Cada item marcado com **↔** é uma
decisão que eu suspeito que mudaria em outro ramo de loja — é o material para
decidir o que extrair quando o segundo projeto existir.

Não abstraia nada com base neste arquivo enquanto houver um projeto só.

---

## 1. O que este site é

Uma vitrine, não uma loja online. Não tem carrinho, checkout, pagamento,
gateway, frete, estoque nem conta de cliente, e não vai ter. O trabalho do site
é gerar conversa qualificada no WhatsApp; quem processa pedido é a dona, na
conversa.

Três características de boutique de bairro sustentam isso: peça quase única com
alta rotatividade (checkout sem estoque confiável vende o que não existe), venda
consultiva ("serve em mim?" trava mais compra que pagamento) e o fato de que a
loja já vende por WhatsApp — o site não muda o processo de venda, acaba com a
ida e volta de "quanto custa?".

**↔** A ausência de carrinho é a decisão mais dependente de ramo do projeto
inteiro. Numa loja de produto seriado e reponível — adega, tabacaria,
papelaria — o argumento contra o checkout se desfaz, porque estoque de produto
com código de barras é confiável. O que sobrevive a qualquer ramo é a mensagem
pré-preenchida, não a recusa do carrinho.

## 2. As cinco regras de produto

Existem para que o site não precise de manutenção constante.

1. **Nunca exibir quantidade em estoque.** A grade mostra o que a peça veste,
   nunca quanto sobrou. `components/peca/grade-tamanhos.tsx`.
2. **Esgotada é conteúdo, não erro.** A peça não some: perde saturação, ganha
   selo em tinta e o botão vira "quero uma parecida". Beco sem saída vira lead.
3. **"Chegou agora" é a seção principal da home**, organizada por dia de
   entrada.
4. **Vencimento automático.** `DIAS.novidade = 21` tira a peça dos trilhos;
   `DIAS.esgotadaVisivel = 30` tira a esgotada do catálogo.
5. **Curadoria, não catálogo completo.**

**↔** As cinco valem para qualquer loja de giro alto e peça escassa. A regra 1
não vale onde o estoque é confiável e a quantidade ajuda a decidir ("últimas 6
garrafas" é informação verdadeira numa adega e mentira numa boutique).

## 3. Vencimento: por que existe um build agendado

Site exportado estático não tem relógio. Depois de publicado, "chegou essa
semana" continua dizendo essa semana até alguém gerar o site de novo. As regras
de vencimento em `lib/peca.ts` são calculadas em tempo de build, e sem um build
por dia elas simplesmente não acontecem.

Duas alternativas foram consideradas e descartadas:

- **Calcular no navegador com `new Date()`** — funciona, mas traz descasamento
  de hidratação e um piscar de conteúdo, e enfia estado de execução numa página
  que existe para não ter nenhum.
- **Vencer só na próxima publicação** — amarra a validade do site à disciplina
  de quem publica. Duas semanas sem publicar e a home mente.

A solução é uma função agendada no Netlify (`netlify/functions/vencimento-diario.mts`,
agendada em `netlify.toml` para 8h UTC = 5h em São Paulo) que só bate no build
hook do próprio site. A URL do hook vive na variável de ambiente
`BUILD_HOOK_URL`, configurada no painel do Netlify, nunca no repositório.

**Isto é dependência de verdade, não detalhe de configuração.** Sem a variável,
a função registra erro e nada vence — e o sintoma (data velha no site) aparece
semanas depois, longe da causa.

**↔** Vale para qualquer vitrine estática com conteúdo datado.

## 4. `destaque` fixa; `dataEntrada` povoa

O briefing tinha `destaque` como booleano de "aparece na home", o que colide com
`dataEntrada` fazendo a mesma coisa. Em três meses, quarenta peças estariam em
destaque e a home voltaria a ser o catálogo inteiro — que é o que a regra 5
existe para evitar, e o sintoma só aparece meses depois.

Redefinido: `destaque` **fixa a peça no topo**, como o manequim da porta, com
teto em `TETO_DESTAQUE = 6`. Quem povoa a home é a data. As fixadas são
retiradas dos trilhos para não aparecerem duas vezes na mesma tela.

**↔** O mecanismo (fixar + teto) vale em qualquer ramo. O número 6 é desta loja.

## 5. Modelo de dados

Régua para incluir um campo: muda a decisão de compra **ou** reduz a ida e volta
no WhatsApp? Cada campo é preenchido umas quarenta vezes por ano, com a peça na
mão e cliente esperando.

**Acrescentados ao rascunho:**

- `medidas` — o campo mais valioso da ficha, e por isso opcional. "Serve em
  mim?" é a dúvida que trava a compra, e é a única linha que a responde antes da
  conversa. Obrigatório, viraria tarefa e seria preenchido errado.
- `tecido` — uma palavra, responde caimento e "é quente?".

**Cortados antes de propor:** `precoAntigo`/`precoPromocional` (convida teatro de
desconto e é a primeira coisa a envelhecer errado), `marca`, `sku`, `peso`, tags
livres.

**Listas fechadas** para `categoria` e `tamanhos`. Texto livre produz "blusa",
"Blusa", "blusinha" e "blusa " no mesmo catálogo em três meses, e qualquer
agrupamento morre junto. No painel vira lista para escolher, que também é mais
rápido no celular do que digitar.

**`cores` era fechada também, e a cerca teve de cair.** O argumento contra veio
de fora, do Victor, ao abrir o painel no celular: a lista de dezoito cores foi
escrita olhando as vinte fotos de demonstração, e a peça seguinte pode ser
lilás. O beco era este: peça na mão, nenhuma cor que sirva, e o formulário se
recusando a salvar. Desistir de cadastrar a peça ou mentir a cor são os dois
desfechos, e nenhum é aceitável.

A lista continua, porque marcar é mais rápido que digitar e resolve quase
sempre. Ao lado dela entrou **"Outra cor"**, texto livre, e a obrigatoriedade
virou "pelo menos uma das duas".

Custa pouco porque **`cores` só vira texto**: a ficha, a linha do cartão, o
cartão de compartilhamento e o `alt` da foto. Não há filtro por cor nem amostra
colorida. Se houvesse, texto livre fragmentaria o filtro e a decisão seria
outra — é essa a régua, não "abrir é sempre melhor".

A junção acontece em `paraPeca`, na fronteira dos dados: do lado do site, cor é
uma lista só. Ter vindo de uma caixa de texto ou de uma de seleção é assunto do
formulário, e vazar isso para `Peca` obrigaria as cinco telas que mostram cor a
lembrar da distinção.

**`tamanhos` mistura letra e número** (`P M G GG U` e `36`–`46`). A loja vende
vestido em letra e jeans em número, e obrigar os dois a caber num sistema só
inventaria uma tradução que a cliente não faz de cabeça. `U` é tamanho único,
que existe de verdade.

**`cores` mostra nome, não amostra.** Amostra exigiria que ela escolhesse um
valor de cor por peça, e cor de tela mente sobre cor de tecido de qualquer jeito.
A lista inclui `estampado` e `listrado`, que não são cor mas é como se fala no
balcão.

**`alt` da foto é opcional e derivado** (`altDaFoto` em `lib/peca.ts`). Alt
obrigatório é um campo que se preenche mal quarenta vezes por ano, e alt mal
preenchido é pior para quem usa leitor de tela do que alt derivado e correto.

**↔** `tamanhos` e `cores` são de vestuário e não sobrevivem a outro ramo.
`medidas` vira "volume/teor" numa adega. O que sobrevive: `slug`, `nome`,
`fotos`, `preco`, `categoria`, `situacao`, `destaque`, `dataEntrada` — e a régua
que decide se um campo entra.

## 6. A mensagem do WhatsApp não usa artigo

"Tenho interesse **no** Vestido" está certo; "**no** Blusa" está errado. O gênero
não está no dado: `nome` é texto livre e `categoria` só acertaria o artigo na
maioria das vezes.

Concordância errada numa mensagem que a cliente lê **antes de enviar** é
exatamente o detalhe que denuncia "site automático". A frase foi escrita para
não precisar de artigo: *"Oi! Tenho interesse nesta peça: {nome}, {preço}. Vi no
site."*

**↔** Vale para qualquer catálogo em português. Numa adega o problema seria "no
Vinho" / "na Cerveja". **Este é o candidato mais óbvio a virar utilitário
compartilhado quando o segundo projeto existir.**

## 7. Medição

Duas camadas, e a ordem entre elas importa.

**A principal é a mensagem do WhatsApp.** Ela carrega o nome da peça: a dona
abre o aplicativo e vê qual peça gerou cada conversa. Mede *lead* — gente
falando com a loja —, que é a coisa que o site existe para produzir. Não depende
de rastreador, não coleta dado de ninguém e não pode quebrar.

**A secundária é a Cloudflare Web Analytics**, que conta visita por página.
Grátis sem teto, sem cookie e sem fingerprint: nenhum dado pessoal é coletado, e
por isso o site não precisa de aviso de cookie. LGPD resolvida por não coletar,
não por consentir.

Netlify Analytics foi descartada. Ela seria tecnicamente melhor — mede do lado
do servidor e não carrega script nenhum —, mas custa por site e por mês, e a
diferença não paga.

**O preço da escolha, e ele é real:** o site deixa de ser "não carrega nada de
terceiro". Passa a buscar um arquivo em `static.cloudflareinsights.com` a cada
visita, e a mandar o número para `cloudflareinsights.com`. Os dois domínios
estão liberados na CSP do `netlify.toml`; liberar um sem o outro quebra a
medição em silêncio — o site continua perfeito e ninguém é contado.

Sem a variável `NEXT_PUBLIC_CF_BEACON_TOKEN` o script não é escrito no HTML. É
assim que desenvolvimento e prévia de branch ficam fora do número.

**↔** A camada do WhatsApp vale em qualquer vitrine. A da Cloudflare é uma
decisão de custo e de privacidade, não de ramo.

## 8. Direção de arte: "Linho e musgo"

Paleta em `app/globals.css`, contrastes medidos em `scripts/contrast.mjs`
(`pnpm contrast`), nunca estimados.

- **O fundo é `#E8E7DF`, não branco**, por motivo funcional: metade do que uma
  boutique vende é branco, cru ou off-white, e em fundo branco blusa branca some.
  O linho dá contorno à peça clara sem precisar de borda. É um greige puxado
  para o verde — mesmo lado do círculo em que fica o acento.
- **Não existe cartão.** A foto é o cartão: sem borda, sombra, fundo ou raio. A
  hierarquia vem do fio de 1px e do espaço. Toda a escala de `--radius-*` está
  em zero para neutralizar qualquer `rounded-*` que entre por descuido.
- **Musgo é acento reservado** a três lugares: marca de novidade, anel de foco e
  superfície do rodapé. É por aparecer pouco que ele manda.
- **Peça esgotada não recebe cor.** Perde saturação e ganha selo em tinta. Cor é
  o que está disponível; ausência de cor é o que já foi.
- **Nome e preço na mesma linha, mesma fonte, mesmo corpo.** É o oposto do
  padrão (preço menor, cinza, embaixo) e é deliberado: preço escondido é a coisa
  que este site existe para acabar.
- **Fraunces + Karla**, escolhidas contra Playfair e Cormorant de propósito —
  são o par de luxo padrão, leem como Milão, e a loja é Santo André. Da Fraunces
  fica ligado só o eixo `SOFT`; `WONK` em zero e por isso nem é carregado.
- **Modo claro só**, e é decisão, não omissão: a percepção da cor do tecido muda
  com o fundo, e a cliente decide compra olhando para a cor.
- **O rosa foi recusado.** É o que a base de dados devolve para "boutique
  feminina" e o que quase todo site do ramo usa. O problema não é o rosa: é que
  ele mira uma cliente de 16 anos, e a loja vende para quem precisa de uma blusa
  para trabalhar na segunda-feira. Num portfólio, ele ainda apaga o projeto.

**↔** A direção inteira é desta loja. Cada cliente recebe a própria — é o que o
site do estúdio já afirma, e reusar paleta entre clientes desmentiria isso.

## 9. O botão do WhatsApp

- **Não usa o verde do WhatsApp.** É tinta sobre linho, como todo botão do site.
  Verde de aplicativo dentro desta paleta é marca de terceiro passando na frente
  da marca da loja, e ninguém precisa da cor para saber o que abre.
- **O peso muda com o estado:** cheio para peça disponível, vazado para "quero
  uma parecida" — conversa mais fria não deve competir com a peça ao lado que
  ainda existe.
- **Na arara ele é linha de texto, não botão cheio.** Dezoito botões cheios numa
  grade viram marketplace e matam a direção. Continua com alvo de toque de 44px.
- **Desvio consciente do briefing:** o briefing pede o botão em cada peça. Ele
  existe em cada peça, mas na arara em forma discreta e na página da peça em
  forma cheia — que é onde a cliente tem grade, medidas e tecido na frente. É
  uma linha de mudança se a preferência for o botão cheio na arara também.

## 10. O aviso de demonstração

A Camélia não existe, e o site diz isso antes de qualquer outra coisa: tarja no
topo de toda página, parágrafo inteiro no rodapé e um `sr-only` no fim do
`<body>` para quem usa leitor de tela e nunca chega à tarja.

Duas consequências técnicas:

- **Sem dados estruturados de `LocalBusiness`.** Declarar endereço, telefone e
  horário para o Google seria plantar um negócio falso no índice dele. Ser
  honesto com o visitante e mentir para o buscador não é ser honesto.
- **O WhatsApp aponta para o número do Victor**, não para um número inventado
  nem para o de um terceiro. Quem clicar cai na conversa de quem de fato está do
  outro lado.

Este projeto **não** altera o contador "Projetos no ar: 01" do site do estúdio.

## 11. As fotos

São do Pexels, escolhidas uma a uma contra o gosto óbvio: peça no cabide, luz de
loja, parede lisa. Nada de campanha com modelo em estúdio, nada de vitrine de
shopping, nada de vestido de noiva — que é o que domina as buscas do ramo.

**A ficha segue a foto, não o contrário.** Depois de escolhidas, cada peça foi
descrita a partir do que aparece de fato na imagem. O caminho inverso — inventar
a peça e caçar uma foto que sirva — produz catálogo onde a descrição não bate
com a imagem, e é o que denuncia um modelo.

Consequência assumida: **não há calça nenhuma na seleção.** Não é decisão de
produto, é limite do acervo — calça feminina no cabide com luz de loja
praticamente não existe no Pexels. Numa loja real as fotos seriam feitas na
própria loja, com o celular, e a arara estaria completa.

As imagens foram recortadas em 3:4 (proporção de peça no cabide, e a que a dona
consegue repetir semana após semana), redimensionadas para 900×1200 e convertidas
para WebP a 78 de qualidade — cerca de 63 KB cada, 1,4 MB no total.

## 12. Convenções herdadas do site do estúdio

Next.js 16 com App Router, TypeScript, `output: "export"`, `images:
{ unoptimized: true }`, `netlify.toml` como fonte da verdade dos cabeçalhos com
a CSP duplicada em `next.config.ts` só para desenvolvimento, `next/font` com
subconjunto `latin`, constantes centralizadas em `lib/constants.ts`, revelação
por scroll em CSS dentro de `@media (scripting: enabled)` com o conteúdo
nascendo visível, e comentário que explica *por que*, não *o que*.

**Três desvios deliberados:**

1. **Modo claro**, não escuro (item 8).
2. **O catálogo não mora em `lib/constants.ts`.** Ele fica em `content/pecas.ts`
   porque a origem dele é outra: com a Sanity configurada, o catálogo vem da API
   em tempo de build e este arquivo passa a ser só a rede de segurança. O que
   vem de fora fica separado do que é escrito por gente, senão uma publicação da
   dona apaga uma frase do site.
3. **Sem `framer-motion`.** Não há widget aqui, e a única animação é a revelação
   em CSS. Uma dependência a menos numa página que carrega vinte fotos.

**Duas armadilhas da revelação por scroll**, ambas encontradas depois de o site
já estar de pé, e ambas com o mesmo sintoma: conteúdo invisível para sempre.
Estão explicadas em `components/ui/observador-revela.tsx`, e valem para qualquer
projeto que copie esse padrão.

1. **O observador mora no layout, e o layout não remonta ao trocar de página.**
   Com `useEffect(..., [])`, ele rodava uma vez e nunca mais: quem clicasse num
   link do menu chegava numa página em branco. A dependência é `usePathname()`.
2. **O IntersectionObserver avisa quando um elemento ENTRA na tela, nunca sobre
   um que já passou.** Entre o HTML chegar e o efeito rodar cabe muita rolagem
   em celular lento — e o que passou nesse intervalo não é revelado por
   ninguém. Por isso há uma varredura inicial que revela na hora tudo o que a
   rolagem já alcançou.

A lição maior é sobre como verificar: as duas passaram por toda a conferência
anterior porque eu só abria as páginas por endereço direto, e nunca clicando no
menu. Recarregar a página escondia exatamente o defeito.

## 13. O painel — Sanity

**O Studio não mora dentro do site.** Ele é hospedado de graça pela própria
Sanity, em `camelia.sanity.studio`. Embutir o Studio numa rota do Next exigiria
voltar a ter servidor, que é exatamente o que o export estático abre mão de
propósito — e o Studio hospedado roda bem em navegador de celular, que é onde a
dona vai usá-lo, de dentro da loja com a peça na mão.

O fluxo inteiro: ela publica no Studio → um webhook bate no build hook da
Netlify → a Netlify gera o site → um ou dois minutos depois a peça está no ar.

**Por que Sanity e não um CMS baseado em git (Decap):** o CDN de imagem. Ela
sobe a foto de 4 MB do celular e nada precisa ser convertido no build — o CDN
entrega a versão redimensionada e em WebP por parâmetro de URL. É isso que
permite `lib/sanity/loader.ts` devolver um `srcset` de verdade sem servidor
nenhum. O Decap não tem CDN de imagem (a foto de 4 MB viraria uma foto de 4 MB
no site) e o editor dele em navegador de celular é ruim.

**A busca acontece só no build.** O site exportado não fala com a Sanity: quem
fala é o processo que gera o HTML. Depois de publicado não há requisição, chave
nem latência de API entre a visitante e a foto do vestido.

**O catálogo local não é gambiarra de transição.** Sem
`NEXT_PUBLIC_SANITY_PROJECT_ID`, o build usa `content/pecas.ts` e o site
funciona inteiro. É o que permite trabalhar no layout sem rede e sem conta, o
que faz `pnpm build` funcionar para quem clonar o repositório amanhã, e é por
ele que a demonstração do portfólio roda.

**Se a Sanity cair, o build não pode parar.** Às cinco da manhã, quando o build
agendado roda, a alternativa a cair para o catálogo local seria o site sair do
ar inteiro por causa de um vencimento de data. Conteúdo velho é infinitamente
melhor que um 404 — mas o aviso é gritado no log do build, porque conteúdo velho
servido em silêncio é o mesmo tipo de defeito que a Cloudflare barrada na CSP.
Resposta vazia também conta como falha: quase sempre é configuração errada, não
"a loja está sem peças".

**A consulta é buscada com prazo de um segundo, e isso foi um defeito antes de
ser uma decisão.** O Next grava em `.next/cache/fetch-cache` a resposta de todo
`fetch` do build, e a Netlify preserva essa pasta de um build para o outro. Sem
prazo declarado, ele guarda por **um ano**. Foi o que aconteceu na primeira
carga: a resposta vazia de antes da importação ficou gravada em disco, e três
builds seguidos leram o disco em vez da Sanity — o site saía com o catálogo
local, as dezoito peças estavam publicadas, e o log só dizia "não havia nenhuma
peça publicada". Apagar `.next` resolvia; nada no código explicava por quê.

O sintoma numa loja de verdade é o pior defeito que este projeto pode ter: ela
publica a peça, o webhook dispara o build, o build termina com sucesso, e a peça
não aparece. Sem erro nenhum.

`cache: "no-store"` é o instinto e está errado — marca a rota como dinâmica, e
rota dinâmica é proibida em `output: "export"`; o build inteiro para. Um segundo
de prazo é a diferença certa: dentro de um build as rotas que pedem o catálogo
aproveitam a mesma resposta, e entre um build e outro nunca sobra nada. As
fotos continuam guardadas por um ano de propósito, porque a URL do CDN carrega
o hash do arquivo — foto trocada é URL trocada.

Vale registrar o erro de diagnóstico junto: a primeira hipótese foi o CDN da
Sanity servindo cópia velha, e ela foi descartada por medição (`curl` no CDN e
na API devolviam 18 os dois). A hipótese estava errada, mas o hábito de medir
antes de consertar foi o que evitou "consertar" a coisa errada.

**Os rótulos do painel estão no vocabulário dela** — "peça", "grade que a peça
veste", "esgotada", "entrou na loja". E as descrições de campo não explicam o
que o campo é; explicam a REGRA ("os tamanhos em que esta peça existe, NÃO
quantas você tem"). É o único lugar onde as regras de produto chegam a quem
preenche.

**↔** A arquitetura (Studio hospedado + webhook + build + fallback local) vale
para qualquer vitrine estática. O esquema em `studio/schemas/peca.ts` é de
vestuário e não sobrevive a outro ramo — mas o formato dele, sim.

## 14. Busca e compartilhamento

**O site é indexável, e a decisão merece explicação** porque a loja é fictícia.
A chave está em `INDEXAR`, em `lib/constants.ts`, com o raciocínio ao lado dela.
O resumo: estrutura de SEO técnico é parte do que este modelo demonstra, e um
site com `noindex` não demonstra nada — não dá para abrir o Search Console de um
site que pediu para não ser lido. O risco de enganar alguém está coberto, porque
o aviso de demonstração aparece no cabeçalho de toda página, no rodapé, na
descrição que vira o resumo na busca e na própria imagem de compartilhamento.

**O aviso vai na descrição, não no título.** O título é o que o modelo precisa
demonstrar ("Camélia, boutique em Santo André"); a descrição é onde a
honestidade cabe sem estragar a demonstração — e é ela que aparece como resumo
no resultado de busca.

**O sitemap sai das mesmas funções que geram as páginas**, então publicar uma
peça já a coloca lá e uma peça vencida sai sozinha. A página da peça vencida
continua existindo e respondendo 200 — link que circulou no WhatsApp não vira
404 —, mas não é anunciada: pedir rastreio de novo para uma peça que saiu da
loja é gastar orçamento de rastreio à toa.

**Uma imagem de compartilhamento por peça.** Sem isso, mandar o link de um
vestido abre um cartão com a foto da loja e o nome da marca, igual ao de
qualquer outra peça. Com isso, o cartão mostra a peça, o preço e a grade, e a
conversa começa com as duas pessoas olhando para a mesma coisa. Numa loja que
vende por conversa, é uma das partes mais úteis do site.

**Três armadilhas do Satori, todas encontradas do jeito difícil:**

1. **Ele não lê WOFF2 nem WOFF.** Só TTF/OTF. As fontes em `assets/fonts/` são
   os subconjuntos `latin` do Google Fonts, convertidos de WOFF para TTF.
2. **Ele não decodifica WebP.** O site inteiro serve WebP; o cartão não pode. Por
   isso existe `assets/og/`, com uma cópia JPEG em tamanho de cartão de cada
   foto. O erro era `u2 is not iterable`, que não diz nada sobre a causa.
3. **Ele não ignora propriedade com valor `undefined`** — tenta processá-la e
   morre com `Cannot read properties of undefined (reading 'trim')`. Um
   `filter: esgotada ? "..." : undefined` derrubava o build justamente nas peças
   *disponíveis*. E ele também não implementa `filter`: a peça esgotada perde a
   cor por um véu de linho por cima da foto.

`assets/og/` é andaime do catálogo local: quando a Sanity for a origem, o CDN
resolve com `fm=jpg` na URL e essa pasta deixa de ser necessária.

**↔** Tudo aqui vale para qualquer vitrine. A decisão de indexar é específica de
ser um modelo, não de ser boutique.

## 15. Uma verruga conhecida

`components/peca/foto.tsx` marca as fotos locais como `unoptimized` e as da
Sanity não. Isso existe porque o site tem duas origens de imagem ao mesmo tempo,
e some sozinho quando o catálogo passar a vir da Sanity — não vale abstrair
agora.

## 16. O que ainda não existe

- **`sitemap.ts`, `robots.ts` e imagem de compartilhamento.**
- **O aviso de "publicando" no painel.** A Sanity não sabe o estado do build da
  Netlify; mostrar isso exige um widget no dashboard do Studio. A versão barata
  é o badge público de deploy da Netlify (um SVG, sem token) com uma frase em
  português abaixo. É trabalho real, não um campo a marcar.
- **Rodar o `contrast.mjs` no CI.**
