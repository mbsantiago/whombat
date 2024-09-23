import { useEffect, useMemo } from "react";

import useViewport from "@/lib/hooks/window/useViewport";

import type { Recording, SoundEvent } from "@/lib/types";
import { getGeometryViewingWindow } from "@/lib/utils/windows";

export default function useSoundEventViewport({
  soundEvent,
  recording,
}: {
  soundEvent: SoundEvent;
  recording: Recording;
}) {
  const bounds = useMemo(
    () =>
      getGeometryViewingWindow({
        geometry: soundEvent.geometry,
        recording,
        timeBuffer: 0.2,
      }),
    [soundEvent.geometry, recording],
  );

  const initial = useMemo(
    () =>
      getGeometryViewingWindow({
        geometry: soundEvent.geometry,
        recording,
        timeBuffer: 0.1,
        freqBuffer: null,
      }),
    [soundEvent.geometry, recording],
  );

  const viewport = useViewport({
    initial,
    bounds,
  });

  const { set: setViewport } = viewport;

  useEffect(() => {
    setViewport(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEvent.uuid, setViewport]);

  return viewport;
}
