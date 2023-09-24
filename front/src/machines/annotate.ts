import { ActorRefFrom, assign, createMachine, spawn } from "xstate";

import { spectrogramMachine } from "@/machines/spectrogram";
import { getInitialDuration } from "@/utils/windows";
import { type Tag } from "@/api/tags";
import { type Annotation, type AnnotationTag } from "@/api/annotations";
import { type Geometry } from "@/api/sound_events";
import { type Task } from "@/api/tasks";
import { type Recording } from "@/api/recordings";
import { type SpectrogramParameters } from "@/api/spectrograms";

export type AnnotateContext = {
  // Global settings
  parameters: SpectrogramParameters;
  geometryType: "TimeStamp" | "TimeInterval" | "BoundingBox";

  // Data for current task
  task: Task;
  recording: Recording;

  // Spectrogram Machine
  spectrogram: ActorRefFrom<typeof spectrogramMachine>;

  // Annotation state
  selectedAnnotation: Annotation | null;
  geometryToCreate: Geometry | null;
};

export type AnnotateContextWithData = AnnotateContext & {
  task: Task;
  recording: Recording;
  annotations: Annotation[];
};

export type CreateAnnotationEvent = {
  type: "CREATE";
  geometry: Geometry;
  tag_ids?: number[];
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

export type SelecteGeometryTypeEvent = {
  type: "SELECT_GEOMETRY_TYPE";
  geometryType: "TimeStamp" | "TimeInterval" | "BoundingBox";
};

export type AddTagEvent = {
  type: "ADD_TAG";
  annotation: Annotation;
  tag: Tag;
};

export type RemoveTagEvent = {
  type: "REMOVE_TAG";
  annotation: Annotation;
  tag: AnnotationTag;
};

export type AnnotateEvent =
  | { type: "IDLE" }
  | { type: "SELECT" }
  | { type: "DRAW" }
  | { type: "DELETE" }
  | { type: "CLEAR_GLOBAL_TAGS" }
  | SelectAnnotationEvent
  | EditAnnotationEvent
  | CreateAnnotationEvent
  | DeleteAnnotationEvent
  | SelecteGeometryTypeEvent
  | AddTagEvent
  | RemoveTagEvent;

const annotateStates = {
  id: "annotate",
  initial: "idle",
  entry: ["setupSpectrogram"],
  states: {
    idle: {
      entry: ["enableSpectrogram"],
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
            CREATE: {
              target: "#create.creating",
              actions: "startAnnotationCreation",
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
      id: "create",
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
              target: "#annotate",
            },
            onError: {
              target: "selecting",
            },
          },
        },
      },
    },
  },
  on: {
    // Annotation state flow control
    IDLE: "idle",
    SELECT: "edit",
    DRAW: "create",
    DELETE: "delete",
    RESET: {
      actions: ["reset"],
      target: "idle",
    },
    // Annotation actions
    ADD_TAG: {
      actions: ["addTag"],
    },
    REMOVE_TAG: {
      actions: ["removeTag"],
    },
    ADD_NOTE: {
      actions: ["addNote"],
    },
    UPDATE_NOTE: {
      actions: ["updateNote"],
    },
    REMOVE_NOTE: {
      actions: ["removeNote"],
    },
    // Geometry type selection
    SELECT_GEOMETRY_TYPE: {
      actions: ["selectGeometryType"],
    },
  },
};

export const annotateActions = {
  selectGeometryType: assign({
    geometryType: (_, event: SelecteGeometryTypeEvent) => event.geometryType,
  }),
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
    context.spectrogram?.send({ type: "DISABLE" });
  },
  enableSpectrogram: (context: AnnotateContext) => {
    context.spectrogram?.send({ type: "PAN" });
  },
  setupSpectrogram: assign({
    spectrogram: (context: AnnotateContext) => {
      if (context.spectrogram != null) return context.spectrogram;

      const { task, recording, parameters } = context;
      const bounds = {
        time: {
          min: task.clip.start_time,
          max: task.clip.end_time,
        },
        freq: {
          min: 0,
          max: recording.samplerate / 2,
        },
      };

      const initialDuration = getInitialDuration({
        interval: bounds.time,
        samplerate: recording.samplerate,
        window_size: parameters.window_size,
        hop_size: parameters.hop_size,
      });

      const initial = {
        time: {
          min: task.clip.start_time,
          max: Math.min(
            task.clip.end_time,
            task.clip.start_time + initialDuration,
          ),
        },
        freq: {
          min: 0,
          max: recording.samplerate / 2,
        },
      };

      return spawn(
        spectrogramMachine.withContext({
          recording: recording,
          parameters: parameters,
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
    ...annotateStates,
  },
  {
    // @ts-ignore
    actions: annotateActions,
  },
);
