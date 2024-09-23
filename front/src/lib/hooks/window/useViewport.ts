import { useCallback } from "react";

import useLifoQueue from "@/lib/hooks/utils/useLifoQueue";

import type {
  Interval,
  Position,
  SpectrogramWindow,
  ViewportController,
} from "@/lib/types";
import {
  adjustWindowToBounds,
  centerWindowOn,
  expandWindow,
  scaleWindow,
  shiftWindow,
  zoomWindowToPosition,
} from "@/lib/utils/windows";

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
