# ARTOOLS Precision Series

Single-page site for one product: the Artools Precision Pen. It is a display
piece — everything is rendered at build time, nothing fetches data, no form
submits anywhere. What the page does is present an object, and it does that
through scroll-driven motion.

---

## The page

Five folds, stacked in [app/page.tsx](app/page.tsx), with the navbar and the
footer living in the layout so they frame the whole scroll.

**Hero.** A product video that is scrubbed, not played. The section pins to the
viewport and the scroll position writes `video.currentTime`, so scrolling down
advances the pen and scrolling up rewinds it — about 320% of scroll distance
spread over roughly 2.7 seconds of usable footage, which is what makes the
motion read as handling the object instead of watching a clip. The headline is
cut in three lines, two of them filled with a photograph clipped inside the
letterforms, the photo offset line by line so the three crops continue one
another as a single image. On phones the text and the video hand off: the fold
opens as type, and the first half of the scroll lifts the copy out while the
video fades in.

**Technology.** What the pen is made of. Photograph on the left with instrument
readouts overlaid, numbered list on the right, and a giant outlined `PRECISION`
watermark bleeding off the right edge with parallax. A scanning sweep crosses
the photo — the `.beam-button` highlight rotated 90°.

**Ticker.** A thin marquee between the two heavy folds, half qualitative and
half spec, running on CSS alone and pausing on hover. No JavaScript ships for
it.

**Experience.** What writing with it feels like. Three cards in a grid with no
gutter — divided by 1px rules rather than air — under a single 600px radial
flashlight that follows the pointer across the whole fold, headers and rules
included.

**Signature.** The closing invitation: a dark card over a slow crossfading
carousel, the backdrop desaturated, blurred and veiled so it stays texture, and
a conic ring that only spins on hover. The fold and the footer both carry
`.on-dark`, a scope that redeclares the tokens so the same class names resolve
to the dark band's colours in either theme.

## Architecture

**Next.js 16 App Router, React 19, TypeScript.** Server Components by default —
`"use client"` sits only on the components that genuinely need hooks or GSAP.
`Ticker` and `Footer` stay on the server entirely; the footer's back-to-top
button was split into its own [BackToTop](components/ui/BackToTop.tsx) so the
rest of it never crosses into the client.

**Tailwind CSS 4**, plain utilities. No component library — buttons, container,
eyebrow, icon button and the rest are small hand-rolled primitives in
[components/ui/](components/ui/).

**All copy lives in [lib/content.ts](lib/content.ts).** Headlines, feature
lists, alt text, media paths, carousel timing — the section components hold
layout only, so text changes never touch a `.tsx`.

**GSAP + ScrollTrigger and Lenis share one ticker.** The video scrub reads
`ScrollTrigger.progress`; if Lenis ran its own rAF loop, the read would land a
frame after the write and the video would stutter. Wiring Lenis into
`gsap.ticker` makes the order deterministic — `lenis.raf → ScrollTrigger.update
→ tweens` — and `lagSmoothing(0)` keeps GSAP from "catching up" mid-seek and
jumping the scrub. Reduced-motion visitors get native scroll, no pin and no
scrub.

**The scrub itself** ([lib/hooks/useVideoScrub.ts](lib/hooks/useVideoScrub.ts))
never calls `play()`. It keeps a target time, chases it with a lerp so
intermediate frames actually render, and issues at most one seek per presented
frame — `requestVideoFrameCallback` where it exists, the `seeking` flag where it
doesn't, and a watchdog behind both so a tab that never composites can't
deadlock the lock. The source video was re-encoded all-intra for this: with the
original 4-second GOP, a seek near the end meant reconstructing 95 inter-frames,
and no amount of interpolation fixes a bottleneck that lives in the file.

**Theme.** Light and dark resolve in a synchronous inline script in `<head>`,
before the first paint, so the page never flashes the wrong one.
[ThemeToggle](components/ui/ThemeToggle.tsx) only handles the switch and the
memory from there.

**Touch.** Tailwind 4 wraps `hover:` in `@media (hover: hover)`, so on a phone
those effects simply don't exist. [TapActivation](components/providers/TapActivation.tsx)
is a single document listener that lights an explicit `.is-on` class on the
nearest `[data-tap]` ancestor — and removes it when you tap elsewhere, which is
exactly what a stuck `:hover` never does.

## Design system

The whole aesthetic comes from `artools/assets/design_system.html` (AURA v5.0,
"Hybrid Aesthetica"), which lives outside this repo. Its tokens were extracted
into [app/globals.css](app/globals.css): surfaces (bone/paper/mist), ink
(ink/slate/graphite/muted/line), gradients and motion curves — plus the
signature classes the sections are built from: `.text-outline`,
`.gradient-text`, `.text-photo`, `.hairline`, `.aurora`, `.noise`,
`.beam-button`, `.link-draw`, `.radar-dot`, `.flashlight-area`,
`.conic-ring`, `.marquee-*`, `.glass-panel`, `.on-dark`.

Typography is Inter across the entire interface, weights 300–600 only — 700+
would be synthesised and thicken the strokes. The system monospace is reserved
for labels, numbers and metadata.

## Layout

```
app/
  page.tsx              # composition — stacks the five folds
  layout.tsx            # Inter, theme bootstrap, navbar + footer, providers
  globals.css           # tokens and signature classes
components/
  sections/             # Hero, Technology, Ticker, Experience, Signature, Navbar, Footer
  ui/                   # BeamButton, ConicButton, Container, Eyebrow, LetteringLine…
  providers/            # SmoothScrollProvider, TapActivation
lib/
  content.ts            # every string, list and media path
  hooks/useVideoScrub.ts
scripts/                # build-time and authoring tooling
public/media/           # video, poster, photography
```

## Tooling built for the project

| Command | |
|---|---|
| `npm run dev` / `build` / `start` / `lint` | The usual Next.js cycle |
| `npm run icons` | Extracts only the icons the page uses from the Solar set and writes [components/ui/icons.tsx](components/ui/icons.tsx). `@iconify/react` would have meant either a CDN round-trip or the whole 7,600-icon collection in the bundle; this keeps the set in devDependencies and ships zero runtime dependency |
| `npm run video:intra` | Re-encodes a video all-intra so every frame is a keyframe and scrubbing can seek freely — [scripts/video-intra.mjs](scripts/video-intra.mjs) |
| `npm run shot` | Screenshots a selector in a real browser via Playwright. It exists because typography isn't verified by reasoning: a clipped descender in the hero survived three rounds of plausible wrong theories and became obvious in the first magnified crop — [scripts/shot.mjs](scripts/shot.mjs) |

Runtime dependencies are five: `next`, `react`, `react-dom`, `gsap`, `lenis`.

---
---

# ARTOOLS Precision Series (PT-BR)

Site de uma página só para um produto: a Artools Precision Pen. É peça de
exibição — tudo é renderizado em build time, nada busca dados, nenhum
formulário envia coisa alguma. O que a página faz é apresentar um objeto, e faz
isso por movimento guiado pela rolagem.

---

## A página

Cinco dobras, empilhadas em [app/page.tsx](app/page.tsx), com a barra e o
rodapé morando no layout para emoldurar a rolagem inteira.

**Hero.** Um vídeo do produto que é percorrido, não tocado. A seção prende na
viewport e a posição da rolagem escreve `video.currentTime`: rolar para baixo
avança a caneta, rolar para cima a faz voltar — cerca de 320% de distância de
rolagem espalhados por uns 2,7s de material aproveitável, que é o que faz o
movimento ler como manipular o objeto em vez de assistir a um vídeo. O título
é cortado em três linhas, duas delas preenchidas por uma fotografia recortada
dentro das letras, com a imagem deslocada linha a linha para que os três
recortes continuem um do outro como uma fotografia só. No telefone texto e
vídeo se revezam: a dobra abre como tipografia e a primeira metade da rolagem
sobe a copy enquanto o vídeo entra.

**Technology.** Do que a caneta é feita. Foto à esquerda com leituras de
instrumento sobrepostas, lista numerada à direita e um `PRECISION` vazado
gigante sangrando pela direita com paralaxe. Uma varredura atravessa a foto —
o brilho do `.beam-button` girado 90°.

**Ticker.** Faixa fina entre as duas dobras pesadas, metade qualitativa e
metade especificação, correndo só em CSS e pausando no hover. Não embarca
JavaScript nenhum.

**Experience.** Como é escrever com ela. Três cartões numa grade sem vão —
separados por réguas de 1px, não por ar — sob uma única lanterna radial de
600px que segue o ponteiro pela dobra inteira, cabeçalho e réguas incluídos.

**Signature.** O convite que fecha: um cartão escuro sobre um carrossel de
esmaecimento lento, com o fundo em monocromático, desfocado e velado para
continuar sendo textura, e uma moldura cônica que só gira no hover. A dobra e o
rodapé carregam `.on-dark`, um escopo que redeclara os tokens para os mesmos
nomes de classe resolverem nas cores da banda escura em qualquer tema.

## Arquitetura

**Next.js 16 App Router, React 19, TypeScript.** Server Components por padrão —
`"use client"` só nos componentes que de fato precisam de hooks ou GSAP.
`Ticker` e `Footer` ficam inteiros no servidor; o botão de voltar ao topo foi
separado em [BackToTop](components/ui/BackToTop.tsx) justamente para o resto do
rodapé não atravessar para o cliente.

**Tailwind CSS 4**, utilitários puros. Sem biblioteca de componentes — botões,
container, eyebrow, icon button e companhia são pequenos primitivos feitos à
mão em [components/ui/](components/ui/).

**Toda a copy vive em [lib/content.ts](lib/content.ts).** Títulos, listas de
características, textos alternativos, paths de mídia, tempo do carrossel — os
componentes de seção guardam só layout, então trocar texto nunca encosta num
`.tsx`.

**GSAP + ScrollTrigger e Lenis dividem um ticker.** O scrub do vídeo lê
`ScrollTrigger.progress`; se o Lenis rodasse o rAF dele, a leitura cairia um
frame depois da escrita e o vídeo piscaria. Ligar o Lenis ao `gsap.ticker`
torna a ordem determinística — `lenis.raf → ScrollTrigger.update → tweens` — e
`lagSmoothing(0)` impede o GSAP de "recuperar o tempo perdido" no meio de um
seek e dar um salto no scrub. Quem pede menos movimento fica com a rolagem
nativa, sem pin e sem scrub.

**O scrub em si** ([lib/hooks/useVideoScrub.ts](lib/hooks/useVideoScrub.ts))
nunca chama `play()`. Ele guarda um tempo-alvo, persegue esse alvo com um lerp
para os frames do meio realmente aparecerem, e pede no máximo um seek por frame
apresentado — `requestVideoFrameCallback` onde existe, a flag `seeking` onde
não existe, e um cão de guarda atrás dos dois para uma aba que nunca compõe não
travar a trava. O vídeo foi reencodado em all-intra por causa disso: com o GOP
original de 4s, um seek perto do fim exigia reconstruir 95 inter-frames, e
nenhuma interpolação resolve um gargalo que mora no arquivo.

**Tema.** Claro e escuro são resolvidos por um script síncrono inline no
`<head>`, antes da primeira pintura, para a página nunca piscar no tema errado.
O [ThemeToggle](components/ui/ThemeToggle.tsx) cuida só da troca e da memória
daí em diante.

**Toque.** O Tailwind 4 embrulha `hover:` em `@media (hover: hover)`, então num
telefone esses efeitos simplesmente não existem. O
[TapActivation](components/providers/TapActivation.tsx) é um listener único no
documento que acende uma classe explícita `.is-on` no ancestral `[data-tap]`
mais próximo — e a apaga quando se toca em outro lugar, que é exatamente o que
um `:hover` grudado nunca faz.

## Design system

A estética inteira vem de `artools/assets/design_system.html` (AURA v5.0,
"Hybrid Aesthetica"), que fica fora deste repositório. Os tokens foram
extraídos para o [app/globals.css](app/globals.css): superfícies
(bone/paper/mist), tinta (ink/slate/graphite/muted/line), gradientes e curvas
de movimento — mais as classes-assinatura de que as seções são feitas:
`.text-outline`, `.gradient-text`, `.text-photo`, `.hairline`, `.aurora`,
`.noise`, `.beam-button`, `.link-draw`, `.radar-dot`, `.flashlight-area`,
`.conic-ring`, `.marquee-*`, `.glass-panel`, `.on-dark`.

A tipografia é Inter em 100% da interface, pesos 300–600 apenas — 700+ seria
sintetizado e engordaria o traço. A monoespaçada do sistema fica reservada a
labels, números e metadados.

## Estrutura

```
app/
  page.tsx              # composição — empilha as cinco dobras
  layout.tsx            # Inter, bootstrap de tema, barra + rodapé, providers
  globals.css           # tokens e classes-assinatura
components/
  sections/             # Hero, Technology, Ticker, Experience, Signature, Navbar, Footer
  ui/                   # BeamButton, ConicButton, Container, Eyebrow, LetteringLine…
  providers/            # SmoothScrollProvider, TapActivation
lib/
  content.ts            # todo texto, lista e path de mídia
  hooks/useVideoScrub.ts
scripts/                # ferramentas de build e de autoria
public/media/           # vídeo, poster, fotografia
```

## Ferramentas feitas para o projeto

| Comando | |
|---|---|
| `npm run dev` / `build` / `start` / `lint` | O ciclo normal do Next.js |
| `npm run icons` | Extrai do set Solar só os ícones que a página usa e escreve [components/ui/icons.tsx](components/ui/icons.tsx). O `@iconify/react` significaria ou uma ida ao CDN ou a coleção inteira de 7.600 ícones no bundle; assim o set fica em devDependencies e o runtime não ganha dependência nenhuma |
| `npm run video:intra` | Reencoda um vídeo em all-intra, todo quadro virando keyframe, para o scrub poder buscar livremente — [scripts/video-intra.mjs](scripts/video-intra.mjs) |
| `npm run shot` | Fotografa um seletor num navegador de verdade via Playwright. Existe porque tipografia não se confere por raciocínio: uma perna cortada no título da hero sobreviveu a três rodadas de hipóteses plausíveis e erradas, e ficou óbvia no primeiro recorte ampliado — [scripts/shot.mjs](scripts/shot.mjs) |

As dependências de runtime são cinco: `next`, `react`, `react-dom`, `gsap`,
`lenis`.
