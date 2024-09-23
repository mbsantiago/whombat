import { useCallback, useState } from "react";

import { SpectrogramMode, SpectrogramState } from "@/lib/types";

export default function useSpectrogramState({
  state: initialState = "panning",
}: {
  state?: SpectrogramMode;
} = {}): SpectrogramState {
  const [mode, setMode] = useState(initialState);
  const enablePanning = useCallback(() => setMode("panning"), []);
  const enableZooming = useCallback(() => setMode("zooming"), []);
  const enableIdle = useCallback(() => setMode("idle"), []);
  return { mode, setMode, enablePanning, enableZooming, enableIdle };
}
