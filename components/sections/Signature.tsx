"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BeamButton } from "@/components/ui/BeamButton";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconArrowRight, IconCrown } from "@/components/ui/icons";
import { signature } from "@/lib/content";

/**
 * Fecho da página: um cartão escuro sobre o carrossel da hero do DS.
 *
 * O cartão é o assunto e tudo aqui existe para dizer isso. O fundo entra em
 * monocromático (o `grayscale contrast-125` que o DS aplica às fotos dele),
 * com desfoque leve e um véu por cima — o desfoque tira o detalhe que
 * competiria, o monocromático tira a cor e o véu tira a luz. O que sobra é
 * textura e movimento lento, que é o papel de um fundo.
 *
 * A moldura cônica girando é a mesma do `ConicButton` — `.conic-ring` da seção
 * 4 do DS —, só que revelada no hover, como na referência: num cartão deste
 * tamanho, girar o tempo todo seria a moldura roubando o assunto de novo.
 *
 * A seção inteira carrega `.on-dark`: sobre fotografia, o tema da página não
 * decide mais a cor, e o escopo redeclara os tokens da banda escura do DS. É o
 * que permite `text-ink`, `border-line` e `bg-ink text-bone` funcionarem aqui
 * sem uma única cor literal — e continuarem certos nos dois temas.
 */

/** Escala do fundo no começo e no fim da aproximação. */
const ZOOM_FROM = 1;
const ZOOM_TO = 1.22;

export function Signature() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  /* ---------- Relógio do carrossel ----------
     O GSAP não entra nesta: a troca é `className` e o esmaecer é transição de
     CSS. O que sobra para o JS é um relógio. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(
      () => setCurrent((index) => (index + 1) % signature.slides.length),
      signature.intervalMs,
    );

    return () => window.clearInterval(timer);
  }, []);

  /* ---------- Aproximação por rolagem ---------- */
  useEffect(() => {
    const root = sectionRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* O fundo repousa afastado e se aproxima enquanto a dobra sobe: quem
           dá o zoom é a rolagem, não um relógio. Daí o `scrub` — a imagem
           anda com o dedo e para quando o dedo para, que é o que faz o gesto
           ler como aproximação e não como animação tocando sozinha.

           O fim é `bottom bottom`, e não `top top`: esta é a última dobra da
           página, e com 85vh de altura o topo dela nunca chega ao topo da
           janela — o zoom nunca completaria. Encostar o rodapé da seção no
           rodapé da janela é alcançável e cai exatamente no fim do curso.

           A escala mora no palco, e não em cada quadro: assim ela multiplica
           a folga que o desfoque exige em vez de disputar o `transform` com
           ela. */
        const zoom = gsap.fromTo(
          stage,
          { scale: ZOOM_FROM },
          {
            scale: ZOOM_TO,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        );

        return () => {
          zoom.scrollTrigger?.kill();
          zoom.kill();
        };
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="signature"
      className="on-dark relative isolate flex min-h-[85vh] items-center justify-center overflow-hidden border-t border-line px-6 py-24"
    >
      {/* ============ Fundo ============
          O palco existe para carregar a escala da rolagem; os quadros dentro
          dele só trocam. */}
      <div ref={stageRef} aria-hidden className="absolute inset-0 -z-20">
        {signature.slides.map((src, index) => (
          <div
            key={src}
            className={`carousel-slide ${index === current ? "active" : ""}`}
          >
            {/* A escala de repouso fica no CSS do carrossel (é a folga que o
                desfoque exige); um utilitário do Tailwind aqui perderia para
                aquela regra, que é mais específica. */}
            <Image
              src={src}
              alt=""
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover grayscale blur-[2px] contrast-125"
            />
          </div>
        ))}
      </div>

      {/* Véu. `bg-bone` dentro do escopo escuro é a própria superfície da banda
          escura do DS — o fundo recua para dentro da página em vez de ficar um
          preto que não pertence a paleta nenhuma. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bone/60" />

      {/* ============ Cartão ============
          O feixe dá voltas na borda: é o `--grad-beam` do DS — um cônico quase
          todo transparente, com um arco aceso de 20° — girando atrás do
          recorte de 1px. O que se vê é esse arco passeando pelo perímetro.

          `--ring-spin` governa a volta. Os 2.2s do DS são cadência de botão e
          num objeto deste tamanho leem como pressa; 6s dá para acompanhar o
          feixe com os olhos sem que ele vire relógio de parede. As duas
          camadas herdam a mesma variável, então giram em fase — são o mesmo
          feixe, não dois. */}
      <div className="group/card relative [--ring-spin:6s]">
        {/* O rastro. Mesma engrenagem da moldura, só que desfocada e um pouco
            maior que o cartão: é o que faz a borda acesa ler como luz em vez
            de traço. O halo do original é fixo; este viaja junto com o feixe,
            que é o que estava faltando. */}
        <div
          aria-hidden
          className="conic-ring absolute -inset-1 overflow-hidden rounded-lg opacity-50 blur-md transition-opacity duration-500 group-hover/card:opacity-90"
        >
          <span className="ring" />
        </div>

        <div className="conic-ring relative overflow-hidden rounded-lg p-[1px]">
          {/* A moldura: o feixe nítido, sempre correndo. */}
          <span className="ring" />

          {/* Corpo opaco: `bg-bone` dentro do escopo escuro é a superfície da
              banda escura do DS. Sem vidro — o cartão é chapado sobre a foto,
              e é isso que o destaca dela. */}
          <div className="relative flex flex-col items-center rounded-lg border border-line bg-bone px-10 py-14 text-center md:px-16 md:py-16">
            {/* Selo: tinta cheia no disco, com halo. */}
            <span className="seal-glow grid h-16 w-16 place-items-center rounded-full bg-ink text-bone">
              <IconCrown className="text-3xl" />
            </span>

            {/* `font-semibold` e não `font-bold`: acima de 600 o Inter
                sintetiza e o traço engorda — a regra tipográfica do projeto. */}
            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              {signature.brand.name}
              <span className="font-light text-muted">
                {signature.brand.suffix}
              </span>
            </h2>

            <span aria-hidden className="my-5 h-px w-12 bg-line" />

            <Eyebrow className="mb-8 block tracking-[0.3em] text-slate">
              {signature.meta}
            </Eyebrow>

            <BeamButton>
              <span className="relative z-10">
                {signature.action.label}
              </span>
              <IconArrowRight className="relative z-10 text-base transition-transform duration-300 group-hover:translate-x-1" />
            </BeamButton>
          </div>
        </div>
      </div>
    </section>
  );
}
