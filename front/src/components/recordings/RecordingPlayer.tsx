import Player from "@/components/audio/Player";
import useAudio from "@/hooks/audio/useAudio";

import type { Recording } from "@/types";

export default function RecordingPlayer({
  recording,
}: {
  recording: Recording;
}) {
  const { state, controls } = useAudio({ recording });
  return <Player state={state} controls={controls} />;
}
