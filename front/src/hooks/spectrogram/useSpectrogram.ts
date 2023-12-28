import { useCallback, useMemo, useState } from "react";

import { type Recording } from "@/api/schemas";
import {
  DEFAULT_SPECTROGRAM_PARAMETERS,
  type SpectrogramParameters,
  type SpectrogramWindow,
} from "@/api/spectrograms";
import drawFrequencyAxis from "@/draw/freqAxis";
import drawTimeAxis from "@/draw/timeAxis";
import useSpectrogramImage from "@/hooks/spectrogram//useSpectrogramImage";
import useSpectrogramMotions from "@/hooks/spectrogram/useSpectrogramMotions";
import {
  adjustWindowToBounds,
  centerWindowOn,
  scaleWindow,
  shiftWindow,
} from "@/utils/windows";

/**
 * A function type representing the drawing function for a spectrogram.
 */
export type DrawFn = (ctx: CanvasRenderingContext2D) => void;

/**
 * Represents the state of a spectrogram, including parameters, bounds, and
 * viewport.
 */
export type SpectrogramState = {
  parameters: SpectrogramParameters;
  bounds: SpectrogramWindow;
  viewport: SpectrogramWindow;
  isLoading: boolean;
  isError: boolean;
  canDrag: boolean;
  canZoom: boolean;
};

/**
 * A set of controls for manipulating and interacting with a spectrogram.
 */
export type SpectrogramControls = {
  reset: () => void;
  zoom: (window: SpectrogramWindow) => void;
  scale: ({ time = 1, freq = 1 }: { time?: number; freq?: number }) => void;
  shift({ time = 0, freq = 0 }: { time?: number; freq?: number }): void;
  centerOn: ({ time, freq }: { time?: number; freq?: number }) => void;
  setParameters: (parameters: SpectrogramParameters) => void;
  resetParameters: () => void;
  enableDrag: () => void;
  enableZoom: () => void;
  disable: () => void;
};

/**
 * The `useSpectrogram` hook provides state, controls, and drawing functions
 * for managing and displaying a spectrogram of an audio recording.
 */
export default function useSpectrogram({
  recording,
  bounds,
  initial,
  dimensions,
  parameters: initialParameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  onParameterChange,
  onModeChange,
  enabled = true,
}: {
  recording: Recording;
  dimensions: { width: number; height: number };
  bounds?: SpectrogramWindow;
  initial?: SpectrogramWindow;
  parameters?: SpectrogramParameters;
  onParameterChange?: (parameters: SpectrogramParameters) => void;
  onModeChange?: (mode: "drag" | "zoom" | "idle") => void;
  enabled?: boolean;
}): {
  state: SpectrogramState;
  controls: SpectrogramControls;
  draw: DrawFn;
  props: React.HTMLAttributes<HTMLCanvasElement>;
} {
  const initialBounds = useMemo<SpectrogramWindow>(() => {
    return (
      bounds ?? {
        time: { min: 0, max: recording.duration },
        freq: { min: 0, max: recording.samplerate / 2 },
      }
    );
  }, [bounds, recording]);

  const [parameters, setParameters] = useState<SpectrogramParameters>(
    validateParameters(initialParameters, recording),
  );
  const [viewport, setViewport] = useState<SpectrogramWindow>(
    initial ?? initialBounds,
  );

  const zoom = useCallback(
    (window: SpectrogramWindow) => {
      setViewport(adjustWindowToBounds(window, initialBounds));
    },
    [initialBounds],
  );

  const scale = useCallback(
    ({ time = 1, freq = 1 }: { time?: number; freq?: number }) => {
      setViewport((prev) =>
        adjustWindowToBounds(scaleWindow(prev, { time, freq }), initialBounds),
      );
    },
    [initialBounds],
  );

  const shift = useCallback(
    ({ time = 0, freq = 0 }: { time?: number; freq?: number }) => {
      setViewport((prev) =>
        adjustWindowToBounds(
          shiftWindow(prev, { time, freq }, false),
          initialBounds,
        ),
      );
    },
    [initialBounds],
  );

  // Drawing functions
  const {
    draw: drawImage,
    isLoading,
    isError,
  } = useSpectrogramImage({
    recording,
    window: viewport,
    parameters,
  });

  const {
    props,
    draw: drawMotions,
    state: { canDrag, canZoom },
    controls: { enableDrag, enableZoom, disable },
  } = useSpectrogramMotions({
    viewport,
    onDrag: (viewport) => zoom(viewport),
    onZoom: (_, viewport) => zoom(viewport),
    onScrollMoveTime: (time) => shift({ time }),
    onScrollMoveFreq: (freq) => shift({ freq }),
    onScrollZoomTime: (time) => scale({ time }),
    onScrollZoomFreq: (freq) => scale({ freq }),
    onModeChange,
    dimensions,
    enabled,
  });

  const controls = useMemo(() => {
    return {
      reset: () => setViewport(initialBounds),
      zoom,
      scale,
      shift,
      centerOn: ({ time, freq }: { time?: number; freq?: number }) => {
        setViewport((prev) =>
          adjustWindowToBounds(
            centerWindowOn(prev, { time, freq }),
            initialBounds,
          ),
        );
      },
      setParameters: (parameters: SpectrogramParameters) => {
        const validated = validateParameters(parameters, recording);
        onParameterChange?.(validated);
        setParameters(validated);
      },
      resetParameters: () => {
        setParameters(validateParameters(initialParameters, recording));
      },
      enableDrag,
      enableZoom,
      disable,
    };
  }, [
    recording,
    initialBounds,
    initialParameters,
    setParameters,
    onParameterChange,
    zoom,
    scale,
    shift,
    enableDrag,
    enableZoom,
    disable,
  ]);

  // Compute exported state
  const state = useMemo(() => {
    return {
      bounds: initialBounds,
      parameters,
      viewport,
      isLoading,
      isError,
      canDrag,
      canZoom,
    };
  }, [
    parameters,
    viewport,
    initialBounds,
    isLoading,
    isError,
    canDrag,
    canZoom,
  ]);

  // Create the drawing function
  const draw = useCallback<DrawFn>(
    (ctx) => {
      if (canDrag) {
        ctx.canvas.style.cursor = "grab";
      } else if (canZoom) {
        ctx.canvas.style.cursor = "zoom-in";
      } else {
        ctx.canvas.style.cursor = "default";
      }
      drawImage(ctx, viewport);
      drawTimeAxis(ctx, viewport.time);
      drawFrequencyAxis(ctx, viewport.freq);
      drawMotions(ctx);
    },
    [drawImage, drawMotions, viewport, canDrag, canZoom],
  );

  return {
    state,
    controls,
    draw,
    props,
  };
}

function validateParameters(
  parameters: SpectrogramParameters,
  recording: Recording,
): SpectrogramParameters {
  const constrained: Partial<SpectrogramParameters> = {};

  // We need to constrain the maximum filtered, otherwise filtering
  // will fail
  if (parameters.high_freq != null) {
    // Use the samplerate of the recording, or the target sampling rate
    // if resampling is enabled.
    const samplerate = parameters.resample
      ? parameters.samplerate ?? recording.samplerate
      : recording.samplerate;

    // The maximum frequency is half the sampling rate, minus a bit
    // to avoid aliasing.
    const maxValue = Math.round((samplerate / 2) * 0.95);
    constrained.high_freq = Math.min(parameters.high_freq, maxValue);

    // Check that the low frequency is not higher than the high frequency.
    if (parameters.low_freq != null) {
      constrained.low_freq = Math.min(
        parameters.low_freq,
        parameters.high_freq - 1,
      );
    }
  }

  return { ...parameters, ...constrained };
}
