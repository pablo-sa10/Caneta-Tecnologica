"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BeamButton } from "@/components/ui/BeamButton";
import { ConicButton } from "@/components/ui/ConicButton";
import { IconArrowDown, IconArrowRight } from "@/components/ui/icons";
import { useVideoScrub } from "@/lib/hooks/useVideoScrub";
import { hero } from "@/lib/content";

/**
 * Distância de scroll consumida pelo pin: três telas e pouco para os ~2,7s
 * de material aproveitável. Espalhar tão pouco filme por tanto scroll é
 * deliberado — é o que faz o movimento ler como "manipulando o objeto" em
 * vez de "assistindo a um vídeo".
 */
const SCROLL_DISTANCE = "+=320%";

/** Curva do DS (`--ease: cubic-bezier(.16,1,.3,1)`) no vocabulário do GSAP. */
const EASE = "expo.out";

/**
 * Por que GSAP + Lenis:
 *
 * - **ScrollTrigger** é a única das opções que faz *pin* de verdade — prender
 *   a seção e devolver o fluxo depois — com recálculo correto em resize.
 * - **Lenis** amortece a roda do mouse, que é discreta e por natureza saltada.
 *   Sem ele o `currentTime` recebe degraus de ~100px de scroll de uma vez.
 * - **split-type foi descartado**: ele fatia texto no cliente, depois da
 *   hidratação. Como o título já vem estruturado em linhas de `content.ts`,
 *   as máscaras são markup — funcionam no HTML servido, sem FOUC e sem
 *   mexer no DOM que o React controla.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { isReady } = useVideoScrub({
    videoRef,
    triggerRef: sectionRef,
    pinRef,
    scrollDistance: SCROLL_DISTANCE,
    clip: hero.media.clip,
    lerp: 0.12,
  });

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---------- Entrada (uma vez, no load) ---------- */
        const intro = gsap.timeline({
          defaults: { ease: EASE, duration: 1.2 },
        });

        intro
          .from(".js-headline-inner", { yPercent: 110, stagger: 0.12 }, 0)
          .from(
            [".js-lead", ".js-actions"],
            { autoAlpha: 0, y: 24, stagger: 0.08, duration: 0.9 },
            0.35,
          )
          .from(".js-frame", { autoAlpha: 0, scale: 1.04, duration: 1.4 }, 0.1)
          .from(".js-cue", { autoAlpha: 0, y: -12, duration: 0.9 }, 0.7);

        /* ---------- Saída pelo scroll ----------
           O texto cede a dobra para o produto assim que o scrub começa: some
           sem sair de cena, e o indicador vai junto — ele já cumpriu o papel
           no instante em que o visitante rolou. */
        const exit = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "+=60%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        exit
          .to(".js-copy", { opacity: 0.16, yPercent: -6, ease: "none" }, 0)
          .to(".js-cue", { autoAlpha: 0, ease: "none", duration: 0.3 }, 0);

        return () => {
          exit.scrollTrigger?.kill();
          exit.kill();
          intro.kill();
        };
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      <div ref={pinRef} className="relative h-dvh overflow-hidden bg-bone">
        {/* ============ Vídeo em tela cheia ============
            O assunto nasce centrado no material. No desktop a escala e o
            deslocamento o empurram para o terço direito, de modo que ele
            ocupe o lado oposto ao da coluna de texto em vez de brigar com
            ela. No telefone fica centrado — lá o texto está embaixo. */}
        <div className="js-frame absolute inset-0 z-0">
          <video
            ref={videoRef}
            src={hero.media.src}
            poster={hero.media.poster}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden
            className={`h-full w-full object-cover transition-opacity duration-700 lg:origin-center lg:translate-x-[13%] lg:scale-[1.18] ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        {/* Assenta o vídeo no papel e abre espaço legível para o texto. */}
        <div aria-hidden className="hero-scrim absolute inset-0 z-[1]" />

        {/* Grade editorial por cima — leitura de desenho técnico. */}
        <div aria-hidden className="bg-grid absolute inset-0 z-[2] opacity-70" />

        {/* Cantoneiras: a dobra inteira como visor de instrumento. */}
        <span
          aria-hidden
          className="absolute left-5 top-5 z-[3] hidden h-5 w-5 border-l border-t border-ink/20 lg:block"
        />
        <span
          aria-hidden
          className="absolute bottom-5 right-5 z-[3] hidden h-5 w-5 border-b border-r border-ink/20 lg:block"
        />

        {/* ============ Conteúdo ============
            O recuo do topo é a altura da barra fixa; a dobra continua com
            `h-dvh` e quem cede a altura é o corpo (`flex-1`). */}
        <div className="relative z-10 flex h-full flex-col pt-[var(--nav-h)]">
          {/* No telefone o texto assenta no rodapé da dobra, sobre a parte
              opaca do scrim; no desktop centraliza nas 6 primeiras colunas,
              deixando a metade direita para o produto. */}
          <div className="flex min-h-0 flex-1 items-end lg:items-center">
            <Container className="grid w-full grid-cols-1 lg:grid-cols-12">
              <div className="js-copy flex flex-col gap-6 pb-6 pt-4 lg:col-span-6 lg:gap-8 lg:py-0">
                {/* O vídeo é decorativo para o leitor de tela (aria-hidden),
                    então a descrição do que ele mostra vive aqui. */}
                <p className="sr-only">{hero.media.caption}</p>

                <h1 className="text-[11vw] font-semibold leading-[0.9] tracking-tighter lg:text-[3.5rem] xl:text-[4.5rem] 2xl:text-[5.4rem]">
                  {hero.headline.map((line) => (
                    /* Máscara: o wrapper corta, o inner desliza de baixo.
                       O padding compensa o que `leading-[0.9]` deixa de fora —
                       sem ele o overflow come o acento de "tecnológica" em
                       cima e a perna do "g" embaixo. A margem negativa
                       devolve o espaço para não abrir o rastro. */
                    <span
                      key={line.text}
                      className="-my-[0.14em] block overflow-hidden py-[0.14em]"
                    >
                      <span
                        className={`js-headline-inner block ${
                          line.treatment === "outline"
                            ? "text-outline"
                            : "gradient-text"
                        }`}
                      >
                        {line.text}
                      </span>
                    </span>
                  ))}
                </h1>

                <p className="js-lead max-w-xl text-base leading-relaxed text-slate md:text-lg">
                  {hero.lead}
                </p>

                <div className="js-actions flex flex-wrap items-center gap-4">
                  <BeamButton>
                    <span className="relative z-10">
                      {hero.actions.primary.label}
                    </span>
                    {/* <IconArrowRight className="relative z-10 text-lg transition-transform group-hover:translate-x-1" /> */}
                  </BeamButton>

                  <ConicButton>
                    <span className="relative z-10 text-sm font-medium uppercase tracking-widest">
                      {hero.actions.secondary.label}
                    </span>
                    <IconArrowDown className="relative z-10 ml-3 text-lg text-graphite transition-all group-hover:translate-y-0.5 group-hover:text-ink" />
                  </ConicButton>
                </div>
              </div>
            </Container>
          </div>

          {/* ============ Indicador de scroll ============
              Centrado no rodapé da dobra: o rótulo diz o que o scroll faz e a
              régua diz para onde. */}
          <div className="js-cue flex shrink-0 flex-col items-center gap-3 pb-5">
            <Eyebrow>{hero.scrollHint}</Eyebrow>
            <span aria-hidden className="hairline-y h-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
