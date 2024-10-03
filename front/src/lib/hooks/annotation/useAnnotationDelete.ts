import { useCallback } from "react";
import { mergeProps, usePress } from "react-aria";

import useHoveredAnnotation from "@/lib/hooks/annotation/useHoveredAnnotation";

import drawGeometry from "@/lib/draw/geometry";
import { RED } from "@/lib/draw/styles";
import type {
  Dimensions,
  SoundEventAnnotation,
  SpectrogramWindow,
} from "@/lib/types";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";

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

  if (!enabled) {
    return {
      props: {},
      draw: _VOID_FN,
    };
  }

  return {
    props,
    draw,
  };
}

const _VOID_FN = () => {};
