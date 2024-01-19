import { useKeyPressEvent } from "react-use";

import useKeyFilter from "@/hooks/utils/useKeyFilter";

import type { KeyShortcut } from "@/hooks/utils/useKeyFilter";

export const SPECTROGRAM_KEY_SHORTCUTS: KeyShortcut[] = [
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
  useKeyPressEvent(useKeyFilter({ enabled, key: "x" }), onGoMove);
  useKeyPressEvent(useKeyFilter({ enabled, key: "z" }), onGoZoom);
}
