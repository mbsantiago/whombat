import {
  adjustWindowToBounds,
  centerWindowOn,
  scaleWindow,
  shiftWindow,
} from "@/utils/windows";
import { useState, useMemo, useCallback } from "react";
import { type Recording } from "@/api/schemas";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
  DEFAULT_SPECTROGRAM_PARAMETERS,
} from "@/api/spectrograms";
import useSpectrogramImage from "@/hooks/spectrogram//useSpectrogramImage";
import drawTimeAxis from "@/draw/timeAxis";
import drawFrequencyAxis from "@/draw/freqAxis";

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
  setParameter: <T extends keyof SpectrogramParameters>(
    key: T,
    value: SpectrogramParameters[T],
  ) => void;
  clearParameter: <T extends keyof SpectrogramParameters>(key: T) => void;
};

/**
 * The `useSpectrogram` hook provides state, controls, and drawing functions
 * for managing and displaying a spectrogram of an audio recording.
 */
export default function useSpectrogram({
  recording,
  bounds,
  initial,
  parameters: initialParameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  onParameterChange,
}: {
  recording: Recording;
  bounds?: SpectrogramWindow;
  initial?: SpectrogramWindow;
  parameters?: SpectrogramParameters;
  onParameterChange?: (parameters: SpectrogramParameters) => void;
}): {
  state: SpectrogramState;
  controls: SpectrogramControls;
  draw: DrawFn;
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

  const controls = useMemo(() => {
    return {
      reset: () => setViewport(initialBounds),
      zoom: (window: SpectrogramWindow) => {
        setViewport(adjustWindowToBounds(window, initialBounds));
      },
      scale: ({ time = 1, freq = 1 }: { time?: number; freq?: number }) => {
        setViewport((prev) =>
          adjustWindowToBounds(
            scaleWindow(prev, { time, freq }),
            initialBounds,
          ),
        );
      },
      shift: ({ time = 0, freq = 0 }: { time?: number; freq?: number }) => {
        setViewport((prev) =>
          adjustWindowToBounds(
            shiftWindow(prev, { time, freq }),
            initialBounds,
          ),
        );
      },
      centerOn: ({ time, freq }: { time?: number; freq?: number }) => {
        setViewport((prev) =>
          adjustWindowToBounds(
            centerWindowOn(prev, { time, freq }),
            initialBounds,
          ),
        );
      },
      setParameter: <T extends keyof SpectrogramParameters>(
        key: T,
        value: SpectrogramParameters[T],
      ) => {
        setParameters((prev: SpectrogramParameters) => {
          const validated = validateParameters(
            { ...prev, [key]: value },
            recording,
          );
          onParameterChange?.(validated);
          return validated;
        });
      },
      clearParameter: <T extends keyof SpectrogramParameters>(key: T) => {
        setParameters((prev: SpectrogramParameters) => {
          const validated = validateParameters(
            { ...prev, [key]: undefined },
            recording,
          );
          onParameterChange?.(validated);
          return validated;
        });
      },
    };
  }, [recording, initialBounds, setParameters, onParameterChange]);

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

  // Compute exported state
  const state = useMemo(() => {
    return {
      bounds: initialBounds,
      parameters,
      viewport,
      isLoading,
      isError,
    };
  }, [parameters, viewport, initialBounds, isLoading, isError]);

  // Create the drawing function
  const draw = useCallback<DrawFn>(
    (ctx) => {
      drawImage(ctx, viewport);
      drawTimeAxis(ctx, viewport.time);
      drawFrequencyAxis(ctx, viewport.freq);
    },
    [drawImage, viewport],
  );

  return {
    state,
    controls,
    draw,
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
