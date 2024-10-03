import { act, renderHook } from "@testing-library/react";

import usePresets from "./usePresets";

describe("usePresets Hook", () => {
  const initialPresets = {
    preset1: { value: 10 },
    preset2: { value: 20 },
  };

  it("initializes with correct values", () => {
    const { result } = renderHook(() =>
      usePresets({ presets: initialPresets }),
    );

    expect(result.current.presets).toEqual(initialPresets);
    expect(result.current.selectedName).toBeNull();
    expect(result.current.selectedPreset).toBeNull();
    expect(result.current.size).toBe(2);
    expect(result.current.getNames()).toEqual(["preset1", "preset2"]);
  });

  it("loads a preset", () => {
    const { result } = renderHook(() =>
      usePresets({ presets: initialPresets }),
    );

    act(() => {
      result.current.load("preset2");
    });

    expect(result.current.selectedName).toBe("preset2");
    expect(result.current.selectedPreset).toEqual(initialPresets.preset2);
  });

  it("returns null when loading a non-existent preset", () => {
    const { result } = renderHook(() =>
      usePresets({ presets: initialPresets }),
    );

    act(() => {
      result.current.load("nonExistentPreset");
    });

    expect(result.current.selectedName).toBeNull();
    expect(result.current.selectedPreset).toBeNull();
  });

  it("saves a new preset", () => {
    const onSaveMock = jest.fn();
    const { result } = renderHook(() => usePresets({ onSave: onSaveMock }));

    const newPreset = { value: 30 };
    act(() => {
      result.current.save("preset3", newPreset);
    });

    expect(result.current.presets).toHaveProperty("preset3", newPreset);
    expect(result.current.selectedName).toBe("preset3");
    expect(result.current.selectedPreset).toEqual(newPreset);
    expect(onSaveMock).toHaveBeenCalledWith({
      name: "preset3",
      preset: newPreset,
    });
  });

  it("overwrites an existing preset", () => {
    const onSaveMock = jest.fn();
    const { result } = renderHook(() =>
      usePresets({ presets: initialPresets, onSave: onSaveMock }),
    );

    const updatedPreset = { value: 100 };
    act(() => {
      result.current.save("preset1", updatedPreset);
    });

    expect(result.current.presets.preset1).toEqual(updatedPreset);
    expect(onSaveMock).toHaveBeenCalledWith({
      name: "preset1",
      preset: updatedPreset,
    });
  });

  it("deletes a preset", () => {
    const onDeleteMock = jest.fn();
    const { result } = renderHook(() =>
      usePresets({ presets: initialPresets, onDelete: onDeleteMock }),
    );

    act(() => {
      result.current.delete("preset1");
    });

    expect(result.current.presets).not.toHaveProperty("preset1");
    expect(result.current.size).toBe(1);
    expect(onDeleteMock).toHaveBeenCalledWith({
      name: "preset1",
      preset: initialPresets.preset1,
    });
  });

  it("clears selected preset when deleting it", () => {
    const { result } = renderHook(() =>
      usePresets({ presets: initialPresets }),
    );

    // Load a preset to make it the selected one
    act(() => {
      result.current.load("preset1");
    });

    expect(result.current.selectedName).toBe("preset1");

    act(() => {
      result.current.delete("preset1");
    });

    expect(result.current.selectedName).toBeNull();
    expect(result.current.selectedPreset).toBeNull();
  });
});
