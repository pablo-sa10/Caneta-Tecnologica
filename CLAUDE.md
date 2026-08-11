# Caneta Tecnológica — Landing Page

Landing page estática para apresentar um produto. Sem back-end, sem CMS, sem formulários com envio — o objetivo é exibição visual com animações.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS 4** — utilitários puros, sem biblioteca de componentes (sem shadcn/ui, sem MUI, etc.)
- **GSAP + ScrollTrigger** — animação e tudo que depende de scroll (pin, scrub, reveal). Registrar o plugin dentro do efeito, nunca no topo do módulo.
- **Lenis** — scroll suave global, montado uma vez em `SmoothScrollProvider` e governado pelo ticker do GSAP.

Todas as seções são estáticas em build time. Nenhuma rota busca dados, nenhum formulário chama API — se isso mudar, atualize esta seção antes de introduzir a exceção.

## Design system

A estética vem inteira de `artools/assets/design_system.html` (AURA v5.0 / "Hybrid Aesthetica"), fora do repositório. Os tokens já foram extraídos para `app/globals.css`: superfícies (bone/paper/mist), tinta (ink/slate/graphite/muted/line), gradientes e curvas de movimento — mais as classes-assinatura (`.text-outline`, `.gradient-text`, `.hairline`, `.aurora`, `.noise`, `.beam-button`, `.link-draw`, `.radar-dot`).

**Não invente cor, fonte ou curva fora desses tokens.** Precisa de algo novo? Volte ao `design_system.html` e extraia de lá. Tipografia é Inter em 100% da interface (pesos 300–600 apenas; `font-bold` sintetiza e engorda o traço) e a monoespaçada do sistema fica reservada a labels, números e metadados.

## Estrutura de pastas

```
app/
  page.tsx              # só compõe <Seção /> em sequência — zero lógica, zero markup próprio
  layout.tsx
components/
  sections/             # uma seção da página = um componente (Hero.tsx, Features.tsx, CTA.tsx...)
  ui/                    # primitivos reutilizáveis feitos à mão (Button.tsx, Container.tsx...)
lib/
  content.ts             # todo copy, listas de features, textos e paths de imagem
```

## Convenções

- **Server Component por padrão.** Só adicione `"use client"` no componente que realmente usa `motion`, hooks ou interatividade — não propague a diretiva para o arquivo pai sem necessidade.
- **Conteúdo nunca fica hardcoded no JSX da seção.** Toda copy/lista/imagem vem de `lib/content.ts`. Isso mantém os componentes só com layout e permite editar texto sem tocar em lógica.
- **`page.tsx` é só composição.** Se aparecer JSX, className ou lógica ali além de importar e empilhar seções, esse código pertence a um componente em `components/sections`.
- **Sem lib de componentes.** Botões, containers, badges etc. são pequenos primitivos Tailwind em `components/ui`, não dependências externas.
- **Animação só com `motion`.** Não misture com outras libs (GSAP, react-spring, etc.) nem CSS `@keyframes` customizado a menos que seja algo trivial que `motion`/Tailwind não cubra.

## Skill do projeto

A skill [`landing-page-architecture`](.claude/skills/landing-page-architecture/SKILL.md) documenta o passo a passo para adicionar seções, primitivos e animações seguindo esse padrão — ela é carregada automaticamente pelo Claude Code quando a tarefa for desse tipo.
