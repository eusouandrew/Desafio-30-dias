# Histórico de sessões

Registro do que foi decidido em cada sessão e por quê. O `CONTEXTO.md` diz
como as coisas *são*; este arquivo diz como chegaram lá, incluindo os
caminhos errados — para ninguém refazê-los.

---

## 23/09/2026 — Dois dias para publicar uma troca de preço

O commit do preço ficou pronto em 22/09 e só entrou no ar em 23/09. Nada do
atraso foi código.

### O que aconteceu

Empurrei para `eusouandrew/Desafio-30-dias`, integrei na `integracao`, vi a
Vercel construir com sucesso — e o site não mudava. Persegui o problema por
camadas: achei que era cache de borda, depois build na fila, depois integração
Git quebrada.

Identifiquei o que estava em produção comparando **hashes de bundle**: o Vite
nomeia o arquivo pelo conteúdo, então compilar um commit candidato e bater o
hash prova qual está no ar. Foi assim que descobri que produção rodava
`0a4bf7f` e que o `zbow` servia a `main` do repositório de trabalho. Técnica
que vale guardar — funciona sem acesso a painel nenhum.

A causa real: **o site publica de outro repositório**,
`desafiodawaleska/landing-page-desafio-2026`. Tudo o que eu fazia acontecia num
repositório que não alimenta o domínio.

### O erro que importa

**Isso já estava documentado.** O `DEPLOY.md` — adicionado em `be91fe2`, na
própria `integracao` que eu vinha lendo — diz o repositório oficial, a branch e
a Production Branch, tudo certo. Eu listei a pasta `docs/`, vi o arquivo e não
abri.

Li só o `CONTEXTO.md`, que dizia "dois projetos ligados ao mesmo repo, ambos
publicam da `main`" — errado e desatualizado. Dois documentos discordando, e eu
segui o que estava no arquivo marcado como "leia antes de mexer no código".

Corrigido: o `CONTEXTO.md` agora aponta para o `DEPLOY.md` em vez de descrever
o deploy por conta própria. Duplicar é como eles desandaram.

Lição: quando existe um documento dedicado a um assunto, ele vence o resumo
que outro arquivo faz do mesmo assunto. E ler o índice da pasta não é ler a
pasta.

### Efeito colateral que ninguém pediu

O push para a `main` do cliente foi fast-forward, então **levou junto toda a
`integracao`** — card de compartilhamento, correção de âncora, FAQ, Vídeo. O
cliente pediu uma troca de preço e recebeu 31 commits.

Não houve dano aparente, mas era para ter sido verificado antes. O
`CONTEXTO.md` agora traz o `git log --oneline cliente/main..HEAD` como passo
obrigatório antes de publicar.

---

## 22/09/2026 — Preço de R$297 para R$79,99

Mudança de valor pedida pelo cliente. Parecia troca de texto; exigiu recalcular
o `font-size` das três variantes.

`R$79,99` tem dois caracteres a mais e fica **32% mais largo** — medido com a
fonte real, no peso 900, que é o estado mais largo da animação `price-weight`.
Sem reduzir, o preço do desktop passaria de 655 para 852px (invadindo a foto e
quase encostando na borda do card) e o do mobile encostaria nas duas bordas.

Critério: **preservar a pegada anterior**, não preencher o espaço. No desktop o
resultado é exato — 655px, de 104 a 759 do canvas, idêntico ao `R$297`.

| | antes | agora |
|---|---|---|
| Desktop | 174,225px | 134px |
| Tablet | `clamp(74px, 13vw, 132px)` | `clamp(56px, 9.85vw, 100px)` |
| Mobile | 72px no `span` | 55px |

No tablet **não era necessário**: havia 120px de folga e o preço novo cabia sem
mexer. Reduzi para as três ficarem com o mesmo peso visual. Se um dia quiserem
o preço maior, o tablet é onde sobra espaço.

### O tropeço que vale registrar

Fiz esta mudança primeiro em cima da `loading-intro` e só descobri a branch
`integracao` — 31 commits à frente, com Vídeo, FAQ, assets em `.webp` e a
Oferta rediagramada — **depois de já ter comitado e publicado** a branch
`preco-79-99`. Lá o bloco do preço já tinha sido ampliado em 1,15x
(174,225px), então os 115px que eu havia calculado estavam calibrados contra
um layout que não existia mais.

Refiz em cima da `integracao`, medindo de novo. A branch `preco-79-99` ficou
órfã no remoto e pode ser apagada.

Lição: antes de começar, `git fetch` e olhar as branches do remoto. Eu tinha
clonado o repo no início da sessão e tratei o estado daquele momento como
atual por quase dois meses de trabalho paralelo.

---

## 28/07/2026 (noite) — Desalinhamento do desktop em tela grande

O cliente reportou o desktop "bem quebrado" depois da mudança de escala.

### A sonda primeiro

Antes de mexer, rodei contra o protótipo do desktop em coordenadas de canvas,
forçando `--vw: 1440px` para isolar a geometria da escala. **10 dos 11 pontos
com diferença zero.** O único diferente é a foto, que usa `hero-foto-wide.png`
de propósito. A estrutura não estava quebrada — o problema era só a escala.

Vale como método: a sonda evitou que eu saísse mexendo em posicionamento que
estava certo.

### A causa

`--vw` é `larguraDaJanela / escala`. Toda redução de escala infla a largura
visível em px de canvas, e o conteúdo ancorado no canvas de 1440 — que é
centralizado — não acompanha. A margem esquerda do texto ia de 9,5% para 24%.

Dois erros meus empilhados:

1. **O alvo do ajuste era a hero inteira (1024).** O CTA termina em 940 e o
   resto é fundo. Passou para 964, o que devolveu de 110 a 160px de `--vw`.
2. **O texto não acompanhava a borda.** Corrigido com `--lead`.

### `--ld-x` do loading estava errado

Achado ao derivar o `--lead`: `--ld-x` usava `var(--vw)/2` como centro da
janela. Mas na horizontal o centro é sempre o canvas 720, porque o canvas é
centralizado — `--vw/2` é a meia-largura, não a posição do centro. As duas
contas só coincidem em `--vw: 1440`, que por azar foi o único caso que testei
quando implementei o loading. Em `--vw: 2142` o erro era de **351px**.

Lição: conferir só o caso de referência não prova fórmula nenhuma. O valor de
referência é onde as contas erradas também acertam — é preciso testar pelo
menos um caso fora dele.

### Conferido

Margem do texto em 9,5% da largura visível em `--vw` 1440, 1757, 2142 e 2598.
Pouso do título do loading sobre o título real com 0px de diferença nas
quatro. Em 1440, CTA no canvas 85 e `--lead` em 0 — a referência não se mexeu.

---

## 28/07/2026 (fim do dia) — Conferência do tablet e ordem da luz

### Como conferi o tablet contra o protótipo

Screenshot não serviu: o painel do navegador do agente captura de forma
instável e chegou a mostrar a página sem preencher a largura, quando o DOM
dizia 885px em tudo. Perdi tempo tratando artefato de captura como bug.

O que funcionou foi servir o `.dc.html` do protótipo pelo próprio Vite —
copiado para a raiz do `public/`, onde os caminhos relativos (`assets/…`)
resolvem sozinhos — e rodar a mesma sonda de medição nas duas páginas, na
mesma janela, comparando retângulo a retângulo. Os arquivos temporários saíram
depois.

**Uma única diferença real em 17 pontos medidos:** o CTA da Oferta. Eu tinha
acrescentado `box-sizing: border-box`, que não está no design, e ele ficava com
68px de altura em vez de 104. Corrigido — o `min-height: 68px` mais os 18px de
padding em cima e embaixo é justamente o que dá os 104px do CTA da hero, que
usa a mesma conta. Com `border-box` os dois botões destoavam.

O botão fica 48px mais largo que a coluna de texto e avança sobre o padding do
card branco. Parece descuido do protótipo, mas é consistente com o CTA da hero
e mantém os dois iguais.

### Dois falsos positivos, registrados para não perseguir de novo

- **O anel da Oferta** media 329px numa página e 316px na outra. É o mesmo
  elemento: ele gira (`ring-spin`), e a caixa de um quadrado rotacionado muda
  de tamanho com o ângulo. A largura computada é 234px nas duas.
- **O preço** media 435 contra 428. A animação `price-weight` oscila o peso
  entre 600 e 900, e isso muda a largura do texto de 427 a 440. Os dois valores
  caem dentro da faixa.

Ao medir algo animado, congele a animação antes de comparar.

### Ordem da luz

A pedido do cliente, `luz.png` passou a vir **depois** da foto no DOM, na hero
do desktop e do tablet — a forma do canto inferior direito agora passa por
cima dela em vez de por baixo. Os quadrados soltos continuam acima da luz, que
é onde o cliente queria: entre a foto e o quadrado em outline.

O mobile não entra: aquela hero não usa `luz.png`.

Isso é desvio deliberado do protótipo, onde a luz vem antes da foto.

---

## 28/07/2026 (fim do dia) — CTA abaixo da dobra

O cliente reportou que o botão da hero só aparecia depois de rolar, e que
usuários acharam a interface grande demais.

### A causa

Não era ajuste fino de tamanho: era uma trava. O `fitHeight` do `ScaledCanvas`
só agia quando a escala já estava acima de 1 (`if (scale > 1 && ...)`) e ainda
tinha um piso em 1 (`Math.max(..., 1)`). Ou seja, a escala **nunca descia**.
Entre 1440 e 2040px de largura ela ficava fixa em 1 e a hero, rígida em 1024px
de altura.

O design tem proporção 1440x1024 (1,41). Quase toda janela de desktop é mais
larga e mais baixa que isso. Então o corte não era caso raro — pegava MacBook
Air 13" e Pro 14", que são das máquinas mais comuns.

### A correção

O ajuste por altura passou a valer nos dois sentidos, com piso em 0,62
(`DESKTOP_MIN_SCALE`), calibrado para o texto de 20px não cair abaixo de
12,4px. Como efeito, a interface encolhe entre 8% e 23% conforme a janela —
que é a "leve diminuída" que o cliente também pediu. As duas queixas tinham a
mesma causa.

Conferido em 8 resoluções: antes, três cortavam o CTA; depois, nenhuma. Em
1440x1024 a escala continua exatamente 1.

### Efeito colateral, medido antes de aceitar

Encolher a escala aumenta `--vw`, e o grid tem largura fixa em px de canvas —
logo ele passa a ocupar uma fração menor da tela. Antes de dar por resolvido,
comparei a proporção do grid antes e depois em cada resolução: a perda vai de
0 a 20 pontos percentuais, e o pior caso fica em 68% da largura. Como já
rodavam ~50% em ultrawide com aprovação do cliente, 68% não é território novo.

Foi o passo que evitou trocar um problema por outro: o grid virando box no
centro já tinha sido rejeitado uma vez.

---

## 28/07/2026 (tarde) — Tela de loading

Branch `loading-intro`. Veio de um handoff do Claude Design
(`Landing page hero 5K9 2K25-handoff.zip`).

### O que o handoff trouxe

Duas coisas, não uma: o arquivo novo do **tablet** e uma **tela de loading**
acrescentada ao desktop. Só o loading foi implementado; o tablet ficou para
depois da decisão de arquitetura (ver Pendências no `CONTEXTO.md`).

Dos 44 assets do zip, 31 já estavam no repo byte a byte — é o mesmo pipeline
que gerou `public/assets/`, então o encaixe é direto. Entrou só
`loading/fundo.png`; o título do loading reusa o `titulo.png` que já existia.

### Dois bugs que a implementação encontrou

**O loading não cobria a página.** Seguindo o protótipo, pus o loader dentro
da `<section class="hero">`. A `.hero` tem `isolation: isolate`, que cria um
contexto de empilhamento — de dentro dela nenhum `z-index` passa por cima das
seções seguintes, e a Benefícios aparecia por baixo. O loader saiu para a raiz
do canvas, depois de todas as seções. É o caso em que **não** copiar a
estrutura do protótipo era o certo.

**O CTA entrava visível.** `.hero__cta` e `.cta` (do `styles.css`) têm a mesma
especificidade e as duas declaram `animation`; a segunda vence na cascata e
apagava o `fade-rise`. Resolvido com `.cta.hero__cta`. Se aparecer de novo em
outro elemento com as duas classes, é isso.

### Erro meu, registrado de propósito

Li o gradiente bege do `loading/fundo.png` como sendo o fundo da hero e
concluí que o loader não estava pintando. Perdi duas rodadas atrás de um bug
de empilhamento que não existia ali — o loader pintava, o que faltava era
cobrir **abaixo** da hero. Bastava ter aberto o PNG antes de teorizar. Mesma
lição das "manchas escuras" da sessão anterior: olhar o asset custa segundos.

### Como conferir a intro

`--ld` multiplica todas as durações e atrasos. Subir para 10 espalha os 3s por
30s, sem mudar proporção nenhuma. Para conferir quadro a quadro, `pause()` +
`currentTime` em `document.getAnimations()` e leitura do `getComputedStyle` —
**não** confie no screenshot com as animações pausadas: opacidade roda no
compositor e a captura sai dessincronizada da linha do tempo.

Conferido: em 1440x1024 o `--ld-x`/`--ld-y` dão 218,5 e 89, os valores fixos
do design; no pouso, o título do loading e o real coincidem com 0px de
diferença nos quatro lados; os 11 elementos da hero saem de 0 e chegam a 1.

### Mudança que pegou carona

O handoff trocou o peso do "O desafio que muda…" de 500 para 600. A largura
da linha foi de 476 para 478px e a tabela do `CONTEXTO.md` foi corrigida.

### Depois: o tablet

Implementado na sequência, fluido como veio no design — a primeira das três
versões que não usa o `ScaledCanvas`.

A decisão que faltava era até onde ele vai. As duas opções tinham custo:
parar em 1024 deixa a faixa de 1024 a ~1440 como desktop encolhido; ir até
~1280 faz o `max-width: 1024px` do design travar e reaparecerem as barras
laterais do `#160100` — justamente o bug da sessão anterior. **O cliente
escolheu parar em 1024**, aceitando o desktop encolhido acima disso.

Duas coisas foram implementadas diferente do protótipo, de propósito:
moldura e degradê da Benefícios em CSS (esticar `borda.png` a 100%x100%
engrossa o traço na horizontal), e `ResizeObserver` em vez de evento de
`resize` para medir o trilho do carrossel.

---

## 28/07/2026 — Responsividade em telas largas

Commits `6eabad7`, `ff4bfe1`, `b3c693d`, `3b4c06b`. Integrados na `main` e
publicados em produção.

### O problema de origem

Em monitor largo apareciam barras escuras nas laterais. Duas causas
empilhadas: o canvas centralizava uma caixa de 1440px e deixava o
`background` do `body` exposto, e toda seção tinha `overflow: hidden` em
1440px, então recortaria qualquer sangria de volta.

Resolvido com as faixas de sangria descritas no `CONTEXTO.md`.

### Ajustes pedidos depois, em ultrawide 2560x1080

1. **CTA fora da tela.** A hero ficava com 1285px de altura. A escala
   passou a respeitar a altura da janela quando amplia.
2. **Grid virando um box no centro.** Ele tinha 1271x855 parado no meio do
   canvas. Testei espalhar de ponta a ponta e **o cliente rejeitou** —
   preferiu contido, que lê como margem intencional. Voltou ao original.
3. **Moldura da Benefícios presa aos 1440.** Virou borda CSS de ponta a
   ponta, e o degradê virou `radial-gradient` ajustado numericamente.
4. **Anel da Oferta deixando de cruzar a foto.** Eu tinha ancorado na
   borda da tela; passou a acompanhar a foto.

### Erros meus, registrados de propósito

**Diagnóstico errado das "manchas escuras".** O cliente reportou áreas
mais escuras nas pontas. Concluí que eram os lóbulos externos do "W" do
`Logo-fundo` sendo revelados pela faixa mais larga, e reescrevi o fundo com
base nisso. Estava errado. Quando finalmente **medi** as descontinuidades
nas camadas de fundo, nenhum salto passava de 0,7/255 — não havia estrutura
nenhuma ali.

A causa real: `logo-fundo.png` é semitransparente e a cor de base creme
estava na `<section>` de 1440px. Fora dela, a transparência caía sobre o
`#160100` do body, desenhando um retângulo em canvas 0..1440. O cliente
vinha apontando isso desde o início — primeiro pelas duas bordas
verticais ("na esquerda e na direita"), depois pela região inteira.

Lição: eu me convenci de uma explicação plausível antes de medir. A
medição levou dois minutos e teria economizado dois commits.

A mudança de não revelar mais arte (esticar o recorte de 1440 em vez de
expor o que estava cortado) ficou de pé por ser mais previsível, mas não
era ela que resolvia o problema relatado.

**Grid em `repeating-linear-gradient`.** Tentei desenhar as linhas em CSS.
Com origem fracionária, ~17 repetições e escala não inteira, as linhas caem
em pixels quebrados e saem com espessuras irregulares — o cliente chamou de
"porca", com razão. Se precisar disso de novo, use o PNG do desenho
original: o anti-aliasing já vem embutido.

### Bug encontrado no caminho

Quando a barra de rolagem aparece, ela come ~15px de `clientWidth` **sem
disparar `resize`**. A faixa ficava larga demais e jogava a moldura 7,5px
para fora da tela de cada lado. Corrigido com `ResizeObserver`.

### Assets

Saíram: `hero-fundo-wide.png`, `hero-luz-wide.png`, `gradiente-wide.png`,
`grid-tile.png` — todos tentativas abandonadas. Entrou:
`hero-foto-wide.png`, que é a foto da hero com mais corpo, necessária para
ela continuar encostada na borda direita em telas largas.

### Onde paramos

Desktop e ultrawide fechados e em produção. O próximo assunto é o
**mobile**, que o cliente considera a principal porta de entrada e quer
refazer. Falta a decisão dele: partir dos 390px que já existem ou
rediagramar no Claude Design.
