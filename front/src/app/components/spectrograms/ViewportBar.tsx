import ViewportBarBase from "@/lib/components/spectrograms/ViewportBar";
import type { ViewportController } from "@/lib/hooks/window/useViewport";
import useSpectrogramBarInteractions from "@/lib/hooks/spectrogram/useSpectrogramBarInteractions";

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
