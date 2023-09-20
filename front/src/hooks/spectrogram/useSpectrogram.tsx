import { useActor } from "@xstate/react";
import { useEffect, useCallback } from "react";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import drawOnset from "@/draw/onset";
import useSpectrogramParameters from "@/hooks/spectrogram/useSpectrogramParameters";
import useWindowDrag from "@/hooks/spectrogram/useWindowDrag";
import useWindowScroll from "@/hooks/spectrogram/useWindowScroll";
import useWindowZoom from "@/hooks/spectrogram/useWindowZoom";
import useBBoxZoom from "@/hooks/spectrogram/useBBoxZoom";
import useSpectrogramWindow from "@/hooks/spectrogram/useSpectrogramWindow";
import useRecordingSegments from "@/hooks/spectrogram/useRecordingSegments";
import { spectrogramMachine } from "@/machines/spectrogram";

import { type StateFrom, type EventFrom } from "xstate";
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

/* This hook provides all the basic spectrogram functionality, including
 * playback, dragging, scrolling, and settings, with controls for each.
 */
export default function useSpectrogram({
  state,
  send,
  dragState,
  scrollState,
}: {
  state: StateFrom<typeof spectrogramMachine>;
  send: (event: EventFrom<typeof spectrogramMachine>) => void;
  dragState: ScratchState;
  scrollState: ScrollState;
}) {
  // Listen for changes to the spectrogram settings and update global state
  useSpectrogramParameters({
    parameters: state.context.parameters,
  });

  // State machine for the audio player
  const [audioState] = useActor(state.context.audio);

  // Track the audio playback with the spectrogram
  useEffect(() => {
    if (state.matches("playing")) {
      send({ type: "CENTER_ON", time: audioState.context.currentTime });
    }
  }, [state.matches("playing"), audioState.context.currentTime]);

  // Allow the user to drag the spectrogram around
  const handleOnDrag = useCallback(
    (newWindow: SpectrogramWindow) => {
      send({ type: "PAN_TO", window: newWindow });
    },
    [send],
  );
  useWindowDrag({
    window: state.context.window,
    setWindow: handleOnDrag,
    active: state.matches("panning"),
    dragState,
  });

  // Allow the user to move the spectrogram around with the scroll wheel
  const handleOnScroll = useCallback(
    (shiftBy: { time: number; freq: number }, relative: boolean) => {
      send({ type: "SHIFT_WINDOW", shiftBy, relative });
    },
    [send],
  );
  useWindowScroll({
    // NOTE: This should be active all the time as it doesn't interfere with
    // other mouse events
    active: true,
    shiftWindow: handleOnScroll,
    scrollState,
  });

  // Allow the user to zoom in and out of the spectrogram with the scroll wheel
  const handleOnScrollZoom = useCallback(
    (scaleBy: { time?: number; freq?: number }) => {
      send({ type: "SCALE_WINDOW", scaleBy });
    },
    [send],
  );
  useWindowZoom({
    // NOTE: This should be active all the time as it doesn't interfere with
    // other mouse events
    active: true,
    scaleWindow: handleOnScrollZoom,
    scrollState,
  });

  // Allow the user to zoom in and out of the spectrogram by drawing a bounding
  // box
  const handleOnBBoxZoom = useCallback(
    (newWindow: SpectrogramWindow) => {
      send({ type: "ZOOM_TO", window: newWindow });
    },
    [send],
  );
  const { draw: drawZoomBBox } = useBBoxZoom({
    window: state.context.window,
    setWindow: handleOnBBoxZoom,
    drag: dragState,
    active: state.matches("zooming"),
  });

  // Get a spectrogram segment that covers the window
  const { selected, prev, next } = useRecordingSegments({
    recording: state.context.recording,
    window: state.context.window,
  });

  // Load the spectrogram segment
  const { draw: drawSpecWindow } = useSpectrogramWindow({
    recording_id: state.context.recording.id,
    window: selected,
    parameters: state.context.parameters,
  });

  // Load the previous and next spectrogram segments in the background
  useSpectrogramWindow({
    recording_id: state.context.recording.id,
    window: prev,
    parameters: state.context.parameters,
  });
  useSpectrogramWindow({
    recording_id: state.context.recording.id,
    window: next,
    parameters: state.context.parameters,
  });

  // Draw the spectrogram
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const window = state.context.window;
      drawSpecWindow(ctx, window);
      drawTimeAxis(ctx, window.time);
      drawFreqAxis(ctx, window.freq);
      drawZoomBBox(ctx);

      if (audioState.context.currentTime) {
        if (
          audioState.context.currentTime < window.time.min ||
          audioState.context.currentTime > window.time.max
        ) {
          return;
        }

        const { min, max } = window.time;
        const x = Math.ceil(
          (ctx.canvas.width * (audioState.context.currentTime - min)) /
            (max - min),
        );
        drawOnset(ctx, x);
      }
    },
    [
      drawZoomBBox,
      drawSpecWindow,
      audioState.context.currentTime,
      state.context.window,
    ],
  );

  return {
    state,
    send,
    draw,
  };
}
