import { useMemo, memo } from "react";
import Card from "@/lib/components/ui/Card";
import SpectrogramBar from "@/lib/components/spectrograms/SpectrogramBar";
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
} from "@/lib/types";

const RecordingSpectrogram = memo(function RecordingSpectrogram({
  samplerate,
  viewport,
  bounds,
  height = 384,
  spectrogramState = "panning",
  audioSettings = DEFAULT_AUDIO_SETTINGS,
  spectrogramSettings = DEFAULT_SPECTROGRAM_SETTINGS,
  audioCurrentTime = 0,
  audioIsPlaying = false,
  audioLoop = false,
  onAudioPlay,
  onAudioPause,
  onAudioSeek,
  onAudioLoopToggle,
  onAudioSpeedChange,
  onAudioSettingsChange,
  onSpectrogramSettingsChange,
  onViewportReset,
  onViewportBack,
  onViewportEnablePanning,
  onViewportEnableZooming,
  onSpectrogramHover,
  onSpectrogramMoveStart,
  onSpectrogramMoveEnd,
  onSpectrogramMove,
  onSpectrogramPress,
  onSpectrogramScroll,
  onSpectrogramDoubleClick,
  onBarMoveStart,
  onBarMoveEnd,
  onBarMove,
  onBarPress,
  onBarScroll,
  onSettingsReset,
  onSettingsSave,
  spectrogramDrawFn,
}: {
  samplerate: number;
  viewport: SpectrogramWindow;
  bounds: SpectrogramWindow;
  height?: number;
  audioSettings?: AudioSettings;
  spectrogramSettings?: SpectrogramSettings;
  spectrogramState?: SpectrogramState;
  audioCurrentTime?: number;
  audioIsPlaying?: boolean;
  audioLoop?: boolean;
  onSpectrogramHover?: HoverHandler;
  onSpectrogramMoveStart?: MoveStartHandler;
  onSpectrogramMoveEnd?: MoveEndHandler;
  onSpectrogramMove?: MoveHandler;
  onSpectrogramPress?: PressHandler;
  onSpectrogramScroll?: ScrollHandler;
  onSpectrogramDoubleClick?: DoublePressHandler;
  spectrogramDrawFn?: DrawFn;
  onAudioPlay?: () => void;
  onAudioPause?: () => void;
  onAudioSeek?: (time: number) => void;
  onAudioLoopToggle?: () => void;
  onAudioSpeedChange?: (speed: number) => void;
  onAudioSettingsChange?: (settings: AudioSettings) => void;
  onSpectrogramSettingsChange?: (settings: SpectrogramSettings) => void;
  onViewportReset?: () => void;
  onViewportBack?: () => void;
  onViewportEnablePanning?: () => void;
  onViewportEnableZooming?: () => void;
  onSettingsReset?: () => void;
  onSettingsSave?: () => void;
  onBarMoveStart?: MoveStartHandler;
  onBarMoveEnd?: MoveEndHandler;
  onBarMove?: MoveHandler;
  onBarPress?: PressHandler;
  onBarScroll?: ScrollHandler;
}) {
  const speedOptions = useMemo(() => {
    return getSpeedOptions(samplerate);
  }, [samplerate]);

  return (
    <Card>
      <div className="flex flex-row gap-4">
        <ViewportToolbar
          state={spectrogramState}
          onResetClick={onViewportReset}
          onBackClick={onViewportBack}
          onDragClick={onViewportEnablePanning}
          onZoomClick={onViewportEnableZooming}
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
})

export default RecordingSpectrogram;
