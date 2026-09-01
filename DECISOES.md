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

## 3. O build: por que ele acontece e quanto custa

Site exportado estático não tem relógio. Depois de publicado, "chegou essa
semana" continua dizendo essa semana até alguém gerar o site de novo. As regras
de vencimento em `lib/peca.ts` são calculadas em tempo de build, e sem alguém
disparando um build de tempos em tempos elas simplesmente não acontecem.

Duas alternativas foram consideradas e descartadas:

- **Calcular no navegador com `new Date()`** — funciona, mas traz descasamento
  de hidratação e um piscar de conteúdo, e enfia estado de execução numa página
  que existe para não ter nenhum.
- **Vencer só na próxima publicação** — amarra a validade do site à disciplina
  de quem publica. Duas semanas sem publicar e a home mente.

A solução é uma função agendada no Netlify (`netlify/functions/vencimento-agendado.mts`,
agendada em `netlify.toml`) que só bate no build hook do próprio site. A URL do
hook vive na variável de ambiente `BUILD_HOOK_URL`, configurada no painel do
Netlify, nunca no repositório.

**Isto é dependência de verdade, não detalhe de configuração.** Sem a variável,
a função registra erro e nada vence — e o sintoma (data velha no site) aparece
semanas depois, longe da causa.

**Era diário e virou semanal, por conta de custo real.** Em 31/08/2026 o crédito
de build da Netlify acabou no meio do ciclo e os deploys de produção pararam —
com uma alteração de preço já publicada no painel e presa fora do ar. Trinta
builds por mês para sustentar uma regra de vinte e um dias não se paga.

O raciocínio da troca: **o agendado não é o que mantém o site em dia.** Quem faz
isso é o webhook — toda publicação dela dispara um build, e as datas vão junto.
O agendado só importa nas semanas em que ela não publica nada, e nessas não há
novidade entrando; o que precisa acontecer é "chegou agora" encolher sozinha.
Semanal dá conta.

O preço, dito por inteiro: uma peça pode ficar até seis dias a mais em "chegou
agora". Numa boutique de bairro isso é barato perto de vinte e seis builds.

**Quinta-feira, não segunda.** Assim o site está no ponto mais fresco entrando
no fim de semana, que é quando se olha vitrine e se sai para comprar. Segunda
faria o atraso ser maior justamente no sábado.

### O preço, medido

Números reais da conta, em 31/08/2026, plano gratuito da Netlify, ciclo de
24/08 a 23/09:

| item | consumo |
| --- | --- |
| **Production deploys** | **300 créditos — 20 deploys** |
| Web requests (5.338) | 1,1 crédito |
| Bandwidth | 1,5 crédito |
| AI inference | 0 |
| Compute | 0 |

O plano dá **300 créditos por mês**. Vinte deploys consumiram os 300 — **15
créditos por deploy**. Tudo o mais somado não chega a 3.

Isso reposiciona o que o plano é: **não é um limite de visitas, é um limite de
publicações.** A vitrine poderia receber cem vezes mais tráfego sem encostar no
teto. O que a derruba é gerar o site de novo.

### Três torneiras no mesmo balde

Um deploy é um deploy, custe o que custar a mudança. Trocar uma vírgula na
descrição custa igual a cadastrar uma peça com quatro fotos. E são três fontes,
não uma:

1. **O que ela publica.** Cada clique em "Publicar" — preço, cor, tamanho,
   marcar esgotada, apagar. Não tem a ver com foto.
2. **O que o desenvolvedor envia.** Cada `git push` dispara um deploy. Um dia de
   correções consome um dia de orçamento dela.
3. **O build agendado.**

E o orçamento é **do time**, não do site: o portfólio do estúdio divide o mesmo
pote com esta vitrine.

### O erro que só a fatura revelou

O agendamento diário eram **30 builds por mês contra um teto de 20**. O
despertador sozinho estourava o plano, todo mês, sem ninguém publicar nada e sem
ninguém visitar o site. Era matematicamente impossível, e foi projetado sem
nunca se perguntar quanto custava um build.

Semanal são ~4,3 por mês: 21% do orçamento em vez de 150%.

### O que um mês de loja real custa

Estimativa para uma vitrine curada de 30 a 60 peças com boa saída:

| ação | vezes/mês |
| --- | --- |
| peças novas | ~10 |
| **marcar como esgotada** | ~15 |
| correções de preço e texto | ~3 |
| build agendado | 4 |
| **total** | **~32** |

O **esgotada** é o item subestimado, e é a ação que ela mais repete: toda peça
vendida é um clique em "Publicar". Trinta e dois não cabe em vinte — e nessa
conta ninguém programou nada.

### Conclusão: o plano pago não é opcional para cliente real

O plano Pessoal (US$ 9/mês) dá **1.000 créditos ≈ 66 deploys**. Contra os ~32 de
uso normal, é mais que o dobro de folga.

- **Demonstração de portfólio: gratuito serve.** Ninguém publica aqui. A única
  disciplina é não fazer vinte envios de código no mesmo dia.
- **Cliente real: plano pago, e na conta DELA.** A promessa que vende o produto
  é "a senhora mesma atualiza o site". No gratuito ela gastaria o mês em duas
  semanas de trabalho normal e ficaria com o site travado sem entender por quê.
  Na conta dela também resolve o problema de um cliente travar o deploy de
  outro, que foi como isto apareceu.

### A saída que existe e não foi construída

Se algum dia for preciso segurar uma loja real no plano gratuito, o caminho é
**agrupar publicações**: o webhook avisa uma tarefa agendada, que espera ~10
minutos e reinicia a contagem a cada nova publicação. Cinco peças numa tarde
viram um deploy.

O detalhe que torna isso melhor do que parece: **a pressa não é igual para
tudo.** Peça nova precisa estar no ar em dois minutos — ela quer mandar o link
para uma cliente. Peça marcada como esgotada não tem ninguém esperando, e é a
maioria dos cliques. Dá para agrupar só o que não tem pressa.

Não foi construído de propósito: com o plano pago o problema não existe, e
código que só serve para economizar dez dólares custa mais caro que os dez
dólares.

### O mesmo site no Cloudflare: o teto deixa de existir

Números lidos no painel de planos do Cloudflare, em 01/09/2026:

| | Netlify grátis | Cloudflare grátis |
| --- | --- | --- |
| unidade | 300 créditos | 3.000 minutos de build |
| custo de um build | 15 créditos (medido) | ~1 minuto (57s, medido) |
| **publicações por mês** | **~20** | **~3.000** |
| tráfego | 5.338 requisições = 1,1 crédito | 100.000 requisições/dia |

Não é folga maior; é o problema deixando de existir. Todo o raciocínio acima —
o teto de vinte, a conta do mês de loja real, o plano pago, o agrupamento que
seria preciso construir — nasce de uma escassez que só a Netlify impõe.

**Consequências diretas:**

- **O plano pago deixa de ser necessário** para um cliente real. O custo mensal
  de hospedagem pode ser zero, e isso muda a proposta comercial, não só a
  infraestrutura.
- **O agrupamento não será construído.** Era código para caber em vinte
  deploys. Complexidade que só existe para economizar dinheiro que ninguém
  gasta é a pior espécie.
- **O build agendado tem casa aqui**: o gratuito inclui 5 Cron Triggers por
  conta, o que dispensa até o GitHub Actions.

**Duas coisas por conferir antes de prometer "grátis" a alguém.** O cartão do
plano diz *"For personal use and simple applications"* no Free e *"For business
use"* no pago de US$ 5 — texto de marketing, talvez, mas é a mesma zona cinzenta
do plano Hobby da Vercel e merece leitura dos termos. E o plano gratuito da
Sanity continua não medido: enquanto for, o custo mensal do projeto é
desconhecido, não zero.

### Movimento: o que ficou e o que foi tirado

**Ficou:** as peças entram uma após a outra, 10px em meio segundo, com 45ms de
atraso por item e teto de oito. Verificado com o olho do Victor: *"vejo as
roupas entrarem uma após a outra"*.

**O número que fez a diferença foi a margem do observador, não a animação.** Com
`-12%`, a peça começava a revelar quando mal tinha entrado na tela: meio segundo
de transição terminava na periferia e, quando o olho chegava, já estava pronto.
O relato antes da correção foi literal — "tudo aparece pronto, nada teve
movimento" — **com o mecanismo funcionando** (19 de 19 revelados ao rolar até o
fim). Com `-22%` o movimento acontece onde a pessoa está olhando.

**Foi tirado:** o fio da arara sendo desenhado quando a seção entra. Era o único
gesto que vinha do assunto em vez de vir de uma biblioteca, e mesmo assim caiu —
por uma razão que só o olho de alguém revela: **o fio animado é curto e mora
dentro do cabeçalho da seção, e o olho não segue aquela linha.** O Victor olhou
para a borda entre seções, que corre de ponta a ponta, e esperou que ela se
mexesse.

A alternativa seria animar as bordas de seção, que são as linhas que o olho de
fato acompanha. Foi oferecida e recusada: a página inteira se montando à medida
que desce cansa mais do que encanta numa vitrine, onde o conteúdo é a foto da
peça e não a moldura.

**A lição de método, e ela custou caro:** `IntersectionObserver` e
`ResizeObserver` não disparam no painel de navegador usado para verificar. Três
diagnósticos foram dados como certos com esse instrumento e estavam errados,
inclusive um alarme de "doze blocos invisíveis em produção" que não existia.
**Para qualquer coisa que dependa de rolagem, o instrumento é o olho de uma
pessoa num navegador de verdade.**

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

### O endereço da peça vai na mensagem

Descoberto na prospecção: o WhatsApp da loja tem uma **assistente de IA da Meta**
atendendo antes da dona. Ela usa o nome de quem escreve, entende a mensagem e
repassa para um humano — não é árvore de menu, e por isso não atropela a
conversa que o site inicia.

**O que ela não tem é o catálogo.** Perguntada sobre uma peça, ou desvia ou
inventa. Preço divergente entre o site e o WhatsApp da mesma loja destrói
confiança mais rápido do que qualquer coisa que o site construa.

Com o endereço dentro da mensagem, a assistente tem para onde apontar em vez de
adivinhar. E vêm dois ganhos que valeriam sozinhos: a dona abre a peça exata
enquanto responde, em vez de procurar pelo nome num catálogo de cento e
cinquenta; e a cliente encaminha a conversa para uma amiga com a peça junto.

Em linha própria, porque o WhatsApp só transforma em link o que consegue
separar do texto. E o "Vi no site." saiu: o endereço logo abaixo já diz de onde
veio, e repetir a origem em duas formas é a gordura que faz mensagem
pré-escrita parecer escrita por máquina.

**↔** A divisão de camadas vale para qualquer loja com atendimento
automatizado: a assistente responde saudação e horário, o site responde o que
tem e quanto custa, a dona responde o que só ela sabe.

### Separar peças: onde fica a linha do carrinho

A vitrine passou a deixar a visitante **separar** algumas peças e perguntar
sobre todas numa mensagem só. A pergunta óbvia — "isso não é um carrinho?" — tem
resposta, e ela precisa estar escrita para o dia em que alguém quiser esticar
mais.

**Carrinho acumula com intenção de comprar**: tem quantidade, tem total, tem
checkout, e obriga a loja a manter estoque correto. Nada disso existe aqui. O
que existe é o gesto do balcão — a atendente separa duas ou três peças para a
cliente ver junto — e a conversa continua sendo com uma pessoa, que confirma se
ainda tem.

**A régua, para a próxima ideia: se ela obrigar a saber QUANTAS peças existem,
está do outro lado da linha.**

E isto não é recurso novo inventado: a cliente já manda três prints de uma vez
no Instagram. O site, antes disto, **piorava** esse comportamento — obrigava a
mandar três mensagens separadas.

**Sem total, de propósito.** Somar os preços transforma "gostei destas três" em
"vou levar estas três". Cada peça leva o seu preço na mensagem; a soma é assunto
da conversa.

**"Separar", nunca "carrinho", "sacola" ou "lista de desejos".** É a palavra que
ela já usa com a cliente na frente dela. E a linguagem visual acompanha: não há
ícone de sacola, não há bolinha com número. O botão é uma linha de texto do
mesmo peso do "quero esta peça" ao lado — as duas ações são irmãs, perguntar
agora ou juntar para perguntar depois.

**Peça esgotada não pode ser separada.** Separar existe para montar uma pergunta
sobre o que dá para levar; peça que já foi entra na conversa por outro caminho
("quero uma parecida"), que é outra conversa.

**Teto de oito.** Uma lista de vinte deixa de ser pergunta e vira pedido — de
novo a fronteira. E separar dezenas é comportamento de quem monta carrinho, não
de quem tira dúvida.

**A mensagem leva um link só**, para o catálogo já filtrado nas peças
escolhidas (`?separadas=...`). Um endereço por peça encheria a mensagem de links
ilegíveis; assim a dona abre uma página e vê as três com foto. Esse corte é
absoluto: nenhum filtro aplicado por cima traz peça que não estava na seleção.

**O estado vive no navegador de quem visita, e em lugar nenhum além dele.** Não
há servidor, não há conta, e a dona não vê seleção de ninguém — ela vê a
mensagem que a pessoa decidiu mandar.

**A barra não lista as peças, e isso foi correção de um defeito.** A primeira
versão listava cada peça com preço; com cinco separadas ela cresceu para 191px e
cobriu o rodapé, inclusive o aviso de que a loja é fictícia. A tentativa
seguinte — medir a altura com `ResizeObserver` — não disparou de forma
confiável nem num teste direto, porque depende de quadro de animação.

A saída veio de olhar o que já existia: **o WhatsApp mostra a mensagem inteira
antes de enviar.** A revisão do que foi separado já acontece lá, com nome e
preço. Repetir isso numa barra fixa era duplicar uma tela que a pessoa vê de
qualquer jeito, e pagar com o rodapé coberto. Sem a lista, a barra tem uma linha
e altura constante — e não há medição para dar errado.

**↔** O mecanismo (juntar itens, mandar numa mensagem, link que reabre a
seleção) vale para qualquer vitrine. O nome "separar" é de loja de roupa; numa
adega seria outro verbo.

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

## 11b. A segunda foto, e por que não é vídeo

**Vídeo foi cogitado e medido.** Um clipe de 11 segundos gravado no celular deu
**20 MB** em 1080p e **13 MB** em 720p — baixar a resolução cortou 35% e custou
metade dos pixels, o que mostra onde está o problema: é o codificador do
aparelho, que grava a ~10 Mbps independentemente do que se peça. Para escala,
13 MB é o peso de **216 fotos de peça**.

A Sanity não converte vídeo: ela serve o arquivo como foi enviado. Então as
únicas saídas eram entregar 13 MB para quem está no 4G (o celular costuma ter
de baixar o arquivo inteiro antes do primeiro quadro) ou contratar um serviço
de vídeo — e aí acaba o custo mensal zero.

**A segunda foto responde a maior parte da mesma pergunta por 1/200 do peso**, e
usa uma capacidade que já existia e ninguém estava usando: o cadastro sempre
aceitou até quatro fotos, e a página de peça sempre mostrou todas, em coluna.

**As segundas fotos aqui são recortes de detalhe da própria foto**, e isso é
limitação do material de demonstração: as fotos são de banco, e não existe uma
segunda foto da mesma peça. Numa loja real são fotos distintas — de frente, de
costas, o detalhe do tecido, a peça vestida.

**O recorte só funciona quando a foto original é de UMA peça.** Onde a foto é
uma cena — uma arara, uma parede com bolsa e chapéu — o recorte devolve outra
parte da cena, não um detalhe da peça. Por isso cinco peças continuam com uma
foto só: foi julgamento visual numa folha de contato, não regra automática. Um
catálogo em que toda peça tem exatamente duas fotos pareceria gerado; um em que
algumas têm duas parece uma loja.

**O script que subiu essas fotos NÃO é o importador.** `pnpm fotos` acrescenta
ao fim da lista com `patch`/`insert`; o importador faz `createOrReplace` e
desfaria qualquer edição feita no painel. Usar carga inicial para acrescentar
uma imagem seria trocar o conteúdo de uma loja por causa de uma foto.

**↔** A galeria em coluna e o "até quatro fotos" valem para qualquer vitrine. O
recorte de detalhe é muleta de demonstração e não sobrevive a um cliente real,
onde as fotos são feitas na loja.

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

**O prazo de um segundo não bastou, e o segundo episódio foi pior.** Já no
Cloudflare, o ciclo passou a publicar o conteúdo de ANTES da publicação que o
disparou: webhook com 200, build concluído com sucesso, e o site sempre
*exatamente uma publicação atrasado*. Medido três vezes, com o mesmo padrão.

O que tornou isso caro de achar: **localmente não reproduz.** Só acontece na
máquina de build, que restaura o `.next` do cache entre uma execução e outra. Na
caça foram descartadas, por medição, três hipóteses erradas — o CDN da Sanity, o
cache de borda do Cloudflare (uma resposta `MISS` devolveu o valor velho, o que
prova que a origem é que estava velha) e propagação lenta do deploy.

A correção é a única que não depende de entender a implementação de cache de
ninguém: **um selo com a hora entra na URL da consulta como `?tag=`, e muda a
cada processo de build.** A chave de qualquer cache de `fetch` é a URL; uma URL
que nunca se repete não tem como devolver resposta guardada. O prazo de um
segundo fica como segunda defesa.

E entrou um `console.log` com a contagem e uma amostra do que veio da Sanity.
Sem ele, a única maneira de saber o que o build leu é comparar o site com o
painel e adivinhar — foi assim que se perdeu uma noite.

**Medido depois da correção, três vezes: 60 a 62 segundos** entre publicar no
painel e a mudança estar no ar.

Vale registrar o erro de diagnóstico junto: a primeira hipótese foi o CDN da
Sanity servindo cópia velha, e ela foi descartada por medição (`curl` no CDN e
na API devolviam 18 os dois). A hipótese estava errada, mas o hábito de medir
antes de consertar foi o que evitou "consertar" a coisa errada.

**A tela de login está em inglês, e o pacote de tradução não alcança.** O
`@sanity/locale-pt-br` traduz o *Studio*; a tela de entrada é da Sanity, e vem
com "Log in to your account" e um aviso de cookies por cima. Descoberto ao abrir
`camelia.sanity.studio` num celular — não aparece de outro jeito.

Acontece uma vez: ela entra com o Google, a sessão fica salva, e o painel é
adicionado à tela inicial do celular, abrindo direto na lista de peças. Fica
registrado porque muda a entrega: esse primeiro acesso se faz **junto com ela**,
no balcão, não por instrução escrita.

**Os rótulos do painel estão no vocabulário dela** — "peça", "grade que a peça
veste", "esgotada", "entrou na loja". E as descrições de campo não explicam o
que o campo é; explicam a REGRA ("os tamanhos em que esta peça existe, NÃO
quantas você tem"). É o único lugar onde as regras de produto chegam a quem
preenche.

### O plano gratuito da Sanity cobre o projeto inteiro

Lido no comparativo de planos em 01/09/2026, com o uso medido ao lado:

| item | Free | nosso uso |
| --- | --- | --- |
| **GROQ-powered webhooks** | **2** | **1** |
| Documentos | 10.000 | ~60 hoje; ~450 com 150 peças |
| **Banda por mês** | **100 GB** | 723 KB por visita à home (medido) |
| Assets | 100 GB | ~40 MB |
| Requisições de API | 250 mil/mês | 1 por build |
| Assentos | 20 | 2 |

O webhook estar no gratuito era a dúvida que mais importava: se fosse pago, o
ciclo morreria sozinho ao fim do teste de 30 dias, e o sintoma seria o mesmo
silêncio de sempre.

**A banda dá ~141 mil visitas por mês**, ou 4.700 por dia. Uma boutique de
bairro vinda do Instagram faz duas ordens de grandeza menos.

**Com isto, o custo mensal de uma loja real é o domínio.** Cloudflare US$ 0,
Sanity US$ 0. Todos os números vêm das telas dos próprios fornecedores; a banda
por visita foi medida no site publicado.

### Quatro coisas que o gratuito impõe

1. **Só existem dois papéis: Administrador e Visualizador.** Não há "Editor".
   Para publicar, a dona precisa ser Administradora — e portanto pode também
   apagar peças e mudar configurações. Aceitável no projeto dela; inaceitável
   num projeto compartilhado. **Cada cliente precisa do próprio projeto na
   Sanity.**
2. **Não há backup, e o histórico de rascunho é de 3 dias.** Apagar quarenta
   peças sem querer não tem desfazer. É risco de entrega, não detalhe: um
   script de exportação periódica deve existir antes de qualquer entrega real.
3. **O dataset é público** — leitura sem token, rascunhos incluídos. Para uma
   vitrine, tudo o que está lá já está no site; fica registrado como aceitação
   deliberada, não como descuido.
4. O texto do plano fala em *"individuals experimenting or shipping smaller
   projects"*. Os limites técnicos cobrem com folga; a leitura comercial é o
   que não foi conferido — mesmo caso do Cloudflare.

**Terceira opção para o build agendado:** o gratuito inclui 5 Scheduled
Functions com frequência diária. Somadas ao Cron Trigger do Cloudflare e ao
GitHub Actions, são três caminhos — e nenhum foi construído ainda.

**↔** A arquitetura (Studio hospedado + webhook + build + fallback local) vale
para qualquer vitrine estática. O esquema em `studio/schemas/peca.ts` é de
vestuário e não sobrevive a outro ramo — mas o formato dele, sim.

## 13b. O filtro do catálogo

**A decisão anterior era não ter filtro, e ela caiu.** Enquanto o catálogo era
de trinta a sessenta peças, rolar era mais rápido do que escolher um critério, e
filtro parecia ferramenta de inventário grande. Com cento e cinquenta deixa de
ser: a visitante rola até desistir, e o site falha exatamente na única coisa que
existe para fazer.

**O filtro por tamanho é o que mais vale, e não é o mais óbvio.** "Tem no meu
tamanho?" é uma das três perguntas que travam a venda, e é a única que o site
consegue responder antes de a conversa começar. Categoria é conveniência; grade
é resposta.

**Só entra na lista o que tem peça agora.** As facetas são contadas em
`lib/filtro.ts` a partir do catálogo do dia, nunca das listas fechadas de
`lib/tipos.ts`. Um botão "Macacões" que devolve nada promete uma prateleira
vazia e faz a loja parecer menor do que é.

**Categoria ordena por quantidade; tamanho, nunca.** O que a loja mais tem
aparece primeiro, e a ordem se reorganiza sozinha conforme o estoque muda de
perfil. Grade tem ordem própria e fixa — "PP depois de G porque tem mais G"
seria uma ordem que muda toda semana e que ninguém percorre com o olho.

**O filtro não redesenha a lista.** As peças são geradas no build e ficam no
HTML; o componente só acende e apaga `hidden` nelas. Passar as peças como
propriedade escreveria o catálogo duas vezes dentro do HTML e jogaria fora a
foto já carregada a cada mudança. Com cento e cinquenta peças isso deixa de ser
detalhe.

**Sem JavaScript os controles não aparecem** (`[data-so-com-script]` em
globals.css) e o catálogo inteiro fica visível. Mesma escolha da revelação por
rolagem: o conteúdo nasce visível, e o script só tira coisa da frente. Mostrar
sempre e desligar por script piscaria um painel de botões mortos justamente
para quem tem a rede pior.

**A seleção vai para o endereço, e esse é o ponto.** Uma escolha vira link, e
link vira mensagem de WhatsApp: a dona manda "os vestidos que servem em você"
sem montar nada. O filtro deixa de ser ferramenta de quem visita e vira
ferramenta de quem vende.

**A categoria viaja no endereço sem acento** (`tricos`, não `tricô`). Descoberto
testando: o mesmo "ô" chega como um caractere ou como dois dependendo do
aparelho que copiou o link, e o filtro simplesmente não aplicava — sem erro, sem
aviso, a página inteira aparecendo como se ninguém tivesse escolhido nada. A
leitura aceita as duas formas, porque link é coisa que se edita no meio da
conversa.

**O custo, medido:** o bloco de filtros ocupa 243px e empurra a primeira peça
para 1,01 tela no celular. Quem domina essa altura é o cabeçalho da página, não
o filtro.

### As páginas por tipo de peça

`/pecas/categoria/vestidos`, uma por tipo que tenha peça hoje.

**Se o filtro já faz isso, por que existem?** Porque filtro não tem endereço
para o Google. Quem procura "vestido midi Santo André" precisa cair numa página
que já É sobre vestidos — com título, descrição e conteúdo sobre vestidos — e
não numa página genérica que só vira sobre vestidos depois que alguém clica num
botão. É a diferença entre o site ser **encontrado** e o site ser **navegado**,
e são coisas diferentes.

**O segmento `categoria/` no meio do endereço não é enfeite.** Sem ele,
`/pecas/vestidos` disputaria lugar com `/pecas/vestido-preto-midi` — a rota de
peça já ocupa esse nível, e o dia em que uma peça se chamasse "vestidos" seria
um defeito impossível de achar.

**Os tamanhos do filtro são os que existem dentro daquele tipo**, não a grade
inteira. Numa página de vestidos com P, M e G, oferecer "44" seria prometer
prateleira vazia.

**A descrição diz a cidade e a quantidade** ("3 peças na arara agora"). Número
em descrição é incomum, e aqui é honesto: sai do build do dia e o site se refaz
quando o catálogo muda. É também o que separa esta página de mil iguais na
busca — quantidade específica diz que existe loja de verdade atrás.

**As irmãs são links de verdade**, no fim da página. É assim que a autoridade de
uma página alcança as vizinhas, e é assim que funciona sem JavaScript. O
sitemap anuncia todas com prioridade acima da peça individual: uma página de
tipo continua verdadeira depois que a peça vence.

**↔** Filtro por grade de tamanho é de vestuário. O que sobrevive a outro ramo é
o mecanismo: facetas contadas do catálogo do dia, seleção no endereço, e
filtragem por atributo no HTML já gerado.

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

Em 31/08/2026 o ciclo inteiro está no ar e foi verificado de ponta a ponta:
publicar uma peça no painel dispara o build e a mudança aparece no site. As 18
peças da Sanity conferem uma a uma com o que o site publicado mostra.

- **Um backup do conteúdo.** O plano gratuito da Sanity não faz backup e guarda
  rascunho por 3 dias. Para a demonstração não importa; **antes de entregar a
  qualquer cliente, importa muito** — um `sanity dataset export` periódico é o
  mínimo.
- **O build agendado no Cloudflare.** A função em `netlify/functions/` é da
  Netlify. Enquanto não houver equivalente, as datas só vencem quando alguém
  publica.
- **A contagem de visita.** O `NEXT_PUBLIC_CF_BEACON_TOKEN` está vazio, então o
  contador não é escrito no HTML. A medição principal — a mensagem do WhatsApp
  com o nome da peça — funciona desde o primeiro dia.
- **O aviso de "publicando" no painel.** A Sanity não sabe o estado do build da
  Netlify; mostrar isso exige um widget no dashboard do Studio. A versão barata
  é o badge público de deploy da Netlify (um SVG, sem token) com uma frase em
  português abaixo. É trabalho real, não um campo a marcar.
- **Rodar o `contrast.mjs` no CI.**
