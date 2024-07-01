import { useState, useCallback } from "react";

export type SpectrogramState = "panning" | "zooming" | "idle";

export default function useSpectrogramState({
  state: initialState = "panning",
}: {
  state?: SpectrogramState;
} = {}) {
  const [state, setState] = useState(initialState);

  const enablePanning = useCallback(() => setState("panning"), []);
  const enableZooming = useCallback(() => setState("zooming"), []);
  const enableIdle = useCallback(() => setState("idle"), []);

  return { state, setState, enablePanning, enableZooming, enableIdle };
}
