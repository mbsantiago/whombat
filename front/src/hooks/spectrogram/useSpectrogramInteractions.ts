import useSpectrogramZoom from "@/hooks/spectrogram/useSpectrogramZoom";
import useSpectrogramSeek from "@/hooks/spectrogram/useSpectrogramSeek";
import type { AudioController } from "@/hooks/audio/useRecordingAudio";
import type { ViewportController } from "@/hooks/window/useViewport";
import type { SpectrogramWindow, SpectrogramState } from "@/types";
import {
  useSpectrogramDrag,
  useSpectrogramScroll,
} from "@/hooks/spectrogram/useSpectrogramMotions";

const nullFn = () => {};

export default function useSpectrogramInteractions({
  viewport,
  audio,
  state,
  onZoom,
}: {
  state: SpectrogramState;
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
