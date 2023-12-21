import { useMemo, type WheelEvent } from "react";
import { type SpectrogramWindow } from "@/api/spectrograms";

export default function useSpectrogramScrollMove({
  dimensions,
  onScroll,
  shift = false,
  ctrl = false,
  alt = false,
  enabled = true,
}: {
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
          const factor = deltaY / dimensions.height;
          onScroll?.(1 + factor);
        } else {
          const factor = deltaY / dimensions.height;
          onScroll?.(1 + factor);
        }
      },
    };
  }, [enabled, onScroll, dimensions, ctrl, shift, alt]);

  return {
    scrollProps,
  };
}
