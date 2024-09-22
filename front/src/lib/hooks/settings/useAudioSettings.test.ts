import { act, renderHook } from "@testing-library/react";

import type { AudioSettings } from "@/lib/types";

import useAudioSettings from "./useAudioSettings";

describe("useAudioSettings Hook", () => {
  const initialSettings: AudioSettings = {
    speed: 1.0,
    resample: false,
    samplerate: 44100,
    filter_order: 4,
    channel: 2,
  };

  it("initializes with the correct initial settings", () => {
    const { result } = renderHook(() => useAudioSettings({ initialSettings }));
    expect(result.current.settings).toEqual(initialSettings);
  });

  it("updates settings using the provided functions", () => {
    const { result } = renderHook(() =>
      useAudioSettings({
        initialSettings,
      }),
    );

    const { dispatch } = result.current;

    act(() => {
      dispatch({ type: "setSpeed", speed: 1.5 });
      dispatch({ type: "toggleResample" });
      dispatch({ type: "setSamplerate", samplerate: 48000 });
      dispatch({
        type: "setFilter",
        filter: { lowFreq: 100, highFreq: 5000 },
      });
      dispatch({ type: "setChannel", channel: 1 });
    });

    expect(result.current.settings).toEqual({
      speed: 1.5,
      resample: true,
      samplerate: 48000,
      low_freq: 100,
      high_freq: 5000,
      filter_order: 4,
      channel: 1,
    });
  });

  it("resets settings to their initial values", () => {
    const { result } = renderHook(() =>
      useAudioSettings({
        initialSettings,
      }),
    );

    const { dispatch } = result.current;

    act(() => {
      dispatch({ type: "setSpeed", speed: 1.5 });
    });

    expect(result.current.settings).not.toEqual(initialSettings);

    act(() => {
      dispatch({ type: "reset" });
    });

    expect(result.current.settings).toEqual(initialSettings);
  });
});
