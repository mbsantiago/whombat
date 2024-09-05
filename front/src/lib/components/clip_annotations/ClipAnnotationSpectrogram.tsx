import { useMemo, memo } from "react";
import Card from "@/lib/components/ui/Card";
import SpectrogramBar from "@/lib/components/spectrograms/SpectrogramBar";
import AnnotationControls, {
  type AnnotationMode,
} from "@/lib/components/annotation/AnnotationControls";
import ViewportToolbar from "@/lib/components/spectrograms/ViewportToolbar";
import SettingsMenu from "@/lib/components/settings/SettingsMenu";
import Canvas from "@/lib/components/spectrograms/Canvas";
import Player from "@/lib/components/audio/Player";

import { getSpeedOptions } from "@/lib/hooks/settings/useAudioSettings";
import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SPECTROGRAM_SETTINGS,
} from "@/lib/constants";

import type {
  AudioSettings,
  SpectrogramSettings,
  SpectrogramState,
  SpectrogramWindow,
  DrawFn,
  HoverHandler,
  MoveStartHandler,
  MoveEndHandler,
  MoveHandler,
  PressHandler,
  ScrollHandler,
  DoublePressHandler,
  GeometryType,
} from "@/lib/types";

const ClipAnnotationSpectrogram = memo(function ClipAnnotationSpectrogram({
  samplerate,
  viewport,
  bounds,
  annotationMode = "none",
  audioCurrentTime = 0,
  audioIsPlaying = false,
  audioLoop = false,
  audioSettings = DEFAULT_AUDIO_SETTINGS,
  geometryType = "BoundingBox",
  height = 384,
  spectrogramDrawFn,
  spectrogramMode = "panning",
  spectrogramSettings = DEFAULT_SPECTROGRAM_SETTINGS,
  onAnnotationDelete,
  onAnnotationDraw,
  onAnnotationSelect,
  onAudioLoopToggle,
  onAudioPause,
  onAudioPlay,
  onAudioSeek,
  onAudioSettingsChange,
  onAudioSpeedChange,
  onBarMove,
  onBarMoveEnd,
  onBarMoveStart,
  onBarPress,
  onBarScroll,
  onSelectGeometryType,
  onSettingsReset,
  onSettingsSave,
  onSpectrogramDoubleClick,
  onSpectrogramHover,
  onSpectrogramMove,
  onSpectrogramMoveEnd,
  onSpectrogramMoveStart,
  onSpectrogramPress,
  onSpectrogramScroll,
  onSpectrogramSettingsChange,
  onViewportBack,
  onViewportEnablePanning,
  onViewportEnableZooming,
  onViewportReset,
}: {
  samplerate: number;
  viewport: SpectrogramWindow;
  bounds: SpectrogramWindow;
  annotationMode?: AnnotationMode;
  audioCurrentTime?: number;
  audioIsPlaying?: boolean;
  audioLoop?: boolean;
  audioSettings?: AudioSettings;
  geometryType?: GeometryType;
  height?: number;
  spectrogramDrawFn?: DrawFn;
  spectrogramMode?: SpectrogramState;
  spectrogramSettings?: SpectrogramSettings;
  onAnnotationDelete?: () => void;
  onAnnotationDraw?: () => void;
  onAnnotationSelect?: () => void;
  onAudioLoopToggle?: () => void;
  onAudioPause?: () => void;
  onAudioPlay?: () => void;
  onAudioSeek?: (time: number) => void;
  onAudioSettingsChange?: (settings: AudioSettings) => void;
  onAudioSpeedChange?: (speed: number) => void;
  onBarMove?: MoveHandler;
  onBarMoveEnd?: MoveEndHandler;
  onBarMoveStart?: MoveStartHandler;
  onBarPress?: PressHandler;
  onBarScroll?: ScrollHandler;
  onSelectGeometryType?: (type: GeometryType) => void;
  onSettingsReset?: () => void;
  onSettingsSave?: () => void;
  onSpectrogramDoubleClick?: DoublePressHandler;
  onSpectrogramHover?: HoverHandler;
  onSpectrogramMove?: MoveHandler;
  onSpectrogramMoveEnd?: MoveEndHandler;
  onSpectrogramMoveStart?: MoveStartHandler;
  onSpectrogramPress?: PressHandler;
  onSpectrogramScroll?: ScrollHandler;
  onSpectrogramSettingsChange?: (settings: SpectrogramSettings) => void;
  onViewportBack?: () => void;
  onViewportEnablePanning?: () => void;
  onViewportEnableZooming?: () => void;
  onViewportReset?: () => void;
}) {
  const speedOptions = useMemo(() => {
    return getSpeedOptions(samplerate);
  }, [samplerate]);

  return (
    <Card>
      <div className="flex flex-row gap-4">
        <ViewportToolbar
          mode={spectrogramMode}
          onResetClick={onViewportReset}
          onBackClick={onViewportBack}
          onDragClick={onViewportEnablePanning}
          onZoomClick={onViewportEnableZooming}
        />
        <AnnotationControls
          mode={annotationMode}
          geometryType={geometryType}
          onDraw={onAnnotationDraw}
          onDelete={onAnnotationDelete}
          onSelect={onAnnotationSelect}
          onSelectGeometryType={onSelectGeometryType}
        />
        <Player
          currentTime={audioCurrentTime}
          startTime={bounds.time.min}
          endTime={bounds.time.max}
          isPlaying={audioIsPlaying}
          loop={audioLoop}
          speed={audioSettings.speed}
          onPlay={onAudioPlay}
          onPause={onAudioPause}
          onSeek={onAudioSeek}
          onToggleLoop={onAudioLoopToggle}
          onSpeedChange={onAudioSpeedChange}
          speedOptions={speedOptions}
        />
        <SettingsMenu
          audioSettings={audioSettings}
          spectrogramSettings={spectrogramSettings}
          samplerate={samplerate}
          onAudioSettingsChange={onAudioSettingsChange}
          onSpectrogramSettingsChange={onSpectrogramSettingsChange}
          onResetClick={onSettingsReset}
          onSaveClick={onSettingsSave}
        />
      </div>
      <Canvas
        height={height}
        viewport={viewport}
        onHover={onSpectrogramHover}
        onMoveStart={onSpectrogramMoveStart}
        onMoveEnd={onSpectrogramMoveEnd}
        onMove={onSpectrogramMove}
        onPress={onSpectrogramPress}
        onScroll={onSpectrogramScroll}
        onDoubleClick={onSpectrogramDoubleClick}
        drawFn={spectrogramDrawFn}
      />
      <SpectrogramBar
        bounds={bounds}
        viewport={viewport}
        onMoveStart={onBarMoveStart}
        onMoveEnd={onBarMoveEnd}
        onMove={onBarMove}
        onPress={onBarPress}
        onScroll={onBarScroll}
      />
    </Card>
  );
});

export default ClipAnnotationSpectrogram;
