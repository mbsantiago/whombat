import useSpectrogramWindow from "@/hooks/spectrogram/useSpectrogramWindow";
import useRecordingSegments from "@/hooks/spectrogram/useRecordingSegments";
import {
  type SpectrogramWindow,
  type SpectrogramParameters,
} from "@/api/spectrograms";
import { type Recording } from "@/api/recordings";

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
  const { draw } = useSpectrogramWindow({
    recording_id: recording.id,
    window: selected,
    parameters: parameters,
  });

  // Load the previous and next spectrogram segments in the background
  useSpectrogramWindow({
    recording_id: recording.id,
    window: prev,
    parameters: parameters,
  });
  useSpectrogramWindow({
    recording_id: recording.id,
    window: next,
    parameters: parameters,
  });

  return draw;
}
