"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LetteringLine } from "@/components/ui/LetteringLine";
import { IconDatabase } from "@/components/ui/icons";
import { technology } from "@/lib/content";

/** Curva do DS (`--ease: cubic-bezier(.16,1,.3,1)`) no vocabulário do GSAP. */
const EASE = "expo.out";

/**
 * Segunda dobra: o que a caneta é por dentro.
 *
 * A composição — cabeçalho, foto à esquerda com leituras sobrepostas, lista
 * numerada à direita — vem da referência do cliente. O acabamento é o do DS, e
 * onde os dois discordam o DS ganha:
 *
 * - a referência empilha cartões arredondados com sombra difusa; aqui as
 *   fichas são réguas de 1px e cantos retos, e a lista vira linhas editoriais
 *   separadas por hairline em vez de caixas flutuantes;
 * - a marca d'água era um bloco cinza a 3%; virou o lettering vazado do DS,
 *   sangrando pela direita e com paralaxe na rolagem;
 * - as duas linhas do título usam os tratamentos opostos do `#hero-title` do
 *   DS (tinta cheia e traço vazado) no lugar de dois tons de cinza;
 * - o que sobrou intacto da referência é o gesto da varredura na foto, que já
 *   é vocabulário do DS — é o brilho do `.beam-button` girado 90°.
 */
export function Technology() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* Sem branch para `reduce`: o que o GSAP faz aqui é `from`, então o
         estado final é o próprio markup. Não casando a media query, nada é
         escrito e a dobra já nasce montada. */
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Uma dobra que o visitante alcança rolando não pode se montar antes
           de ele chegar — daí o gatilho em `top 70%` e o `once`. A escada de
           tempos é a mesma da hero: cabeçalho, corpo, figura, lista. */
        const reveal = gsap.timeline({
          defaults: { ease: EASE },
          scrollTrigger: { trigger: root, start: "top 70%", once: true },
        });

        reveal
          .from(".js-tech-eyebrow", { y: 24, autoAlpha: 0, duration: 0.8 }, 0)
          .from(
            ".js-tech-line",
            { yPercent: 110, autoAlpha: 0, duration: 1.2, stagger: 0.18 },
            0.1,
          )
          .from(".js-tech-lead", { y: 32, autoAlpha: 0, duration: 1 }, 0.45)
          .from(
            ".js-tech-figure",
            { y: 48, autoAlpha: 0, scale: 0.98, duration: 1.2 },
            0.55,
          )
          .from(
            ".js-tech-row",
            { x: 24, autoAlpha: 0, duration: 0.9, stagger: 0.16 },
            0.75,
          )
          // A barra da ficha preenche em vez de aparecer pronta: é leitura de
          // instrumento, e instrumento mede.
          .from(
            ".js-tech-fill",
            { scaleX: 0, transformOrigin: "left center", duration: 1.4 },
            1,
          );

        /* Paralaxe da marca d'água. Deslocamento curto de propósito: o vazado
           é grande o bastante para que 6% já leiam como profundidade, e mais
           do que isso começa a disputar atenção com o título. */
        const drift = gsap.to(".js-tech-watermark", {
          xPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        return () => {
          reveal.scrollTrigger?.kill();
          reveal.kill();
          drift.scrollTrigger?.kill();
          drift.kill();
        };
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="technology"
      className="relative overflow-hidden border-t border-line bg-mist"
    >
      {/* Bloom do DS: uma mancha de luz difusa que dá profundidade à
          superfície sem virar cor. */}
      <div aria-hidden className="aurora">
        <i className="left-[52%] top-[-18%] h-[42rem] w-[42rem] [background:var(--grad-aurora)]" />
      </div>

      {/* Marca d'água chapada e quase apagada, como na referência — não o
          vazado do DS. É tinta cheia a 6%, o que a deixa no lugar certo da
          hierarquia: ela é textura de fundo, não lettering. Por ser tão baixa,
          o título pode cruzar por cima sem disputar leitura.

          A opacidade é a mesma nos dois temas porque a tinta vira junto: no
          escuro são 6% de tinta clara sobre superfície escura. Sangra pela
          direita e o `overflow-hidden` da seção corta o resto. */}
      <span
        aria-hidden
        className="js-tech-watermark pointer-events-none absolute left-1/2 top-6 z-0 select-none whitespace-nowrap text-[22vw] font-semibold leading-none text-ink opacity-[0.06] lg:left-[36%] lg:top-16 lg:text-[16rem]"
      >
        {technology.watermark}
      </span>

      <Container className="relative z-10 py-24 md:py-32">
        <header className="max-w-4xl">
          {/* Régua de metadados da hero do DS: ponto de radar, rótulo, traço. */}
          <div className="js-tech-eyebrow flex items-center gap-4">
            <span
              aria-hidden
              className="radar-dot h-1.5 w-1.5 rounded-full bg-ink"
            />
            <Eyebrow>{technology.eyebrow}</Eyebrow>
            <span aria-hidden className="hairline w-16" />
          </div>

          {/* Corpo menor que o da hero — ela é a dobra-assunto, esta é uma
              seção. No telefone o valor sai da largura útil e não de `vw`,
              pelo mesmo motivo do título da hero: o recuo do `Container` é
              fixo em pixels, então `vw` sobra em tela larga e transborda em
              tela estreita. "Precisão Molecular." mede ~8,6em e o divisor a
              deixa em ~85% da folha em qualquer aparelho. */}
          <h2 className="mt-6 flex flex-col text-[calc((100vw_-_3rem)/10.1)] font-semibold leading-[0.95] tracking-tight md:text-[3.4rem] lg:text-[4.5rem]">
            {technology.headline.map((line) => (
              <LetteringLine
                key={line.text}
                line={line}
                pad={0.4}
                className="js-tech-line"
              />
            ))}
          </h2>

          <p className="js-tech-lead mt-8 max-w-2xl text-base font-light leading-relaxed text-slate md:text-lg">
            {technology.lead}
          </p>
        </header>

        <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          {/* ============ Figura ============ */}
          <figure data-tap className="js-tech-figure group relative lg:col-span-7">
            {/* A referência resolve a profundidade com uma sombra difusa, que
                é o oposto do DS — lá tudo é 1px e aresta viva. Aqui a mesma
                ideia vira uma segunda folha girada por baixo: a foto parece
                pousada sobre a página, e o gesto continua sendo desenho. */}
            <div
              aria-hidden
              className="absolute inset-0 -rotate-1 border border-line bg-surface-3 transition-transform duration-700 ease-cinematic group-hover:-rotate-2 group-[.is-on]:-rotate-2"
            />

            {/* Marcas de registro. Ficam por fora da foto, sobre a página: aí a
                tinta pode ser `--ink`, que vira com o tema. Por dentro não
                poderia — a fotografia é escura nos dois temas e um token de
                superfície sumiria no escuro. */}
            <span
              aria-hidden
              className="absolute -left-3 -top-3 z-10 h-4 w-4 border-l border-t border-ink/25"
            />
            <span
              aria-hidden
              className="absolute -bottom-3 -right-3 z-10 h-4 w-4 border-b border-r border-ink/25"
            />

            <div className="relative aspect-[4/3] overflow-hidden border border-line bg-ink">
              <Image
                src={technology.media.src}
                alt={technology.media.alt}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover grayscale contrast-125 transition-all duration-700 ease-cinematic group-hover:scale-[1.03] group-hover:grayscale-0 group-[.is-on]:scale-[1.03] group-[.is-on]:grayscale-0"
              />

              {/* Varredura: atravessa a foto de cima a baixo no hover. */}
              <span
                aria-hidden
                className="scan-sweep pointer-events-none absolute inset-0 z-20 -translate-y-full transition-transform duration-[1500ms] ease-in-out group-hover:translate-y-full group-[.is-on]:translate-y-full"
              />

              {/* ---------- Leitura: material ---------- */}
              <div className="glass-panel absolute left-6 top-6 z-30 w-44 border border-line p-3">
                <IconDatabase className="text-xl text-ink" />
                <Eyebrow className="mt-2 block">
                  {technology.readouts.material.label}
                </Eyebrow>
                <span
                  aria-hidden
                  className="mt-2 block h-0.5 w-full bg-ink/20"
                >
                  <span
                    className="js-tech-fill block h-full origin-left bg-ink"
                    style={{
                      width: `${technology.readouts.material.fill * 100}%`,
                    }}
                  />
                </span>
              </div>

              {/* ---------- Leitura: ponta ---------- */}
              <div className="glass-panel absolute bottom-6 right-6 z-30 border border-line p-3 text-right">
                <span className="text-3xl font-medium leading-none tracking-tight">
                  {technology.readouts.tip.value}
                  <span className="ml-1 align-top font-mono text-xs text-graphite">
                    {technology.readouts.tip.unit}
                  </span>
                </span>
                <Eyebrow className="mt-1 block">
                  {technology.readouts.tip.label}
                </Eyebrow>
              </div>
            </div>
          </figure>

          {/* ============ Lista ============
              Linhas editoriais separadas por hairline, e não cartões: no DS a
              divisão é sempre uma régua de 1px. O realce do hover é a régua da
              esquerda ganhando tinta — o mesmo movimento do `.link-draw`. */}
          {/* `ul` e não `dl`: o par termo/descrição descreveria bem estes
              itens, mas o modelo de conteúdo do `dt` proíbe cabeçalho por
              dentro, e o título de cada característica merece ser um `h3` — é
              o que dá a estes três itens um lugar no sumário do documento. */}
          <ul className="lg:col-span-5">
            {technology.features.map((feature) => (
              <li
                key={feature.index}
                data-tap
                className="js-tech-row group border-t border-line py-6 transition-colors duration-500 last:border-b hover:bg-paper/50 [&.is-on]:bg-paper/50"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-muted transition-colors duration-300 group-hover:text-ink group-[.is-on]:text-ink">
                    {feature.index}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight transition-transform duration-500 ease-cinematic group-hover:translate-x-1 group-[.is-on]:translate-x-1 md:text-2xl">
                    {feature.title}
                  </h3>
                </div>
                {/* Alinha sob o título, não sob o número: dois dígitos mono a
                    12px medem ~0.9rem, mais o `gap-4` da linha acima. */}
                <p className="ml-[1.9rem] mt-3 border-l border-line pl-4 text-sm leading-relaxed text-slate transition-colors duration-500 group-hover:border-ink group-[.is-on]:border-ink">
                  {feature.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
