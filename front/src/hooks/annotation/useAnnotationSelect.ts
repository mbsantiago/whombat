import { useCallback } from "react";
import { mergeProps, usePress } from "react-aria";

import drawGeometry from "@/draw/geometry";
import { ORANGE } from "@/draw/styles";
import useHoveredAnnotation from "@/hooks/annotation/useHoveredAnnotation";
import { scaleGeometryToViewport } from "@/utils/geometry";

import type {
  Dimensions,
  SoundEventAnnotation,
  SpectrogramWindow,
} from "@/types";

const SELECT_STYLE = {
  borderColor: ORANGE,
  fillColor: ORANGE,
  borderWidth: 2,
  fillAlpha: 0.2,
};

export default function useAnnotationSelect({
  annotations,
  viewport,
  dimensions,
  enabled = true,
  onSelect,
  onDeselect,
}: {
  annotations: SoundEventAnnotation[];
  dimensions: Dimensions;
  viewport: SpectrogramWindow;
  enabled: boolean;
  onSelect?: (annotation: SoundEventAnnotation) => void;
  onDeselect?: () => void;
}) {
  const { props: hoverProps, hoveredAnnotation: hovered } =
    useHoveredAnnotation({
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
      onSelect?.(hovered);
    }
  }, [hovered, enabled, onSelect, onDeselect]);

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
        // @ts-ignore
        hovered.sound_event.geometry,
        viewport,
      );

      drawGeometry(ctx, geometry, SELECT_STYLE);
    },
    [viewport, hovered, enabled],
  );

  const props = mergeProps(pressProps, hoverProps);

  return {
    props,
    draw,
  };
}
