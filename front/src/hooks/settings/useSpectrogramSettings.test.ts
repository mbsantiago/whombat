import { renderHook, act } from "@testing-library/react";
import useSpectrogramSettings from "./useSpectrogramSettings";
import type { SpectrogramSettings } from "@/types";

describe("useSpectrogramSettings Hook", () => {
  const initialSettings: SpectrogramSettings = {
    window_size: 512,
    hop_size: 0.5,
    scale: "dB",
    window: "hann",
    min_dB: -80,
    max_dB: 0,
    cmap: "viridis",
    pcen: false,
    normalize: false,
    clamp: true,
  };

  it("initializes with the correct initial settings", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings, onChange: jest.fn() }),
    );
    expect(result.current.settings).toEqual(initialSettings);
  });

  it("updates settings and calls onChange", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings, onChange }),
    );

    act(() => {
      result.current.setWindowSize(1024);
      result.current.setOverlap(0.25);
      result.current.setScale("power");
      result.current.setWindow("hamming");
      result.current.setDBRange({ min: -60, max: 10 });
      result.current.setColormap("magma");
      result.current.togglePCEN();
      result.current.toggleNormalize();
    });

    expect(onChange).toHaveBeenCalledTimes(8);
    expect(result.current.settings).toEqual({
      window_size: 1024,
      hop_size: 0.25,
      scale: "power",
      window: "hamming",
      min_dB: -60,
      max_dB: 10,
      cmap: "magma",
      pcen: true,
      normalize: true,
      clamp: true,
    });
  });

  it("calls onError when invalid settings are provided", () => {
    const onError = jest.fn();
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings, onError }),
    );

    act(() => {
      result.current.setWindowSize(-1);
      result.current.setOverlap(1.5);
      result.current.setScale("invalid" as any);
      result.current.setWindow("invalid" as any);
      result.current.setDBRange({ min: 5, max: -5 });
      result.current.setColormap("invalid" as any);
    });

    expect(onError).toHaveBeenCalledTimes(6);
  });

  it("resets settings and calls onReset", () => {
    const onReset = jest.fn();
    const onChange = jest.fn();

    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings, onChange, onReset }),
    );

    // Change settings first
    act(() => {
      result.current.setWindowSize(2048);
    });

    expect(onChange).toHaveBeenLastCalledWith({
      ...initialSettings,
      window_size: 2048,
    });
    expect(result.current.settings.window_size).toBe(2048);

    act(() => {
      result.current.reset();
    });

    expect(onReset).toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith(initialSettings);
    expect(result.current.settings).toEqual(initialSettings);
  });
});
