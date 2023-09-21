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

export type EditAnnotationEvent = {
  type: "EDIT";
  geometry: Geometry;
};

export type SelectAnnotationEvent = {
  type: "SELECT_ANNOTATION";
  annotation: Annotation;
};

export type DeleteAnnotationEvent = {
  type: "DELETE_ANNOTATION";
  annotation: Annotation;
};

export type AnnotateEvent =
  | { type: "IDLE" }
  | { type: "SELECT" }
  | { type: "DRAW" }
  | { type: "DELETE" }
  | SelectAnnotationEvent
  | EditAnnotationEvent
  | CreateAnnotationEvent
  | DeleteAnnotationEvent
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
    edit: {
      id: "edit",
      exit: ["clearSelectedAnnotation"],
      initial: "selecting",
      states: {
        selecting: {
          on: {
            SELECT_ANNOTATION: {
              target: "editing",
              actions: "selectAnnotation",
            },
          },
        },
        editing: {
          on: {
            EDIT: {
              target: "updating",
            },
          },
        },
        updating: {
          invoke: {
            src: "updateAnnotationGeometry",
            onDone: {
              target: "editing",
              actions: "updateSelectedAnnotation",
            },
            onError: {
              target: "editing",
            },
          },
        },
      },
    },
    create: {
      initial: "drawing",
      states: {
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
              target: "#edit.editing",
              actions: "finishAnnotationCreation",
            },
            onError: {
              target: "drawing",
            },
          },
          exit: ["clearCreationGeometry"],
        },
      },
    },
    delete: {
      initial: "selecting",
      states: {
        selecting: {
          on: {
            DELETE_ANNOTATION: {
              target: "deleting",
            },
          },
        },
        deleting: {
          invoke: {
            src: "deleteAnnotation",
            onDone: {
              target: "selecting",
            },
            onError: {
              target: "selecting",
            },
          },
        },
      },
    },
    tagging: {},
  },
  on: {
    IDLE: "idle",
    SELECT: "edit",
    DRAW: "create",
    DELETE: "delete",
    RESET: {
      actions: ["reset"],
      target: "idle",
    },
  },
};

export const annotateActions = {
  updateSelectedAnnotation: assign({
    // @ts-ignore
    selectedAnnotation: (_, event) => event.data,
  }),
  clearCreationGeometry: assign({
    geometryToCreate: null,
  }),
  startAnnotationCreation: assign({
    geometryToCreate: (_: AnnotateContext, event: CreateAnnotationEvent) =>
      event.geometry,
  }),
  finishAnnotationCreation: assign({
    // @ts-ignore
    selectedAnnotation: (_: AnnotateContext, data) => data.data,
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
  selectAnnotation: assign({
    selectedAnnotation: (_: AnnotateContext, event: SelectAnnotationEvent) =>
      event.annotation,
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
