import { useMemo, type WheelEvent } from "react";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { scaleXToWindow, scaleYToWindow } from "@/utils/geometry";

export default function useSpectrogramScrollMove({
  viewport,
  dimensions,
  onScroll,
  shift = false,
  ctrl = false,
  alt = false,
  enabled = true,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onScroll?: (time: number) => void;
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  enabled?: boolean;
}) {
  const scrollProps = useMemo(() => {
    return {
      onWheel: (event: WheelEvent) => {
        const { deltaY, shiftKey, ctrlKey, altKey, metaKey } = event;
        const specialKey = metaKey || altKey;
        if (
          !enabled ||
          ctrlKey != ctrl ||
          shiftKey != shift ||
          specialKey != alt
        )
          return;

        if (shiftKey) {
          const deltaTime = scaleXToWindow(
            deltaY,
            viewport,
            dimensions.width,
            true,
          );
          onScroll?.(deltaTime);
        } else {
          const deltaFreq = scaleYToWindow(
            deltaY,
            viewport,
            dimensions.height,
            true,
          );
          onScroll?.(-deltaFreq);
        }
      },
    };
  }, [enabled, onScroll, viewport, dimensions, ctrl, shift, alt]);

  return {
    scrollProps,
  };
}
