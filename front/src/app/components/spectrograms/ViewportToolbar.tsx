import ViewportToolbarBase from "@/lib/components/spectrograms/ViewportToolbar";

import type { SpectrogramState, ViewportController } from "@/lib/types";

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
