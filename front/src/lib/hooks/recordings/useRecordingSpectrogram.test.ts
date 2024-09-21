import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SPECTROGRAM_SETTINGS,
} from "@/lib/constants";
import type { Recording } from "@/lib/types";
import { getInitialViewingWindow } from "@/lib/utils/windows";
import { act, renderHook } from "@testing-library/react";

import useRecordingSpectrogram from "./useRecordingSpectrogram";

jest.mock("@/lib/utils/windows", () => ({
  ...jest.requireActual("@/lib/utils/windows"),
  getInitialViewingWindow: jest.fn(),
}));

describe("useRecordingSpectrogram hook", () => {
  const mockGetInitialViewingWindow =
    getInitialViewingWindow as jest.MockedFunction<
      typeof getInitialViewingWindow
    >;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("correctly updates viewport and bounds when the recording changes", () => {
    const initialRecording: Recording = {
      path: "path1",
      hash: "hash1",
      uuid: "uuid1",
      channels: 1,
      duration: 10,
      samplerate: 44100,
      time_expansion: 1,
      created_on: new Date(),
    };

    const updatedRecording: Recording = {
      path: "path2",
      hash: "hash2",
      uuid: "uuid2",
      channels: 2,
      duration: 20,
      samplerate: 48000,
      time_expansion: 1,
      created_on: new Date(),
    };

    mockGetInitialViewingWindow.mockReturnValue({
      time: { min: 0, max: 2 },
      freq: { min: 0, max: 22050 },
    });

    const { result, rerender } = renderHook(
      ({ recording }) =>
        useRecordingSpectrogram({
          recording,
          audioSettings: DEFAULT_AUDIO_SETTINGS,
          spectrogramSettings: DEFAULT_SPECTROGRAM_SETTINGS,
        }),
      { initialProps: { recording: initialRecording } },
    );

    // Initial state
    expect(result.current.bounds).toEqual({
      time: { min: 0, max: 10 },
      freq: { min: 0, max: 22050 },
    });

    // Initial viewport
    expect(result.current.viewport.viewport).toEqual({
      time: { min: 0, max: 2 },
      freq: { min: 0, max: 22050 },
    });

    // Simulate user navigating the spectrogram
    act(() => {
      result.current.viewport.set({
        time: { min: 3, max: 6 },
        freq: { min: 0, max: 22050 },
      });
    });

    // Update the recording prop
    rerender({ recording: updatedRecording });

    // Updated state
    expect(result.current.bounds).toEqual({
      time: { min: 0, max: 20 },
      freq: { min: 0, max: 24000 },
    });

    // Updated viewport
    expect(result.current.viewport.viewport).toEqual({
      time: { min: 0, max: 2 },
      freq: { min: 0, max: 22050 },
    });
  });
});
