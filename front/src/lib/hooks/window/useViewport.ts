import { useCallback } from "react";
import type { Interval, SpectrogramWindow, Position } from "@/lib/types";
import useLifoQueue from "@/lib/hooks/utils/useLifoQueue";
import {
  adjustWindowToBounds,
  centerWindowOn,
  scaleWindow,
  shiftWindow,
  expandWindow,
  zoomWindowToPosition,
} from "@/lib/utils/windows";

export type ViewportControls = {
  /** Sets the viewport to a new position and dimensions.*/
  set(window: SpectrogramWindow): void;
  /** Sets the time interval of the viewport.*/
  setTimeInterval(interval: Interval): void;
  /** Sets the frequency interval of the viewport.*/
  setFrequencyInterval(interval: Interval): void;
  /** Scales the viewport by the given factors (time and/or frequency).*/
  scale({ time, freq }: { time?: number; freq?: number }): void;
  /** Expands the viewport by the given amounts (time and/or frequency).*/
  expand({ time, freq }: { time?: number; freq?: number }): void;
  /** Shifts the viewport by the given amounts (time and/or frequency).*/
  shift({ time, freq }: { time?: number; freq?: number }): void;
  /** Centers the viewport on the specified time and/or frequency.*/
  centerOn({ time, freq }: { time?: number; freq?: number }): void;
  /** Zooms the viewport to the specified position by some factor.*/
  zoomToPosition({
    position,
    factor,
  }: {
    position: Position;
    factor: number;
  }): void;
  /** Resets the viewport to its initial position and dimensions.*/
  reset(): void;
  /** Saves the current viewport position to the history stack.*/
  save(): void;
  /** Goes back to the previous viewport position in the history stack.*/
  back(): void;
};

/**
 * Represents the state and functionality of a viewport within a spectrogram
 * display.
 */
export type ViewportController = ViewportControls & {
  /** The current position and dimensions of the viewport. */
  viewport: SpectrogramWindow;
  /** The maximum allowable boundaries for the viewport. */
  bounds: SpectrogramWindow;
};

/**
 * A React hook that provides functionality for managing a viewport (window)
 * within a spectrogram display.
 */
export default function useViewport({
  initial,
  bounds,
  onChange,
  onSave,
  onBack,
  onReset,
}: {
  /** The initial position and dimensions of the viewport. */
  initial: SpectrogramWindow;
  /** The maximum allowable boundaries for the viewport.*/
  bounds: SpectrogramWindow;
  /** A callback function that is called whenever the viewport changes.*/
  onChange?(viewport: SpectrogramWindow): void;
  /** A callback function that is called whenever the viewport is saved.*/
  onSave?(): void;
  /** A callback function that is called whenever the viewport is reset.*/
  onReset?(): void;
  /** A callback function that is called whenever the viewport goes back.*/
  onBack?(): void;
}): ViewportController {
  const { current, replace, clear, push, pop, size } =
    useLifoQueue<SpectrogramWindow>(initial);

  const set = useCallback(
    (window: SpectrogramWindow) => {
      const adjusted = adjustWindowToBounds(window, bounds);
      replace(adjusted);
      onChange?.(adjusted);
    },
    [bounds, replace, onChange],
  );

  const setTimeInterval = useCallback(
    (interval: Interval) => {
      replace((prev) =>
        adjustWindowToBounds({ ...prev, time: interval }, bounds),
      );
    },
    [bounds, replace],
  );

  const setFrequencyInterval = useCallback(
    (interval: Interval) => {
      replace((prev) =>
        adjustWindowToBounds({ ...prev, freq: interval }, bounds),
      );
    },
    [bounds, replace],
  );

  const scale = useCallback(
    ({ time = 1, freq = 1 }: { time?: number; freq?: number }) => {
      replace((prev) =>
        adjustWindowToBounds(scaleWindow(prev, { time, freq }), bounds),
      );
    },
    [replace, bounds],
  );

  const expand = useCallback(
    ({ time = 0, freq = 0 }: { time?: number; freq?: number }) => {
      replace((prev) =>
        adjustWindowToBounds(expandWindow(prev, { time, freq }), bounds),
      );
    },
    [replace, bounds],
  );

  const shift = useCallback(
    ({ time = 0, freq = 0 }: { time?: number; freq?: number }) => {
      replace((prev) =>
        adjustWindowToBounds(shiftWindow(prev, { time, freq }, false), bounds),
      );
    },
    [replace, bounds],
  );

  const centerOn = useCallback(
    ({ time, freq }: { time?: number; freq?: number }) => {
      replace((prev) =>
        adjustWindowToBounds(centerWindowOn(prev, { time, freq }), bounds),
      );
    },
    [replace, bounds],
  );

  const reset = useCallback(() => {
    clear();
    push(initial);
    onReset?.();
  }, [initial, clear, push, onReset]);

  const back = useCallback(() => {
    if (size > 1) {
      pop();
      onBack?.();
    }
  }, [pop, size, onBack]);

  const zoomToPosition = useCallback(
    ({ position, factor }: { position: Position; factor: number }) => {
      replace((prev) =>
        adjustWindowToBounds(
          zoomWindowToPosition(prev, position, factor),
          bounds,
        ),
      );
    },
    [replace, bounds],
  );

  const save = useCallback(() => {
    if (current != null) {
      push(current);
      onSave?.();
    }
  }, [push, current, onSave]);

  return {
    viewport: current ?? initial,
    bounds,
    set,
    setTimeInterval,
    setFrequencyInterval,
    scale,
    shift,
    expand,
    centerOn,
    zoomToPosition,
    reset,
    back,
    save,
  };
}
