import useRecordingSpectrogram from "@/lib/hooks/recordings/useRecordingSpectrogram";
import { useHotkeys } from "react-hotkeys-hook";
import useSettings from "@/app/hooks/settings/useSettings";

import RecordingSpectrogramBase from "@/lib/components/recordings/RecordingSpectrogram";
import type { Recording } from "@/lib/types";

export default function RecordingSpectrogram({
  recording,
}: {
  recording: Recording;
}) {
  const { audioSettings, spectrogramSettings, reset, save } = useSettings();

  const spectrogram = useRecordingSpectrogram({
    recording,
    audioSettings: audioSettings.settings,
    spectrogramSettings: spectrogramSettings.settings,
  });

  useHotkeys("space", spectrogram.audio.togglePlay, {
    preventDefault: true,
    description: "Toggle playing",
  });

  useHotkeys("z", spectrogram.state.enableZooming, {
    description: "Enable spectrogram zooming",
  });

  useHotkeys("x", spectrogram.state.enablePanning, {
    description: "Enable spectrogram panning",
  });

  useHotkeys("b", spectrogram.viewport.back, {
    description: "Go back to previous view",
  });

  return (
    <RecordingSpectrogramBase
      samplerate={recording.samplerate}
      viewport={spectrogram.viewport.viewport}
      bounds={spectrogram.viewport.bounds}
      spectrogramDrawFn={spectrogram.canvasProps.drawFn}
      spectrogramState={spectrogram.state.state}
      audioSettings={audioSettings.settings}
      spectrogramSettings={spectrogramSettings.settings}
      audioCurrentTime={spectrogram.audio.currentTime}
      audioIsPlaying={spectrogram.audio.isPlaying}
      audioLoop={spectrogram.audio.loop}
      onAudioLoopToggle={spectrogram.audio.toggleLoop}
      onAudioPause={spectrogram.audio.pause}
      onAudioPlay={spectrogram.audio.play}
      onAudioSeek={spectrogram.audio.seek}
      onAudioSettingsChange={audioSettings.set}
      onAudioSpeedChange={audioSettings.setSpeed}
      onBarMove={spectrogram.barProps.onMove}
      onBarMoveEnd={spectrogram.barProps.onMoveEnd}
      onBarMoveStart={spectrogram.barProps.onMoveStart}
      onBarPress={spectrogram.barProps.onPress}
      onBarScroll={spectrogram.barProps.onScroll}
      onSettingsReset={reset}
      onSettingsSave={save}
      onSpectrogramDoubleClick={spectrogram.canvasProps.onDoubleClick}
      onSpectrogramMove={spectrogram.canvasProps.onMove}
      onSpectrogramMoveEnd={spectrogram.canvasProps.onMoveEnd}
      onSpectrogramMoveStart={spectrogram.canvasProps.onMoveStart}
      onSpectrogramScroll={spectrogram.canvasProps.onScroll}
      onSpectrogramSettingsChange={spectrogramSettings.set}
      onViewportBack={spectrogram.viewport.back}
      onViewportEnablePanning={spectrogram.state.enablePanning}
      onViewportEnableZooming={spectrogram.state.enableZooming}
      onViewportReset={spectrogram.viewport.reset}
    />
  );
}
