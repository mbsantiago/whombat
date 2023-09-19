import { useMachine } from "@xstate/react";
import { useMemo } from "react";
import useSpectrogram, { type SpectrogramState } from "@/hooks/useSpectrogram";
import useCreateBBox from "@/hooks/useCreateBBox";
import { annotateMachine } from "@/machines/annotate";
import { type Task } from "@/api/tasks";
import { type Recording } from "@/api/recordings";

export default function useAnnotate({
  task,
  recording,
}: {
  task: Task;
  recording: Recording;
}) {
  const { start_time, end_time } = task.clip;
  const { samplerate } = recording;

  const bounds = useMemo(
    () => ({
      time: { min: start_time ?? 0, max: end_time ?? 1 },
      freq: { min: 0, max: (samplerate ?? 44100) / 2 },
    }),
    [end_time, start_time, samplerate],
  );

  const initial = useMemo(
    () => ({
      time: {
        min: start_time ?? 0,
        max: Math.min(end_time ?? 1, (start_time ?? 0) + 1),
      },
      freq: { min: 0, max: samplerate ?? 44100 / 2 },
    }),
    [samplerate, start_time, end_time],
  );

  const [state, send] = useMachine(annotateMachine, {});

  const spectrogram = useSpectrogram({
    bounds,
    initial,
    recording,
    canDrag: state.matches("panning"),
    canBBoxZoom: state.matches("zooming"),
  });

  return { spectrogram, bounds };
}
