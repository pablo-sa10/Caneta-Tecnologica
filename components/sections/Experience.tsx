"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconPenLine, IconScale, IconSoundwave } from "@/components/ui/icons";
import { experience } from "@/lib/content";

/** Curva do DS (`--ease: cubic-bezier(.16,1,.3,1)`) no vocabulário do GSAP. */
const EASE = "expo.out";

/** Chave do ícone em `content.ts` → componente. O texto não importa JSX. */
const CARD_ICON = {
  pen: IconPenLine,
  soundwave: IconSoundwave,
  scale: IconScale,
} as const;

/**
 * Terceira dobra: como é escrever com ela.
 *
 * Tudo aqui vem do design system, sem mistura: o cartão é a variante
 * *flashlight* da seção 4.3 — o radial de 600px que segue o ponteiro —, os
 * ícones são do mesmo set Solar em traço linear que o DS carrega, e as cores
 * são tokens. Nem uma letra transparente: as duas dobras anteriores já vivem de
 * vazado e foto, e uma terceira seguida viraria maneirismo. Aqui a hierarquia
 * é só peso e tinta.
 *
 * A grade não tem vão entre os cartões. O DS separa células com régua de 1px,
 * nunca com ar — cartão flutuando com sombra é vocabulário de outra escola. O
 * conjunto lê como um bloco de três colunas, não como três objetos soltos.
 *
 * A lanterna do DS, que lá vive dentro de cada cartão, aqui cobre a dobra
 * inteira: uma luz só, atravessando cabeçalho, réguas e cartões. Como o
 * conjunto já lê como um bloco, repartir a luz célula a célula desenharia de
 * volta as divisões que a grade sem vão apaga.
 */
export function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  const lightRef = useRef<HTMLSpanElement>(null);
  const pointRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(0);

  /* Escrita direta no DOM, como no `BeamButton` — estado do React aqui
     re-renderizaria a dobra a cada pixel.

     Duas economias além dessa. O `transform` vai no elemento da luz, e não em
     variáveis CSS na seção: variável escrita no ancestral invalida o estilo de
     toda a descendência, e aqui basta mexer numa propriedade de um elemento
     só. E a escrita é agendada num quadro: entre dois quadros o ponteiro
     dispara vários eventos, e sem isso todos viram trabalho que ninguém vê. */
  const trackPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    pointRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    if (frameRef.current) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const { x, y } = pointRef.current;
      lightRef.current?.style.setProperty(
        "transform",
        `translate3d(${x}px, ${y}px, 0)`,
      );
    });
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* Como na dobra anterior: só o branch de movimento. O que o GSAP faz
         aqui é `from`, então não casar a media query deixa a dobra montada. */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const reveal = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        });

        reveal
          .from(".js-xp-eyebrow", { y: 24, autoAlpha: 0, duration: 0.8 }, 0)
          .from(".js-xp-title", { y: 32, autoAlpha: 0, duration: 1.1 }, 0.15)
          /* Os cartões entram um a um, da esquerda para a direita. É a mesma
             escada do DS, que resolve isso com `delay-200/400/600` no CSS. */
          .from(
            ".js-xp-card",
            { y: 40, autoAlpha: 0, duration: 1, stagger: 0.18 },
            0.4,
          );

        return () => {
          reveal.scrollTrigger?.kill();
          reveal.kill();
        };
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      onPointerMove={trackPointer}
      className="flashlight-area overflow-hidden border-t border-line bg-bone"
    >
      {/* A lanterna. Fica fora de vista ate o primeiro movimento do
          ponteiro; o `:hover` da secao e quem a acende. */}
      <span ref={lightRef} aria-hidden className="flash-light" />

      <Container className="py-24 md:py-32">
        {/* Cabeçalho centrado — a exceção da página, e de propósito: as duas
            dobras anteriores abrem à esquerda, e centrar esta marca a virada
            de assunto (do objeto para o gesto). */}
        <header className="mx-auto mb-16 max-w-3xl text-center md:mb-24">
          <Eyebrow className="js-xp-eyebrow block">
            {experience.eyebrow}
          </Eyebrow>

          {/* Aqui o corpo pode ser um passo fixo do Tailwind, ao contrário dos
              títulos das dobras anteriores: este é um cabeçalho que quebra em
              várias linhas quando falta largura, então não há uma linha longa
              e indivisível para caber na folha. */}
          <h2 className="js-xp-title mt-6 text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            {experience.headline.lead}
            <br />
            <span className="text-muted">{experience.headline.trail}</span>
          </h2>
        </header>

        {/* Régua externa no conjunto, régua interna entre as células: no
            telefone a divisão é horizontal, a partir do `md` ela vira
            vertical. O `last:` zera a régua da ponta para não dobrar com a
            borda do bloco. */}
        <div className="grid grid-cols-1 border border-line md:grid-cols-3">
          {experience.cards.map((card) => {
            const Icon = CARD_ICON[card.icon];

            return (
              <article
                key={card.title}
                data-tap
                className="js-xp-card group flex min-h-[22rem] cursor-pointer flex-col justify-between border-b border-line bg-paper p-8 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
              >
                {/* Ficha do ícone: a mesma do DS (48px, canto suave), com a
                    inversão tinta/papel no hover — em 300ms, e não nos 500ms
                    do original. Troca de cor não tem percurso para o olho
                    acompanhar: ou já mudou, ou está demorando. */}
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-mist text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-bone group-[.is-on]:bg-ink group-[.is-on]:text-bone">
                  <Icon className="text-2xl" />
                </span>

                <div>
                  <h3 className="mb-3 text-2xl font-medium tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate">
                    {card.body}
                  </p>
                </div>

                {/* Régua que se preenche no hover — o gesto do `.link-draw`
                    do DS aplicado à largura do cartão.

                    Cresce por `scale`, não por `width`: largura é propriedade
                    de layout, e animá-la obriga o navegador a refazer a conta
                    a cada quadro (17ms de layout num único hover, medidos).
                    Escala o compositor resolve sozinho.

                    E 500ms, não 700ms. A curva do DS é expo-out: ela chega
                    perto do fim logo e depois rasteja. Num percurso longo esse
                    rastejo é o que se lê como lentidão. */}
                <span aria-hidden className="mt-8 block h-px w-full bg-line">
                  <span className="ease-cinematic block h-full w-full origin-left scale-x-0 bg-ink transition-[scale] duration-500 group-hover:scale-x-100 group-[.is-on]:scale-x-100" />
                </span>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
