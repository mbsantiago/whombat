import { useCallback } from "react";

import type { SpectrogramWindow } from "@/lib/types";
import type { ViewportController } from "@/lib/hooks/window/useViewport";
import useSpectrogramBox from "@/lib/hooks/spectrogram/useSpectrogramBBox";

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
  onZoom,
}: {
  viewport: ViewportController;
  onZoom?: (window: SpectrogramWindow) => void;
}) {
  const { set: setViewport, save } = viewport;
  const handleZoom = useCallback(
    (window: SpectrogramWindow) => {
      save();
      setViewport(window);
      onZoom?.(window);
    },
    [setViewport, save, onZoom],
  );

  const { onMove, onMoveStart, onMoveEnd, drawFn } = useSpectrogramBox({
    viewport,
    onCreateBox: handleZoom,
  });

  return { onMove, onMoveStart, onMoveEnd, drawFn };
}

// export default function useSpectrogramZoom({
//   viewport,
//   dimensions,
//   onZoom,
//   enabled = true,
// }: {
//   viewport: SpectrogramWindow;
//   dimensions: { width: number; height: number };
//   onZoom?: (window: SpectrogramWindow) => void;
//   enabled?: boolean;
// }) {
//   const [isValid, setIsValid] = useState(false);
//   const [currentWindow, setCurrentWindow] = useState<SpectrogramWindow | null>(
//     null,
//   );
//
//   const handleMoveStart = useCallback(() => {
//     setCurrentWindow(null);
//   }, []);
//
//   const handleMove = useCallback(
//     ({ initial, shift }: { initial: Position; shift: Position }) => {
//       const window = {
//         time: {
//           min: Math.min(initial.time, initial.time + shift.time),
//           max: Math.max(initial.time, initial.time + shift.time),
//         },
//         freq: {
//           min: Math.min(initial.freq, initial.freq - shift.freq),
//           max: Math.max(initial.freq, initial.freq - shift.freq),
//         },
//       };
//       setCurrentWindow(window);
//       setIsValid(validateWindow(window));
//     },
//     [],
//   );
//
//   const handleMoveEnd = useCallback(() => {
//     if (currentWindow == null) return;
//     if (isValid) {
//       onZoom?.(currentWindow);
//     }
//     setCurrentWindow(null);
//   }, [currentWindow, isValid, onZoom]);
//
//   const { props, isDragging } = useWindowMotions({
//     enabled,
//     viewport,
//     dimensions,
//     onMoveStart: handleMoveStart,
//     onMove: handleMove,
//     onMoveEnd: handleMoveEnd,
//   });
//
//   const draw = useCallback(
//     (ctx: CanvasRenderingContext2D) => {
//       if (!enabled) return;
//
//       if (currentWindow == null) return;
//       ctx.canvas.style.cursor = "nwse-resize";
//
//       const dimensions = ctx.canvas.getBoundingClientRect();
//       const bbox = scaleBBoxToViewport(
//         dimensions,
//         [
//           currentWindow.time.min,
//           currentWindow.freq.min,
//           currentWindow.time.max,
//           currentWindow.freq.max,
//         ],
//         viewport,
//       );
//
//       const style = isValid ? VALID_STYLE : INVALID_STYLE;
//       drawBBox(ctx, bbox, style);
//     },
//     [enabled, currentWindow, viewport, isValid],
//   );
//
//   return {
//     zoomProps: props,
//     isDragging,
//     isValid,
//     draw,
//   };
// }
