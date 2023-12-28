import { useCallback } from "react";
import { type RefObject } from "react";

import { type SoundEventAnnotation } from "@/api/schemas";
import { type SpectrogramWindow } from "@/api/spectrograms";
import drawGeometry from "@/draw/geometry";
import { DANGER } from "@/draw/styles";
import useHoveredAnnotation from "@/hooks/annotation/useHoveredAnnotation";
import useClick from "@/hooks/motions/useClick";
import { type MouseState } from "@/hooks/motions/useMouse";
import { scaleGeometryToViewport } from "@/utils/geometry";

import { type DeleteAnnotationEvent } from "@/machines/annotate";

const DELETE_STYLE = {
  borderColor: DANGER,
  fillColor: DANGER,
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
  annotations: SoundEventAnnotation[];
  window: SpectrogramWindow;
  active: boolean;
  send: (event: DeleteAnnotationEvent | { type: "IDLE" }) => void;
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
      send({ type: "IDLE" });
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
      ctx.canvas.style.cursor = "pointer";
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
