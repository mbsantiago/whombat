import { useCallback, useMemo, useState } from "react";

import type {
  AnnotationMode,
  AnnotationState,
  GeometryType,
  SoundEventAnnotation,
  SpectrogramState,
} from "@/lib/types";

export default function useAnnotationState({
  spectrogramState,
  soundEventAnnotation: initialSelectedAnnotation = null,
  mode: initialMode = "idle",
  geometryType: initialGeometryType = "BoundingBox",
  onChangeMode,
  onChangeGeometryType,
  onSelectAnnotation,
}: {
  spectrogramState: SpectrogramState;
  mode?: AnnotationMode;
  soundEventAnnotation?: SoundEventAnnotation | null;
  geometryType?: GeometryType;
  onChangeMode?: (mode: AnnotationMode) => void;
  onChangeGeometryType?: (geometryType: GeometryType) => void;
  onSelectAnnotation?: (annotation: SoundEventAnnotation | null) => void;
}): AnnotationState {
  const [mode, setMode] = useState<AnnotationMode>(initialMode);

  const [geometryType, setGeometryType] =
    useState<GeometryType>(initialGeometryType);

  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SoundEventAnnotation | null>(initialSelectedAnnotation);

  const changeMode = useCallback(
    (mode: AnnotationMode) => {
      setMode(mode);
      onChangeMode?.(mode);

      if (mode !== "idle") {
        spectrogramState.setMode("idle");
      }

      if (mode != "edit") {
        setSelectedAnnotation(null);
        onSelectAnnotation?.(null);
      }

      if (mode === "idle") {
        setSelectedAnnotation(null);
        onSelectAnnotation?.(null);
      }
    },
    [onChangeMode, onSelectAnnotation, spectrogramState],
  );

  const changeGeometryType = useCallback(
    (geometryType: GeometryType) => {
      setGeometryType(geometryType);
      onChangeGeometryType?.(geometryType);
    },
    [onChangeGeometryType],
  );

  const selectAnnotation = useCallback(
    (annotation: SoundEventAnnotation | null) => {
      setSelectedAnnotation(annotation);
      onSelectAnnotation?.(annotation);
      changeMode("edit");
    },
    [onSelectAnnotation, changeMode],
  );

  const enableDrawing = useCallback(() => {
    changeMode("draw");
  }, [changeMode]);

  const enableSelecting = useCallback(() => {
    changeMode("select");
  }, [changeMode]);

  const enableDeleting = useCallback(() => {
    changeMode("delete");
  }, [changeMode]);

  const finalMode = useMemo(() => {
    if (mode === "edit" && !selectedAnnotation) {
      return "idle";
    }
    if (spectrogramState.mode !== "idle") {
      return "idle";
    }
    return mode;
  }, [mode, selectedAnnotation, spectrogramState.mode]);

  return {
    mode: finalMode,
    geometryType,
    selectedAnnotation,
    setMode: changeMode,
    setSelectedAnnotation: selectAnnotation,
    setGeometryType: changeGeometryType,
    enableDrawing,
    enableDeleting,
    enableSelecting,
  };
}
