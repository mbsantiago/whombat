import { useCallback, FC } from "react";
import { mergeProps } from "react-aria";

import useSpectrogramImages from "@/lib/hooks/spectrogram/useSpectrogramImages";
import useSpectrogramInteractions from "@/lib/hooks/spectrogram/useSpectrogramInteractions";
import useAnnotationDraw from "@/lib/hooks/annotation/useAnnotationDraw";
import useAnnotationCreate from "@/lib/hooks/annotation/useAnnotationCreate";
import useAnnotationDelete from "@/lib/hooks/annotation/useAnnotationDelete";
import useAnnotationEdit from "@/lib/hooks/annotation/useAnnotationEdit";
import useAnnotationSelect from "@/lib/hooks/annotation/useAnnotationSelect";
import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";
import useSpectrogramTags from "@/lib/hooks/spectrogram/useSpectrogramTags";
import useStore from "@/app/store";

import drawOnset from "@/lib/draw/onset";
import { scaleTimeToViewport } from "@/lib/utils/geometry";

import TagSearchBarBase from "../tags/TagSearchBar";
import SpectrogramTags from "@/lib/components/spectrograms/SpectrogramTags";
import type { TagSearchBarProps } from "@/lib/components/tags/TagSearchBar";
import CanvasBase, {
  type CanvasProps,
} from "@/lib/components/spectrograms/Canvas";

import type { ViewportController } from "@/lib/hooks/window/useViewport";
import type { SpectrogramState } from "@/lib/hooks/spectrogram/useSpectrogramState";
import type { AnnotationState } from "@/lib/hooks/annotation/useAnnotationState";
import type { AudioController } from "@/app/hooks/audio/useRecordingAudio";
import type {
  Geometry,
  Recording,
  ClipAnnotation,
  SoundEventAnnotation,
  AudioSettings,
  SpectrogramSettings,
  SpectrogramWindow,
  Tag,
} from "@/lib/types";
import useElementSize from "@/lib/hooks/utils/useElementSize";

const _emptyTags: Tag[] = [];

export default function CanvasWithAnnotations({
  clipAnnotation,
  viewport,
  recording,
  audioSettings,
  spectrogramSettings,
  audio,
  spectrogramState,
  annotationState,
  defaultTags = _emptyTags,
  height = 400,
  TagSearchBar = TagSearchBarBase,
}: {
  clipAnnotation: ClipAnnotation;
  audio: AudioController;
  recording: Recording;
  spectrogramState: SpectrogramState;
  viewport: ViewportController;
  audioSettings: AudioSettings;
  spectrogramSettings: SpectrogramSettings;
  annotationState: AnnotationState;
  defaultTags?: Tag[];
  height?: number;
  TagSearchBar?: FC<TagSearchBarProps>;
}) {
  const { size: dimensions, ref } = useElementSize<HTMLCanvasElement>();

  const {
    data = clipAnnotation,
    addSoundEvent,
    removeSoundEvent,
    updateSoundEvent,
    removeSoundEventTag,
    addSoundEventTag,
  } = useClipAnnotation({
    uuid: clipAnnotation.uuid,
    clipAnnotation,
  });

  const { setSelectedAnnotation, selectedAnnotation } = annotationState;
  const handleCreate = useCallback(
    (geometry: Geometry) => {
      addSoundEvent.mutate(
        {
          geometry,
          tags: defaultTags,
        },
        {
          onSuccess: (data) => {
            setSelectedAnnotation(data);
          },
        },
      );
    },
    [defaultTags, addSoundEvent, setSelectedAnnotation],
  );

  const { setMode: setSpectrogramMode } = spectrogramState;
  const handleDelete = useCallback(
    (annotation: SoundEventAnnotation) => {
      removeSoundEvent.mutate(annotation);
      setSpectrogramMode("panning");
    },
    [removeSoundEvent, setSpectrogramMode],
  );

  const handleEdit = useCallback(
    (geometry: Geometry) => {
      if (selectedAnnotation == null) return;
      updateSoundEvent.mutate(
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

  const handleCopy = useCallback(
    (annotation: SoundEventAnnotation, geometry: Geometry) => {
      addSoundEvent.mutate(
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
    [addSoundEvent, setSelectedAnnotation],
  );

  const { props: createProps, draw: drawCreate } = useAnnotationCreate({
    viewport: viewport.viewport,
    dimensions,
    geometryType: annotationState.geometryType,
    enabled: annotationState.mode === "draw",
    onCreate: handleCreate,
  });

  const { props: selectProps, draw: drawSelect } = useAnnotationSelect({
    viewport: viewport.viewport,
    dimensions,
    annotations: data.sound_events || [],
    onSelect: setSelectedAnnotation,
    onDeselect: () => setSelectedAnnotation(null),
    enabled: annotationState.mode === "select",
  });

  const { props: deleteProps, draw: drawDelete } = useAnnotationDelete({
    viewport: viewport.viewport,
    dimensions,
    annotations: data.sound_events || [],
    onDelete: handleDelete,
    onDeselect: () => setSelectedAnnotation(null),
    enabled: annotationState.mode === "delete",
  });

  const { props: editProps, draw: drawEdit } = useAnnotationEdit({
    viewport: viewport.viewport,
    dimensions,
    annotation: selectedAnnotation,
    onDeselect: () => setSelectedAnnotation(null),
    onEdit: handleEdit,
    onCopy: handleCopy,
    enabled: annotationState.mode === "edit",
  });

  const { drawFn: drawInteractions, ...interactionProps } =
    useSpectrogramInteractions({
      viewport,
      audio,
      state: spectrogramState.mode,
      onZoom: spectrogramState.enablePanning,
    });

  const { drawFn: drawSpectrogram } = useSpectrogramImages({
    recording,
    audioSettings,
    spectrogramSettings,
  });

  const drawAnnotations = useAnnotationDraw({
    viewport: viewport.viewport,
    annotations: data.sound_events || [],
  });

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      drawSpectrogram(ctx, viewport);
      const time = scaleTimeToViewport(
        audio.currentTime,
        viewport,
        ctx.canvas.width,
      );
      drawOnset(ctx, time);
      drawInteractions(ctx, viewport);
      drawAnnotations(ctx);
      drawCreate(ctx);
      drawSelect(ctx);
      drawDelete(ctx);
      drawEdit(ctx);
    },
    [
      audio.currentTime,
      drawSpectrogram,
      drawInteractions,
      drawAnnotations,
      drawCreate,
      drawSelect,
      drawEdit,
      drawDelete,
    ],
  );

  const tags = useSpectrogramTags({
    annotations: data.sound_events || [],
    viewport: viewport.viewport,
    dimensions,
    onClickTag: (soundEventAnnotation, tag) =>
      removeSoundEventTag.mutate({ soundEventAnnotation, tag }),
    onAddTag: (soundEventAnnotation, tag) =>
      addSoundEventTag.mutate({ soundEventAnnotation, tag }),
  });

  let canvasProps: CanvasProps = mergeProps(
    selectProps,
    deleteProps,
    createProps,
    editProps,
    interactionProps,
  );

  const tagColorFn = useStore((state) => state.getTagColor);

  return (
    <SpectrogramTags
      tags={tags}
      TagSearchBar={TagSearchBar}
      tagColorFn={tagColorFn}
    >
      <CanvasBase
        viewport={viewport.viewport}
        height={height}
        drawFn={drawFn}
        canvasRef={ref}
        {...canvasProps}
      />
    </SpectrogramTags>
  );
}
