import { useState, useCallback, useMemo, type MouseEvent } from "react";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Shift } from "@/hooks/window/useDrag";
import useDrag from "@/hooks/window/useDrag";
import { mergeProps } from "react-aria";
import { scalePixelsToWindow, scaleBBoxToViewport } from "@/utils/geometry";
import drawBBox from "@/draw/bbox";

export const VALID_STYLE = {
  fillAlpha: 0.3,
  fillColor: "yellow",
  borderWidth: 1,
  borderColor: "yellow",
  borderDash: [4, 4],
};

export const INVALID_STYLE = {
  fillAlpha: 0.3,
  fillColor: "red",
  borderWidth: 1,
  borderColor: "red",
  borderDash: [4, 4],
};

const MIN_TIME_ZOOM = 0.001;
const MIN_FREQ_ZOOM = 1;

function validateWindow(window: SpectrogramWindow) {
  const { time, freq } = window;
  if (time.min < 0 || freq.min < 0) return false;
  return (
    time.max - time.min > MIN_TIME_ZOOM && freq.max - freq.min > MIN_FREQ_ZOOM
  );
}

export default function useSpectrogramZoom({
  viewport,
  dimensions,
  onZoom,
  enabled = true,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onZoom?: (prev: SpectrogramWindow, zoomed: SpectrogramWindow) => void;
  enabled?: boolean;
}) {
  const [isValid, setIsValid] = useState(false);
  const [initialPosition, setInitialPosition] = useState<Shift | null>(null);
  const [currentWindow, setCurrentWindow] = useState<SpectrogramWindow | null>(
    null,
  );

  const clickProps = useMemo(() => {
    const handleClick = (e: MouseEvent) => {
      if (!enabled) return;
      const targetRect = e.currentTarget.getBoundingClientRect();
      const point = {
        x: e.pageX - targetRect.left,
        y: e.pageY - targetRect.top,
      };
      const position = scalePixelsToWindow(point, viewport, dimensions);
      setInitialPosition(position);
    };

    return {
      onMouseDown: handleClick,
      onPointerDown: handleClick,
      onClick: handleClick,
    };
  }, [enabled, viewport, dimensions]);

  const onMoveStart = useCallback(() => {
    if (!enabled) return;
    setCurrentWindow(null);
  }, [enabled]);

  const onMove = useCallback(
    (pos: Shift) => {
      if (!enabled || initialPosition == null) return;
      const { time, freq } = initialPosition;
      const window = {
        time: {
          min: Math.min(time, time + pos.time),
          max: Math.max(time, time + pos.time),
        },
        freq: {
          min: Math.min(freq, freq - pos.freq),
          max: Math.max(freq, freq - pos.freq),
        },
      };
      setCurrentWindow(window);
      setIsValid(validateWindow(window));
    },
    [initialPosition, enabled],
  );

  const onMoveEnd = useCallback(() => {
    if (!enabled || currentWindow == null) return;
    if (isValid) {
      onZoom?.(viewport, currentWindow);
    }
    setInitialPosition(null);
    setCurrentWindow(null);
  }, [enabled, currentWindow, onZoom, viewport, isValid]);

  const { moveProps, isDragging } = useDrag({
    viewport,
    dimensions,
    onMoveStart,
    onMove,
    onMoveEnd,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!enabled) return;

      if (currentWindow == null) return;
      ctx.canvas.style.cursor = "nwse-resize";

      const dimensions = ctx.canvas.getBoundingClientRect();
      const bbox = scaleBBoxToViewport(
        dimensions,
        [
          currentWindow.time.min,
          currentWindow.freq.min,
          currentWindow.time.max,
          currentWindow.freq.max,
        ],
        viewport,
      );

      const style = isValid ? VALID_STYLE : INVALID_STYLE;
      drawBBox(ctx, bbox, style);
    },
    [enabled, currentWindow, viewport, isValid],
  );

  const zoomProps = mergeProps(clickProps, moveProps);

  return {
    zoomProps,
    isDragging,
    isValid,
    draw,
  };
}
