import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import drawFrequencyAxis from "@/draw/freqAxis";
import drawTimeAxis from "@/draw/timeAxis";
import useSpectrogramImage from "@/hooks/spectrogram//useSpectrogramImage";
import useSpectrogramMotions from "@/hooks/spectrogram/useSpectrogramMotions";
import useSpectrogramKeyShortcuts from "@/hooks/spectrogram/useSpectrogramKeyShortcuts";
import {
  getInitialViewingWindow,
  adjustWindowToBounds,
  centerWindowOn,
  scaleWindow,
  shiftWindow,
} from "@/utils/windows";

import type { MotionMode } from "@/hooks/spectrogram/useSpectrogramMotions";
import type {
  Position,
  Recording,
  SpectrogramParameters,
  SpectrogramWindow,
} from "@/types";

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
  scale: ({ time , freq }: { time?: number; freq?: number }) => void;
  shift({ time , freq }: { time?: number; freq?: number }): void;
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
  onDoubleClick,
  enabled = true,
  withShortcuts = true,
}: {
  recording: Recording;
  dimensions: { width: number; height: number };
  bounds?: SpectrogramWindow;
  initial?: SpectrogramWindow;
  parameters?: SpectrogramParameters;
  onParameterChange?: (parameters: SpectrogramParameters) => void;
  onModeChange?: (mode: MotionMode) => void;
  onDoubleClick?: (dblClickProps: { position: Position }) => void;
  enabled?: boolean;
  withShortcuts?: boolean;
}): {
  draw: DrawFn;
  props: React.HTMLAttributes<HTMLCanvasElement>;
} & SpectrogramState &
  SpectrogramControls {
  const initialBounds = useMemo<SpectrogramWindow>(() => {
    return (
      bounds ?? {
        time: { min: 0, max: recording.duration },
        freq: { min: 0, max: recording.samplerate / 2 },
      }
    );
  }, [bounds, recording]);

  const initialViewport = useMemo<SpectrogramWindow>(() => {
    return initial ?? getInitialViewingWindow({ 
      startTime: initialBounds.time.min,
      endTime: initialBounds.time.max,
      samplerate: recording.samplerate,
      parameters: initialParameters,
    });
  }, [initial, initialBounds, recording, initialParameters]);

  const [parameters, setParameters] = useState<SpectrogramParameters>(
    validateParameters(initialParameters, recording),
  );
  const [viewport, setViewport] = useState<SpectrogramWindow>(
    initialViewport,
  );

  // NOTE: Need to update the viewport if the initial viewport
  // changes. This usually happens when the visualised clip
  // changes.
  useEffect(() => {
    if (initial != null) {
      setViewport(initial);
    }
  }, [initial]);

  const {
    draw: drawImage,
    isLoading,
    isError,
  } = useSpectrogramImage({
    recording,
    window: viewport,
    parameters,
  });

  const handleZoom = useCallback(
    (window: SpectrogramWindow) => {
      setViewport(adjustWindowToBounds(window, initialBounds));
    },
    [initialBounds],
  );

  const handleScale = useCallback(
    ({ time = 1, freq = 1 }: { time?: number; freq?: number }) => {
      setViewport((prev) =>
        adjustWindowToBounds(scaleWindow(prev, { time, freq }), initialBounds),
      );
    },
    [initialBounds],
  );

  const handleShift = useCallback(
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

  const handleReset = useCallback(() => {
    setViewport(initialViewport);
  }, [initialViewport]);

  const handleCenterOn = useCallback(
    ({ time, freq }: { time?: number; freq?: number }) => {
      setViewport((prev) =>
        adjustWindowToBounds(
          centerWindowOn(prev, { time, freq }),
          initialBounds,
        ),
      );
    },
    [initialBounds],
  );

  const handleSetParameters = useCallback(
    (parameters: SpectrogramParameters) => {
      const validated = validateParameters(parameters, recording);
      onParameterChange?.(validated);
      setParameters(validated);
    },
    [recording, onParameterChange],
  );

  const handleResetParameters = useCallback(() => {
    setParameters(validateParameters(initialParameters, recording));
  }, [initialParameters, recording]);

  const {
    props,
    draw: drawMotions,
    canDrag,
    canZoom,
    enableDrag,
    enableZoom,
    disable,
  } = useSpectrogramMotions({
    viewport,
    onDrag: handleZoom,
    onZoom: handleZoom,
    onScrollMoveTime: handleShift,
    onScrollMoveFreq: handleShift,
    onScrollZoomTime: handleScale,
    onScrollZoomFreq: handleScale,
    onDoubleClick,
    onModeChange,
    dimensions,
    enabled,
  });

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

  useSpectrogramKeyShortcuts({
    onGoMove: enableDrag,
    onGoZoom: enableZoom,
    enabled: withShortcuts,
  })

  return {
    bounds: initialBounds,
    parameters,
    viewport,
    isLoading,
    isError,
    canDrag,
    canZoom,
    draw,
    props,
    reset: handleReset,
    zoom: handleZoom,
    scale: handleScale,
    shift: handleShift,
    centerOn: handleCenterOn,
    setParameters: handleSetParameters,
    resetParameters: handleResetParameters,
    enableDrag,
    enableZoom,
    disable,
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
