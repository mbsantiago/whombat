import { act, renderHook } from "@testing-library/react";

import type {
  SpectrogramWindow,
  Recording,
  AudioSettings,
  SpectrogramSettings,
} from "@/types";
import useRecordingSpectrogram from "./useRecordingSpectrogram";
import drawImg from "@/draw/image";
import {
  getWindowDuration,
  getWindowCenter,
} from "@/utils/spectrogram_segments";

jest.mock("@/utils/spectrogram_segments", () => ({
  getWindowDuration: jest.fn(),
  getWindowCenter: jest.fn(),
}));

jest.mock("@/draw/image", () => jest.fn());

describe("useRecordingSpectrogram hook", () => {
  // Sample data for testing
  const recording: Recording = {
    path: "test-path",
    samplerate: 44100,
    duration: 10,
    channels: 1,
    time_expansion: 1,
    created_on: new Date(),
    uuid: "test-uuid",
    hash: "test-hash",
  };
  const audioSettings: AudioSettings = {
    resample: false,
    samplerate: 44100,
    channel: 0,
    speed: 1,
    filter_order: 4,
  };
  const spectrogramSettings: SpectrogramSettings = {
    window_size: 512,
    hop_size: 256,
    window: "hann",
    pcen: false,
    min_dB: -80,
    max_dB: 0,
    scale: "dB",
    clamp: false,
    normalize: false,
    cmap: "viridis",
  };
  const viewport: SpectrogramWindow = {
    time: { min: 0, max: 10 },
    freq: { min: 0, max: 22050 },
  };

  // Mocked functions
  const getImageUrl = jest.fn().mockReturnValue("test-url");

  beforeEach(() => {
    jest.useFakeTimers(); // Enable fake timers
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    jest.clearAllTimers();
  });

  test("calculates duration and center correctly", () => {
    (getWindowDuration as jest.Mock).mockReturnValue(2);
    (getWindowCenter as jest.Mock).mockReturnValue(5);

    const { result } = renderHook(() =>
      useRecordingSpectrogram({
        recording,
        audioSettings,
        spectrogramSettings,
        viewport,
        getImageUrl,
      }),
    );

    expect(getWindowDuration).toHaveBeenCalledWith(
      viewport,
      recording.samplerate,
      spectrogramSettings.window_size,
      spectrogramSettings.hop_size,
    );
    expect(getWindowCenter).toHaveBeenCalledWith(viewport, 2);
    expect(result.current.interval).toEqual({ min: 4, max: 6 });
  });

  test("generates the correct image URL", () => {
    const { result } = renderHook(() =>
      useRecordingSpectrogram({
        recording,
        audioSettings,
        spectrogramSettings,
        viewport,
        getImageUrl,
      }),
    );

    expect(getImageUrl).toHaveBeenCalledWith({
      recording,
      interval: result.current.interval,
      audioSettings,
      spectrogramSettings,
    });
  });

  test("calls drawImg with correct parameters on image load", async () => {
    const { result } = renderHook(() =>
      useRecordingSpectrogram({
        recording,
        audioSettings,
        spectrogramSettings,
        viewport,
        getImageUrl,
      }),
    );

    act(() => {
      result.current.image.current!.dispatchEvent(new Event("load"));
    });

    act(() => {
      result.current.drawFn({} as CanvasRenderingContext2D, viewport);
    });

    expect(drawImg).toHaveBeenCalledWith({
      ctx: {} as CanvasRenderingContext2D,
      image: result.current.image.current,
      window: viewport,
      bounds: {
        time: result.current.interval,
        freq: { min: 0, max: recording.samplerate / 2 },
      },
    });
  });

  // Add tests for error handling, timeout, viewport changes, etc.
});
