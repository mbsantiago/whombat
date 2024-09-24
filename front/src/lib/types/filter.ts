import { z } from "zod";

import * as schemas from "@/lib/schemas";

/**
 * Represents a generic filter state object with various utility functions.
 */
export type Filter<T extends Object> = {
  /** The current filter state. */
  filter: T;
  /**
   * Sets the value for a specific key in the filter state.
   * @param key - The key to set.
   * @param value - The value to set for the key.
   * @param force - If true, sets the value even if the key is fixed.
   */
  set: <K extends keyof T>(key: K, value: T[K], force?: boolean) => void;
  /**
   * Updates the filter state with a partial object.
   * @param value - The partial object to update the filter state with.
   * */
  update: (value: Partial<T>) => void;
  /**
   * Gets the value for a specific key in the filter state.
   * @param key - The key to get.
   * @returns The value for the specified key.
   */
  get: <K extends keyof T>(key: K) => T[K];
  /**
   * Clears the value for a specific key in the filter state.
   * @param key - The key to clear.
   * @param force - If true, clears the value even if the key is fixed.
   */
  clear: <K extends keyof T>(key: K, force?: boolean) => void;
  /** Resets the filter state to its default and fixed values. */
  reset: () => void;
  /** Submits the current filter state.
   * This is particularly useful when the filter state is debounced.
   */
  submit: () => void;
  /**
   * Checks if a specific key in the filter state is fixed.
   * @param key - The key to check.
   * @returns True if the key is fixed, false otherwise.
   */
  isFixed: <K extends keyof T>(key: K) => boolean;
  fixed: (keyof T)[];
  /** The count of non-fixed keys in the filter state. */
  size: number;
};

export type DateFilter = z.input<typeof schemas.DateFilterSchema>;

export type TimeFilter = z.input<typeof schemas.TimeFilterSchema>;

export type NumberFilter = z.input<typeof schemas.NumberFilterSchema>;

export type StringFilter = z.input<typeof schemas.StringFilterSchema>;

export type PredictedTagFilter = z.input<
  typeof schemas.PredictedTagFilterSchema
>;

export type IntegerFilter = z.input<typeof schemas.IntegerFilterSchema>;
