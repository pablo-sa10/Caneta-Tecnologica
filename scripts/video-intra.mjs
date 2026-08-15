/**
 * Reencoda um vídeo em all-intra — todo quadro vira keyframe.
 *
 * Por que isto existe: a hero não *toca* o vídeo, ela o percorre. Cada posição
 * de rolagem é um seek, e num arquivo comum o decodificador precisa voltar até
 * o keyframe anterior e reconstruir todos os quadros no caminho. O material
 * original desta página tinha 2 keyframes em 192 quadros (GOP de 4s): um seek
 * no fim custava reconstruir 95 quadros, e era daí que vinha o engasgo. Nenhum
 * ajuste de interpolação no `useVideoScrub` contorna isso — o gargalo está no
 * arquivo, não no código.
 *
 * O preço é tamanho. Sem quadros de diferença, cada um carrega a imagem
 * inteira: no CRF conservador (20) este material saltou de 3,8 MB para 13 MB. O
 * padrão aqui é 27 porque a cena é clara, lisa e de pouco detalhe — a 27 ela
 * fica indistinguível do original a olho, num recorte 1:1, e o arquivo cabe no
 * mesmo peso de antes. Material com gradiente longo ou grão pede número menor;
 * confira um quadro antes de aceitar.
 *
 *   node scripts/video-intra.mjs entrada.mp4 saida.mp4 [--seconds 6] [--crf 27]
 *
 * Para conferir o resultado (ausência de `stss` = all-intra):
 *   ffprobe -v error -select_streams v:0 -show_entries frame=key_frame \
 *     -of csv=p=0 saida.mp4 | grep -c '^1'
 */
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";

const [input, output, ...rest] = process.argv.slice(2);

if (!input || !output) {
  console.error("uso: node scripts/video-intra.mjs <entrada> <saida> [--seconds N] [--crf N]");
  process.exit(1);
}

const flag = (name, fallback) => {
  const at = rest.indexOf(`--${name}`);
  return at === -1 ? fallback : rest[at + 1];
};

const seconds = flag("seconds", null);
const crf = flag("crf", "27");

const args = [
  "-hide_banner",
  "-v", "error",
  "-i", input,
  ...(seconds ? ["-t", seconds] : []),
  "-c:v", "libx264",
  "-crf", crf,
  // O trio que desliga a compressão temporal: um quadro por grupo, mínimo de
  // um, e nenhum keyframe extra por mudança de cena (que já seriam todos).
  "-g", "1",
  "-keyint_min", "1",
  "-sc_threshold", "0",
  "-pix_fmt", "yuv420p",
  // Move o índice para o começo do arquivo: o navegador sabe a duração e
  // consegue buscar antes de ter baixado tudo.
  "-movflags", "+faststart",
  // A hero é muda (`muted` é o que permite o autoplay que preenche o buffer).
  "-an",
  output,
  "-y",
];

const run = spawnSync(ffmpeg, args, { stdio: "inherit" });
process.exit(run.status ?? 1);
