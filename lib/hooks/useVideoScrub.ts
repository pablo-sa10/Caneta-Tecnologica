"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* `requestVideoFrameCallback` ainda não está em todas as versões da lib DOM
   do TypeScript, e nem todo navegador implementa. Tipamos a capacidade e
   detectamos em runtime em vez de castar para `any`. */
type VideoFrameMetadata = {
  mediaTime: number;
  presentedFrames: number;
};

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback(
    callback: (now: number, metadata: VideoFrameMetadata) => void,
  ): number;
  cancelVideoFrameCallback(handle: number): void;
};

const supportsFrameCallback = (
  video: HTMLVideoElement,
): video is VideoWithFrameCallback => "requestVideoFrameCallback" in video;

/**
 * Tempo máximo que um seek pode ficar sem confirmação antes de destravarmos.
 *
 * O valor precisa ser maior que o pior seek possível do material, senão o cão
 * de guarda vira o problema que ele existe para evitar: ele solta a trava com
 * o decodificador ainda trabalhando, o rAF seguinte pede outro seek e a fila
 * cresce — que é exatamente o modo de falha que trava a aba. Com um GOP de 4s,
 * um seek pode ter que percorrer 95 inter-frames, e 250ms não cobriam isso em
 * máquina fraca. Não é a correção de verdade (essa é reencodar; ver o comentário
 * de `precision-series.mp4` na skill do projeto), mas evita que o remédio piore
 * a doença enquanto o arquivo for este.
 *
 * Continua sendo um teto generoso, não uma espera: quem normalmente libera a
 * trava é o `seeked` ou o `requestVideoFrameCallback`, em milissegundos.
 */
const SEEK_WATCHDOG_MS = 600;

export type VideoScrubState = {
  /** metadados chegaram: `duration` é confiável e o primeiro frame pode pintar */
  isReady: boolean;
  /** true quando o usuário pediu menos movimento — o pin e o scrub não existem */
  isReduced: boolean;
};

export type UseVideoScrubOptions = {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** elemento que define o trecho de scroll consumido pelo efeito */
  triggerRef: RefObject<HTMLElement | null>;
  /** elemento que fica preso na viewport enquanto o vídeo é percorrido */
  pinRef: RefObject<HTMLElement | null>;
  /** distância de scroll do pin, na sintaxe de `end` do ScrollTrigger */
  scrollDistance?: string;
  /**
   * Trecho do vídeo percorrido, em segundos. Use quando só uma parte do
   * material presta — o scroll inteiro passa a mapear apenas esse intervalo.
   * Omitido, percorre o vídeo todo.
   */
  clip?: { start: number; end: number };
  /** fração do delta consumida por frame (0–1). Menor = mais macio e mais lento. */
  lerp?: number;
  /**
   * Chamado a cada atualização de scroll. Escreva direto no DOM aqui —
   * guardar isto em estado do React re-renderizaria a árvore inteira a
   * cada frame de scroll.
   */
  onProgress?: (progress: number, currentTime: number, duration: number) => void;
};

/**
 * Prende a seção na viewport e traduz o progresso do scroll em
 * `video.currentTime` — o vídeo avança quando se rola para baixo e retrocede
 * quando se rola para cima. Não há `play()`: cada frame é um seek.
 *
 * Três detalhes fazem a diferença entre "sedoso" e "engasgado":
 *
 * 1. **Interpolação.** O scroll entrega saltos; escrever esses saltos direto
 *    em `currentTime` pula frames. Guardamos um tempo-alvo e perseguimos ele
 *    com um lerp no rAF, então o vídeo sempre atravessa os frames do meio.
 *
 * 2. **Um seek por frame apresentado.** Pedir um novo seek antes de o
 *    anterior pintar enfileira trabalho no decodificador e trava a aba.
 *    `requestVideoFrameCallback` avisa exatamente quando um frame foi
 *    apresentado; onde ele não existe, caímos para a flag `video.seeking`.
 *
 * 3. **Sem `scrub` do ScrollTrigger.** O amortecimento é o lerp acima. Somar
 *    o scrub do GSAP em cima criaria dois amortecedores em série e o vídeo
 *    "escorregaria" depois que o scroll já parou.
 */
export function useVideoScrub({
  videoRef,
  triggerRef,
  pinRef,
  scrollDistance = "+=300%",
  clip,
  lerp = 0.12,
  onProgress,
}: UseVideoScrubOptions): VideoScrubState {
  const [state, setState] = useState<VideoScrubState>({
    isReady: false,
    isReduced: false,
  });

  // Mantém o callback fresco sem re-montar o ScrollTrigger a cada render —
  // a seção pode passar uma arrow function inline sem custo.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Primitivos nas dependências: um literal `{start, end}` inline seria uma
  // referência nova a cada render e remontaria o ScrollTrigger sem parar.
  const clipStartOption = clip?.start;
  const clipEndOption = clip?.end;

  useEffect(() => {
    const video = videoRef.current;
    const trigger = triggerRef.current;
    const pin = pinRef.current;
    if (!video || !trigger || !pin) return;

    gsap.registerPlugin(ScrollTrigger);

    const isReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let clipStart = 0;
    let clipLength = 0; // trecho efetivamente percorrido pelo scroll
    let targetTime = 0; // para onde o scroll quer levar o vídeo
    let renderedTime = video.currentTime; // onde o vídeo está de fato
    let frameInFlight = false; // um seek foi pedido e ainda não voltou
    let seekIssuedAt = 0;
    let rafId = 0;
    let frameCallbackId = 0;

    /* Referência tipada em vez de um booleano: um alias booleano de type
       guard faria o TS estreitar `video` para `never` no ramo do fallback. */
    const frameCallbackVideo: VideoWithFrameCallback | null =
      supportsFrameCallback(video) ? video : null;

    /* A trava do seek precisa de mais de uma forma de ser liberada.
       `requestVideoFrameCallback` é o sinal mais preciso — dispara quando o
       frame foi de fato apresentado — mas ele só dispara se existir um
       compositor pintando: numa aba oculta, num contexto sem GPU ou em
       headless ele nunca volta. Com um único sinal, a trava fica presa e o
       scrub morre sem se recuperar. Daí três liberações em cascata. */

    // 1. Frame apresentado (mais preciso, quando o compositor coopera).
    const onVideoFrame = () => {
      frameInFlight = false;
      if (frameCallbackVideo) {
        frameCallbackId =
          frameCallbackVideo.requestVideoFrameCallback(onVideoFrame);
      }
    };

    // 2. Seek concluído — semântico, independe de composição.
    const onSeeked = () => {
      frameInFlight = false;
    };
    video.addEventListener("seeked", onSeeked);

    // 3. Cão de guarda: se nenhum dos dois voltou, seguimos em frente.
    //    Perder a precisão de um frame é infinitamente melhor que congelar.
    const canSeek = () => {
      if (!frameInFlight) return true;
      if (performance.now() - seekIssuedAt > SEEK_WATCHDOG_MS) {
        frameInFlight = false;
        return true;
      }
      return false;
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (clipLength === 0) return;

      const delta = targetTime - renderedTime;

      // Abaixo de ~1ms de diferença não há frame novo para mostrar; evita
      // queimar seeks (e bateria) com o scroll parado.
      if (Math.abs(delta) < 0.001) return;

      renderedTime += delta * lerp;

      if (!canSeek()) return;
      frameInFlight = true;
      seekIssuedAt = performance.now();
      video.currentTime = renderedTime;
    };

    const onLoadedMetadata = () => {
      const full = Number.isFinite(video.duration) ? video.duration : 0;
      clipStart = Math.max(0, Math.min(clipStartOption ?? 0, full));
      clipLength = Math.min(clipEndOption ?? full, full) - clipStart;
      renderedTime = clipStart;
      setState({ isReady: true, isReduced });
      // O pin depende da altura real da seção, que só assenta depois que o
      // vídeo reserva seu espaço.
      ScrollTrigger.refresh();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      onLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", onLoadedMetadata);
    }

    /* Safari/iOS só popula o buffer depois de um play(); sem isto o primeiro
       seek devolve frame preto. O vídeo é muted+playsInline, então o autoplay
       é permitido e a pausa imediata é imperceptível. */
    const primeDecoder = async () => {
      try {
        await video.play();
        video.pause();
        video.currentTime = clipStart;
      } catch {
        // Autoplay bloqueado: o poster continua no lugar e o scrub passa a
        // valer no primeiro seek bem-sucedido. Não é um erro fatal.
      }
    };
    void primeDecoder();

    const scrollTrigger = ScrollTrigger.create({
      trigger,
      start: "top top",
      end: scrollDistance,
      pin: isReduced ? false : pin,
      pinSpacing: !isReduced,
      // Compensa o salto de 1 frame ao prender/soltar em scroll rápido.
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        targetTime = clipStart + self.progress * clipLength;
        onProgressRef.current?.(self.progress, targetTime - clipStart, clipLength);
      },
      onRefresh: (self) => {
        // Depois de um resize o progresso muda sem evento de scroll.
        targetTime = clipStart + self.progress * clipLength;
        onProgressRef.current?.(self.progress, targetTime - clipStart, clipLength);
      },
    });

    if (!isReduced) {
      rafId = requestAnimationFrame(tick);
      if (frameCallbackVideo) {
        frameCallbackId = frameCallbackVideo.requestVideoFrameCallback(onVideoFrame);
      }
    } else {
      // Sem movimento: mostra um frame representativo e para por aí.
      setState({ isReady: video.readyState >= 1, isReduced });
    }

    return () => {
      cancelAnimationFrame(rafId);
      if (frameCallbackId !== 0 && frameCallbackVideo) {
        frameCallbackVideo.cancelVideoFrameCallback(frameCallbackId);
      }
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      scrollTrigger.kill();
    };
  }, [
    videoRef,
    triggerRef,
    pinRef,
    scrollDistance,
    lerp,
    clipStartOption,
    clipEndOption,
  ]);

  return state;
}
