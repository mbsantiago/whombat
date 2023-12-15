import { useCallback, useEffect } from "react";
import { useActor, useMachine } from "@xstate/react";
import { type RefObject } from "react";

import {
  annotateMachine,
  type CreateAnnotationEvent,
  type AddTagEvent,
  type RemoveTagEvent,
  type DeleteAnnotationEvent,
  type EditAnnotationEvent,
} from "@/machines/annotate";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useAnnotationTags from "@/hooks/annotation/useAnnotationTags";
import useAnnotateKeyShortcuts from "@/hooks/annotation/useAnnotateKeyShortcuts";
import useAnnotationCreate from "@/hooks/annotation/useAnnotationCreate";
import useAnnotationEdit from "@/hooks/annotation/useAnnotationEdit";
import useAnnotationDelete from "@/hooks/annotation/useAnnotationDelete";
import useAnnotationSelect from "@/hooks/annotation/useAnnotationSelect";
import useAnnotationDraw from "@/hooks/annotation/useAnnotationDraw";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type SpectrogramParameters } from "@/api/spectrograms";
import {
  type SoundEventAnnotation,
  type Tag,
  type Geometry,
  type ClipAnnotation,
} from "@/api/schemas";

export default function useAnnotateSpectrogram({
  soundEventAnnotations: soundEventAnnotations,
  parameters,
  mouseState,
  scratchState,
  ref,
  onAddAnnotationTag: onAddTag,
  onRemoveTag,
  onCreateAnnotation,
  onUpdateAnnotationGeometry,
  onDeleteAnnotation,
}: {
  clipAnnotation: ClipAnnotation;
  soundEventAnnotations: SoundEventAnnotation[];
  parameters: SpectrogramParameters;
  mouseState: MouseState;
  scratchState: ScratchState;
  ref: RefObject<HTMLCanvasElement>;
  onAddAnnotationTag?: (
    annotation: SoundEventAnnotation,
    tag: Tag,
  ) => Promise<SoundEventAnnotation>;
  onRemoveTag?: (
    annotation: SoundEventAnnotation,
    tag: Tag,
  ) => Promise<SoundEventAnnotation>;
  onCreateAnnotation?: (
    geometry: Geometry,
    tags?: Tag[],
  ) => Promise<SoundEventAnnotation>;
  onUpdateAnnotationGeometry?: (
    annotation: SoundEventAnnotation,
    geometry: Geometry,
  ) => Promise<SoundEventAnnotation>;
  onDeleteAnnotation?: (
    annotation: SoundEventAnnotation,
  ) => Promise<SoundEventAnnotation>;
}) {
  const [state, send] = useMachine(annotateMachine, {
    context: {
      clipAnnotation,
      parameters,
      selectedAnnotation: null,
      geometryType: "BoundingBox",
    },
    actions: {
      addTag: async (_, event: AddTagEvent) => {
        const { annotation, tag } = event;
        return await onAddTag?.(annotation, tag);
      },
      removeTag: async (_, event: RemoveTagEvent) => {
        const { annotation, tag } = event;
        return await onRemoveTag?.(annotation, tag);
      },
    },
    services: {
      // @ts-ignore
      createAnnotation: async (context, event: CreateAnnotationEvent) => {
        let { geometry, tags } = event;
        let { task } = context;

        if (geometry == null) {
          throw new Error("No geometry to create");
        }
        return await onCreateAnnotation?.(task, geometry, tags);
      },
      // @ts-ignore
      updateAnnotationGeometry: async (ctx, event: EditAnnotationEvent) => {
        const { selectedAnnotation } = ctx;
        const { geometry } = event;

        if (selectedAnnotation == null) {
          throw new Error("No annotation selected");
        }

        return await onUpdateAnnotationGeometry?.(selectedAnnotation, geometry);
      },
      // @ts-ignore
      deleteAnnotation: async (_, event: DeleteAnnotationEvent) => {
        const { annotation } = event;
        return await onDeleteAnnotation?.(annotation);
      },
    },
  });

  // Make sure the task is updated when the task prop changes
  useEffect(() => {
    send({ type: "CHANGE_TASK", task });
  }, [task, send]);

  const [specState, specSend] = useActor(state.context.spectrogram);

  // Attach keyboard listeners for annotation shortcuts
  useAnnotateKeyShortcuts({
    send,
    cond: state.matches("edit.editing"),
  });

  const { draw: drawSpec } = useSpectrogram({
    state: specState,
    send: specSend,
    dragState: scratchState,
    recording: specState.context.recording,
    ref,
  });

  const drawAnnotationCreate = useAnnotationCreate({
    drag: scratchState,
    window: specState.context.window,
    send,
    active: state.matches("create.drawing"),
    geometryType: state.context.geometryType,
  });

  const drawAnnotationEdit = useAnnotationEdit({
    mouse: mouseState,
    ref,
    active: state.matches("edit.editing"),
    send,
    window: specState.context.window,
    annotation: state.context.selectedAnnotation,
  });

  const drawAnnotationDelete = useAnnotationDelete({
    ref,
    mouse: mouseState,
    annotations: soundEventAnnotations,
    window: specState.context.window,
    active: state.matches("delete.selecting"),
    send,
  });

  const drawAnnotationSelect = useAnnotationSelect({
    ref,
    mouse: mouseState,
    annotations: soundEventAnnotations,
    window: specState.context.window,
    active: state.matches("edit.selecting"),
    send,
  });

  const drawAnnotations = useAnnotationDraw({
    window: specState.context.window,
    annotations: soundEventAnnotations,
  });

  const tags = useAnnotationTags({
    annotations: soundEventAnnotations,
    window: specState.context.window,
    active: state.matches("idle"),
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
      drawAnnotationDelete(ctx);
      drawAnnotationSelect(ctx);
      drawAnnotationEdit(ctx);
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
