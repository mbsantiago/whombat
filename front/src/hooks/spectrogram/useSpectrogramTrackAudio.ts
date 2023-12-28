import { useCallback, useEffect } from "react";

import drawOnset from "@/draw/onset";
import { scaleTimeToViewport } from "@/utils/geometry";

import type { SpectrogramWindow } from "@/types";

export default function useSpectrogramTrackAudio({
  viewport,
  currentTime,
  isPlaying,
  onTimeChange,
  enabled = true,
}: {
  viewport: SpectrogramWindow;
  currentTime: number;
  isPlaying: boolean;
  onTimeChange?: (time: number) => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    if (isPlaying) onTimeChange?.(currentTime);
  }, [currentTime, isPlaying, onTimeChange, enabled]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!isPlaying || !enabled) return;
      ctx.canvas.style.cursor = "not-allowed";
      const { width } = ctx.canvas;
      const x = scaleTimeToViewport(currentTime, viewport, width);
      drawOnset(ctx, x);
    },
    [currentTime, isPlaying, viewport, enabled],
  );

  return {
    tracking: isPlaying && enabled,
    draw,
  };
}
