/**
 * Fotografa um pedaço da página num navegador de verdade.
 *
 * Existe porque tipografia não se confere por cálculo. O corte da perna do "g"
 * no título da hero passou três rodadas sendo atribuído à máscara, à ordem de
 * pintura e à entrelinha — todas hipóteses plausíveis e todas erradas — e a
 * causa (a área de pintura do `background-clip: text`) ficou óbvia no primeiro
 * recorte ampliado. Medir custa menos que supor.
 *
 *   npm run start -- -p 3987
 *   npm run shot -- h1 hero.png
 *   npm run shot -- "#technology h2" tech.png --width 390 --scroll "#technology"
 *
 * Para ampliar um detalhe depois (o ffmpeg já está no projeto):
 *   node -e "console.log(require('ffmpeg-static'))"
 *   <ffmpeg> -i hero.png -vf "crop=190:190:320:60,scale=570:570:flags=neighbor" zoom.png
 */
import { chromium } from "playwright";

const [selector = "body", out = "shot.png", ...rest] = process.argv.slice(2);

const flag = (name, fallback) => {
  const at = rest.indexOf(`--${name}`);
  return at === -1 ? fallback : rest[at + 1];
};

const url = flag("url", "http://localhost:3987/");
const width = Number(flag("width", 1440));
const height = Number(flag("height", 900));
const scrollTo = flag("scroll", null);
// As entradas da página são longas de propósito (`PACE` na hero); sem esperar,
// a foto pega tudo no meio do caminho.
const settle = Number(flag("settle", 5000));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });

await page.goto(url, { waitUntil: "networkidle" });

if (scrollTo) {
  await page.evaluate((sel) => document.querySelector(sel)?.scrollIntoView(), scrollTo);
}

await page.waitForTimeout(settle);
await page.locator(selector).first().screenshot({ path: out });
await browser.close();

console.log(`✓ ${selector} → ${out}  (${width}×${height})`);
