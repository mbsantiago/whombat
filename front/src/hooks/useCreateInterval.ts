import { useState, useEffect, useCallback } from "react";
import { type DragState } from "@/hooks/useWindowDrag";
import type { Interval } from "@/api/audio";
import type { Style } from "@/draw/styles";
import drawInterval, { DEFAULT_INTERVAL_STYLE } from "@/draw/interval";

export interface UseCreateIntervalProps {
  drag: DragState;
  active: boolean;
  onCreate?: (interval: Interval) => void;
  style?: Style;
}

// export default function useCreateInterval({
//   drag,
//   active,
//   onCreate = () => null,
//   style = DEFAULT_INTERVAL_STYLE,
// }: UseCreateIntervalProps): {
//   interval: Interval | null;
//   isDrawing: boolean;
//   draw: (ctx: CanvasRenderingContext2D) => void;
// } {
//   const [interval, setInterval] = useState<Interval | null>(null);
//   const [isDrawing, setIsDrawing] = useState<boolean>(false);
//
//   useEffect(() => {
//     if (active) {
//       if (drag.isScratching) {
//         setIsDrawing(true);
//       } else {
//         setIsDrawing(false);
//
//         if (interval != null) {
//           onCreate(interval);
//           setInterval(null);
//         }
//       }
//     }
//   }, [active, drag.isScratching, interval, onCreate]);
//
//   useEffect(() => {
//     if (active) {
//       const start = drag.startingPoint;
//       const current = drag.currentPoint;
//
//       if (start != null && current != null) {
//         const left = Math.min(start.x, current.x);
//         const right = Math.max(start.x, current.x);
//         setInterval([left, right]);
//       }
//     }
//   }, [active, drag.currentPoint, drag.startingPoint]);
//
//   const draw = useCallback(
//     (ctx: CanvasRenderingContext2D) => {
//       if (!active) return;
//       if (!isDrawing) return;
//       if (interval == null) return;
//       drawInterval(ctx, interval, style);
//     },
//     [active, interval, isDrawing, style],
//   );
//
//   return {
//     interval,
//     isDrawing,
//     draw,
//   };
// }
