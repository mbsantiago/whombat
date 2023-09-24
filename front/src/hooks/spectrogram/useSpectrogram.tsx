import { useSelector } from "@xstate/react";
import { useCallback } from "react";
import { useUpdateEffect } from "react-use";
import { type EventFrom, type StateFrom } from "xstate";

import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import useSpectrogramTrackAudio from "@/hooks/spectrogram/useSpectrogramTrackAudio";
import useSpectrogramImage from "@/hooks/spectrogram/useSpectrogramImage";
import useSpectrogramBBoxZoom from "@/hooks/spectrogram/useSpectrogramBBoxZoom";
import useSpectrogramScrollMove from "@/hooks/spectrogram/useSpectrogramScrollMove";
import useSpectrogramScrollZoom from "@/hooks/spectrogram/useSpectrogramScrollZoom";
import useSpectrogramDrag from "@/hooks/spectrogram/useSpectrogramDrag";
import { spectrogramMachine } from "@/machines/spectrogram";
import { audioMachine } from "@/machines/audio";
import { type Recording } from "@/api/recordings";
import { type ScratchState } from "@/hooks/motions/useDrag";
import { type ScrollState } from "@/hooks/motions/useMouseWheel";
import { type SpectrogramWindow } from "@/api/spectrograms";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  window: SpectrogramWindow,
) => void;

export type SpectrogramState = {
  canZoom: boolean;
  canScroll: boolean;
  canDrag: boolean;
  canBBoxZoom: boolean;
  frozen: boolean;
};

const selectTime = (state: StateFrom<typeof audioMachine>) =>
  state.context.currentTime;

/* This hook provides all the basic spectrogram functionality, including
 * playback, dragging, scrolling, and settings, with controls for each.
 */
export default function useSpectrogram({
  recording,
  bounds,
  initial,
  state,
  send,
  dragState,
  scrollState,
}: {
  recording?: Recording;
  bounds?: SpectrogramWindow;
  initial?: SpectrogramWindow;
  state: StateFrom<typeof spectrogramMachine>;
  send: (event: EventFrom<typeof spectrogramMachine>) => void;
  dragState: ScratchState;
  scrollState: ScrollState;
}) {
  // State machine for the audio player
  const currentTime = useSelector(state.context.audio, selectTime);

  // Update the spectrogram when recording changes
  useUpdateEffect(() => {
    if (recording != null) {
      send({ type: "CHANGE_RECORDING", recording });
    }
  }, [recording, send]);

  // Update the spectrogram when bounds change
  useUpdateEffect(() => {
    if (bounds != null && initial != null) {
      send({ type: "UPDATE", bounds, initial });
    }
  }, [bounds, initial, send]);

  // Allow the user to drag the spectrogram around
  useSpectrogramDrag({
    active: state.matches("panning"),
    window: state.context.window,
    drag: dragState,
    send,
  });

  // Allow the user to move the spectrogram around with the scroll wheel
  useSpectrogramScrollMove({
    // NOTE: This should be active all the time as it doesn't interfere with
    // other mouse events
    active: true,
    scrollState,
    send,
  });

  // Allow the user to zoom in and out of the spectrogram with the scroll wheel
  useSpectrogramScrollZoom({
    // NOTE: This should be active all the time as it doesn't interfere with
    // other mouse events
    active: true,
    scrollState,
    send,
  });

  // Allow the user to zoom in and out of the spectrogram by drawing a bounding
  // box
  const drawZoomBBox = useSpectrogramBBoxZoom({
    window: state.context.window,
    drag: dragState,
    active: state.matches("zooming"),
    send,
  });

  // Draw the spectrogram image
  const drawSpecImage = useSpectrogramImage({
    recording: state.context.recording,
    window: state.context.window,
    parameters: state.context.parameters,
  });

  const drawCurrentTime = useSpectrogramTrackAudio({
    active: state.matches("playing"),
    time: currentTime,
    window: state.context.window,
    send,
  });

  const isZooming = state.matches("zooming");
  const isPanning = state.matches("panning");

  const { window } = state.context;

  // Draw the spectrogram
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (isZooming) {
        ctx.canvas.style.cursor = "zoom-in";
      } else if (isPanning) {
        ctx.canvas.style.cursor = "grab";
      } else {
        ctx.canvas.style.cursor = "default";
      }

      drawSpecImage(ctx, window);
      drawTimeAxis(ctx, window.time);
      drawFreqAxis(ctx, window.freq);
      drawZoomBBox(ctx);
      drawCurrentTime(ctx);
    },
    [
      isZooming,
      isPanning,
      drawZoomBBox,
      drawSpecImage,
      drawCurrentTime,
      window,
    ],
  );

  return {
    state,
    send,
    draw,
  };
}
