# Contexto do projeto — Landing "Desafio da Waleska / 30 dias"

Documento de handoff. Leia antes de mexer no código: registra as decisões
já tomadas e o porquê delas, para não serem desfeitas por engano.

Última revisão: 06/08/2026.

## O que é

Landing page de campanha, implementada em React + Vite a partir de
protótipos feitos no Claude Design (claude.ai/design). Os protótipos são a
fonte da verdade do visual e estão em `design/`.

Repositório: `eusouandrew/Desafio-30-dias` · Deploy: Vercel (dois projetos
ligados ao mesmo repo, `desafio-30-dias` e `desafio-30-dias-zbow`; ambos
publicam da `main`).

## Estrutura

```
src/
  App.jsx              escolhe o layout conforme a largura da janela
  ScaledCanvas.jsx     escala um canvas de largura fixa para caber na tela
  styles.css           @font-face + animações compartilhadas
  sections/            desktop, canvas de 1440px
                       ordem, nas três versões: Hero, Benefícios, Vídeo,
                       Trajetória, FAQ, Oferta
  sections/Loading.jsx tela de abertura (fora da hero — ver seção própria)
  sections/tablet/     tablet, 768–1024, fluido (não usa ScaledCanvas)
  sections/mobile/     mobile, canvas de 390px
public/assets/         imagens da identidade visual
public/fonts/          Red Hat Display variável (WOFF2)
design/                protótipos .dc.html do Claude Design + transcrições
docs/                  este arquivo, o histórico de sessões e o inventário
                       da arte-fonte
```

Fora do repositório, em `../arte-fonte/`, fica o export por camadas do
design — a origem das imagens de `public/assets/`. O `ARTE-FONTE.md` mapeia
o que já foi importado e o que sobrou, e registra que essa pasta **não é
versionada**: é a única cópia local dos originais em alta.

## Decisões que têm motivo

**Canvas de largura fixa + `transform: scale()`, não layout fluido.**
O design foi feito em 1440px com posicionamento absoluto, e a arte depende
de sobreposições precisas (grid, luz em `multiply`, quadrados ancorados nas
células do grid). Redigramar com flex/grid quebraria a composição. O
`ScaledCanvas` encolhe o canvas inteiro proporcionalmente.

**Faixas de sangria acompanhando a janela.** Cada seção desktop pinta uma
faixa (`.<secao>__bleed`) que vai de ponta a ponta da tela, centrada no
canvas. Sem ela sobrava o fundo do `body` nas laterais em telas largas.
A largura visível em px de canvas é exposta pelo `ScaledCanvas` na variável
CSS `--vw`.

**Atenção à âncora — é fácil errar aqui.** O canvas de 1440 é *centrado* na
janela, então a coordenada do design já está centrada. Só quem precisa de
`--vw` é o que tem de alcançar ou acompanhar uma borda da tela:

```css
/* borda esquerda da tela (é onde toda faixa de sangria começa) */
left: calc(720px - var(--vw) / 2);

/* preso à borda direita: fica sempre a (1440 - x) da direita visível */
left: calc(<x>px + var(--vw) / 2 - 720px);

/* centrado: a coordenada do design, sem conta nenhuma */
left: <x>px;
```

A segunda fórmula é a da foto da hero, que é ancorada à direita. Aplicá-la a
um bloco centrado empurra tudo para a direita conforme a tela cresce — foi
exatamente o erro que cometi ao montar Vídeo e FAQ, e a medição pegou: num
ultrawide de 2560 a margem esquerda deu 1178px contra 246px na direita.
Antes de escolher, pergunte de qual borda aquele elemento depende.

Em 1440 todas essas contas devolvem os valores originais do design — é o
critério que uso para saber que não quebrei nada.

**Toda faixa precisa da cor de base da seção.** Vários assets são
semitransparentes (`logo-fundo.png` tem alfa ~57/255 nas pontas), então
compõem sobre o que estiver atrás. Enquanto a cor de base ficou na
`<section>`, que tem 1440px, tudo fora dessa largura compunha sobre o
`#160100` do body e desenhava um retângulo visível em canvas 0..1440.
**Se criar uma faixa nova, ponha a cor de base nela, não na section.**

**A escala trava em 1 até a sangria cobrir a janela.** Acima de
`DESKTOP_BLEED` (2040px) ela volta a crescer. Ampliar antes disso borraria
os PNGs à toa.

**A escala respeita a altura da janela nos dois sentidos.** `fitHeight` é a
altura da hero (1024). A escala nunca deixa a hero passar da altura da tela,
seja encolhendo, seja limitando o quanto ela cresce.

Isso já valia para cima — em ultrawide 2560x1080 a hero ficava com 1285px e o
CTA caía fora. Mas até 28/07 **não valia para baixo**: havia um piso em 1, e
entre 1440 e 2040px de largura a hero ficava travada em 1024px de altura. Como
quase toda janela de desktop é mais larga e mais baixa que a proporção
1440x1024 do design, o CTA caía abaixo da dobra em máquinas comuns — MacBook
13" e 14" incluídos.

O piso agora é `DESKTOP_MIN_SCALE` (0,62), calibrado pela legibilidade: abaixo
disso o texto de 20px da hero cairia de 12,4px. Em janela mais baixa que isso,
a página volta a rolar — é o limite onde encolher custa mais do que vale.

**O alvo do ajuste é 964, não 1024** (`HERO_FIT_HEIGHT`). O CTA termina em 940
no canvas e os 84px restantes até o fim da seção são só fundo — exigir a hero
inteira encolhia mais do que o necessário. E encolher tem preço: `--vw` é
`larguraDaJanela / escala`, então **toda redução de escala infla a largura
visível em px de canvas**, o desenho se espalha e o conteúdo se afasta das
bordas. Mirar em 964 devolve de 110 a 160px de `--vw` conforme a janela, sem
custar o CTA (sobram 20 a 24px de folga).

Se for mexer na escala de novo, olhe o `--vw` resultante junto: é ele, não a
escala, que diz o quanto a composição vai esticar.

**O bloco de texto da hero acompanha a borda visível (`--lead`).** Ele estava
ancorado no canvas de 1440, que é centralizado, então não acompanhava o
crescimento do `--vw`: a margem esquerda ia dos 9,5% do design a 24% em tela
grande e o bloco ficava encalhado no meio, com uma faixa vazia à esquerda.

`--lead` (definida no `styles.css`) desloca kicker, título, "30 dias", texto
de apoio e CTA — todos pelo mesmo valor, para o bloco se mover inteiro e as
posições relativas entre eles não mudarem. A margem fica em 9,5% da largura
visível em qualquer janela. O coeficiente 583/1440 é exato (583 = 720 − 137),
então em `--vw: 1440` a conta dá 0 e o design de referência não se mexe.

O grid e os quadrados **não** recebem `--lead`: eles seguem contidos e
centrados, que é o que o cliente aprovou. O CTA deixa de se alinhar à borda
esquerda do grid acima de 1440, o que é aceitável — o grid é textura de fundo.

**O título do loading usa o mesmo `--lead`**, senão não pousaria sobre o
título de verdade.

Em 1440x1024 a conta devolve escala 1, então o design de referência não mudou.

Efeito colateral conhecido: encolher a escala aumenta `--vw`, e o grid, que
tem largura fixa em px de canvas, passa a ocupar uma fração menor da tela.
Medido, a perda vai de 0 a 20 pontos percentuais conforme a janela, e o pior
caso (68%) ainda fica bem acima dos ~50% que já rodavam em ultrawide antes da
mudança. Não é regressão — é mais do mesmo que já estava aprovado.

**O fundo da hero é o recorte de 1440 esticado, não uma versão estendida
do asset.** O `Logo-fundo` é o "W" da marca desfocado; alargar o recorte
revelaria os lóbulos externos dele, arte que sempre esteve fora do corte.
Esticando, a borda da janela mostra sempre o mesmo tom que a borda do
design aprovado. Como o degradê é difuso, o alongamento não se percebe.

**O grid da hero é contido, em 85..1356 do canvas.** Foi testado se
espalhar de ponta a ponta e o cliente rejeitou — limitado lê como margem
intencional. Fica em px de canvas, sem esticar junto com o fundo: a célula
de 141 x 142,5 é estrutural, é nela que os quadrados soltos se encaixam.

**Breakpoint em 768px** (`MOBILE_BREAKPOINT` no `App.jsx`). Abaixo disso
entra o canvas de 390px, que é uma re-diagramação real feita no design, não
o desktop encolhido: a 390px o texto de 20px viraria 5px.

**`clientWidth` + `ResizeObserver`, não `innerWidth` + `resize`.**
`innerWidth` conta a barra de rolagem. E quando a barra aparece ela come
~15px de `clientWidth` **sem disparar `resize`** — a faixa ficava larga
demais e jogava a moldura para fora da tela.

**Fonte variável servida localmente, não Google Fonts.** A animação do preço
(seção Oferta) interpola o peso de 600 a 900 continuamente — pesos estáticos
travariam em degraus. Os WOFF2 em `public/fonts/` têm eixo `wght` 300–900.
`OFL.txt` acompanha por exigência da licença.

**`build.assetsDir = 'build'` no `vite.config.js`.** Separa o bundle
compilado (nome com hash, cacheável para sempre) das imagens em
`public/assets/`, que são substituídas mantendo o mesmo nome. Sem isso não
dá para cachear um sem congelar o outro. O `vercel.json` depende dessa
separação.

**Moldura e degradê da seção Benefícios são CSS, não PNG.** Como PNG de
1440px fixos eles não acompanhavam a tela. A moldura é `border: 20px solid
#ff2801` (medido do PNG original). O degradê é um `radial-gradient` com
elipse no meio de baixo, raios e rampa ajustados numericamente contra o
`gradiente.png` — erro médio de 1,1/255 por canal. Os raios são
percentuais, então o brilho se espalha junto com a tela.

**O anel giratório da Oferta acompanha a foto, não a borda da tela.** É o
cruzamento do texto sobre ela que precisa se manter igual em qualquer
largura. Para isso a composição da Oferta é fluida: o card estica, a foto
fica ancorada na direita com a mesma folga de 68px, o bloco de texto segue
o card e o anel segue a foto.

**Tracking calibrado por medição.** Os textos da hero foram ajustados para
bater com a arte de referência. Medidas conferidas no navegador, com a
fonte real, descontando o letter-spacing que o CSS aplica após o último
caractere:

| Texto | Largura |
|---|---|
| Sem fórmula mágica! | 350px |
| Apenas hábito & constância | 487px |
| O desafio que muda… (3 linhas) | 478px |
| Quero participar | 357px |

Se mexer em `font-size`, `letter-spacing` **ou `font-weight`** na hero, re-meça.
O peso conta: o handoff de 28/07 trocou o "O desafio que muda…" de 500 para
600 e a linha mais larga passou de 476 para 478px.

Para medir, use um `Range` sobre o nó de texto, não o `getBoundingClientRect`
do elemento — os `span` do kicker são `display: block` dentro de um `<p>` de
620px, então a caixa devolve 620 e não a largura do texto.

## Trocar as fotos do carrossel

São **6 pares** de fotos reais, em `public/assets/s3/`, nomeados
`antes-1.webp` … `antes-6.webp` e `depois-1.webp` … `depois-6.webp`. A
ordem é sempre antes → depois.

Exportados em **646×896** — 2× o card do desktop (323×448, retrato
~1:1,39). O card do mobile é 230×341, um pouco mais estreito, e o CSS
recorta a diferença. WebP em qualidade 82: as 12 somam 652 kB, contra
~30 MB dos originais.

**O carrossel só alterna antes → depois; não são pares da mesma pessoa.**
Vale registrar porque é o contrário do que o nome sugere, e eu já travei uma
vez tentando casar quem era quem antes de trocar as fotos.

Regra do recorte, que depende da proporção da fonte:

- **Fonte mais larga que o card** → corta a largura **pelo centro**. É o caso
  das fotos que o cliente já enquadrou: mexer na vertical desfaria o trabalho
  dele.
- **Fonte mais alta que o card** → corta a altura **pelo topo**. Cortar por
  baixo tira pé e chão; cortar centrado comeria parte da cabeça. Em foto de
  antes/depois o que importa é o tronco, e a cabeça ancora a leitura.

Os slots 1 (`antes-1` e `depois-1`) são as duas fotos que vieram do design, e
o cliente pediu para mantê-las. Elas vêm de fontes de 210×430 e sobem 3× para
caber no card, então ficam visivelmente mais moles e com enquadramento mais
fechado que as outras cinco.

Para mudar a quantidade de pares, editar a lista `SLIDES` nos **três**
arquivos: `Trajetoria.jsx`, `tablet/TrajetoriaTablet.jsx` e
`mobile/TrajetoriaMobile.jsx`.

**HEIC do iPhone não passa pelo sharp.** O libheif barra por limite de
segurança ("Number of references in iref box exceeds the security
limits") — são arquivos com muitas referências internas. O decodificador
do Windows lê sem reclamar; o caminho é converter para PNG via WIC
(`System.Windows.Media.Imaging.BitmapDecoder` no PowerShell) antes de
entregar ao sharp.

## Animações (as duas versões)

Brilho metalizado varrendo o título e o "30 DIAS"; tremida constante nos
CTAs, com hover invertendo as cores; fade individual dos quadrados soltos
(cada um com duração e delay próprios); marquee infinito; carrossel que
expande o card central, segura 2s e fecha; parallax na foto da Oferta;
peso do preço oscilando entre 600 e 900.

## Tablet (768–1024) — a exceção à regra do canvas

**É a única das três versões que não usa canvas de largura fixa.** O design
veio fluido: 69 `clamp()`, 54 `vw`, `min-height: 100svh`, flex e grid, contra
236 medidas em px e 55 `position: absolute` do desktop. Não passa pelo
`ScaledCanvas`, não tem faixa de sangria e não usa `--vw`.

Fica em `src/sections/tablet/`, com as classes em `-t` (`.hero-t`,
`.beneficios-t`…), como o mobile usa `-m`.

**Por que para em 1024.** É o `max-width` do container no design. Fechando a
faixa exatamente nele, o limite nunca chega a travar dentro do intervalo — o
layout sempre preenche a janela e não sobra barra lateral do `#160100`. O
custo é a faixa de 1024 a ~1440 continuar como desktop encolhido. Foi escolha
do cliente, entre as duas.

**Os quadrados soltos ficam em % da caixa do grid**, não do canvas. A caixa
tem `aspect-ratio: 1271/855` fixo, então a grade não deforma e os quadrados
continuam caindo nas células — é o que substitui o canvas fixo aqui.

**Moldura e degradê da Benefícios são CSS, como no desktop.** O protótipo
estica `borda.png` e `gradiente.png` a 100%x100%, mas esticar a moldura deixa
o traço mais grosso na horizontal que na vertical. A borda usa
`clamp(11px, 1.39vw, 14px)` — 1,39% é a proporção dos 20px do desktop.

**A tabela de larguras calibradas não vale aqui.** O texto reflui
(`max-width: 22ch`, sem `nowrap`) em vez de ter as quebras na mão, e o CTA se
dimensiona pelo conteúdo em vez de ser uma caixa de 424x143.

A largura do card do carrossel sai de `min(300, max(186, largura * 0.31))`,
medida do próprio trilho com `ResizeObserver`. Tudo que era medida fixa no
desktop virou razão sobre os 329px do card original.

## Tela de loading (só desktop)

Abertura de 3s: o título entra pequeno no centro da janela, estoura, assenta
e nos últimos 8% viaja até a posição exata do título da hero, onde o de
verdade assume. Os elementos da hero entram escalonados atrás, de 1,95s a
2,58s.

**Tudo passa por `--ld`**, que vale 1 com a intro ligada e 0 sem ela. Durações
e atrasos são `calc(<valor> * var(--ld, 1))`, então com 0 a duração vira 0s,
o preenchimento `both` aplica o estado final e a página aparece direto — sem
sobrar nem o deslocamento de 14px do `fade-rise`. É o mesmo mecanismo do prop
`showLoading` do protótipo.

**O componente fica fora da `<section>` da hero**, na raiz do canvas e depois
de todas as seções. A `.hero` tem `isolation: isolate`, que cria um contexto
de empilhamento: de dentro dela, nenhum `z-index` passa por cima das seções
seguintes, e a Benefícios aparecia por baixo do fundo do loading. Foi por isso
que ele saiu de lá.

**O fundo cobre a janela, não o canvas.** Usa `--vw` e `--vh` (esta última
adicionada ao `ScaledCanvas` para isso). Só a altura da hero não bastaria: em
janela alta — 1280x1024, por exemplo — os 1024px de canvas não chegam a
preencher a tela. `position: fixed` não serve como alternativa, porque o
`transform: scale()` do canvas vira bloco de contenção e o `fixed` passaria a
se ancorar nele.

**A intro não roda com `prefers-reduced-motion: reduce`** — são 3s de tela
cheia antes do conteúdo, exatamente o caso que a preferência existe para
evitar. Também não roda no mobile: o design mobile veio sem ela.

A rolagem fica travada durante os 3s (`App.jsx`). Sem isso, rolar no meio da
abertura passa por baixo do fundo, que é ancorado no topo do canvas.

O `--ld` serve de câmera lenta para conferir: subir para 10 espalha a intro
por 30s sem mudar proporção nenhuma.

## A seção FAQ

**O protótipo não é a fonte da verdade aqui — o mockup é.** O handoff traz
`uploads/P4-4.png`, o desenho original da seção em 1440×1024, e ele não bate
com o `.dc.html` em três pontos. Quem manda é o mockup:

| | protótipo | mockup (usado) |
|---|---|---|
| topo do "FAQ" | 118 | **125** |
| topo do título | 158 | **157** |
| caixa | 282, altura 642 | **268, altura 656** |

Os 125 não são arbitrários: é o topo do **retângulo** da foto. O asset tem
889px de altura, mas os primeiros 90 são só o cabelo dela sobre fundo
transparente — o retângulo só começa em 35+90. Alinhar pelo topo do arquivo
deixa a tag flutuando 90px acima do que se vê. A caixa, do outro lado,
termina rente ao pé da foto (924 nos dois).

No CSS o alvo é a **tinta** da letra, não a caixa de linha: os 2,5px de
desconto em `.faq__col` são entrelinha + a diferença entre a ascendente da
fonte e a altura de caixa-alta.

Cuidado com `text-indent` em título de duas linhas: ele só afeta a primeira,
então "PERGUNTAS" saía deslocado e "FREQUENTES" não. O protótipo usa o indent
para compensar o tracking de textos centralizados; aqui o texto é alinhado à
esquerda e ele não tem função.

### A fita de texto sobre a foto

Corre pela hélice de `faq-helice.js` (que veio do handoff e está correta —
conferi sobrepondo o traçado à fita extraída do mockup). O resto foi medido:

- **corpo 24, peso 500** para "DESAFIO DA WALESKA"
- **peso 800** para "30 DIAS", igual ao anel giratório da Oferta
- **tracking 10,8**, branco

Como medi, caso precise refazer: recortei a região da foto no mockup e
subtraí o asset limpo — a diferença é a fita. Filtrei os blocos com forma de
letra (o diff também pega o contorno do corpo dela e da cerca). Daí saem duas
grandezas que não dependem de rotação nem da fase da animação: a **área de
tinta de cada letra**, que dá o corpo e o peso comparando com a fonte
renderizada em canvas, e o **passo centro-a-centro entre letras vizinhas**,
que dá o tracking.

Não tente casar por sobreposição de pixels ao longo de todo o traçado: 1% de
erro no tracking vira 19px de deriva no fim dos 1880px da hélice, e a
sobreposição despenca mesmo com os parâmetros certos. Foi o caminho que
tentei primeiro e ele apontava justamente para os valores errados.

### A máscara: a fita passa atrás dela

O protótipo escondia o texto com quatro elipses, e elas erravam nos dois
sentidos — comiam letra sobre o fundo e deixavam letra em cima do braço, da
mão e da coxa dela. Hoje a máscara é a **silhueta real**, em
`public/assets/s4/mascara-corpo.webp` (2 kB), gerada por
`tools/mascara-faq.mjs`. Branco = a fita aparece; preto = ela está na frente.

Duas armadilhas que o script documenta, e que qualquer refação vai reencontrar:

- **Segmentar só por cor não funciona.** O braço esquerdo dela encosta na
  sombra da montanha e os dois são praticamente pretos; os arbustos ao sol
  têm exatamente a luminância e a temperatura da pele. Por isso o script tem
  dois contornos traçados à mão que limitam onde a segmentação pode crescer —
  e o braço esquerdo fica num contorno **separado e estreito**, senão a mancha
  vaza para os arbustos e come o "DESAFI" que o design mostra ali.
- **Buracos internos precisam ser preenchidos de verdade** (inundação a partir
  da borda), não só com fechamento morfológico: um brilho na manga abria um
  vão de ~20x25px por onde a letra reaparecia sobre o ombro.

A máscara sai em metade da resolução e desfocada de propósito: não há detalhe
a perder e o SVG a estica de volta com suavização. Em tamanho cheio o PNG
dava 44 kB.

## O acordeão do FAQ

**Só o desktop tem a caixa de altura fixa.** Tablet e mobile usam
`AcordeaoFaq.jsx`, onde a caixa simplesmente cresce ao abrir. O truque da
altura fixa existe porque no desktop a caixa divide a linha com a foto e as
duas terminam juntas; empilhado não há nada para casar, e espremer nove
perguntas mais uma resposta num quadro fixo deixaria o texto pequeno demais
para o celular. A troca compensa: com a caixa crescendo, **as nove respostas
cabem inteiras** no mobile, contra duas que rolam por dentro no desktop.

Também compartilhados pelas três versões: `FitaFaq.jsx` (foto + fita, com o
SVG de viewBox fixo escalando junto com o contêiner) e `usar-player.js` (o
play/pause do vídeo). Aqui eu fujo de propósito da regra da casa de duplicar
por breakpoint — o carrossel duplica porque a lógica muda de verdade entre as
versões, mas essas três são idênticas, e três cópias só criariam três lugares
para desencontrar.

No desktop a caixa tem altura fixa e **nunca cresce**: 656px, menos 4 de
borda e 32 de padding, sobram 620px de interior. Quem se ajusta são as linhas.

Fechado, as 9 perguntas dividem o interior em partes iguais (57,3px cada,
com 13px de intervalo). Aberto, a escolhida fica com 57px de pergunta mais
a altura real da resposta, e o que sobra é repartido entre as outras oito —
que encolhem até um piso de 19px, ainda mostrando a pergunta. Nos dois
estados a coluna soma exatamente 620.

Duas armadilhas, ambas herdadas do protótipo e mantidas de propósito:

- A altura da resposta é medida **no clique**, não na montagem. Medir antes
  da fonte carregar guarda um valor errado; há também uma renderização extra
  depois do `document.fonts.ready`.
- As perguntas são de linha única com reticências (`text-overflow`). Se
  quebrassem em duas linhas, a altura sairia da conta e a caixa estouraria.

Com a fonte em 16px (decisão do cliente, o design vinha com 13), **duas das
nove respostas não cabem** e rolam dentro do painel — as duas listas mais
longas, que pedem 383 e 429px contra 307 disponíveis. É o que o `overflowY:
auto` condicional cobre. Se incomodar, as saídas são aumentar a caixa (mas
ela já fecha rente ao pé da foto) ou encurtar esses dois textos.

## Preço — mudar o valor quase sempre mexe no `font-size`

O preço vive em quatro lugares: `PRICE` em `Oferta.jsx` e em
`mobile/OfertaMobile.jsx`, e dois `<span>` em `tablet/OfertaTablet.jsx` — o
segundo é a camada do brilho, que repete o texto.

A caixa é apertada por desenho e a fonte é enorme, então **poucos caracteres a
mais estouram o espaço**. Em 22/09 o valor passou de `R$297` para `R$79,99` —
dois caracteres a mais, **32% mais largo** — e os três tamanhos caíram:

| | antes | agora | o que limita |
|---|---|---|---|
| Desktop | 174,225px | 134px | o recorte da foto, que começa em 719 do canvas |
| Tablet | `clamp(74px, 13vw, 132px)` | `clamp(56px, 9.85vw, 100px)` | nada: cabia sem mexer, reduzido só por consistência |
| Mobile | 55px no `span` (era 72) | 55px | as bordas do card, em 34..356 do canvas |

O critério foi **preservar a pegada anterior**, não preencher o espaço: em
todas as três o preço novo ocupa a mesma largura que o antigo ocupava. No
desktop isso é exato — 655px, de 104 a 759 do canvas, igual ao `R$297`.

Duas armadilhas ao remedir:

- **Meça no peso 900.** A animação `price-weight` oscila o peso entre 600 e
  900 e isso muda a largura do texto em ~3%. Congele a animação antes.
- **O mobile tem dois `font-size`.** O contêiner fica em 68px (é ele que dá a
  `line-height` e a altura da caixa) e o `span` sobrescreve. Mexa no `span`.

As `line-height` ficam nos valores antigos de propósito: as caixas são flex
com `align-items: center`, então o texto menor se centraliza sozinho e o ritmo
vertical não muda.

**Os protótipos em `design/` continuam com `R$297` e os tamanhos antigos.**
São export do Claude Design, não código: editá-los aqui seria desfeito no
próximo handoff. Uma sonda comparando a Oferta contra o protótipo vai acusar
diferença no preço — **é esperado, não é regressão**. O valor precisa ser
trocado no Claude Design.

## Como verificar mudanças de responsividade

O que pegou os bugs reais foi medição, não olhar. Duas técnicas:

**Sondagem de bordas.** Para cada seção, `document.elementFromPoint` nas
colunas x=1 e x=largura-2, em cinco alturas. Se alguma devolver `null`,
existe um vão. Confere também `scrollWidth > clientWidth` para scroll
horizontal.

**Geometria de ultrawide em escala reduzida.** O painel de browser do
agente não passa de ~1060px, então não dá para *ver* 2560 diretamente.
Injetar um `<style>` forçando `--vw` e o `transform: scale()` do canvas
interno reproduz a geometria de qualquer monitor num tamanho que cabe no
painel — e com `translateX` dá para inspecionar uma faixa em 1:1. Foi
assim que apareceram a emenda de uma coluna replicada e a irregularidade
das linhas do grid.

Larguras usadas como referência: 1440, 2545, 3425 e 375.

## Pendências

- **Faixa de 1024 a ~1440** — continua sendo o desktop encolhido, sem
  diagramação própria. É a contrapartida aceita ao fechar o tablet em 1024
  (ver abaixo); foi decisão do cliente, não esquecimento.
- **Mobile** — o cliente considerou a versão de 390px fraca e quer refazer.
  É a principal porta de entrada do projeto. Falta decidir se parte do que
  existe ou rediagrama no Claude Design, e quais seções entram.
- **Favicon** — não existe; o navegador pede `/favicon.ico` e recebe 404.
  É o único erro de console. Aguardando o ícone da marca.
- **Arquivo do vídeo** — a seção Vídeo está montada nas três versões e o
  player funciona, mas não há MP4. Sem fonte ela fica no estado de repouso
  (quadro laranja com o play desenhado, sem interação). Para ligar, basta
  apontar `VIDEO_SRC` em `src/sections/video-fonte.js` — um lugar só para as
  três versões.
- **Resolução do par 1 do carrossel** — mantido a pedido do cliente. As duas fotos-modelo originais são
  210×430 e sobem 3× para caber no card, então ficam visivelmente mais
  moles que os outros cinco pares, que descem de ~2268px. Trocar assim que
  houver o original em alta.
- **Fotos horizontais sobrando** — `LP/S3/` tem `Depois-20` a `Depois-41`
  em paisagem (até 7728×5152), sem par de "antes". Ficaram de fora do
  carrossel, que é retrato. Candidatas à Seção 4.
- **`ctaHref`** — sai de `src/config.js`. Enquanto `CHECKOUT_URL` estiver
  vazio, os nove CTAs rolam até a seção Oferta, que agora carrega o
  `id="inscricao"` nas três versões. Antes disso a âncora não existia em
  lugar nenhum e todos os botões da página eram links mortos. Para ligar o
  checkout de verdade, basta preencher `CHECKOUT_URL` — um lugar só.
- **`titulo.png`** — é o único PNG pesado que sobrou em `public/` (212 KB) e
  é baixado duas vezes, como `<img>` e como `mask-image` do brilho. Não foi
  convertido para WebP junto com os outros por causa do uso em máscara;
  vale medir antes de trocar.

## Imagens

A arte de origem é PNG, mas o que vai para o ar é WebP: a conversão dos oito
arquivos mais pesados cortou 5,16 MB (81%) do peso da página — de 6,23 MB para
1,92 MB baixados no desktop. Os PNGs originais continuam versionados em
`arte-original/`, fora de `public/` para não subirem no deploy; são a fonte
para regerar os WebP se a qualidade precisar de ajuste.

Imagens abaixo da dobra levam `loading="lazy"`. Hero e Loading ficam de fora
de propósito: são a primeira tela, e adiar a foto principal atrasaria o LCP
em vez de melhorar.

## Domínio e SEO

`VITE_SITE_URL` no `.env` é o único lugar com o domínio. Dele saem o
`canonical`, as tags Open Graph e Twitter e o JSON-LD do `index.html`, mais o
`robots.txt` e o `sitemap.xml`, que o `vite.config.js` gera no build em vez de
existirem como arquivos estáticos — assim não há como um deles ficar apontando
para um domínio antigo.

O card de compartilhamento é `public/og.jpg`, montado a partir dos assets da
hero. Regerar se a arte da campanha mudar.

## Fluxo de trabalho

Novas seções nascem no Claude Design, **nas duas larguras** (1440 e 390).
O export do Design entra em `design/`, e daí é implementado no React.

Deploy: a `main` publica em produção automaticamente. O combinado é
trabalhar em branch, conferir a preview que a Vercel gera para ela e só
então integrar na `main`.

Para uma sessão de agente ter acesso de escrita ao repositório, ela precisa
ser iniciada **a partir do repositório** — sessões abertas de outra origem
conseguem ler, mas não dar push.
