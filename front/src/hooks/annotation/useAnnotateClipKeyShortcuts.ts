import { useHotkeys } from "react-hotkeys-hook";

import type { KeyShortcut } from "@/hooks/utils/useKeyFilter";

export const ANNOTATION_KEY_SHORTCUTS: KeyShortcut[] = [
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
];

export default function useAnnotateClipKeyShortcuts(props: {
  onGoCreate: () => void;
  onGoSelect: () => void;
  onGoDelete: () => void;
  enabled?: boolean;
}) {
  const { onGoCreate, onGoSelect, onGoDelete, enabled = true } = props;
  useHotkeys("a", onGoCreate, { enabled });
  useHotkeys("s", onGoSelect, { enabled });
  useHotkeys("d", onGoDelete, { enabled });
}
