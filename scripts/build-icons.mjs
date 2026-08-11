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
  "arrow-right-bold-duotone": "IconArrowRight",
  "arrow-down-linear": "IconArrowDown",
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
