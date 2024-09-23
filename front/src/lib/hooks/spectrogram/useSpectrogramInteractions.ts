import {
  useSpectrogramDrag,
  useSpectrogramScroll,
} from "@/lib/hooks/spectrogram/useSpectrogramMotions";
import useSpectrogramSeek from "@/lib/hooks/spectrogram/useSpectrogramSeek";
import useSpectrogramZoom from "@/lib/hooks/spectrogram/useSpectrogramZoom";

import type {
  AudioController,
  SpectrogramMode,
  SpectrogramWindow,
  ViewportController,
} from "@/lib/types";

const nullFn = () => {};

export default function useSpectrogramInteractions({
  viewport,
  audio,
  state,
  onZoom,
}: {
  state: SpectrogramMode;
  viewport: ViewportController;
  audio: AudioController;
  onZoom?: (window: SpectrogramWindow) => void;
}) {
  const {
    onMove: onZoomMove,
    onMoveStart: onZoomStart,
    onMoveEnd: onZoomEnd,
    drawFn: drawZoomBox,
  } = useSpectrogramZoom({ viewport, onZoom });
  const { onMove: onDragMove, onMoveStart: onDragStart } = useSpectrogramDrag({
    viewport,
  });
  const { onScroll } = useSpectrogramScroll({ viewport });
  const { onDoubleClick } = useSpectrogramSeek({ viewport, audio });

  switch (state) {
    case "panning":
      return {
        onMoveStart: onDragStart,
        onMove: onDragMove,
        onScroll,
        onDoubleClick,
        drawFn: nullFn,
      };
    case "zooming":
      return {
        onMove: onZoomMove,
        onMoveStart: onZoomStart,
        onMoveEnd: onZoomEnd,
        onScroll,
        onDoubleClick,
        drawFn: drawZoomBox,
      };
    default:
      return {
        onMove: nullFn,
        onMoveStart: nullFn,
        onMoveEnd: nullFn,
        onScroll,
        onDoubleClick,
        drawFn: nullFn,
      };
  }
}
