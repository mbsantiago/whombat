import Player from "@/app/components/audio/Player";
import SelectedSoundEventAnnotation from "@/app/components/sound_event_annotations/SelectedSoundEventAnnotation";
import ClipAnnotationCanvas from "@/app/components/spectrograms/ClipAnnotationCanvas";
import SettingsMenu from "@/app/components/spectrograms/SettingsMenu";
import ViewportBar from "@/app/components/spectrograms/ViewportBar";
import ViewportToolbar from "@/app/components/spectrograms/ViewportToolbar";

import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";
import useAnnotationHotkeys from "@/app/hooks/hotkeys/useAnnotationHotkeys";
import useAudioSettings from "@/app/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/app/hooks/settings/useSpectrogramSettings";

import AnnotationControls from "@/lib/components/annotation/AnnotationControls";
import ClipAnnotationSpectrogramBase from "@/lib/components/clip_annotations/ClipAnnotationSpectrogram";
import Empty from "@/lib/components/ui/Empty";

import useAnnotationState from "@/lib/hooks/annotation/useAnnotationState";
import useSpectrogramAudio from "@/lib/hooks/spectrogram/useSpectrogramAudio";
import useSpectrogramState from "@/lib/hooks/spectrogram/useSpectrogramState";
import useClipViewport from "@/lib/hooks/window/useClipViewport";

import type { ClipAnnotation } from "@/lib/types";

export default function ClipAnnotationSpectrogram({
  clipAnnotation,
  height,
  withAnnotationControls = true,
  withAnnotations = true,
  withPlayer = true,
  withControls = true,
  withViewportBar = true,
  withHotKeys = true,
  withSoundEvents = true,
  enabled = false,
}: {
  clipAnnotation: ClipAnnotation;
  height?: number;
  withAnnotationControls?: boolean;
  withAnnotations?: boolean;
  withControls?: boolean;
  withViewportBar?: boolean;
  withHotKeys?: boolean;
  withPlayer?: boolean;
  withSoundEvents?: boolean;
  enabled?: boolean;
}) {
  const { data = clipAnnotation } = useClipAnnotation({
    uuid: clipAnnotation.uuid,
    clipAnnotation,
  });

  const audioSettings = useAudioSettings();

  const spectrogramSettings = useSpectrogramSettings();

  const spectrogramState = useSpectrogramState();

  const annotationState = useAnnotationState({ spectrogramState });

  const viewport = useClipViewport({
    clip: data.clip,
    spectrogramSettings: spectrogramSettings.settings,
  });

  const audio = useSpectrogramAudio({
    viewport,
    recording: data.clip.recording,
    audioSettings: audioSettings.settings,
  });

  useAnnotationHotkeys({
    annotationState,
    audio,
    viewport,
    spectrogramState,
    enabled: withHotKeys,
  });

  return (
    <ClipAnnotationSpectrogramBase
      ViewportToolbar={
        withControls ? (
          <ViewportToolbar state={spectrogramState} viewport={viewport} />
        ) : undefined
      }
      Player={
        withPlayer ? (
          <Player
            audio={audio}
            samplerate={data.clip.recording.samplerate}
            onChangeSpeed={(speed) =>
              audioSettings.dispatch({ type: "setSpeed", speed })
            }
          />
        ) : undefined
      }
      SettingsMenu={
        withControls ? (
          <SettingsMenu
            samplerate={data.clip.recording.samplerate}
            audioSettings={audioSettings}
            spectrogramSettings={spectrogramSettings}
          />
        ) : undefined
      }
      ViewportBar={
        withViewportBar ? <ViewportBar viewport={viewport} /> : undefined
      }
      AnnotationControls={
        withAnnotationControls ? (
          <AnnotationControls
            mode={annotationState.mode}
            geometryType={annotationState.geometryType}
            onDraw={annotationState.enableDrawing}
            onDelete={annotationState.enableDeleting}
            onSelect={annotationState.enableSelecting}
            onSelectGeometryType={annotationState.setGeometryType}
          />
        ) : undefined
      }
      Canvas={
        <ClipAnnotationCanvas
          height={height}
          clipAnnotation={data}
          audioSettings={audioSettings.settings}
          spectrogramSettings={spectrogramSettings.settings}
          spectrogramState={spectrogramState}
          annotationState={annotationState}
          recording={data.clip.recording}
          audio={audio}
          viewport={viewport}
          withAnnotations={withAnnotations}
          enabled={enabled}
        />
      }
      SelectedSoundEvent={
        !withSoundEvents ? undefined : annotationState.selectedAnnotation !=
          null ? (
          <SelectedSoundEventAnnotation
            soundEventAnnotation={annotationState.selectedAnnotation}
          />
        ) : (
          <Empty>
            No annotation selected, click on an annotation to view details
          </Empty>
        )
      }
    />
  );
}
