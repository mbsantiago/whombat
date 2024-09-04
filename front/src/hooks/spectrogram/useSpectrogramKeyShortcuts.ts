import { useHotkeys } from "react-hotkeys-hook";

export const SPECTROGRAM_KEY_SHORTCUTS = [
  {
    label: "Move",
    shortcut: "x",
    description: "Move around the spectrogram",
  },
  {
    label: "Zoom in",
    shortcut: "z",
    description: "Zoom into a selection of the spectrogram",
  },
];

export default function useAnnotateClipKeyShortcuts(props: {
  onGoMove: () => void;
  onGoZoom: () => void;
  enabled?: boolean;
}) {
  const { onGoMove, onGoZoom, enabled = true } = props;
  useHotkeys("x", onGoMove, { enabled });
  useHotkeys("z", onGoZoom, { enabled });
}
