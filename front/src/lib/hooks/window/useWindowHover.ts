import { useMemo } from "react";
import type { DOMAttributes, MouseEvent } from "react";

import type { Dimensions, Position, SpectrogramWindow } from "@/lib/types";
import { scalePixelsToWindow } from "@/lib/utils/geometry";

export default function useWindowHover<T extends HTMLElement>({
  viewport,
  dimensions,
  enabled = true,
  onHover,
}: {
  viewport: SpectrogramWindow;
  /** The dimensions of the canvas. */
  dimensions: Dimensions;
  /** Whether the motion is enabled. */
  enabled?: boolean;
  /** Callback when a click occurs */
  onHover?: (position: Position) => void;
}): DOMAttributes<T> {
  const hoverProps = useMemo(() => {
    return {
      onMouseMove: (e: MouseEvent<T>) => {
        if (!enabled) return;
        const point = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        };
        const position = scalePixelsToWindow(point, viewport, dimensions);
        onHover?.(position);
      },
    };
  }, [viewport, dimensions, enabled, onHover]);
  if (!enabled) return {};
  return hoverProps;
}
