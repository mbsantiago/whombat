import PlayerBase from "@/lib/components/audio/Player";

import type { Recording } from "@/lib/types";
import useRecordingAudio from "@/app/hooks/audio/useRecordingAudio";

export default function Player({
  recording,
  startTime,
  endTime,
}: {
  recording: Recording;
  startTime?: number;
  endTime?: number;
}) {
  return (
    <PlayerBase
      currentTime={0}
      startTime={0}
      endTime={recording.duration}
      speedOptions={[{ label: "1x", value: 1 }]}
    />
  );
}
