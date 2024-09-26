import Player from "@/app/components/audio/Player";
import RecordingCanvas from "@/app/components/spectrograms/RecordingCanvas";
import SettingsMenu from "@/app/components/spectrograms/SettingsMenu";
import ViewportBar from "@/app/components/spectrograms/ViewportBar";
import ViewportToolbar from "@/app/components/spectrograms/ViewportToolbar";

import useSpectrogramHotkeys from "@/app/hooks/hotkeys/useSpectrogramHotkeys";
import useAudioSettings from "@/app/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/app/hooks/settings/useSpectrogramSettings";

import RecordingSpectrogram from "@/lib/components/recordings/RecordingSpectrogram";

import useSpectrogramAudio from "@/lib/hooks/spectrogram/useSpectrogramAudio";
import useSpectrogramState from "@/lib/hooks/spectrogram/useSpectrogramState";
import useClipViewport from "@/lib/hooks/window/useClipViewport";

import type { ClipEvaluation, SpectrogramProps } from "@/lib/types";

export default function ClipEvaluationSpectrogram(
  props: {
    clipEvaluation: ClipEvaluation;
    threshold?: number;
    showPredictions?: boolean;
    showAnnotations?: boolean;
  } & SpectrogramProps,
) {
  const clip = props.clipEvaluation.clip_annotation.clip;
  const recording = clip.recording;

  const state = useSpectrogramState();

  const audioSettings = useAudioSettings();

  const spectrogramSettings = useSpectrogramSettings();

  const viewport = useClipViewport({
    clip,
    spectrogramSettings: spectrogramSettings.settings,
  });

  const audio = useSpectrogramAudio({
    viewport,
    recording: recording,
    audioSettings: audioSettings.settings,
  });

  const {
    withControls = true,
    withViewportBar = true,
    withHotKeys = true,
  } = props;

  useSpectrogramHotkeys({
    spectrogramState: state,
    audio,
    viewport,
    enabled: withHotKeys,
  });

  return (
    <RecordingSpectrogram
      ViewportToolbar={
        withControls ? (
          <ViewportToolbar state={state} viewport={viewport} />
        ) : undefined
      }
      Player={
        withControls ? (
          <Player
            audio={audio}
            samplerate={recording.samplerate}
            onChangeSpeed={(speed) =>
              audioSettings.dispatch({ type: "setSpeed", speed })
            }
          />
        ) : undefined
      }
      SettingsMenu={
        withControls ? (
          <SettingsMenu
            samplerate={recording.samplerate}
            audioSettings={audioSettings}
            spectrogramSettings={spectrogramSettings}
          />
        ) : undefined
      }
      ViewportBar={
        withViewportBar ? <ViewportBar viewport={viewport} /> : undefined
      }
      Canvas={
        <RecordingCanvas
          audioSettings={audioSettings.settings}
          spectrogramSettings={spectrogramSettings.settings}
          state={state}
          recording={recording}
          audio={audio}
          viewport={viewport}
          height={props.height}
        />
      }
    />
  );
}
