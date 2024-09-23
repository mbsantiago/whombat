import { z } from "zod";

import * as schemas from "@/lib/schemas";

export type Position = {
  time: number;
  freq: number;
};

export type Interval = z.infer<typeof schemas.IntervalSchema>;

/** A chunk of the spectrogram. */
export type Chunk = {
  /** The interval of the chunk in seconds. */
  interval: Interval;
  /** A buffered interval for the chunk. */
  buffer: Interval;
};

export type SpectrogramWindow = z.infer<typeof schemas.SpectrogramWindowSchema>;

/**
 * Represents the state and functionality of a viewport within a spectrogram
 * display.
 */
export type ViewportController = {
  /** The current position and dimensions of the viewport. */
  viewport: SpectrogramWindow;
  /** The maximum allowable boundaries for the viewport. */
  bounds: SpectrogramWindow;
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
