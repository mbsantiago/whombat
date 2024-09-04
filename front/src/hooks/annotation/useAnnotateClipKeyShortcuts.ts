import { useHotkeys } from "react-hotkeys-hook";

export const ANNOTATION_KEY_SHORTCUTS = [
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
