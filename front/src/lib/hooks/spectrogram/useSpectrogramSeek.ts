import { useCallback } from "react";

import type {
  AudioController,
  DoublePressHandler,
  ViewportController,
} from "@/lib/types";

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
