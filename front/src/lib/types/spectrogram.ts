export type SpectrogramProps = {
  height?: number;
  withViewportBar?: boolean;
  withControls?: boolean;
  withHotKeys?: boolean;
};

export type SpectrogramMode = "panning" | "zooming" | "idle";

export type SpectrogramState = {
  mode: SpectrogramMode;
  setMode: (mode: SpectrogramMode) => void;
  enablePanning: () => void;
  enableZooming: () => void;
  enableIdle: () => void;
};
