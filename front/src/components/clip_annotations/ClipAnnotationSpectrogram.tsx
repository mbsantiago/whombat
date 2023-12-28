import { useCallback, useMemo, useRef, useState } from "react";
import { mergeProps } from "react-aria";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import AnnotationControls from "@/components/annotation/AnnotationControls";
import Player from "@/components/audio/Player";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import SpectrogramControls from "@/components/spectrograms/SpectrogramControls";
import SpectrogramSettings from "@/components/spectrograms/SpectrogramSettings";
import SpectrogramTags from "@/components/spectrograms/SpectrogramTags";
import useAnnotateClip from "@/hooks/annotation/useAnnotateClip";
import useAudio from "@/hooks/audio/useAudio";
import useCanvas from "@/hooks/draw/useCanvas";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useSpectrogramTrackAudio from "@/hooks/spectrogram/useSpectrogramTrackAudio";
import { getInitialViewingWindow } from "@/utils/windows";

import type { TagFilter } from "@/api/tags";
import type { ClipAnnotation, SpectrogramParameters } from "@/types";

export default function ClipAnnotationSpectrogram({
  clipAnnotation,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  onParameterSave,
  tagFilter,
}: {
  clipAnnotation: ClipAnnotation;
  parameters?: SpectrogramParameters;
  onParameterSave?: (params: SpectrogramParameters) => void;
  tagFilter?: TagFilter;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimensions = canvasRef.current?.getBoundingClientRect() ?? {
    width: 0,
    height: 0,
  };

  const { clip } = clipAnnotation;
  const { recording } = clip;

  // These are the absolute bounds of the spectrogram
  const bounds = useMemo(
    () => ({
      time: { min: clip.start_time, max: clip.end_time },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [clip.start_time, clip.end_time, recording.samplerate],
  );

  // This is the initial viewport of the spectrogram
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

  const [isAnnotating, setIsAnnotating] = useState(false);

  const audio = useAudio({
    recording,
    endTime: bounds.time.max,
    startTime: bounds.time.min,
  });

  const spectrogram = useSpectrogram({
    dimensions,
    recording,
    bounds,
    initial,
    parameters,
    onModeChange: (mode) => setIsAnnotating(mode === "idle"),
    enabled: !isAnnotating,
  });

  const annotate = useAnnotateClip({
    clipAnnotation,
    viewport: spectrogram.state.viewport,
    dimensions,
    onModeChange: (mode) => setIsAnnotating(mode !== "idle"),
    onDeselect: () => setIsAnnotating(false),
    enabled: isAnnotating,
  });

  const {
    controls: { centerOn },
  } = spectrogram;
  const handleTimeChange = useCallback(
    (time: number) => centerOn({ time }),
    [centerOn],
  );

  const { draw: drawTrackAudio } = useSpectrogramTrackAudio({
    viewport: spectrogram.state.viewport,
    currentTime: audio.state.currentTime,
    isPlaying: audio.state.playing,
    onTimeChange: handleTimeChange,
  });

  const {
    props: spectrogramProps,
    draw: drawSpectrogram,
    state: { isLoading: spectrogramIsLoading },
  } = spectrogram;
  const { props: annotateProps, draw: drawAnnotations } = annotate;

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.canvas.style.cursor = "wait";
      if (spectrogramIsLoading) return;
      drawSpectrogram(ctx);
      drawTrackAudio(ctx);
      drawAnnotations(ctx);
    },
    [drawSpectrogram, drawTrackAudio, drawAnnotations, spectrogramIsLoading],
  );

  const props = mergeProps(spectrogramProps, annotateProps);

  useCanvas({ ref: canvasRef, draw });

  return (
    <Card>
      <div className="flex flex-row gap-8">
        <SpectrogramControls
          canDrag={spectrogram.state.canDrag}
          canZoom={spectrogram.state.canZoom}
          onReset={() => spectrogram.controls.reset()}
          onDrag={() => spectrogram.controls.enableDrag()}
          onZoom={() => spectrogram.controls.enableZoom()}
        />
        <AnnotationControls
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
        <SpectrogramSettings
          samplerate={recording.samplerate}
          settings={spectrogram.state.parameters}
          onChange={(parameters) =>
            spectrogram.controls.setParameters(parameters)
          }
          onReset={() => spectrogram.controls.resetParameters()}
          onSave={() => onParameterSave?.(spectrogram.state.parameters)}
        />
        <Player state={audio.state} controls={audio.controls} />
      </div>
      <div className="relative overflow-hidden h-96 rounded-md">
        <SpectrogramTags tags={annotate.tags} filter={tagFilter}>
          <canvas
            ref={canvasRef}
            {...props}
            className="absolute w-full h-full"
          />
        </SpectrogramTags>
      </div>
      <SpectrogramBar
        bounds={spectrogram.state.bounds}
        viewport={spectrogram.state.viewport}
        onMove={spectrogram.controls.zoom}
      />
    </Card>
  );
}
