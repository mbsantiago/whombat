import { type Recording } from "@/api/schemas";
import useAudio from "@/hooks/audio/useAudio";
import Player from "@/components/Player";

export default function RecordingPlayer({
  recording,
}: {
  recording: Recording;
}) {
  const { state, controls } = useAudio({ recording });
  return <Player state={state} controls={controls} />;
}
