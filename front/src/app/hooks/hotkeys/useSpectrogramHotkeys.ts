import { useHotkeys } from "react-hotkeys-hook";

import type {
  AudioController,
  SpectrogramState,
  ViewportController,
} from "@/lib/types";

export default function useSpectrogramHotkeys({
  audio,
  spectrogramState,
  viewport,
  enabled = true,
}: {
  audio: AudioController;
  spectrogramState: SpectrogramState;
  viewport: ViewportController;
  enabled?: boolean;
}) {
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
