import { ActorRefFrom, assign, createMachine, spawn } from "xstate";

import { spectrogramMachine } from "@/machines/spectrogram";
import { type Tag } from "@/api/tags";
import { type Annotation } from "@/api/annotations";
import { type Geometry } from "@/api/sound_events";
import { type StatusBadge } from "@/api/tasks";
import { type Task } from "@/api/tasks";
import { type Recording } from "@/api/recordings";
import { type SpectrogramParameters } from "@/api/spectrograms";

export type AnnotateContext = {
  tags: Tag[];
  task: Task;
  parameters: SpectrogramParameters;
  recording: Recording;
  spectrogram: ActorRefFrom<typeof spectrogramMachine>;
  selectedAnnotation: Annotation | null;
  geometryToCreate: Geometry | null;
};

export type CreateAnnotationEvent = {
  type: "CREATE";
  geometry: Geometry;
};
export type AnnotateEvent =
  | { type: "IDLE" }
  | { type: "SELECT" }
  | { type: "SELECT_ANNOTATION"; annotation: Annotation }
  | { type: "EDIT"; annotation: Annotation }
  | { type: "DRAW" }
  | CreateAnnotationEvent
  | { type: "DELETE" }
  | { type: "DELETE_ANNOTATION"; annotation: Annotation }
  | { type: "ADD_NOTE"; annotation: Annotation }
  | { type: "ADD_STATUS_BADGE"; badge: StatusBadge }
  | { type: "REMOVE_STATUS_BADGE"; badge: StatusBadge }
  | { type: "UPDATE_NOTE"; annotation: Annotation }
  | { type: "ADD_TAG"; tag: Tag }
  | { type: "REMOVE_TAG"; tag: Tag }
  | { type: "ADD_GLOBAL_TAG"; tag: Tag }
  | { type: "REMOVE_GLOBAL_TAG"; tag: Tag };

export const annotateStates = {
  initial: "idle",
  entry: ["setupSpectrogram"],
  states: {
    idle: {
      exit: ["disableSpectrogram"],
    },
    selecting: {
      on: {
        SELECT_ANNOTATION: {
          target: "editing",
          actions: "selectAnnotation",
        },
      },
    },
    editing: {
      exit: ["clearSelectedAnnotation"],
    },
    drawing: {
      on: {
        CREATE: {
          target: "creating",
          actions: "startAnnotationCreation",
        },
      },
    },
    creating: {
      invoke: {
        src: "createAnnotation",
        onDone: {
          target: "editing",
          actions: "finishAnnotationCreation",
        },
        onError: {
          target: "drawing",
        },
      },
      exit: ["clearCreationGeometry"],
    },
    deleting: {},
    tagging: {},
    failed: {},
  },
  on: {
    IDLE: "idle",
    SELECT: "selecting",
    DRAW: "drawing",
    DELETE: "deleting",
    RESET: {
      actions: ["reset"],
      target: "idle",
    },
  },
};

export const annotateActions = {
  clearCreationGeometry: assign({
    geometryToCreate: null,
  }),
  startAnnotationCreation: assign({
    geometryToCreate: (_: AnnotateContext, event: CreateAnnotationEvent) =>
      event.geometry,
  }),
  disableSpectrogram: (context: AnnotateContext) => {
    context.spectrogram.send({ type: "DISABLE" });
  },
  setupSpectrogram: assign({
    spectrogram: (context: AnnotateContext) => {
      if (context.spectrogram != null) return context.spectrogram;

      const bounds = {
        time: {
          min: context.task.clip.start_time,
          max: context.task.clip.end_time,
        },
        freq: {
          min: 0,
          max: context.recording.samplerate / 2,
        },
      };

      const initial = {
        time: {
          min: context.task.clip.start_time,
          max: Math.min(
            context.task.clip.end_time,
            context.task.clip.start_time + 1,
          ),
        },
        freq: {
          min: 0,
          max: context.recording.samplerate / 2,
        },
      };

      return spawn(
        // @ts-ignore
        spectrogramMachine.withContext({
          recording: context.recording,
          parameters: context.parameters,
          bounds,
          initial,
          window: initial,
        }),
      );
    },
  }),
  selectAnnotation: (
    _: AnnotateContext,
    event: {
      type: "SELECT_ANNOTATION";
      annotation: Annotation;
    },
  ) =>
    assign({
      selectedAnnotation: event.annotation,
    }),
  clearSelectedAnnotation: (_: AnnotateContext) =>
    assign({
      selectedAnnotation: null,
    }),
};

export const annotateMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as AnnotateContext,
      events: {} as AnnotateEvent,
    },
    id: "annotate",
    ...annotateStates,
  },
  {
    // @ts-ignore
    actions: annotateActions,
  },
);
