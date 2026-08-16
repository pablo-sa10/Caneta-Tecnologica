import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O selo do Next no canto inferior esquerdo cobre a dobra durante o
  // desenvolvimento — e é justamente ali que a hero assenta o texto.
  devIndicators: false,

  // Empacota o servidor de produção com apenas os módulos que o Next provou
  // serem usados, em .next/standalone. É o que permite descartar node_modules
  // inteiro da imagem final.
  output: "standalone",
};

export default nextConfig;
