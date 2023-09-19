import { useMachine, useActor } from "@xstate/react";
import { assign, spawn } from "xstate";
import { useEffect, useCallback } from "react";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import drawOnset from "@/draw/onset";
import useSpectrogramParameters from "@/hooks/useSpectrogramParameters";
import useWindowDrag from "@/hooks/useWindowDrag";
import useWindowScroll from "@/hooks/useWindowScroll";
import useWindowZoom from "@/hooks/useWindowZoom";
import useBBoxZoom from "@/hooks/useBBoxZoom";
import useSpectrogramWindow from "@/hooks/useSpectrogramWindow";
import useRecordingSegments from "@/hooks/useRecordingSegments";
import { spectrogramMachine } from "@/machines/spectrogram";
import { audioMachine } from "@/machines/audio";
import { type Recording } from "@/api/recordings";
import { type SpectrogramWindow } from "@/api/spectrograms";
import api from "@/app/api";

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
  bounds,
  initial,
  recording,
  dragState,
  scrollState,
  scrollRef,
}: {
  bounds: SpectrogramWindow;
  initial: SpectrogramWindow;
  recording: Recording;
  dragState: any;
  scrollState: any;
  scrollRef: any;
}) {
  // This hook holds the state for the spectrogram settings
  const settings = useSpectrogramParameters({
    recording,
  });

  // State machine for the spectrogram
  const [state, send] = useMachine(spectrogramMachine, {
    context: {
      recording,
      bounds,
      initial,
      window: initial,
    },
    actions: {
      initAudio: assign({
        // @ts-ignore
        audio: () =>
          spawn(
            audioMachine.withContext({
              audio: new Audio(),
              recording,
              startTime: bounds.time.min,
              endTime: bounds.time.max,
              currentTime: bounds.time.min,
              muted: false,
              volume: 1,
              speed: 1,
              loop: true,
              getAudioURL: api.audio.getStreamUrl,
            }),
          ),
      }),
    },
  });

  // State machine for the audio player
  const [audioState, audioSend] = useActor(state.context.audio);

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
    shiftWindow: handleOnScroll,
    active: state.matches("panning"),
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
    active: state.matches("panning"),
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
    dimensions: {
      width: scrollRef.current?.offsetWidth ?? 0,
      height: scrollRef.current?.offsetHeight ?? 0,
    },
    drag: dragState,
    active: state.matches("zooming"),
  });

  // Get a spectrogram segment that covers the window
  const { selected, prev, next } = useRecordingSegments({
    recording,
    window: state.context.window,
  });

  // Load the spectrogram segment
  const { draw: drawSpecWindow } = useSpectrogramWindow({
    recording_id: recording.id,
    window: selected,
    parameters: settings.parameters,
  });

  // Load the previous and next spectrogram segments in the background
  useSpectrogramWindow({
    recording_id: recording.id,
    window: prev,
    parameters: settings.parameters,
  });
  useSpectrogramWindow({
    recording_id: recording.id,
    window: next,
    parameters: settings.parameters,
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
    audioState,
    audioSend,
    draw,
    settings,
  };
}
