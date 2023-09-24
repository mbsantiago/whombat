import { useCallback } from "react";
import { useActor } from "@xstate/react";
import { type RefObject } from "react";
import { type StateFrom, type EventFrom } from "xstate";

import { annotateMachine } from "@/machines/annotate";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useAnnotationTags from "@/hooks/annotation/useAnnotationTags";
import useAnnotateKeyShortcuts from "@/hooks/annotation/useAnnotateKeyShortcuts";
import useAnnotationCreate from "@/hooks/annotation/useAnnotationCreate";
import useAnnotationEdit from "@/hooks/annotation/useAnnotationEdit";
import useAnnotationDelete from "@/hooks/annotation/useAnnotationDelete";
import useAnnotationSelect from "@/hooks/annotation/useAnnotationSelect";
import useAnnotationDraw from "@/hooks/annotation/useAnnotationDraw";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type ScrollState } from "@/hooks/motions/useMouseWheel";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Recording } from "@/api/recordings";
import { type Annotation } from "@/api/annotations";

export default function useAnnotate({
  state,
  send,
  annotations,
  recording,
  mouseState,
  scratchState,
  scrollState,
  ref,
}: {
  state: StateFrom<typeof annotateMachine>;
  send: (event: EventFrom<typeof annotateMachine>) => void;
  recording: Recording;
  annotations: Annotation[];
  mouseState: MouseState;
  scratchState: ScratchState;
  scrollState: ScrollState;
  ref: RefObject<HTMLCanvasElement>;
}) {
  const [specState, specSend] = useActor(state.context.spectrogram);

  useAnnotateKeyShortcuts({
    send,
    cond: state.matches("edit.editing"),
  });

  const { draw: drawSpec } = useSpectrogram({
    state: specState,
    send: specSend,
    dragState: scratchState,
    scrollState,
    recording,
  });

  const drawAnnotationCreate = useAnnotationCreate({
    drag: scratchState,
    window: specState.context.window,
    send,
    active: state.matches("create.drawing"),
    geometryType: state.context.geometryType,
  });

  const drawAnnotationEdit = useAnnotationEdit({
    drag: scratchState,
    mouse: mouseState,
    active: state.matches("edit.editing"),
    send,
    window: specState.context.window,
    annotation: state.context.selectedAnnotation,
  });

  const drawAnnotationDelete = useAnnotationDelete({
    ref,
    mouse: mouseState,
    annotations,
    window: specState.context.window,
    active: state.matches("delete.selecting"),
    send,
  });

  const drawAnnotationSelect = useAnnotationSelect({
    ref,
    mouse: mouseState,
    annotations,
    window: specState.context.window,
    active: state.matches("edit.selecting"),
    send,
  });

  const drawAnnotations = useAnnotationDraw({
    window: specState.context.window,
    annotations,
  });

  const tags = useAnnotationTags({
    annotations,
    window: specState.context.window,
    dimensions: {
      width: ref.current?.width ?? 0,
      height: ref.current?.height ?? 0,
    },
    send,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawSpec(ctx);
      drawAnnotations(ctx);
      drawAnnotationCreate(ctx);
      drawAnnotationEdit(ctx);
      drawAnnotationDelete(ctx);
      drawAnnotationSelect(ctx);
    },
    [
      drawSpec,
      drawAnnotationCreate,
      drawAnnotations,
      drawAnnotationEdit,
      drawAnnotationDelete,
      drawAnnotationSelect,
    ],
  );

  return {
    state,
    send,
    draw,
    tags,
  };
}
