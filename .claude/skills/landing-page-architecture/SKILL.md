---
name: landing-page-architecture
description: This skill should be used when adding, editing, or reviewing anything on this landing page project (caneta-tecnologica) — e.g. "add a new section", "create a hero/features/gallery/CTA section", "add an animation or scroll effect", "add a button/UI primitive", "where does this copy/content go", or any task touching app/page.tsx, components/, lib/content.ts, or the design tokens in globals.css. Enforces the project's Next.js App Router + Tailwind 4 + GSAP/ScrollTrigger static architecture and the ARTOOLS design-system tokens so new code matches the existing pattern.
version: 2.0.0
---

# Landing Page Architecture (caneta-tecnologica)

Reference for keeping new code consistent with this project's architecture: a fully static Next.js App Router landing page, Tailwind-only styling, GSAP/ScrollTrigger for motion, no back-end.

Full rationale lives in the project's [CLAUDE.md](../../../CLAUDE.md) — read it first if it's not already in context. This skill is the how-to for applying it.

## Decision rules

1. **Adding a new section of the page** (hero, features, gallery, testimonials, CTA, footer, ...) → follow [Adding a section](#adding-a-section) below.
2. **Adding a reusable small piece of UI** (button, badge, container, section heading) → it belongs in `components/ui/`, not inside a section file.
3. **Adding or editing copy, feature lists, image paths** → it belongs in `lib/content.ts`, never inline in a section's JSX.
4. **Adding an animation** → use GSAP. See [Animation conventions](#animation-conventions). Don't introduce a second animation library (`motion`, react-spring, AOS) — the project already carries GSAP + Lenis and a second one doubles the bundle for no gain.
5. **Touching `app/page.tsx`** → it may only import sections and render them in order. If you're about to add markup, a class, or logic there, that code belongs in a section component instead.
6. **Needing a color, font, spacing or easing** → take it from the tokens in `app/globals.css`, which were extracted from `artools/assets/design_system.html`. Never hand-pick a hex or a `cubic-bezier` — see [Design tokens](#design-tokens).

## Adding a section

1. Create `components/sections/<SectionName>.tsx` (PascalCase, named after what it shows — `Hero.tsx`, `Features.tsx`, not `Section1.tsx`).
2. Add the section's copy/data to `lib/content.ts` as a typed export. Import it into the component — don't hardcode strings in JSX.
3. Component is a Server Component by default (no directive). Add `"use client"` at the top **only if** the file itself uses `motion`, `useState`, `useEffect`, or another hook/interactive API. If only a small piece needs it, consider extracting that piece into its own client child instead of marking the whole section client.
4. Wrap Tailwind spacing/max-width in the shared `Container` primitive from `components/ui` rather than repeating `max-w-*`/`px-*` per section.
5. Wire it into `app/page.tsx` by importing and adding it to the render list — nothing else changes there.

Once real sections exist, use the most recently written one in `components/sections/` as the reference for structure — this project has no canonical example file yet.

## Design tokens

`app/globals.css` holds the extraction of `artools/assets/design_system.html`. Use the Tailwind utilities it generates, not raw values:

| Need | Use | Never |
| --- | --- | --- |
| Page surface | `bg-bone`, `bg-paper`, `bg-mist`, `bg-surface-3` | `bg-white`, `bg-zinc-50` |
| Text | `text-ink`, `text-slate`, `text-graphite`, `text-muted` | `text-black`, `text-gray-600` |
| Borders / rules | `border-line`, `border-line-soft` | `border-stone-300` |
| Easing | `ease-cinematic`, `ease-elastic`, or `"expo.out"` in GSAP | a hand-written `cubic-bezier(...)` |
| Gradients | `var(--grad-ink)`, `var(--grad-veil)`, `var(--grad-aurora)`, `var(--grad-hairline)` | a new `linear-gradient(...)` |

Every one of these flips for dark mode on its own, because the utilities emit `var(--token)` and the tokens are re-declared under `@media (prefers-color-scheme: dark)`. That is why `bg-white` is wrong — it doesn't flip, and it breaks the dark band.

Signature classes already available: `.text-outline`, `.gradient-text`, `.text-difference`, `.hairline`, `.bg-grid`, `.aurora`, `.noise`, `.beam-button`, `.glow-on-hover`, `.link-draw`, `.radar-dot`, `.hero-scrim`.

### Container and the full-bleed rule

The DS is an editorial grid: **rules and surfaces bleed edge to edge, content stays on the grid.** So a bar or band is a full-width element carrying the border/background, with a `Container` inside carrying the padding:

```tsx
{/* certo — a régua atravessa a tela, o conteúdo respeita a grade */}
<div className="border-b border-line bg-bone/70 backdrop-blur-md">
  <Container className="flex items-center justify-between py-3">…</Container>
</div>

{/* errado — a borda para onde o container para e fica boiando em tela larga */}
<Container className="border-b border-line py-3">…</Container>
```

Never re-type `px-6 md:px-12` in a section — that's what `Container` is for. Anything that overlays a full-bleed media element (scrims, grids, corner ticks) is positioned against the section, not the Container.

Typography: Inter for everything, weights 300–600 only (`font-bold` synthesizes and thickens the stroke). Monospace is reserved for labels, numbers and metadata — use the `Eyebrow` primitive rather than re-typing `font-mono text-[10px] uppercase tracking-[0.28em]`.

## Animation conventions

GSAP owns motion. The canonical shape inside a section:

```tsx
useEffect(() => {
  const root = sectionRef.current;
  if (!root) return;
  gsap.registerPlugin(ScrollTrigger); // dentro do efeito — nunca no topo do módulo (SSR)

  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".js-thing", { autoAlpha: 0, y: 24, ease: "expo.out" });
    });
    return () => mm.revert();
  }, root);

  return () => ctx.revert();
}, []);
```

- `gsap.registerPlugin(ScrollTrigger)` goes **inside** the effect. At module scope it runs during SSR of the client component.
- Scope everything in `gsap.context(fn, root)` and `ctx.revert()` on cleanup — that removes the inline styles GSAP wrote, so a fast refresh or route change doesn't leave elements stuck mid-animation.
- Gate motion behind `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` and give the reduce branch a final-state `gsap.set`. GSAP does **not** respect the preference on its own.
- `"expo.out"` is the GSAP spelling of the DS `--ease` curve. Use it as the default.
- Target elements with `js-`-prefixed classes inside the context scope, not with refs, unless the element is written to on every scroll frame.
- Anything driven by scroll position (progress bars, counters, readouts) should be written **straight to the DOM through a ref** — putting it in React state re-renders the section on every scroll frame.
- Lenis is mounted once in `SmoothScrollProvider`. Never instantiate a second one, and never add `scroll-behavior: smooth` in CSS — it fights Lenis.

## Scroll-scrubbed media

`lib/hooks/useVideoScrub.ts` already implements pin + scroll→`currentTime` scrubbing. Reuse it rather than writing a second one. What it settles, and why it should stay settled:

- Interpolate toward a target time in a rAF loop instead of assigning the raw scroll value — raw assignment skips frames.
- Issue one seek per presented frame (`requestVideoFrameCallback`, falling back to the `seeking` flag). Queuing seeks faster than the decoder drains them locks the tab.
- Don't add ScrollTrigger's `scrub` on top of the lerp — two dampers in series make the video slide on after the scroll stopped.
- Video must be `muted` + `playsInline`, and needs a `play()`/`pause()` prime for iOS to fill its buffer.

### Keyframes decide whether scrubbing feels good

`public/media/precision-series.mp4` carries **2 keyframes across 192 frames** (at 0.00s and 4.00s — a 4-second GOP). Every seek past 4s forces the decoder to walk up to 96 inter-frames, which is why it stalls under software decode. Real browsers with hardware decode absorb it; low-end phones will not.

Before blaming the hook for a choppy scrub, measure the file:

```bash
ffprobe -v error -select_streams v:0 -show_entries frame=key_frame \
  -of csv=p=0 video.mp4 | grep -c '^1'
```

The fix is always re-encoding, never a smaller `lerp`:

```bash
# all-intra: cada frame é um keyframe, seek instantâneo em qualquer ponto
ffmpeg -i entrada.mp4 -c:v libx264 -crf 20 -g 1 -keyint_min 1 \
  -sc_threshold 0 -pix_fmt yuv420p -an saida.mp4
```

The file gets bigger (often 3–5×) and that is the correct trade for a scrubbed hero — nobody waits on a hero video that never plays linearly, but everybody feels a stuttering scrub.

Also: verifying a scrub in headless Chrome is unreliable. Seeks past a distant keyframe silently return the **previous** frame — `currentTime` reports the new value while the pixels are stale, so screenshots look like the video froze when it did not. Confirm framing in a headed browser, or capture during playback instead of seeking.

## Anti-patterns to flag

- A section component importing `next/font` or defining its own font — fonts are configured once in `layout.tsx`.
- Copy strings or `features.map(...)` arrays defined inline inside a section component — should be in `lib/content.ts`.
- `"use client"` at the top of `app/page.tsx` or a section that doesn't actually need it — check whether only a child needs it first.
- A new dependency for buttons/cards/forms (shadcn, MUI, Chakra, react-bootstrap) — this project's UI primitives are hand-rolled Tailwind in `components/ui`.
- Data fetching, API routes, or a form `action` posting somewhere — this page has no back-end by design; flag it back to the user rather than assuming it's wanted.
- A raw hex, `rgb()`, or `cubic-bezier()` in a component — it means a token was skipped.
- `gsap.registerPlugin` at module scope, a `ScrollTrigger` created without a matching `kill()`, or an effect that starts a rAF loop without `cancelAnimationFrame` in its cleanup.
- Product claims invented to fill copy (materials, certifications, durability figures). Anything not visible in the reference assets has to come from the user — ask instead of writing plausible-sounding specs.
