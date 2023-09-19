import { type Tag } from "@/api/tags";
import { type Annotation } from "@/api/annotations";
import { type Geometry } from "@/api/sound_events";
import { type StatusBadge } from "@/api/tasks";
import { createMachine, assign } from "xstate";

export type AnnotateContext = {
  selectedAnnotation: Annotation | null;
  tags: Tag[];
};

export type AnnotateEvent =
  | { type: "PAN" }
  | { type: "ZOOM" }
  | { type: "SELECT" }
  | { type: "SELECT_ANNOTATION"; annotation: Annotation }
  | { type: "EDIT"; annotation: Annotation }
  | { type: "DRAW" }
  | { type: "CREATE"; geometry: Geometry }
  | { type: "DELETE" }
  | { type: "DELETE_ANNOTATION"; annotation: Annotation }
  | { type: "ADD_NOTE"; annotation: Annotation }
  | { type: "ADD_STATUS_BADGE"; badge: StatusBadge }
  | { type: "REMOVE_STATUS_BADGE"; badge: StatusBadge }
  | { type: "UPDATE_NOTE"; annotation: Annotation }
  | { type: "ADD_TAG"; tag: Tag }
  | { type: "REMOVE_TAG"; tag: Tag }
  | { type: "ADD_GLOBAL_TAG"; tag: Tag }
  | { type: "REMOVE_GLOBAL_TAG"; tag: Tag }
  | { type: "PLAY" };

export type AnnotationActions = {
  selectAnnotation: (context: AnnotateContext, event: AnnotateEvent) => void;
};

export const annotateMachine = createMachine(
  {
    predictableActionArguments: true,
    schema: {
      context: {} as AnnotateContext,
      events: {} as AnnotateEvent,
    },
    id: "annotate",
    initial: "panning",
    states: {
      panning: {
        on: {
          ZOOM: "zooming",
          SELECT: "selecting",
          DRAW: "drawing",
          DELETE: "deleting",
        },
      },
      zooming: {
        on: {
          PAN: "panning",
          SELECT: "selecting",
          DRAW: "drawing",
          DELETE: "deleting",
        },
      },
      selecting: {
        on: {
          PAN: "panning",
          ZOOM: "zooming",
          DRAW: "drawing",
          DELETE: "deleting",
          SELECT_ANNOTATION: {
            target: "editing",
            actions: "selectAnnotation",
          },
        },
      },
      editing: {
        exit: [
          "clearSelectedAnnotation",
          "updateAnnotation",
        ],
      },
      drawing: {},
      deleting: {},
      tagging: {},
      playing: {},
      failed: {},
    },
  },
  {
    actions: {
      selectAnnotation: (
        _,
        event: {
          type: "SELECT_ANNOTATION";
          annotation: Annotation;
        },
      ) =>
        assign({
          selectedAnnotation: event.annotation,
        }),
      clearSelectedAnnotation: (_) =>
        assign({
          selectedAnnotation: null,
        }),
    },
  },
);
