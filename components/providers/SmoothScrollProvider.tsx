"use client";

import { useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * Scroll suave global (Lenis) governado pelo ticker do GSAP.
 *
 * Por que os dois juntos, e não o rAF próprio de cada um: o scrubbing do
 * vídeo lê `ScrollTrigger.progress`. Se o Lenis rodar no rAF dele e o GSAP
 * no dele, a leitura do progresso acontece num frame diferente do que
 * escreveu a posição do scroll — o vídeo fica sempre um frame atrasado e o
 * movimento "pisca". Com um único ticker a ordem é determinística:
 * lenis.raf → ScrollTrigger.update → tweens.
 *
 * `lagSmoothing(0)` desliga a compensação de lag do GSAP: durante um seek
 * pesado de vídeo o GSAP tentaria "recuperar o tempo perdido" e daria um
 * salto no scrub. Preferimos perder frames a saltar.
 */
/**
 * A instância viva, para quem precisa mandar a página rolar.
 *
 * O Lenis não intercepta rolagem programática: um `window.scrollTo` ou uma
 * âncora nativa mudam a posição por fora e ele só descobre no frame seguinte,
 * o que aparece como um tranco. Quem quiser levar a página a algum lugar tem
 * que pedir a ele.
 */
let lenisInstance: Lenis | null = null;

/** Segundos gastos por altura de tela percorrida, e os limites do percurso. */
const SECONDS_PER_SCREEN = 0.6;
const MIN_DURATION = 1;
const MAX_DURATION = 3;

/** Altura da barra fixa, lida do token — nenhum destino pode parar debaixo dela. */
const navOffset = () =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
  ) || 0;

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Duração proporcional à distância. Um percurso fixo trata mal os dois
 * extremos: curto demais para atravessar a página inteira, longo demais para
 * pular de uma dobra à vizinha. Os limites impedem que a proporção vire
 * exagero de um lado ou do outro.
 */
const durationFor = (distance: number) =>
  Math.min(
    MAX_DURATION,
    Math.max(MIN_DURATION, (distance / window.innerHeight) * SECONDS_PER_SCREEN),
  );

/** Volta ao topo pelo Lenis; sem ele (movimento reduzido), pelo navegador. */
export function scrollToTop() {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, { duration: durationFor(window.scrollY) });
    return;
  }

  window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
}

/**
 * Leva a página até uma seção, sem tranco.
 *
 * Uma âncora nativa salta: o navegador reposiciona de um frame para o outro e
 * o Lenis só descobre depois, o que aparece como solavanco. Pedindo ao Lenis,
 * o percurso é o mesmo gesto do resto da página — e, de quebra, tudo que
 * depende da posição da rolagem acontece durante o caminho. É por isso que
 * clicar em "Explorar" na hero não pula a caneta: o vídeo é percorrido pela
 * rolagem, e a rolagem passa por ele.
 */
export function scrollToSection(selector: string) {
  const target = document.querySelector(selector);
  if (!(target instanceof HTMLElement)) return;

  const offset = navOffset();
  const destination = target.getBoundingClientRect().top + window.scrollY - offset;
  const duration = durationFor(Math.abs(destination - window.scrollY));

  if (lenisInstance) {
    /* Sem `offset` aqui, de propósito: o Lenis já respeita o
       `scroll-margin-top` que o CSS põe em todo `[id]`, e somar o recuo de
       novo pararia uma altura de barra acima do lugar. O `destination` acima
       continua sendo calculado à mão porque o caminho de baixo, sem Lenis,
       não tem quem faça isso. */
    lenisInstance.scrollTo(target, { duration });
    return;
  }

  window.scrollTo({
    top: destination,
    behavior: prefersReduced() ? "auto" : "smooth",
  });
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Quem pediu menos movimento fica com o scroll nativo do navegador.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      // 0.09 dá inércia perceptível sem aquele "flutuar" que atrapalha
      // encontrar um frame específico do produto.
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // O toque no mobile já tem inércia nativa boa; suavizar em cima
      // atrasa o scrub e briga com o gesto.
      syncTouch: false,
    });

    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000); // ticker do GSAP entrega segundos; Lenis quer ms
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisInstance = null;
      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // volta ao padrão do GSAP
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
