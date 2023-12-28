import { useCallback, useEffect, useState } from "react";

import {
  type ClipAnnotation,
  type Geometry,
  type GeometryType,
  type SoundEventAnnotation,
  type Tag,
} from "@/api/schemas";
import { type SpectrogramParameters } from "@/api/spectrograms";
import useAnnotateKeyShortcuts from "@/hooks/annotation/useAnnotateKeyShortcuts";
import useAnnotationCreate from "@/hooks/annotation/useAnnotationCreate";
import useAnnotationDelete from "@/hooks/annotation/useAnnotationDelete";
import useAnnotationDraw from "@/hooks/annotation/useAnnotationDraw";
import useAnnotationEdit from "@/hooks/annotation/useAnnotationEdit";
import useAnnotationSelect from "@/hooks/annotation/useAnnotationSelect";
import useAnnotationTags from "@/hooks/annotation/useAnnotationTags";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";

type AnnotateMode = "select" | "draw" | "edit" | "delete" | "idle";

export type AnnotateClipState = {
  mode: AnnotateMode;
  geometryType: GeometryType;
  selectedAnnotation: SoundEventAnnotation | null;
  annotations: SoundEventAnnotation[];
  isSelecting: boolean;
  isDrawing: boolean;
  isEditing: boolean;
  isDeleting: boolean;
};

export type AnnotateClipActions = {
  setMode: (mode: AnnotateMode) => void;
  focusOnAnnotation: (annotation: SoundEventAnnotation) => void;
  selectAnnotation: (annotation: SoundEventAnnotation) => void;
  clearSelection: () => void;
  enableSelect: () => void;
  enableDraw: () => void;
  enableEdit: () => void;
  enableDelete: () => void;
  setGeometryType: (geometryType: GeometryType) => void;
  disable: () => void;
};

export default function useAnnotateClip({
  clipAnnotation,
  dimensions,
  defaultTags,
  enabled = true,
  onSelectAnnotation,
  onCreateAnnotation,
  onAddAnnotationTag,
  onRemoveAnnotationTag,
  onUpdateAnnotationGeometry,
  onDeleteAnnotation,
}: {
  clipAnnotation: ClipAnnotation;
  dimensions: { width: number; height: number };
  defaultTags?: Tag[];
  enabled?: boolean;
  onSelectAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddAnnotationTag?: (
    annotation: SoundEventAnnotation,
    tag: Tag,
  ) => Promise<SoundEventAnnotation>;
  onRemoveAnnotationTag?: (
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
  const [mode, setMode] = useState<AnnotateMode>("select");
  const [geometryType, setGeometryType] = useState<GeometryType>("BoundingBox");
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SoundEventAnnotation | null>(null);

  return {
    mode,
    geometryType,
    selectedAnnotation,
    enabled: mode !== "idle" && enabled,
    isSelecting: mode === "select",
    isDrawing: mode === "draw",
    isEditing: mode === "edit",
    isDeleting: mode === "delete",
    enableDelete: useCallback(() => setMode("delete"), []),
    enableSelect: useCallback(() => setMode("select"), []),
    enableDraw: useCallback(() => setMode("draw"), []),
    enableEdit: useCallback(() => setMode("edit"), []),
    disable: useCallback(() => setMode("idle"), []),
    setGeometryType,
  };
}
