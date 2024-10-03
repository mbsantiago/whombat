import ViewportBarBase from "@/lib/components/spectrograms/ViewportBar";

import useSpectrogramBarInteractions from "@/lib/hooks/spectrogram/useSpectrogramBarInteractions";

import type { ViewportController } from "@/lib/types";

export default function ViewportBar({
  viewport,
}: {
  viewport: ViewportController;
}) {
  const spectrogramBarProps = useSpectrogramBarInteractions({ viewport });
  return (
    <ViewportBarBase
      bounds={viewport.bounds}
      viewport={viewport.viewport}
      {...spectrogramBarProps}
    />
  );
}
