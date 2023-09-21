import { useCallback } from "react";
import { type RefObject } from "react";

import { scaleGeometryToViewport } from "@/utils/geometry";
import useHoveredAnnotation from "@/hooks/annotation/useHoveredAnnotation";
import drawGeometry from "@/draw/geometry";
import useClick from "@/hooks/motions/useClick";
import { type DeleteAnnotationEvent } from "@/machines/annotate";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Annotation } from "@/api/annotations";
import { type SpectrogramWindow } from "@/api/spectrograms";

const DELETE_STYLE = {
  borderColor: "red",
  fillColor: "red",
  borderWidth: 3,
  fillAlpha: 0.2,
};

export default function useAnnotationDelete({
  ref,
  mouse,
  annotations,
  window,
  active,
  send,
}: {
  ref: RefObject<HTMLCanvasElement>;
  mouse: MouseState;
  annotations: Annotation[];
  window: SpectrogramWindow;
  active: boolean;
  send: (event: DeleteAnnotationEvent | "IDLE") => void;
}) {
  const hovered = useHoveredAnnotation({
    mouse,
    annotations: annotations,
    window: window,
    active,
  });

  const handleClick = useCallback(() => {
    if (!active) return;

    if (hovered == null) {
      send("IDLE");
    } else {
      send({
        type: "DELETE_ANNOTATION",
        annotation: hovered,
      });
    }
  }, [hovered, send, active]);

  useClick({
    ref,
    onClick: handleClick,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active || hovered == null) return;
      const geometry = scaleGeometryToViewport(
        { width: ctx.canvas.width, height: ctx.canvas.height },
        // @ts-ignore
        hovered.sound_event.geometry,
        window,
      );

      drawGeometry(ctx, geometry, DELETE_STYLE);
    },
    [window, hovered, active],
  );

  return draw;
}
