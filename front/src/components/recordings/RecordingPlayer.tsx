import { type Recording } from "@/api/schemas";
import Player from "@/components/audio/Player";
import useAudio from "@/hooks/audio/useAudio";

export default function RecordingPlayer({
  recording,
}: {
  recording: Recording;
}) {
  const { state, controls } = useAudio({ recording });
  return <Player state={state} controls={controls} />;
}
