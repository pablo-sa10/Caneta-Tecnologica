"use client";

import { useEffect, useSyncExternalStore } from "react";
import { IconButton } from "./IconButton";
import { IconMoonStars, IconSun } from "./icons";
import { nav } from "@/lib/content";

type Theme = "light" | "dark";

/** Mesma chave do DS — quem já escolheu um tema lá chega aqui com ele. */
const STORAGE_KEY = "aura-theme";

/** localStorage lança em modo privado/terceiros bloqueados; o tema não pode cair junto. */
function readStored(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------
   O tema é estado do DOM, não do React: quem manda é o `data-theme` do
   <html>, escrito pelo script inline do `layout.tsx` antes da primeira
   pintura. Em vez de copiar esse valor para dentro de um `useState` (duas
   fontes de verdade que precisam ser sincronizadas na mão), o componente
   assina o atributo e lê direto dele.
   ------------------------------------------------------------------ */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

/** No servidor não há como saber o tema — e chutar deixaria `aria-pressed` mentindo no HTML entregue. */
const getThemeOnServer = (): Theme | null => null;

function applyTheme(next: Theme, remember = true) {
  document.documentElement.dataset.theme = next;
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* sem memória entre visitas — a troca desta sessão continua valendo */
    }
  }
  // Quem pinta em canvas/SVG não recalcula sozinho ao trocar as variáveis.
  window.dispatchEvent(new CustomEvent("aura:theme", { detail: next }));
}

/**
 * Troca e memória do tema. O primeiro paint já veio resolvido pelo script
 * inline do `layout.tsx`; aqui só cuidamos do clique e da persistência.
 *
 * Os dois ícones ficam sempre no DOM e o CSS (`.theme-icon-*` + `data-theme`)
 * decide qual aparece. Escolher o ícone em JS deixaria o servidor renderizar
 * um palpite e o cliente corrigir depois — meio frame com o ícone errado.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    getThemeOnServer,
  );

  useEffect(() => {
    // Enquanto o visitante não escolher, a barra acompanha o SO.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      if (readStored()) return;
      applyTheme(event.matches ? "dark" : "light", false);
    };

    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const isDark = theme === "dark";

  return (
    <IconButton
      aria-label={nav.theme.label}
      aria-pressed={theme === null ? undefined : isDark}
      title={isDark ? nav.theme.toLight : nav.theme.toDark}
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      className="hover:rotate-[18deg]"
    >
      <IconMoonStars className="theme-icon-light text-base" />
      <IconSun className="theme-icon-dark text-base" />
    </IconButton>
  );
}
