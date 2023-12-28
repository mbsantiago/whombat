import { type Recording } from "@/api/schemas";
import {
  type SpectrogramParameters,
  type SpectrogramWindow,
} from "@/api/spectrograms";
import useRecordingSegments from "@/hooks/spectrogram/useRecordingSegments";
import useSpectrogramWindow from "@/hooks/spectrogram/useSpectrogramWindow";

export default function useSpectrogramImage({
  recording,
  window,
  parameters,
}: {
  recording: Recording;
  window: SpectrogramWindow;
  parameters: SpectrogramParameters;
}) {
  // Get a spectrogram segment that covers the window
  const { selected, prev, next } = useRecordingSegments({
    recording: recording,
    window: window,
  });

  // Load the spectrogram segment
  const image = useSpectrogramWindow({
    recording,
    window: selected,
    parameters: parameters,
  });

  // Load the previous and next spectrogram segments in the background
  useSpectrogramWindow({
    recording,
    window: prev,
    parameters: parameters,
  });
  useSpectrogramWindow({
    recording,
    window: next,
    parameters: parameters,
  });

  return image;
}
