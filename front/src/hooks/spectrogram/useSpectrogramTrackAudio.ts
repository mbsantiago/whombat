import { useEffect, useCallback } from "react";

import drawOnset from "@/draw/onset";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type CenterOnEvent } from "@/machines/spectrogram";

export default function useSpectrogramTrackAudio({
  active,
  time,
  window,
  send,
}: {
  active: boolean;
  time?: number;
  window: SpectrogramWindow;
  send: (event: CenterOnEvent) => void;
}) {
  useEffect(() => {
    if (active && time != null) {
      send({ type: "CENTER_ON", time });
    }
  }, [active, send, time]);

  const { min: start, max: end } = window.time;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active || time == null) return;

      if (time < start || time > end) {
        return;
      }

      const x = Math.ceil((ctx.canvas.width * (time - start)) / (end - start));
      drawOnset(ctx, x);
    },
    [active, time, start, end],
  );

  return draw;
}
