import { useKeyPressEvent } from "react-use";

import useKeyFilter from "@/hooks/utils/useKeyFilter";

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
  useKeyPressEvent(useKeyFilter({ enabled, key: "a" }), onGoCreate);
  useKeyPressEvent(useKeyFilter({ enabled, key: "s" }), onGoSelect);
  useKeyPressEvent(useKeyFilter({ enabled, key: "d" }), onGoDelete);
}
