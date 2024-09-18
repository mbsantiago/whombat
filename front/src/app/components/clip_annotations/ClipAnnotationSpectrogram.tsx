import { FC } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import useAudioSettings from "@/app/hooks/settings/useAudioSettings";
import useSpectrogramSettings from "@/app/hooks/settings/useSpectrogramSettings";
import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";
import useSpectrogramAudio from "@/lib/hooks/spectrogram/useSpectrogramAudio";
import useClipViewport from "@/lib/hooks/window/useClipViewport";
import useSpectrogramState from "@/lib/hooks/spectrogram/useSpectrogramState";
import useAnnotationState from "@/lib/hooks/annotation/useAnnotationState";
import useAnnotationTagPallete from "@/lib/hooks/annotation/useAnnotationTagPalette";

import TagSearchBarBase from "../tags/TagSearchBar";
import CanvasWithAnnotations from "@/app/components/spectrograms/CanvasWithAnnotation";
import Player from "@/app/components/audio/Player";
import ViewportToolbar from "@/app/components/spectrograms/ViewportToolbar";
import ViewportBar from "@/app/components/spectrograms/ViewportBar";
import SettingsMenu from "@/app/components/spectrograms/SettingsMenu";
import AnnotationControls from "@/lib/components/annotation/AnnotationControls";
import ClipAnnotationSpectrogramBase from "@/lib/components/clip_annotations/ClipAnnotationSpectrogram";

import type { ClipAnnotation } from "@/lib/types";
import type { TagSearchBarProps } from "@/lib/components/tags/TagSearchBar";

export default function ClipAnnotationSpectrogram({
  clipAnnotation,
  spectrogramSettings,
  audioSettings,
  tagPalette,
  TagSearchBar = TagSearchBarBase,
}: {
  clipAnnotation: ClipAnnotation;
  spectrogramSettings: ReturnType<typeof useSpectrogramSettings>;
  audioSettings: ReturnType<typeof useAudioSettings>;
  tagPalette: ReturnType<typeof useAnnotationTagPallete>;
  TagSearchBar?: FC<TagSearchBarProps>;
}) {
  const { data = clipAnnotation } = useClipAnnotation({
    uuid: clipAnnotation.uuid,
    clipAnnotation,
  });

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

  useHotkeys("a", annotationState.enableDrawing, {
    preventDefault: true,
    description: "Enable annotation drawing",
  });

  useHotkeys("d", annotationState.enableDeleting, {
    preventDefault: true,
    description: "Enable annotation deleting",
  });

  useHotkeys("s", annotationState.enableSelecting, {
    preventDefault: true,
    description: "Enable annotation selecting",
  });

  useHotkeys("space", audio.togglePlay, {
    preventDefault: true,
    description: "Toggle playing",
  });

  useHotkeys("z", spectrogramState.enableZooming, {
    description: "Enable spectrogram zooming",
  });

  useHotkeys("x", spectrogramState.enablePanning, {
    description: "Enable spectrogram panning",
  });

  useHotkeys("b", viewport.back, {
    description: "Go back to previous view",
  });

  return (
    <ClipAnnotationSpectrogramBase
      ViewportToolbar={
        <ViewportToolbar state={spectrogramState} viewport={viewport} />
      }
      Player={
        <Player
          audio={audio}
          samplerate={data.clip.recording.samplerate}
          onChangeSpeed={(speed) =>
            audioSettings.dispatch({ type: "setSpeed", speed })
          }
        />
      }
      SettingsMenu={
        <SettingsMenu
          samplerate={data.clip.recording.samplerate}
          audioSettings={audioSettings}
          spectrogramSettings={spectrogramSettings}
        />
      }
      ViewportBar={<ViewportBar viewport={viewport} />}
      AnnotationControls={
        <AnnotationControls
          mode={annotationState.mode}
          geometryType={annotationState.geometryType}
          onDraw={annotationState.enableDrawing}
          onDelete={annotationState.enableDeleting}
          onSelect={annotationState.enableSelecting}
          onSelectGeometryType={annotationState.setGeometryType}
        />
      }
      Canvas={
        <CanvasWithAnnotations
          clipAnnotation={data}
          audioSettings={audioSettings.settings}
          spectrogramSettings={spectrogramSettings.settings}
          spectrogramState={spectrogramState}
          annotationState={annotationState}
          recording={data.clip.recording}
          audio={audio}
          viewport={viewport}
          defaultTags={tagPalette.tags}
          TagSearchBar={TagSearchBar}
        />
      }
    />
  );
}
