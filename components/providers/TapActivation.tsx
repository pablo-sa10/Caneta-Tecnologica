"use client";

import { useEffect } from "react";

/**
 * Dá ao toque o que o ponteiro já tem.
 *
 * O Tailwind 4 embrulha a variante `hover:` em `@media (hover: hover)`, então
 * num aparelho sem ponteiro fino ela simplesmente não existe — a logo não gira,
 * a foto não sai do cinza, os cartões não reagem. Não é bug do CSS: é a
 * decisão certa do framework, porque `:hover` em touch gruda no último
 * elemento tocado e nunca mais sai.
 *
 * Aqui o toque acende uma classe explícita, `.is-on`, no ancestral marcado com
 * `data-tap`. Cada efeito que tem `group-hover:` ganha o par
 * `group-[.is-on]:`, e o mesmo estado passa a ter duas portas de entrada.
 * Como a classe é escrita e apagada por nós, ela sai quando se toca em outro
 * lugar — que é justamente o que o `:hover` grudado não faz.
 *
 * Um listener só, no documento, em vez de um por elemento: a página inteira é
 * estática e os alvos podem entrar e sair da árvore sem que ninguém precise
 * reassinar nada.
 */
export function TapActivation() {
  useEffect(() => {
    let active: Element | null = null;

    const onPointerDown = (event: PointerEvent) => {
      // Com mouse o `:hover` já resolve, e melhor: ele também *sai*.
      if (event.pointerType === "mouse") return;

      const target = event.target;
      const host =
        target instanceof Element ? target.closest("[data-tap]") : null;

      if (host === active) return;

      active?.classList.remove("is-on");
      host?.classList.add("is-on");
      active = host;
    };

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
