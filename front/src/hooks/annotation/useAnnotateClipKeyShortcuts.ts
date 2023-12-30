import { useKeyPressEvent } from "react-use";

import useKeyFilter from "@/hooks/utils/useKeyFilter";

import type { KeyShortcut } from "@/hooks/utils/useKeyFilter";

export const ANNOTATION_KEY_SHORTCUTS: KeyShortcut[] = [
  {
    label: "Move",
    shortcut: "m",
    description: "Move around the spectrogram",
  },
  {
    label: "Zoom in",
    shortcut: "z",
    description: "Zoom into a selection of the spectrogram",
  },
  {
    label: "Add Annotation",
    shortcut: "a",
    description: "Add a new annotation",
  },
  {
    label: "Select Annotation",
    shortcut: "s",
    description: "Select an annotation",
  },
  {
    label: "Delete Annotation",
    shortcut: "d",
    description: "Delete an annotation",
  },
  {
    label: "Unfocus",
    shortcut: "Escape",
    description: "Unfocus the annotation",
  },
  {
    label: "Reset View",
    shortcut: "x",
    description: "Reset the view to the original spectrogram",
  },
  {
    label: "Toggle Play",
    shortcut: "Space",
    description: "Press space to toggle audio play",
  },
];

export default function useAnnotateClipKeyShortcuts(props: {
  onGoMove: () => void;
  onGoZoom: () => void;
  onGoCreate: () => void;
  onGoSelect: () => void;
  onGoDelete: () => void;
  onUnfocus: () => void;
  onGoHome: () => void;
  onTogglePlay: () => void;
  enabled?: boolean;
}) {
  const {
    onGoMove,
    onGoZoom,
    onGoCreate,
    onGoSelect,
    onGoDelete,
    onUnfocus,
    onGoHome,
    onTogglePlay,
    enabled = true,
  } = props;

  useKeyPressEvent(useKeyFilter({ enabled, key: "m" }), onGoMove);
  useKeyPressEvent(useKeyFilter({ enabled, key: "z" }), onGoZoom);
  useKeyPressEvent(useKeyFilter({ enabled, key: "a" }), onGoCreate);
  useKeyPressEvent(useKeyFilter({ enabled, key: "s" }), onGoSelect);
  useKeyPressEvent(useKeyFilter({ enabled, key: "d" }), onGoDelete);
  useKeyPressEvent(useKeyFilter({ enabled, key: "x" }), onGoHome);
  useKeyPressEvent(
    useKeyFilter({
      enabled,
      key: "Escape",
      preventDefault: true,
      stopPropagation: true,
    }),
    onUnfocus,
  );
  useKeyPressEvent(useKeyFilter({ enabled, key: " " }), onTogglePlay);
}
