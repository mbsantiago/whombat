import { useCallback } from "react";
import { useActor, useMachine } from "@xstate/react";
import toast from "react-hot-toast";

import { annotateMachine } from "@/machines/annotate";
import { scaleGeometryToViewport, scaleGeometryToWindow } from "@/utils/geometry";
import drawBBox from "@/draw/bbox";
import useCreateBBox from "@/hooks/draw/useCreateBBox";
import useStore from "@/store";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useAnnotations from "@/hooks/api/useAnnotations";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type ScrollState } from "@/hooks/motions/useMouseWheel";
import { type Task } from "@/api/tasks";
import { type Recording } from "@/api/recordings";

const CREATE_BBOX_STYLE = {
  borderColor: "yellow",
  borderWidth: 2,
  borderDash: [5, 5],
};

export default function useAnnotate({
  task,
  recording,
  dragState,
  scrollState,
}: {
  task: Task;
  recording: Recording;
  dragState: ScratchState;
  scrollState: ScrollState;
}) {
  const annotations = useAnnotations({
    filter: {
      task__eq: task.id,
    }
  });

  const parameters = useStore((state) => state.spectrogramSettings);

  const [state, send] = useMachine(annotateMachine, {
    context: {
      task,
      recording,
      tags: [],
      parameters,
      selectedAnnotation: null,
    },
    services: {
      createAnnotation: async (ctx, _) => {
        const { task, geometryToCreate } = ctx;

        if (geometryToCreate == null) {
          throw new Error("No geometry to create");
        }

        const annotation = annotations.create.mutateAsync({
          task_id: task.id,
          geometry: geometryToCreate,
        });

        toast.promise(annotation, {
          loading: "Creating annotation...",
          success: "Annotation created",
          error: "Failed to create annotation",
        });

        return await annotation;
      },
    },
  });

  const [specState, specSend] = useActor(state.context.spectrogram);

  const { draw: drawSpec } = useSpectrogram({
    state: specState,
    send: specSend,
    dragState,
    scrollState,
  });

  const handleBBoxCreate = useCallback(
    ({
      bbox,
      dims,
    }: {
      bbox: [number, number, number, number];
      dims: { width: number; height: number };
    }) => {
      const window = specState.context.window;
      const geometry = scaleGeometryToWindow(
        dims,
        {
          type: "BoundingBox",
          coordinates: bbox,
        },
        window,
      );
      send({
        type: "CREATE",
        geometry,
      });
    },
    [send, specState.context.window],
  );
  const { draw: drawCreateBBox } = useCreateBBox({
    drag: dragState,
    active: state.matches("drawing"),
    onCreate: handleBBoxCreate,
    style: CREATE_BBOX_STYLE,
  });

  const drawAnnotations = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const window = specState.context.window;
      const items = annotations.items;
      for (const item of items) {

        const geometry = scaleGeometryToViewport(
          { width: ctx.canvas.width, height: ctx.canvas.height},
          // @ts-ignore
          item.sound_event.geometry,
          window,
        );

        // @ts-ignore
        drawBBox(ctx, geometry.coordinates);
      }
    }, [specState.context.window, annotations.items]
  )

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawSpec(ctx);
      drawCreateBBox(ctx);
      drawAnnotations(ctx);
    },
    [drawSpec, drawCreateBBox, drawAnnotations],
  );

  return {
    state,
    send,
    draw,
  };
}
