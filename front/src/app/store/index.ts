// Global state for the application
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { type AudioSlice, createAudioSlice } from "./audio";
import { type ClipboardSlice, createClipboardSlice } from "./clipboard";
import { type ColorsSlice, createColorsSlice } from "./colors";
import { type SessionSlice, createSessionSlice } from "./session";
import { type SpectrogramSlice, createSpectrogramSlice } from "./spectrogram";

type Store = SessionSlice &
  ClipboardSlice &
  ColorsSlice &
  SpectrogramSlice &
  AudioSlice;

const useStore = create<Store>()(
  persist(
    (...a) => ({
      ...createSessionSlice(...a),
      ...createClipboardSlice(...a),
      ...createColorsSlice(...a),
      ...createSpectrogramSlice(...a),
      ...createAudioSlice(...a),
    }),
    {
      name: "whombat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = useStore.persist.onHydrate(() => setHydrated(false));

    const unsubFinishHydration = useStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );

    setHydrated(useStore.persist.hasHydrated());

    return () => {
      unsubHydrate();
      unsubFinishHydration();
    };
  }, []);

  return hydrated;
};

export default useStore;
