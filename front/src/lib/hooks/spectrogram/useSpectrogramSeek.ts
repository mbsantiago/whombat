import { useCallback } from "react";

import type { ViewportController } from "@/lib/hooks/window/useViewport";
import type { AudioController } from "@/lib/hooks/audio/useRecordingAudio";
import type { DoublePressHandler } from "@/lib/types";

export default function useSpectrogramSeek({
  viewport,
  audio,
}: {
  viewport: ViewportController;
  audio: AudioController;
}): {
  onDoubleClick: DoublePressHandler;
} {
  const { centerOn } = viewport;
  const { seek } = audio;
  const onDoubleClick: DoublePressHandler = useCallback(
    ({ position }) => {
      centerOn(position);
      seek(position.time);
    },
    [centerOn, seek],
  );
  return { onDoubleClick };
}
