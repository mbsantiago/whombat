import { SpectrogramMode } from "@/lib/types";
import { useCallback, useState } from "react";

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

export type SpectrogramState = {
  mode: SpectrogramMode;
  setMode: (mode: SpectrogramMode) => void;
  enablePanning: () => void;
  enableZooming: () => void;
  enableIdle: () => void;
};
