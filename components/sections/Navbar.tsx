"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/Container";
import { IconButton } from "@/components/ui/IconButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { IconBag, IconPenSquare } from "@/components/ui/icons";
import { nav } from "@/lib/content";

/** Rolagem a partir da qual o vidro assume — o suficiente para não piscar. */
const GLASS_AT = 8;

/**
 * Presença do vidro no topo e depois da rolagem.
 *
 * O piso não é zero de propósito. Transparente de verdade, a barra fica à
 * mercê do que estiver passando atrás dela — e o que passa atrás é um vídeo,
 * com assunto claro e contorno escuro em movimento. Os itens da barra ficavam
 * ora legíveis, ora não, dependendo do frame. Um resto de vidro no topo
 * resolve isso sem virar uma faixa sólida: ainda lê como "sem barra", só que
 * com chão suficiente para o texto se apoiar.
 */
const GLASS_TOP = 0.35;
const GLASS_SCROLLED = 1;

/**
 * Barra fixa do topo, portada do `<header>` do design system.
 *
 * As classes são as do arquivo original (`flex justify-between items-center`,
 * `glass-panel`, `nav-load`, `link-draw`), com as cores trocadas pelos tokens
 * equivalentes. O recuo lateral é a exceção: o DS usa `px-4 md:px-6` e deixa a
 * barra encostar na borda da tela, mas aqui ela entra no `Container` para ficar
 * na mesma grade do corpo — a marca alinha com o título da hero em vez de
 * flutuar 24px à esquerda dele.
 *
 * A outra divergência deliberada é o vidro: no DS ele está sempre ligado, aqui
 * só entra depois que a página sai do topo. E não é uma classe que entra e sai,
 * é uma camada própria atrás do conteúdo cuja opacidade é animada — ligar
 * `backdrop-filter` de um frame para o outro faz a barra estalar e o Safari
 * repintar a dobra inteira.
 *
 * Mora no `layout.tsx`, não no `page.tsx`: é moldura do site, fixa e fora do
 * fluxo, na mesma categoria do grão de filme — não é uma seção da narrativa.
 */
export function Navbar() {
  const headerRef = useRef<HTMLElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const glass = glassRef.current;
    if (!header || !glass) return;

    gsap.registerPlugin(ScrollTrigger);

    // Entrada do DS: `setTimeout(() => header.classList.add('loaded'), 100)`.
    const entrance = window.setTimeout(() => header.classList.add("loaded"), 100);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* Sem `trigger`, start/end são posições absolutas de scroll: o gatilho
         é "saiu dos primeiros 8px", não a geometria de nenhum elemento.

         O fim é deliberadamente inalcançável. O ScrollTrigger trata o trecho
         como um intervalo `[start, end)`, então com `end: "max"` ele desativa
         no instante em que a rolagem encosta no rodapé — e a barra voltava ao
         vidro do topo bem ali, com a última seção passando atrás dela. Como o
         que se quer aqui é um limiar e não um trecho, o fim é jogado para
         além do fundo da página: uma vez cruzados os 8px, o gatilho fica
         ativo até a rolagem voltar. A função é reavaliada a cada refresh, de
         modo que crescer ou encolher a página não reabre o problema. */
      const watchScroll = (duration: number) => () => {
        const trigger = ScrollTrigger.create({
          start: GLASS_AT,
          end: () => ScrollTrigger.maxScroll(window) + window.innerHeight,
          onToggle: ({ isActive }) =>
            gsap.to(glass, {
              opacity: isActive ? GLASS_SCROLLED : GLASS_TOP,
              duration,
              ease: "power2.out",
              overwrite: true,
            }),
        });

        // Recarregar a página no meio do scroll não passa por `onToggle`:
        // o estado inicial precisa ser escrito na mão.
        gsap.set(glass, {
          opacity: trigger.isActive ? GLASS_SCROLLED : GLASS_TOP,
        });

        return () => trigger.kill();
      };

      mm.add("(prefers-reduced-motion: no-preference)", watchScroll(0.45));
      mm.add("(prefers-reduced-motion: reduce)", watchScroll(0));

      return () => mm.revert();
    }, header);

    return () => {
      window.clearTimeout(entrance);
      ctx.revert();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="nav-load fixed inset-x-0 top-0 z-50 h-[var(--nav-h)]"
    >
      {/* Camada de vidro — inerte ao ponteiro, recua (sem sumir) no topo da
          página. A classe já entrega o piso de `GLASS_TOP` no primeiro paint,
          para a barra não nascer transparente e ganhar chão só depois que o
          GSAP monta. */}
      <div
        ref={glassRef}
        aria-hidden
        className="glass-panel pointer-events-none absolute inset-0 border-b border-line opacity-35"
      />

      <Container className="relative flex h-full items-center justify-between">
        {/* ---------- Marca ----------
            `data-tap` + `group-[.is-on]:` é o par de toque do `group-hover:`;
            ver `TapActivation`. */}
        <div
          data-tap
          className="group flex shrink-0 cursor-pointer items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-bone transition-transform duration-500 group-hover:rotate-90 group-[.is-on]:rotate-90">
            <IconPenSquare className="text-xl" />
          </div>
          <span className="text-lg font-medium tracking-tight">
            {nav.logo.name}
            <span className="text-muted">{nav.logo.suffix}</span>
          </span>
        </div>

        {/* ---------- Navegação ----------
            Centro absoluto, como a marca do DS: os itens ficam no eixo da
            página em vez de serem empurrados pela largura dos vizinhos. */}
        <nav
          aria-label="Seções"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex"
        >
          {nav.links.map((label) => (
            <button
              key={label}
              type="button"
              className="link-draw text-xs font-medium uppercase tracking-widest text-graphite transition-colors hover:text-ink"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* ---------- Ações ---------- */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <IconButton aria-label={nav.bag.label} title={nav.bag.label}>
            <IconBag className="text-base" />
          </IconButton>
        </div>
      </Container>
    </header>
  );
}
