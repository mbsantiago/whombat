import { useCallback, useMemo, useState } from "react";

type PresetInterface<T> = {
  /** An object containing all stored presets, where keys are preset names and
   * values are the preset data. */
  presets: { [key: string]: T };
  /** The name of the currently selected preset, or null if no preset is
   * selected. */
  selectedName: string | null;
  /** The data of the currently selected preset, or null if no preset is
   * selected. */
  selectedPreset: T | null;
  /** The total number of presets stored. */
  size: number;
  /** Loads a preset by name, updating the `selectedName` and `selectedPreset`
   * state, and calls the optional `onLoad` callback. Returns the preset data
   * if found, or null otherwise. */
  load: (name: string) => T | null;
  /** Saves a new preset or overwrites an existing one. Updates the
   * `selectedName` and `selectedPreset` state, and calls the optional `onSave`
   * callback. If the preset already exists, it will be overwritten.
   */
  save: (name: string, preset: T) => void;
  /** Deletes a preset by name. Updates the `selectedName` state if the deleted
   * preset was selected, and calls the optional `onDelete` callback. */
  delete: (name: string) => void;
  /** Checks if a preset with the given name exists. */
  hasPreset: (name: string) => boolean;
  /** Returns an array of all preset names. */
  getNames: () => string[];
};

/**
 * A React hook that provides functionality to manage and interact with a
 * collection of presets. Presets can be loaded, saved, deleted, and checked
 * for existence.
 */
export default function usePresets<T>({
  presets: initialPresets = {},
  onSave,
  onLoad,
  onDelete,
}: {
  /** An optional initial set of presets. */
  presets?: { [key: string]: T };
  /** A callback function called when a preset is saved. */
  onSave?: (args: { name: string; preset: T }) => void;
  /** A callback function called when a preset is loaded. */
  onLoad?: (args: { name: string; preset: T }) => void;
  /** A callback function called when a preset is deleted. */
  onDelete?: (args: { name: string; preset: T }) => void;
}): PresetInterface<T> {
  const [presets, setPresets] = useState(initialPresets);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  const load = useCallback(
    (name: string) => {
      const preset = presets[name];

      if (preset) {
        setSelectedName(name);
        onLoad?.({ name, preset });
        return preset;
      }

      return null;
    },
    [presets, onLoad],
  );

  const save = useCallback(
    (name: string, preset: T) => {
      setPresets((prev) => {
        const next = { ...prev, [name]: preset };
        setSelectedName(name);
        onSave?.({ name, preset });
        return next;
      });
    },
    [onSave],
  );

  const deletePreset = useCallback(
    (name: string) => {
      setPresets((prev) => {
        const { [name]: preset, ...next } = prev;
        onDelete?.({ name, preset });
        if (name === selectedName) {
          setSelectedName(null);
        }
        return next;
      });
    },
    [onDelete, selectedName],
  );

  const hasPreset = useCallback(
    (name: string) => presets[name] != null,
    [presets],
  );

  const getNames = useCallback(() => Object.keys(presets), [presets]);

  const size = useMemo(() => Object.keys(presets).length, [presets]);
  const selectedPreset = useMemo(() => {
    if (selectedName == null) return null;
    return presets[selectedName] || null;
  }, [presets, selectedName]);

  return {
    presets,
    selectedName,
    selectedPreset,
    size,
    load,
    save,
    delete: deletePreset,
    hasPreset,
    getNames,
  };
}
