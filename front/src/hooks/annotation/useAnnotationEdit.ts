import { useCallback, useEffect, type RefObject } from "react";
import { useKeyPress } from "react-use";

import useDrag from "@/hooks/motions/useDrag";
import useScratch from "@/hooks/motions/useScratch";
import useEditGeometry from "@/hooks/edit/useEditAnnotation";
import {
  type EditAnnotationEvent,
  type CreateAnnotationEvent,
} from "@/machines/annotate";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Annotation } from "@/api/annotations";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Geometry } from "@/utils/types";

const PRIMARY = "rgb(16 185 129)";

const EDIT_STYLE = {
  borderColor: PRIMARY,
  fillColor: PRIMARY,
  borderWidth: 2,
  borderDash: [6, 6],
  fillAlpha: 0.2,
};

export default function useAnnotationEdit({
  mouse,
  active,
  send,
  window,
  annotation,
  ref,
}: {
  mouse: MouseState;
  active: boolean;
  send: (
    event: EditAnnotationEvent | CreateAnnotationEvent | { type: "IDLE" },
  ) => void;
  window: SpectrogramWindow;
  annotation: Annotation | null;
  ref: RefObject<HTMLCanvasElement>;
}) {
  const [control] = useKeyPress("Control");

  useEffect(() => {
    if (control) {
    }
  }, [control]);

  const drag = useScratch({
    ref,
    active,
  });

  const editState = useDrag({
    dragState: drag,
    active,
  });

  const handleEditAnnotation = useCallback(
    (geometry: Geometry) => {
      const event = control
        ? {
            type: "CREATE",
            geometry,
            tag_ids: annotation?.tags.map(
              (annotationTag) => annotationTag.tag.id,
            ),
          }
        : {
            type: "EDIT",
            geometry,
          };
      // @ts-ignore
      send(event);
    },
    [send, control, annotation?.tags],
  );

  const handleClickAway = useCallback(() => {
    send({ type: "IDLE" });
  }, [send]);

  const { draw: drawEdit } = useEditGeometry({
    drag: editState,
    mouse,
    window,
    annotation,
    active,
    onChange: handleEditAnnotation,
    onEmptyClick: handleClickAway,
    style: EDIT_STYLE,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active) return;
      const { canvas } = ctx;
      drawEdit(ctx);
      if (control) {
        canvas.style.cursor = "copy";
      }
    },
    [drawEdit, control, active],
  );

  return draw;
}
