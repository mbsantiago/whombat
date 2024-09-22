import { act, renderHook } from "@testing-library/react";

import type { SpectrogramSettings } from "@/lib/types";

import useSpectrogramSettings from "./useSpectrogramSettings";

describe("useSpectrogramSettings Hook", () => {
  const initialSettings: SpectrogramSettings = {
    window_size: 512,
    overlap: 0.5,
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
      useSpectrogramSettings({ initialSettings }),
    );
    expect(result.current.settings).toEqual(initialSettings);
  });

  it("updates settings", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    act(() => {
      result.current.dispatch({ type: "setWindowSize", windowSize: 1024 });
      result.current.dispatch({ type: "setOverlap", overlap: 0.25 });
      result.current.dispatch({ type: "setScale", scale: "power" });
      result.current.dispatch({ type: "setWindow", window: "hamming" });
      result.current.dispatch({ type: "setDBRange", min: -60, max: 10 });
      result.current.dispatch({ type: "setColormap", colormap: "magma" });
      result.current.dispatch({ type: "togglePCEN" });
      result.current.dispatch({ type: "toggleNormalize" });
    });

    expect(result.current.settings).toEqual({
      window_size: 1024,
      overlap: 0.25,
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

  it("Errors on negative window size", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    expect(() =>
      act(() =>
        result.current.dispatch({ type: "setWindowSize", windowSize: -1 }),
      ),
    ).toThrow("Window size must be greater than 0");
  });

  it("Errors on non 0-1 overlap", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    expect(() =>
      act(() => result.current.dispatch({ type: "setOverlap", overlap: 1.5 })),
    ).toThrow("Overlap must be between 0 and 1");
  });

  it("Errors on invalid scale", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    expect(() =>
      act(() =>
        // @ts-ignore
        result.current.dispatch({ type: "setScale", scale: "invalid" }),
      ),
    ).toThrow("Invalid spectrogram scale, must be one of amplitude, power, dB");
  });

  it("Errors on invalid window", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    expect(() =>
      act(() =>
        // @ts-ignore
        result.current.dispatch({ type: "setWindow", window: "invalid" }),
      ),
    ).toThrow("Invalid window type, must be one of ");
  });

  it("Errors on invalid DB range", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    expect(() =>
      act(() =>
        result.current.dispatch({ type: "setDBRange", min: 5, max: -5 }),
      ),
    ).toThrow("Minimum dB must be less than maximum dB");
  });

  it("Errors on invalid colormap", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    expect(() =>
      act(() =>
        // @ts-ignore
        result.current.dispatch({ type: "setColormap", colormap: "invalid" }),
      ),
    ).toThrow("Invalid colormap, must be one of ");
  });

  it("Can reset settings", () => {
    const { result } = renderHook(() =>
      useSpectrogramSettings({ initialSettings }),
    );

    // Change settings first
    act(() => {
      result.current.dispatch({ type: "setWindowSize", windowSize: 2048 });
    });

    expect(result.current.settings.window_size).toBe(2048);

    act(() => {
      result.current.dispatch({ type: "reset" });
    });

    expect(result.current.settings).toEqual(initialSettings);
  });
});
