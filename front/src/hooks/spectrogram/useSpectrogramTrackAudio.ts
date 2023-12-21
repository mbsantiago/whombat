import { useEffect, useCallback } from "react";

import { scaleTimeToViewport } from "@/utils/geometry";
import drawOnset from "@/draw/onset";
import { type SpectrogramWindow } from "@/api/spectrograms";

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
