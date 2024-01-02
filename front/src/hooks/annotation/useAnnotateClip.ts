import { useCallback, useMemo, useState } from "react";

import useAnnotationCreate from "@/hooks/annotation/useAnnotationCreate";
import useAnnotationDelete from "@/hooks/annotation/useAnnotationDelete";
import useAnnotationDraw from "@/hooks/annotation/useAnnotationDraw";
import useAnnotationEdit from "@/hooks/annotation/useAnnotationEdit";
import useAnnotationSelect from "@/hooks/annotation/useAnnotationSelect";
import useClipAnnotation from "@/hooks/api/useClipAnnotation";
import useSpectrogramTags from "@/hooks/spectrogram/useSpectrogramTags";

import type {
  ClipAnnotation,
  Dimensions,
  Geometry,
  GeometryType,
  SoundEventAnnotation,
  SpectrogramWindow,
  Tag,
} from "@/types";

export type AnnotateMode = "select" | "draw" | "edit" | "delete" | "idle";

type DrawFunction = (ctx: CanvasRenderingContext2D) => void;

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

export default function useAnnotateClip(props: {
  /** The clip annotation to annotate */
  clipAnnotation: ClipAnnotation;
  /** Current spectrogram viewport */
  viewport: SpectrogramWindow;
  /** Dimensions of the spectrogram canvas */
  dimensions: Dimensions;
  /** Initial annotation mode */
  mode?: AnnotateMode;
  /** Tags to add to new sound event annotations by default */
  defaultTags?: Tag[];
  /** Whether the annotation actions are active or not. The active state is
   * used to temporarily disable the annotation actions when other spectrogram
   * actions are active (e.g. zoom, pan, etc.)
   */
  active?: boolean;
  /** Whether annotation (create, edit, delete) actions are permanently
   * disabled or not */
  disabled?: boolean;
  /** Callback when the selected annotation changes */
  onSelectAnnotation?: (annotation: SoundEventAnnotation | null) => void;
  /** Callback when a new annotation is created */
  onCreateAnnotation?: (annotation: SoundEventAnnotation) => void;
  /** Callback when the geometry of an annotation is updated */
  onUpdateAnnotation?: (annotation: SoundEventAnnotation) => void;
  /** Callback when an annotation is deleted */
  onDeleteAnnotation?: (annotation: SoundEventAnnotation) => void;
  /** Callback when a tag is added to a sound event */
  onAddAnnotationTag?: (annotation: SoundEventAnnotation) => void;
  /** Callback when a tag is removed from a sound event */
  onRemoveAnnotationTag?: (annotation: SoundEventAnnotation) => void;
  /** Callback when the annotation mode (idle, create, delete, select, draw)
   * changes */
  onModeChange?: (mode: AnnotateMode) => void;
  /** Callback when an annotation is deselected */
  onDeselect?: () => void;
}) {
  const {
    clipAnnotation: data,
    viewport,
    dimensions,
    defaultTags,
    mode: initialMode = "select",
    active = true,
    disabled = false,
    onModeChange,
    onSelectAnnotation,
    onCreateAnnotation,
    onAddAnnotationTag,
    onRemoveAnnotationTag,
    onUpdateAnnotation,
    onDeleteAnnotation,
    onDeselect,
  } = props;

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
      if (disabled) return;
      addSoundEvent(
        {
          geometry,
          tags: defaultTags || [],
        },
        {
          onSuccess: (data) => {
            setSelectedAnnotation(data);
          },
        },
      );
    },
    [defaultTags, addSoundEvent, disabled, setSelectedAnnotation],
  );

  const { props: createProps, draw: drawCreate } = useAnnotationCreate({
    viewport,
    dimensions,
    geometryType,
    enabled: active && mode === "draw" && !disabled,
    onCreate: handleCreate,
  });

  const { props: selectProps, draw: drawSelect } = useAnnotationSelect({
    viewport,
    dimensions,
    annotations: soundEvents,
    onSelect: setSelectedAnnotation,
    onDeselect,
    enabled: active && mode === "select",
  });

  const handleDelete = useCallback(
    (annotation: SoundEventAnnotation) => {
      if (disabled) return;
      removeSoundEvent(annotation);
      setMode("idle");
    },
    [removeSoundEvent, setMode, disabled],
  );

  const { props: deleteProps, draw: drawDelete } = useAnnotationDelete({
    viewport,
    dimensions,
    annotations: soundEvents,
    onDelete: handleDelete,
    onDeselect,
    enabled: active && mode === "delete" && !disabled,
  });

  const handleEdit = useCallback(
    (geometry: Geometry) => {
      if (selectedAnnotation == null || disabled) return;
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
    [selectedAnnotation, updateSoundEvent, setSelectedAnnotation, disabled],
  );

  const handleCopy = useCallback(
    (annotation: SoundEventAnnotation, geometry: Geometry) => {
      if (disabled) return;
      addSoundEvent(
        {
          geometry,
          tags: annotation.tags || [],
        },
        {
          onSuccess: (data) => {
            setSelectedAnnotation(data);
          },
        },
      );
    },
    [addSoundEvent, setSelectedAnnotation, disabled],
  );

  const { props: editProps, draw: drawEdit } = useAnnotationEdit({
    viewport,
    dimensions,
    annotation: selectedAnnotation,
    onDeselect,
    onEdit: handleEdit,
    onCopy: handleCopy,
    enabled: active && mode === "edit" && !disabled,
  });

  const handleOnClickTag = useCallback(
    (annotation: SoundEventAnnotation, tag: Tag) => {
      if (disabled) return;
      removeTagFromSoundEvent({
        soundEventAnnotation: annotation,
        tag,
      });
    },
    [removeTagFromSoundEvent, disabled],
  );

  const handleOnAddTag = useCallback(
    (annotation: SoundEventAnnotation, tag: Tag) => {
      if (disabled) return;
      addTagToSoundEvent({
        soundEventAnnotation: annotation,
        tag,
      });
    },
    [addTagToSoundEvent, disabled],
  );

  const tags = useSpectrogramTags({
    annotations: soundEvents,
    viewport: viewport,
    dimensions,
    onClickTag: handleOnClickTag,
    onAddTag: handleOnAddTag,
    active: mode !== "draw" && mode !== "delete",
    disabled,
  });

  const drawAnnotations = useAnnotationDraw({
    viewport,
    annotations: soundEvents,
  });

  let annotateProps = {};
  if (active) {
    switch (mode) {
      case "select":
        annotateProps = selectProps;
        break;
      case "delete":
        annotateProps = deleteProps;
        break;
      case "draw":
        annotateProps = createProps;
        break;
      case "edit":
        annotateProps = editProps;
        break;
      default:
        annotateProps = {};
    }
  }

  const draw = useMemo(() => {
    if (!active) return drawAnnotations;

    const otherDraw: DrawFunction = {
      select: drawSelect,
      delete: drawDelete,
      edit: drawEdit,
      draw: drawCreate,
      idle: () => undefined,
    }[mode];

    return (ctx: CanvasRenderingContext2D) => {
      drawAnnotations(ctx);
      otherDraw(ctx);
    };
  }, [
    active,
    mode,
    drawAnnotations,
    drawCreate,
    drawSelect,
    drawDelete,
    drawEdit,
  ]);

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
    props: annotateProps,
    draw,
    geometryType,
    selectedAnnotation,
    enabled: mode !== "idle" && active,
    isSelecting: mode === "select" && active,
    isDrawing: mode === "draw" && active,
    isEditing: mode === "edit" && active,
    isDeleting: mode === "delete" && active,
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
  mode: initialMode = "select",
  geometryType: initialGeometryType = "BoundingBox",
  selectedAnnotation: initialSelectedAnnotation = null,
  onChangeMode,
  onSelectAnnotation,
  onChangeGeometryType,
  disabled = false,
}: {
  mode?: AnnotateMode;
  geometryType?: GeometryType;
  selectedAnnotation?: SoundEventAnnotation | null;
  disabled?: boolean;
  onChangeMode?: (mode: AnnotateMode) => void;
  onSelectAnnotation?: (annotation: SoundEventAnnotation | null) => void;
  onChangeGeometryType?: (geometryType: GeometryType) => void;
}) {
  const [mode, setMode] = useState<AnnotateMode>(initialMode);
  const [geometryType, setGeometryType] =
    useState<GeometryType>(initialGeometryType);
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SoundEventAnnotation | null>(initialSelectedAnnotation);

  const changeMode = useCallback(
    (mode: AnnotateMode) => {
      if (disabled) {
        if (mode !== "idle" && mode !== "select") {
          throw new Error("Cannot change mode when disabled");
        }
      }
      setMode(mode);
      onChangeMode?.(mode);

      if (mode != "edit" && !disabled) {
        setSelectedAnnotation(null);
        onSelectAnnotation?.(null);
      }

      if (mode === "idle" && disabled) {
        setSelectedAnnotation(null);
        onSelectAnnotation?.(null);
      }
    },
    [onChangeMode, onSelectAnnotation, disabled],
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
      if (disabled) return;
      changeMode("edit");
    },
    [onSelectAnnotation, changeMode, disabled],
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
