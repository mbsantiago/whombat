import { useHotkeys } from "react-hotkeys-hook";

import type {
  AnnotationState,
  AudioController,
  SpectrogramState,
  ViewportController,
} from "@/lib/types";

export default function useAnnotationHotkeys({
  annotationState,
  audio,
  spectrogramState,
  viewport,
  enabled = true,
}: {
  annotationState: AnnotationState;
  audio: AudioController;
  spectrogramState: SpectrogramState;
  viewport: ViewportController;
  enabled?: boolean;
}) {
  useHotkeys("a", annotationState.enableDrawing, {
    preventDefault: true,
    description: "Enable annotation drawing",
    enabled,
  });

  useHotkeys("d", annotationState.enableDeleting, {
    preventDefault: true,
    description: "Enable annotation deleting",
    enabled,
  });

  useHotkeys("s", annotationState.enableSelecting, {
    preventDefault: true,
    description: "Enable annotation selecting",
    enabled,
  });

  useHotkeys("space", audio.togglePlay, {
    preventDefault: true,
    description: "Toggle playing",
    enabled,
  });

  useHotkeys("z", spectrogramState.enableZooming, {
    description: "Enable spectrogram zooming",
    enabled,
  });

  useHotkeys("x", spectrogramState.enablePanning, {
    description: "Enable spectrogram panning",
    enabled,
  });

  useHotkeys("b", viewport.back, {
    description: "Go back to previous view",
    enabled,
  });
}
