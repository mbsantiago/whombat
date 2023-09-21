import { useCallback } from "react";

import useDrag from "@/hooks/motions/useDrag";
import useEditGeometry from "@/hooks/edit/useEditAnnotation";
import { type EditAnnotationEvent } from "@/machines/annotate";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Annotation } from "@/api/annotations";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Geometry } from "@/utils/types";

const EDIT_STYLE = {
  borderColor: "yellow",
  fillColor: "yellow",
  borderWidth: 2,
  borderDash: [6, 6],
  fillAlpha: 0.2,
};

export default function useAnnotationEdit({
  drag,
  mouse,
  active,
  send,
  window,
  annotation,
}: {
  drag: ScratchState;
  mouse: MouseState;
  active: boolean;
  send: (event: EditAnnotationEvent | "IDLE") => void;
  window: SpectrogramWindow;
  annotation: Annotation | null;
}) {
  const editState = useDrag({
    dragState: drag,
    active,
  });

  const handleEditAnnotation = useCallback(
    (geometry: Geometry) => {
      send({
        type: "EDIT",
        // @ts-ignore
        geometry,
      });
    },
    [send],
  );

  const handleClickAway = useCallback(() => {
    send("IDLE");
  }, [send]);

  const { draw } = useEditGeometry({
    drag: editState,
    mouse,
    window,
    annotation,
    active,
    onChange: handleEditAnnotation,
    onEmptyClick: handleClickAway,
    style: EDIT_STYLE,
  });

  return draw;
}
