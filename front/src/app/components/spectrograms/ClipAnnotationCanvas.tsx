import { useCallback, useMemo, useState } from "react";
import { mergeProps } from "react-aria";

import SoundEventSpectrogramTags from "@/app/components/sound_event_annotations/SoundEventSpectrogramTags";

import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import CanvasBase from "@/lib/components/spectrograms/Canvas";
import SpectrogramTags from "@/lib/components/spectrograms/SpectrogramTags";

import useAnnotationCreate from "@/lib/hooks/annotation/useAnnotationCreate";
import useAnnotationDelete from "@/lib/hooks/annotation/useAnnotationDelete";
import useSoundEventDraw from "@/lib/hooks/annotation/useAnnotationDraw";
import useAnnotationEdit from "@/lib/hooks/annotation/useAnnotationEdit";
import useAnnotationSelect from "@/lib/hooks/annotation/useAnnotationSelect";
import useSpectrogramImages from "@/lib/hooks/spectrogram/useSpectrogramImages";
import useSpectrogramInteractions from "@/lib/hooks/spectrogram/useSpectrogramInteractions";
import useElementSize from "@/lib/hooks/utils/useElementSize";

import { drawCursor } from "@/lib/draw/cursor";
import drawOnset from "@/lib/draw/onset";
import type {
  AnnotationState,
  AudioController,
  AudioSettings,
  CanvasProps,
  ClipAnnotation,
  Geometry,
  Position,
  Recording,
  SoundEventAnnotation,
  SpectrogramSettings,
  SpectrogramState,
  SpectrogramWindow,
  Tag,
  ViewportController,
} from "@/lib/types";
import { scaleTimeToViewport } from "@/lib/utils/geometry";

const _emptyTags: Tag[] = [];

export default function ClipAnnotationCanvas({
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
  withAnnotations = true,
  enabled = true,
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
  withAnnotations?: boolean;
  enabled?: boolean;
}) {
  const { size: dimensions, ref } = useElementSize<HTMLCanvasElement>();

  const [cursorPosition, setCursorPosition] = useState<Position>({
    time: 0,
    freq: 0,
  });

  const {
    data = clipAnnotation,
    addSoundEvent,
    removeSoundEvent,
    updateSoundEvent,
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

  const soundEvents = useMemo(() => {
    if (!withAnnotations) return [];
    return data.sound_events || [];
  }, [data.sound_events, withAnnotations]);

  const drawAnnotations = useSoundEventDraw({
    viewport: viewport.viewport,
    soundEvents,
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
      drawCursor(ctx, cursorPosition, viewport);
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
      cursorPosition,
    ],
  );

  let canvasProps: CanvasProps = mergeProps(
    selectProps,
    deleteProps,
    createProps,
    editProps,
    interactionProps,
  );

  return (
    <SpectrogramTags
      soundEvents={data.sound_events || []}
      viewport={viewport.viewport}
      SoundEventTags={SoundEventSpectrogramTags}
      enabled={enabled}
    >
      <CanvasBase
        viewport={viewport.viewport}
        height={height}
        drawFn={drawFn}
        canvasRef={ref}
        onHover={({ position }) => setCursorPosition(position)}
        {...canvasProps}
      />
    </SpectrogramTags>
  );
}
