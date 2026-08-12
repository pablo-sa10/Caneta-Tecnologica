"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BeamButton } from "@/components/ui/BeamButton";
import { ConicButton } from "@/components/ui/ConicButton";
import { IconArrowDown } from "@/components/ui/icons";
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
 * Fator que estica a cascata de entrada. `1` reproduz os tempos do DS ao pé da
 * letra; acima disso a mesma sequência acontece mais devagar, sem mexer na
 * proporção entre os itens.
 */
const PACE = 1.6;

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

    /* Sem `registerPlugin` aqui: esta timeline não depende de scroll — quem
       registra o ScrollTrigger é o `useVideoScrub`, que roda antes. */
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---------- Entrada em cascata (uma vez, no load) ----------
           A escada de tempos é a do DS, que resolve isso com classes de
           `transition-delay` no CSS (`delay-100`, `delay-300`, `delay-500`,
           `delay-700`, `delay-1000`): as três linhas do título entram de 0.2
           em 0.2s, o parágrafo em 0.5s, os botões em 0.7s e o último item em
           1s. Nada entra junto — a dobra se monta de cima para baixo.

           `PACE` estica essa escada inteira. Os intervalos do DS foram
           desenhados para uma página de catálogo, que o visitante já chega
           rolando; aqui a dobra é o assunto e vale demorar mais nela. Como
           multiplica tempos e durações pelo mesmo fator, o ritmo relativo
           entre os itens continua sendo o do arquivo original — só o relógio
           anda mais devagar. Para voltar ao DS puro, é `PACE = 1`. */
        const intro = gsap.timeline({ defaults: { ease: EASE } });
        const at = (seconds: number) => seconds * PACE;

        intro
          // `.text-reveal-content` do DS: translateY(110%) atrás da máscara.
          .from(
            ".js-headline-inner",
            {
              yPercent: 110,
              autoAlpha: 0,
              duration: at(1.2), // --dur-cinematic
              stagger: at(0.2),
            },
            at(0.1),
          )
          // `.reveal` do DS: translateY(2rem) + opacidade, em --dur-slow.
          .from(".js-lead", { y: 32, autoAlpha: 0, duration: at(1) }, at(0.5))
          .from(".js-actions", { y: 32, autoAlpha: 0, duration: at(1) }, at(0.7))
          .from(".js-cue", { y: 32, autoAlpha: 0, duration: at(1) }, at(1));

        return () => intro.kill();
      });

      /* ---------- Vídeo no desktop ----------
         Aqui a dobra comporta os dois lados ao mesmo tempo: o vídeo assenta
         junto com a primeira linha do título, por trás de tudo. */
      mm.add(
        "(prefers-reduced-motion: no-preference) and (min-width: 1024px)",
        () => {
          const enter = gsap.from(".js-frame", {
            autoAlpha: 0,
            scale: 1.04,
            duration: 1.4 * PACE,
            delay: 0.1 * PACE,
            ease: EASE,
          });
          return () => enter.kill();
        },
      );

      /* ---------- Passagem de bastão no telefone ----------
         Numa tela estreita não há coluna livre: o vídeo ficaria embaixo do
         texto e os dois se atrapalhariam. Então eles se revezam — primeiro a
         dobra é só texto, com a cascata de entrada; quando a rolagem começa, o
         texto sobe e sai enquanto o vídeo entra no lugar dele, e o resto do
         curso fica todo para o scrub.

         A troca acontece nos primeiros 50% de rolagem do pin (que tem 320% no
         total), então ela termina bem antes de o vídeo chegar ao fim. */
      mm.add(
        "(prefers-reduced-motion: no-preference) and (max-width: 1023px)",
        () => {
          gsap.set(".js-frame", { autoAlpha: 0 });

          const handoff = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "+=50%",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          });

          handoff
            .to([".js-copy", ".js-cue"], { autoAlpha: 0, y: -24 }, 0)
            .to(".js-frame", { autoAlpha: 1 }, 0);

          return () => {
            handoff.scrollTrigger?.kill();
            handoff.kill();
          };
        },
      );

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative">
      <div ref={pinRef} className="relative h-dvh overflow-hidden bg-bone">
        {/* ============ Vídeo em tela cheia ============
            A seção sangra de ponta a ponta, então `inset-0` já é a largura da
            viewport — o vídeo ocupa a tela inteira e só o texto, dentro do
            `Container`, respeita a grade.

            O assunto nasce centrado no material. No desktop a escala e o
            deslocamento o empurram para o terço direito, de modo que ele
            ocupe o lado oposto ao da coluna de texto em vez de brigar com
            ela. No telefone fica centrado — lá o texto está embaixo. */}
        <div className="js-frame absolute inset-0 z-0 overflow-hidden">
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
          {/* Centralizado nos dois: no telefone a dobra começa só com o texto,
              e ancorá-lo no rodapé deixaria meia tela vazia até a rolagem
              trazer o vídeo. No desktop ele divide a dobra com o produto,
              ocupando as colunas da esquerda. */}
          <div className="flex min-h-0 flex-1 items-center">
            <Container className="grid w-full grid-cols-1 lg:grid-cols-12">
              {/* Oito colunas: sobra para o título respirar sem que a linha
                  mais larga entre no terço onde a caneta assenta. O texto
                  corrido continua preso ao `max-w-xl` do DS. */}
              <div className="js-copy flex flex-col gap-6 pb-6 pt-4 lg:col-span-8 lg:gap-8 lg:py-0">
                {/* O vídeo é decorativo para o leitor de tela (aria-hidden),
                    então a descrição do que ele mostra vive aqui. */}
                <p className="sr-only">{hero.media.caption}</p>

                {/* Estilo do `#hero-title` do DS: `font-semibold`,
                    `tracking-tighter`, linhas mascaradas. Os corpos são
                    menores que os de lá (`6.2 / 7.8 / 8.6rem`) porque o
                    critério aqui é outro: "mais tecnológica" tem 16
                    caracteres contra os 9 de "LETTERING", e nos números do DS
                    ela avançava por cima da caneta. Nestes três valores a
                    linha mais larga ocupa ~59% da folha em qualquer
                    breakpoint, deixando o terço direito livre para o produto.

                    A entrelinha é mais fechada que os `0.9` do DS porque o
                    texto de lá é caixa alta: sem a banda vazia acima da altura
                    de x, `0.9` já lê como apertado. Em caixa baixa não —
                    daí `0.8`.

                    No telefone o valor é maior que os `13vw` do DS: com o
                    título quebrado em quatro linhas curtas, a mais larga
                    ("tecnológica") mede ~4,7em, e a `15vw` ela ocupa ~81% da
                    largura útil num aparelho de 390px. O teto antes de
                    encostar na margem fica por volta de `18vw`.

                    O `word-spacing` negativo é acréscimo: `tracking-tighter`
                    aperta as letras mas não toca no espaço, então nos corpos
                    grandes o vão entre palavras ficava desenhando um buraco
                    no meio da linha. No DS o problema não aparece porque lá
                    cada linha do título é uma palavra só. */}
                <h1 className="flex flex-col text-[16vw] font-semibold leading-[0.8] tracking-tighter [word-spacing:-0.08em] lg:text-[5rem] xl:text-[6.2rem] 2xl:text-[7rem]">
                  {hero.headline.map((line) => (
                    /* Máscara: o wrapper corta, o inner desliza de baixo. O
                       padding abre espaço para o que a entrelinha apertada
                       deixa de fora — sem ele o overflow come o acento de
                       "tecnológica" em cima e a perna do "g" embaixo — e a
                       margem negativa devolve esse espaço, para o rastro não
                       afastar as linhas.

                       A margem só cancela o padding porque o `h1` é `flex`:
                       entre irmãos em fluxo normal as margens verticais
                       colapsam, e duas de -0.2em viram uma de -0.2em, não
                       -0.4em. O padding somava 0.4em e a margem devolvia
                       metade — era daí que vinha o vão a mais entre as
                       linhas, não do valor do padding. Em contexto flex não
                       há colapso: as duas margens contam, o cancelamento é
                       exato e quem controla o espaço passa a ser só o
                       `leading` acima. */
                    <span
                      key={line.text}
                      className="-my-[0.2em] block overflow-hidden py-[0.2em]"
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
