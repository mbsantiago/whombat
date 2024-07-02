import useRecordingSpectrogram from "@/lib/hooks/recordings/useRecordingSpectrogram";
import RecordingSpectrogram from "@/lib/components/recordings/RecordingSpectrogram";
import type { AudioSettingsInterface } from "@/lib/hooks/settings/useAudioSettings";
import type { SpectrogramSettingsInterface } from "@/lib/hooks/settings/useSpectrogramSettings";
import type { Recording } from "@/lib/types";

export default function RecordingSpectrogramWrapper({
  recording,
  audioSettings,
  spectrogramSettings,
  onReset,
  onSave,
}: {
  recording: Recording;
  audioSettings: AudioSettingsInterface;
  spectrogramSettings: SpectrogramSettingsInterface;
  onReset?: () => void;
  onSave?: () => void;
}) {
  const spectrogram = useRecordingSpectrogram({
    recording,
    audioSettings: audioSettings.settings,
    spectrogramSettings: spectrogramSettings.settings,
  });

  return (
    <RecordingSpectrogram
      recording={recording}
      viewport={spectrogram.viewport.viewport}
      bounds={spectrogram.viewport.bounds}
      spectrogramDrawFn={spectrogram.canvasProps.drawFn}
      spectrogramState={spectrogram.state.state}
      audioCurrentTime={spectrogram.audio.currentTime}
      audioIsPlaying={spectrogram.audio.isPlaying}
      audioLoop={spectrogram.audio.loop}
      onSpectrogramMoveStart={spectrogram.canvasProps.onMoveStart}
      onSpectrogramMoveEnd={spectrogram.canvasProps.onMoveEnd}
      onSpectrogramMove={spectrogram.canvasProps.onMove}
      onSpectrogramScroll={spectrogram.canvasProps.onScroll}
      onSpectrogramDoubleClick={spectrogram.canvasProps.onDoubleClick}
      onAudioPlay={spectrogram.audio.play}
      onAudioPause={spectrogram.audio.pause}
      onAudioSeek={spectrogram.audio.seek}
      onAudioLoopToggle={spectrogram.audio.toggleLoop}
      onAudioSettingsChange={audioSettings.set}
      onSpectrogramSettingsChange={spectrogramSettings.set}
      onAudioSpeedChange={audioSettings.setSpeed}
      onSettingsReset={onReset}
      onSettingsSave={onSave}
      onBarMoveStart={spectrogram.barProps.onMoveStart}
      onBarMoveEnd={spectrogram.barProps.onMoveEnd}
      onBarMove={spectrogram.barProps.onMove}
      onBarPress={spectrogram.barProps.onPress}
      onBarScroll={spectrogram.barProps.onScroll}
    />
  );
}
