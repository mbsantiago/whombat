import { useCallback } from "react";
import { type RefObject } from "react";

import { scaleGeometryToViewport } from "@/utils/geometry";
import drawGeometry from "@/draw/geometry";
import useClick from "@/hooks/motions/useClick";
import useHoveredAnnotation from "@/hooks/annotation/useHoveredAnnotation";
import { type SelectAnnotationEvent } from "@/machines/annotate";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Annotation } from "@/api/annotations";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { WARNING } from "@/draw/styles";

const SELECT_STYLE = {
  borderColor: WARNING,
  fillColor: WARNING,
  borderWidth: 2,
  fillAlpha: 0.2,
};

export default function useAnnotationSelect({
  ref,
  mouse,
  annotations,
  window,
  send,
  active,
}: {
  ref: RefObject<HTMLCanvasElement>;
  mouse: MouseState;
  annotations: Annotation[];
  window: SpectrogramWindow;
  send: (event: SelectAnnotationEvent | { type: "IDLE" }) => void;
  active: boolean;
}) {
  const hovered = useHoveredAnnotation({
    mouse,
    annotations,
    window,
    active,
  });

  const handleClick = useCallback(() => {
    if (!active) return;
    if (hovered == null) {
      send({ type: "IDLE" });
    } else {
      send({
        type: "SELECT_ANNOTATION",
        annotation: hovered,
      });
    }
  }, [hovered, active, send]);

  useClick({
    ref,
    onClick: handleClick,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active || hovered == null) return;

      ctx.canvas.style.cursor = "pointer";

      const geometry = scaleGeometryToViewport(
        { width: ctx.canvas.width, height: ctx.canvas.height },
        // @ts-ignore
        hovered.sound_event.geometry,
        window,
      );

      drawGeometry(ctx, geometry, SELECT_STYLE);
    },
    [window, hovered, active],
  );

  return draw;
}
