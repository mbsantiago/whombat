import { useCallback, useMemo, useState } from "react";
import { mergeProps } from "react-aria";

import useAnnotationCreate from "@/hooks/annotation/useAnnotationCreate";
import useAnnotationDelete from "@/hooks/annotation/useAnnotationDelete";
import useAnnotationDraw from "@/hooks/annotation/useAnnotationDraw";
import useAnnotationEdit from "@/hooks/annotation/useAnnotationEdit";
import useAnnotationSelect from "@/hooks/annotation/useAnnotationSelect";
import useAnnotationTags from "@/hooks/annotation/useAnnotationTags";
import useClipAnnotation from "@/hooks/api/useClipAnnotation";

import type {
  ClipAnnotation,
  Geometry,
  GeometryType,
  SoundEventAnnotation,
  SpectrogramWindow,
  Tag,
} from "@/types";

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
  clipAnnotation: data,
  viewport,
  dimensions,
  defaultTags,
  mode: initialMode = "draw",
  enabled = true,
  onModeChange,
  onSelectAnnotation,
  onCreateAnnotation,
  onAddAnnotationTag,
  onRemoveAnnotationTag,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onDeselect,
}: {
  clipAnnotation: ClipAnnotation;
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  mode?: AnnotateMode;
  defaultTags?: Tag[];
  enabled?: boolean;
  onSelectAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddTag?: (annotation: ClipAnnotation) => void;
  onRemoveTag?: (annotation: ClipAnnotation) => void;
  onCreateAnnotation?: (annotation: SoundEventAnnotation) => void;
  onUpdateAnnotation?: (annotation: SoundEventAnnotation) => void;
  onDeleteAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddAnnotationTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveAnnotationTag?: (annotation: SoundEventAnnotation) => void;
  onModeChange?: (mode: AnnotateMode) => void;
  onDeselect?: () => void;
}) {
  const {
    mode,
    geometryType,
    selectedAnnotation,
    setMode,
    setGeometryType,
    setSelectedAnnotation,
  } = useAnnotateClipState({
    mode: initialMode,
    geometryType: "BoundingBox",
    onSelectAnnotation,
    onChangeMode: onModeChange,
  });

  const {
    data: clipAnnotation,
    addSoundEvent: { mutate: addSoundEvent },
    removeSoundEvent: { mutate: removeSoundEvent },
    updateSoundEvent: { mutate: updateSoundEvent },
    addTagToSoundEvent: { mutate: addTagToSoundEvent },
    removeTagFromSoundEvent: { mutate: removeTagFromSoundEvent },
  } = useClipAnnotation({
    uuid: data.uuid,
    clipAnnotation: data,
    onAddSoundEventAnnotation: onCreateAnnotation,
    onUpdateSoundEventAnnotation: onUpdateAnnotation,
    onDeleteSoundEventAnnotation: onDeleteAnnotation,
    onAddTagToSoundEventAnnotation: onAddAnnotationTag,
    onRemoveTagFromSoundEventAnnotation: onRemoveAnnotationTag,
  });
  const soundEvents = useMemo(
    () => clipAnnotation?.sound_events || [],
    [clipAnnotation],
  );

  const handleCreate = useCallback(
    (geometry: Geometry) => {
      addSoundEvent({
        geometry,
        tags: defaultTags || [],
      });
    },
    [defaultTags, addSoundEvent],
  );

  const { props: createProps, draw: drawCreate } = useAnnotationCreate({
    viewport,
    dimensions,
    geometryType,
    enabled: enabled && mode === "draw",
    onCreate: handleCreate,
  });

  const { props: selectProps, draw: drawSelect } = useAnnotationSelect({
    viewport,
    dimensions,
    annotations: soundEvents,
    onSelect: setSelectedAnnotation,
    onDeselect,
    enabled: enabled && mode === "select",
  });

  const handleDelete = useCallback(
    (annotation: SoundEventAnnotation) => {
      removeSoundEvent(annotation);
      setMode("idle");
    },
    [removeSoundEvent, setMode],
  );

  const { props: deleteProps, draw: drawDelete } = useAnnotationDelete({
    viewport,
    dimensions,
    annotations: soundEvents,
    onDelete: handleDelete,
    onDeselect,
    enabled: enabled && mode === "delete",
  });

  const handleEdit = useCallback(
    (geometry: Geometry) => {
      if (selectedAnnotation == null) return;
      updateSoundEvent(
        {
          soundEventAnnotation: selectedAnnotation,
          geometry,
        },
        {
          onSuccess: (data) => {
            setSelectedAnnotation(data);
          },
        },
      );
    },
    [selectedAnnotation, updateSoundEvent, setSelectedAnnotation],
  );

  const handleOnClickTag = useCallback(
    (annotation: SoundEventAnnotation, tag: Tag) => {
      removeTagFromSoundEvent({
        soundEventAnnotation: annotation,
        tag,
      });
    },
    [removeTagFromSoundEvent],
  );

  const handleOnAddTag = useCallback(
    (annotation: SoundEventAnnotation, tag: Tag) => {
      addTagToSoundEvent({
        soundEventAnnotation: annotation,
        tag,
      });
    },
    [addTagToSoundEvent],
  );

  const tags = useAnnotationTags({
    annotations: soundEvents,
    viewport,
    dimensions,
    onClickTag: handleOnClickTag,
    onAddTag: handleOnAddTag,
  });

  const { props: editProps, draw: drawEdit } = useAnnotationEdit({
    viewport,
    dimensions,
    annotation: selectedAnnotation,
    onDeselect,
    onEdit: handleEdit,
    enabled: enabled && mode === "edit",
  });

  const drawAnnotations = useAnnotationDraw({
    viewport,
    annotations: soundEvents,
  });

  const props = enabled
    ? mergeProps(createProps, selectProps, deleteProps, editProps)
    : {};

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawAnnotations(ctx);
      drawCreate(ctx);
      drawSelect(ctx);
      drawDelete(ctx);
      drawEdit(ctx);
    },
    [drawAnnotations, drawCreate, drawSelect, drawDelete, drawEdit],
  );

  const enableDelete = useCallback(() => {
    setMode("delete");
  }, [setMode]);

  const enableSelect = useCallback(() => {
    setMode("select");
  }, [setMode]);

  const enableDraw = useCallback(() => {
    setMode("draw");
  }, [setMode]);

  const enableEdit = useCallback(() => {
    setMode("edit");
  }, [setMode]);

  const disable = useCallback(() => {
    setMode("idle");
  }, [setMode]);

  return {
    mode,
    props,
    draw,
    geometryType,
    selectedAnnotation,
    enabled: mode !== "idle" && enabled,
    isSelecting: mode === "select" && enabled,
    isDrawing: mode === "draw" && enabled,
    isEditing: mode === "edit" && enabled,
    isDeleting: mode === "delete" && enabled,
    enableDelete,
    enableSelect,
    enableDraw,
    enableEdit,
    disable,
    setGeometryType,
    tags,
  };
}

function useAnnotateClipState({
  mode: initialMode = "draw",
  geometryType: initialGeometryType = "BoundingBox",
  selectedAnnotation: initialSelectedAnnotation = null,
  onChangeMode,
  onSelectAnnotation,
  onChangeGeometryType,
}: {
  mode?: AnnotateMode;
  geometryType?: GeometryType;
  selectedAnnotation?: SoundEventAnnotation | null;
  onChangeMode?: (mode: AnnotateMode) => void;
  onSelectAnnotation?: (annotation: SoundEventAnnotation) => void;
  onChangeGeometryType?: (geometryType: GeometryType) => void;
}) {
  const [mode, setMode] = useState<AnnotateMode>(initialMode);
  const [geometryType, setGeometryType] =
    useState<GeometryType>(initialGeometryType);
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SoundEventAnnotation | null>(initialSelectedAnnotation);

  const changeMode = useCallback(
    (mode: AnnotateMode) => {
      setMode(mode);
      onChangeMode?.(mode);

      if (mode != "edit") {
        setSelectedAnnotation(null);
      }
    },
    [onChangeMode],
  );

  const changeGeometryType = useCallback(
    (geometryType: GeometryType) => {
      setGeometryType(geometryType);
      onChangeGeometryType?.(geometryType);
    },
    [onChangeGeometryType],
  );

  const selectAnnotation = useCallback(
    (annotation: SoundEventAnnotation) => {
      setSelectedAnnotation(annotation);
      onSelectAnnotation?.(annotation);
      changeMode("edit");
    },
    [onSelectAnnotation, changeMode],
  );

  return {
    mode,
    geometryType,
    selectedAnnotation,
    setMode: changeMode,
    setSelectedAnnotation: selectAnnotation,
    setGeometryType: changeGeometryType,
  };
}
