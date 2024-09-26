import { GeometryType } from "./geometry";
import { SoundEventAnnotation } from "./sound_event_annotations";

export type AnnotationMode = "select" | "draw" | "edit" | "delete" | "idle";

export type AnnotationState = {
  mode: AnnotationMode;
  geometryType: GeometryType;
  selectedAnnotation: SoundEventAnnotation | null;
  setMode: (mode: AnnotationMode) => void;
  setGeometryType: (geometryType: GeometryType) => void;
  setSelectedAnnotation: (annotation: SoundEventAnnotation | null) => void;
  enableDeleting: () => void;
  enableDrawing: () => void;
  enableSelecting: () => void;
};
