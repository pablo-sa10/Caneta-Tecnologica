import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { TapActivation } from "@/components/providers/TapActivation";
import "./globals.css";

// O design system usa Inter em 100% da interface e o pacote só traz
// 300/400/500/600 — 700+ seria sintetizado e engordaria o traço.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/**
 * Resolve o tema antes da primeira pintura — mesmo script do DS. Precisa ser
 * síncrono e inline no `<head>`: qualquer coisa que rode depois da hidratação
 * pinta a página no tema errado por um frame. `ThemeToggle` só cuida da troca
 * e da memória a partir daí.
 */
const THEME_BOOTSTRAP = `(()=>{let t="light";try{const s=localStorage.getItem("aura-theme");t=s==="dark"||s==="light"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")}catch(e){}document.documentElement.dataset.theme=t})()`;

export const metadata: Metadata = {
  title: "ARTOOLS Precision Series — Caneta de tinta pigmentada 0.1",
  description:
    "Pigmentum 0.1: caneta de tinta pigmentada da linha Precision Series da ARTOOLS. Traço contínuo e uniforme para desenho técnico, ilustração e nanquim.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {/* Sem marcação própria: só escuta o toque e acende `.is-on` no alvo,
            para que o que responde ao ponteiro também responda ao dedo. */}
        <TapActivation />
        <Navbar />
        <SmoothScrollProvider>
          {children}
          {/* Moldura do site, como a barra — mas dentro do provider, porque o
              botão de voltar ao topo precisa do Lenis montado. */}
          <Footer />
        </SmoothScrollProvider>
        {/* Grão de filme por cima de tudo — fixo, inerte ao ponteiro. */}
        <div aria-hidden className="noise" />
      </body>
    </html>
  );
}
