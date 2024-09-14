import { useMemo } from "react";
import PlayerBase from "@/lib/components/audio/Player";

import type { Recording } from "@/lib/types";
import { type AudioController } from "@/app/hooks/audio/useRecordingAudio";
import { getSpeedOptions } from "@/lib/hooks/settings/useAudioSettings";

export default function Player({
  audio,
  recording,
  onChangeSpeed,
}: {
  audio: AudioController;
  recording: Recording;
  onChangeSpeed?: (speed: number) => void;
}) {
  const speedOptions = useMemo(() => {
    return getSpeedOptions(recording.samplerate);
  }, [recording.samplerate]);

  return (
    <PlayerBase
      currentTime={audio.currentTime}
      startTime={audio.startTime}
      endTime={audio.endTime}
      isPlaying={audio.isPlaying}
      loop={audio.loop}
      speed={audio.speed}
      speedOptions={speedOptions}
      onPlay={audio.play}
      onPause={audio.pause}
      onSeek={audio.seek}
      onToggleLoop={audio.toggleLoop}
      onChangeSpeed={onChangeSpeed}
    />
  );
}
