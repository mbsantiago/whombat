import { useCallback } from "react";
import { mergeProps, usePress } from "react-aria";

import drawGeometry from "@/draw/geometry";
import { RED } from "@/draw/styles";
import useHoveredAnnotation from "@/hooks/annotation/useHoveredAnnotation";
import { scaleGeometryToViewport } from "@/utils/geometry";

import type {
  Dimensions,
  SoundEventAnnotation,
  SpectrogramWindow,
} from "@/types";

const DELETE_STYLE = {
  borderColor: RED,
  fillColor: RED,
  borderWidth: 3,
  fillAlpha: 0.2,
};

export default function useAnnotationDelete({
  annotations,
  viewport,
  dimensions,
  enabled = true,
  onDelete,
  onDeselect,
}: {
  annotations: SoundEventAnnotation[];
  dimensions: Dimensions;
  viewport: SpectrogramWindow;
  enabled: boolean;
  onDelete?: (annotation: SoundEventAnnotation) => void;
  onDeselect?: () => void;
}) {
  const {
    props: hoverProps,
    hoveredAnnotation: hovered,
    clear,
  } = useHoveredAnnotation({
    viewport,
    dimensions,
    annotations,
    enabled,
  });

  const handleClick = useCallback(() => {
    if (!enabled) return;
    if (hovered == null) {
      onDeselect?.();
    } else {
      onDelete?.(hovered);
      clear();
    }
  }, [hovered, enabled, onDelete, onDeselect, clear]);

  const { pressProps } = usePress({
    onPress: handleClick,
    isDisabled: !enabled,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!enabled || hovered == null) return;
      ctx.canvas.style.cursor = "pointer";
      const geometry = scaleGeometryToViewport(
        { width: ctx.canvas.width, height: ctx.canvas.height },
        hovered.sound_event.geometry,
        viewport,
      );

      drawGeometry(ctx, geometry, DELETE_STYLE);
    },
    [viewport, hovered, enabled],
  );

  const props = mergeProps(pressProps, hoverProps);

  return {
    props,
    draw,
  };
}
