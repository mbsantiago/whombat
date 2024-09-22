import ViewportToolbarBase from "@/lib/components/spectrograms/ViewportToolbar";

import type { SpectrogramState } from "@/lib/hooks/spectrogram/useSpectrogramState";
import type { ViewportController } from "@/lib/hooks/window/useViewport";

export default function ViewportToolbar({
  state,
  viewport,
}: {
  state: SpectrogramState;
  viewport: ViewportController;
}) {
  return (
    <ViewportToolbarBase
      mode={state.mode}
      onResetClick={viewport.reset}
      onBackClick={viewport.back}
      onDragClick={state.enablePanning}
      onZoomClick={state.enableZooming}
    />
  );
}
