import { useEffect, useState, useCallback } from "react";
import drawBBox, { BBoxStyle, DEFAULT_BBOX_STYLE } from "@/draw/bbox";
import useDrag from "@/hooks/useDrag";
import { type DragState } from "@/hooks/useDrag";
import { type BBox } from "@/utils/types";

export interface UseCreateBBoxProps {
  drag: DragState;
  active: boolean;
  style?: BBoxStyle;
  onCreate?: (bbox: BBox) => void;
}

interface CreateBBox {
  bbox: BBox | null;
  isDrawing: boolean;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export default function useCreateBBox({
  drag,
  active,
  style = DEFAULT_BBOX_STYLE,
  onCreate,
}: UseCreateBBoxProps): CreateBBox {
  // State of the bbox creation
  const [bbox, setBBox] = useState<BBox | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Monitor dragging and start and end points
  const {
    isDragging,
    start: startingPoint,
    current: currentPoint,
  } = useDrag({
    dragState: drag,
    active,
  });

  // Handle start and end of bbox creation
  useEffect(() => {
    if (active) {
      if (isDragging && bbox == null) {
        // Start drawing when dragging starts
        setIsDrawing(true);
        setBBox(null);
      } else if (!isDragging && bbox != null) {
        // Stop drawing when dragging stops
        setIsDrawing(false);

        // Create the bbox
        onCreate?.(bbox);
        setBBox(null);
      }
    }
  }, [active, isDragging, bbox, onCreate]);

  // Update the bbox when the starting and current points change
  useEffect(() => {
    if (active) {
      const start = startingPoint;
      const current = currentPoint;
      if (start != null && current != null) {
        const left = Math.min(start[0], current[0]);
        const right = Math.max(start[0], current[0]);
        const top = Math.min(start[1], current[1]);
        const bottom = Math.max(start[1], current[1]);
        setBBox([left, top, right, bottom]);
      }
    }
  }, [active, currentPoint, startingPoint]);

  // Create a drawing function for the bbox
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active) return;
      if (!isDrawing) return;
      if (bbox == null) return;
      drawBBox(ctx, bbox, style);
    },
    [active, bbox, isDrawing, style],
  );

  return {
    bbox,
    isDrawing,
    draw,
  };
}
