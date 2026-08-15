/**
 * Extrai do set Solar (o mesmo que o design system carrega via <iconify-icon>)
 * apenas os ícones que a página usa, e escreve `components/ui/icons.tsx`.
 *
 * Por que gerar em vez de consumir em runtime: `@iconify/react` só resolve o
 * ícone via API pública (CDN) ou carregando a coleção inteira — 7.600 ícones,
 * megabytes de JSON no bundle. Aqui o set fica em devDependencies, o build
 * copia os quatro `<path>` de que precisamos e o runtime não ganha dependência
 * nenhuma. Para adicionar um ícone: inclua o nome em ICONS e rode `npm run icons`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getIconData, iconToSVG } from "@iconify/utils";

/** nome no set Solar → nome do componente React. */
const ICONS = {
  "pen-new-square-bold-duotone": "IconPenSquare",
  "moon-stars-linear": "IconMoonStars",
  "sun-2-linear": "IconSun",
  "bag-3-linear": "IconBag",
  "arrow-right-linear": "IconArrowRight",
  "arrow-down-linear": "IconArrowDown",
  "crown-star-bold-duotone": "IconCrown",
  "arrow-up-linear": "IconArrowUp",
  "globe-linear": "IconGlobe",
  "hamburger-menu-linear": "IconMenu",
  "close-circle-linear": "IconClose",
  "database-bold-duotone": "IconDatabase",
  "pen-new-square-linear": "IconPenLine",
  "soundwave-square-linear": "IconSoundwave",
  "scale-linear": "IconScale",
};

const collection = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../node_modules/@iconify-json/solar/icons.json", import.meta.url)),
    "utf8",
  ),
);

const components = Object.entries(ICONS).map(([name, component]) => {
  const data = getIconData(collection, name);
  if (!data) throw new Error(`Ícone ausente no set Solar: solar:${name}`);

  const { body, attributes } = iconToSVG(data, { height: "1em" });

  return `/** \`solar:${name}\` */
export function ${component}(props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="${attributes.viewBox}"
      width="1em"
      height="1em"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
      dangerouslySetInnerHTML={{ __html: ${JSON.stringify(body)} }}
    />
  );
}`;
});

const out = `// GERADO POR \`npm run icons\` — não edite à mão.
// Fonte: @iconify-json/solar (mesmo set usado no design_system.html).
import type { ComponentProps } from "react";

type IconProps = Omit<ComponentProps<"svg">, "dangerouslySetInnerHTML" | "children">;

${components.join("\n\n")}
`;

const target = fileURLToPath(new URL("../components/ui/icons.tsx", import.meta.url));
writeFileSync(target, out, "utf8");
console.log(`✓ ${Object.keys(ICONS).length} ícones escritos em components/ui/icons.tsx`);

/* ---------- Favicon ----------
   O ícone da guia é a mesma marca da barra: quadrado de tinta com a caneta
   vazada por dentro. Sai daqui, e não de um arquivo desenhado à mão, para não
   existirem duas versões do mesmo símbolo que possam divergir.

   As cores são literais porque um favicon é um arquivo isolado: nenhuma
   variável da página chega até ele. São os valores de `--ink` e `--bone` do
   tema claro — a guia não acompanha o tema do site.

   O `app/icon.svg` é reconhecido pelo App Router sozinho: o Next gera o
   `<link rel="icon">` e o hash do arquivo, sem precisar tocar no layout. */
const INK = "#1C1C1C";
const BONE = "#EFEDE7";

const mark = getIconData(collection, "pen-new-square-bold-duotone");
const { body: markBody } = iconToSVG(mark, { height: "24" });

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="${INK}"/>
  <g transform="translate(4 4)" color="${BONE}">${markBody}</g>
</svg>
`;

const faviconTarget = fileURLToPath(new URL("../app/icon.svg", import.meta.url));
writeFileSync(faviconTarget, favicon, "utf8");
console.log("✓ favicon escrito em app/icon.svg");
