import { renderHook, act } from "@testing-library/react";
import useAudioSettings from "./useAudioSettings";
import type { AudioSettings } from "@/types";

describe("useAudioSettings Hook", () => {
  const initialSettings: AudioSettings = {
    speed: 1.0,
    resample: false,
    samplerate: 44100,
    filter_order: 4,
    channel: 2,
  };

  it("initializes with the correct initial settings", () => {
    const { result } = renderHook(() =>
      useAudioSettings({ initialSettings, onSettingsChange: jest.fn() }),
    );
    expect(result.current.settings).toEqual(initialSettings);
  });

  it("updates settings using the provided functions", () => {
    const onSettingsChangeMock = jest.fn();
    const { result } = renderHook(() =>
      useAudioSettings({
        initialSettings,
        onSettingsChange: onSettingsChangeMock,
      }),
    );

    const { setSpeed, toggleResample, setSamplerate, setFilter, setChannel } =
      result.current;

    act(() => {
      setSpeed(1.5);
      toggleResample();
      setSamplerate(48000);
      setFilter({ lowFreq: 100, highFreq: 5000 });
      setChannel(1);
    });

    expect(onSettingsChangeMock).toHaveBeenCalledTimes(5);
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
    const onResetMock = jest.fn();
    const { result } = renderHook(() =>
      useAudioSettings({
        initialSettings,
        onSettingsChange: jest.fn(),
        onReset: onResetMock,
      }),
    );

    const { reset } = result.current;

    act(() => {
      reset();
    });

    expect(result.current.settings).toEqual(initialSettings);
    expect(onResetMock).toHaveBeenCalled();
  });
});
