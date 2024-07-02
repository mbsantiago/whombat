import { useCallback, useMemo, useRef, useState } from "react";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/lib/api/spectrograms";
import AnnotationControls from "@/components/annotation/AnnotationControls";
import Player from "@/components/audio/Player";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import ViewportToolbar from "@/components/spectrograms/ViewportToolbar";
import SpectrogramSettings from "@/components/spectrograms/SpectrogramSettings";
import SpectrogramTags from "@/components/spectrograms/SpectrogramTags";
import useAnnotateClip from "@/hooks/annotation/useAnnotateClip";
import useAudio from "@/hooks/audio/useAudio";
import useCanvas from "@/hooks/draw/useCanvas";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useSpectrogramTrackAudio from "@/hooks/spectrogram/useSpectrogramTrackAudio";
import { getInitialViewingWindow } from "@/utils/windows";

import type { TagFilter } from "@/lib/api/tags";
import type { AnnotateMode } from "@/hooks/annotation/useAnnotateClip";
import type { MotionMode as SpectrogramMode } from "@/hooks/spectrogram/useSpectrogramMotions";
import type {
  ClipAnnotation,
  Position,
  SoundEventAnnotation,
  SpectrogramParameters,
  Tag,
} from "@/types";

export default function ClipAnnotationSpectrogram({
  clipAnnotation,
  tagFilter,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  disabled = false,
  height = 384,
  withBar = true,
  withPlayer = true,
  withControls = true,
  withSettings = true,
  withAudioShortcuts = true,
  withSpectrogramShortcuts = true,
  defaultTags,
  onAddSoundEventTag,
  onRemoveSoundEventTag,
  onCreateSoundEventAnnotation,
  onUpdateSoundEventAnnotation,
  onDeleteSoundEventAnnotation,
  onParameterSave,
  onSelectAnnotation,
  onCreateTag,
}: {
  clipAnnotation: ClipAnnotation;
  parameters?: SpectrogramParameters;
  tagFilter?: TagFilter;
  disabled?: boolean;
  defaultTags?: Tag[];
  height?: number;
  withBar?: boolean;
  withPlayer?: boolean;
  withControls?: boolean;
  withSettings?: boolean;
  withAudioShortcuts?: boolean;
  withSpectrogramShortcuts?: boolean;
  onParameterSave?: (params: SpectrogramParameters) => void;
  onSelectAnnotation?: (annotation: SoundEventAnnotation | null) => void;
  onCreateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onUpdateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onDeleteSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddSoundEventTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveSoundEventTag?: (annotation: SoundEventAnnotation) => void;
  onCreateTag?: (tag: Tag) => void;
}) {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensions = canvasRef.current?.getBoundingClientRect() ?? {
    width: 0,
    height: 0,
  };

  const { clip } = clipAnnotation;
  const { recording } = clip;

  const bounds = useMemo(
    () => ({
      time: { min: clip.start_time, max: clip.end_time },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [clip.start_time, clip.end_time, recording.samplerate],
  );

  const initial = useMemo(
    () =>
      getInitialViewingWindow({
        startTime: clip.start_time,
        endTime: clip.end_time,
        samplerate: recording.samplerate,
        parameters,
      }),
    [recording.samplerate, clip.start_time, clip.end_time, parameters],
  );

  const audio = useAudio({
    recording,
    endTime: bounds.time.max,
    startTime: bounds.time.min,
    withShortcuts: withAudioShortcuts,
  });

  const handleSpectrogramModeChange = useCallback(
    (mode: SpectrogramMode) => {
      setIsAnnotating(mode === "idle");
      if (mode !== "idle") {
        onSelectAnnotation?.(null);
      }
    },
    [onSelectAnnotation],
  );

  const { seek, play } = audio;
  const handleDoubleClick = useCallback(
    ({ position }: { position: Position }) => {
      seek(position.time);
      play();
    },
    [seek, play],
  );

  const spectrogram = useSpectrogram({
    dimensions,
    recording,
    bounds,
    initial,
    parameters,
    onDoubleClick: handleDoubleClick,
    onModeChange: handleSpectrogramModeChange,
    enabled: !isAnnotating && !audio.isPlaying,
    withShortcuts: withSpectrogramShortcuts,
  });

  const { centerOn } = spectrogram;

  const handleTimeChange = useCallback(
    (time: number) => centerOn({ time }),
    [centerOn],
  );

  const { draw: drawTrackAudio, enabled: trackingAudio } =
    useSpectrogramTrackAudio({
      viewport: spectrogram.viewport,
      currentTime: audio.currentTime,
      isPlaying: audio.isPlaying,
      onTimeChange: handleTimeChange,
    });

  const handleAnnotationModeChange = useCallback(
    (mode: AnnotateMode) => setIsAnnotating(mode !== "idle"),
    [],
  );

  const handleAnnotationDeselect = useCallback(() => {
    setIsAnnotating(false);
    onSelectAnnotation?.(null);
  }, [onSelectAnnotation]);

  const annotate = useAnnotateClip({
    clipAnnotation,
    viewport: spectrogram.viewport,
    dimensions,
    defaultTags,
    onModeChange: handleAnnotationModeChange,
    onDeselect: handleAnnotationDeselect,
    active: isAnnotating && !audio.isPlaying,
    onSelectAnnotation,
    disabled,
    onAddAnnotationTag: onAddSoundEventTag,
    onRemoveAnnotationTag: onRemoveSoundEventTag,
    onCreateAnnotation: onCreateSoundEventAnnotation,
    onUpdateAnnotation: onUpdateSoundEventAnnotation,
    onDeleteAnnotation: onDeleteSoundEventAnnotation,
  });

  const {
    props: spectrogramProps,
    draw: drawSpectrogram,
    isLoading: spectrogramIsLoading,
  } = spectrogram;
  const { props: annotateProps, draw: drawAnnotations } = annotate;

  const draw = useMemo(() => {
    if (spectrogramIsLoading) {
      return (ctx: CanvasRenderingContext2D) => {
        ctx.canvas.style.cursor = "wait";
      };
    }
    if (trackingAudio) {
      return (ctx: CanvasRenderingContext2D) => {
        drawSpectrogram(ctx);
        drawTrackAudio(ctx);
        drawAnnotations(ctx);
      };
    }
    return (ctx: CanvasRenderingContext2D) => {
      drawSpectrogram(ctx);
      drawAnnotations(ctx);
    };
  }, [
    drawSpectrogram,
    drawTrackAudio,
    drawAnnotations,
    spectrogramIsLoading,
    trackingAudio,
  ]);

  useCanvas({ ref: canvasRef, draw });

  const props = isAnnotating ? annotateProps : spectrogramProps;
  return (
    <Card>
      <div className="flex flex-row gap-4">
        {withControls && (
          <ViewportToolbar
            dragEnabled={spectrogram.canDrag}
            zoomEnabled={spectrogram.canZoom}
            onResetClick={spectrogram.reset}
            onDragClick={spectrogram.enableDrag}
            onZoomClick={spectrogram.enableZoom}
          />
        )}
        {!disabled && withControls && (
          <AnnotationControls
            disabled={disabled}
            isDrawing={annotate.isDrawing}
            isDeleting={annotate.isDeleting}
            isSelecting={annotate.isSelecting}
            isEditing={annotate.isEditing}
            geometryType={annotate.geometryType}
            onDraw={annotate.enableDraw}
            onDelete={annotate.enableDelete}
            onSelect={annotate.enableSelect}
            onSelectGeometryType={annotate.setGeometryType}
          />
        )}
        {withSettings && (
          <SpectrogramSettings
            samplerate={recording.samplerate}
            settings={spectrogram.parameters}
            onChange={spectrogram.setParameters}
            onReset={spectrogram.resetParameters}
            onSave={() => onParameterSave?.(spectrogram.parameters)}
          />
        )}
        {withPlayer && <Player {...audio} />}
      </div>
      <div className="overflow-hidden relative rounded-md" style={{ height }}>
        <SpectrogramTags
          disabled={disabled}
          tags={annotate.tags}
          filter={tagFilter}
          onCreate={onCreateTag}
        >
          <canvas
            ref={canvasRef}
            {...props}
            className="absolute w-full h-full"
          />
        </SpectrogramTags>
      </div>
      {withBar && (
        <SpectrogramBar
          bounds={spectrogram.bounds}
          viewport={spectrogram.viewport}
          onMove={spectrogram.zoom}
        />
      )}
    </Card>
  );
}
