import { useKeyPressEvent } from "react-use";

import useKeyFilter from "@/hooks/utils/useKeyFilter";

import type { KeyShortcut } from "@/hooks/utils/useKeyFilter";

export const ANNOTATE_TASKS_KEY_SHORTCUTS: KeyShortcut[] = [
  {
    label: "Next",
    shortcut: "n",
    description: "Go to next annotation task",
  },
  {
    label: "Previous",
    shortcut: "p",
    description: "Go to previous annotation task",
  },
  {
    label: "Mark Complete",
    shortcut: "g",
    description: "Mark the annotation task as complete (good)",
  },
  {
    label: "Mark Review",
    shortcut: "r",
    description: "Mark the annotation task for review",
  },
  {
    label: "Mark Verified",
    shortcut: "v",
    description: "Mark the annotation task as verified",
  },
];

export default function useAnnotateTaskKeyShortcuts(props: {
  onGoNext?: () => void;
  onGoPrevious?: () => void;
  onMarkCompleted?: () => void;
  onMarkRejected?: () => void;
  onMarkVerified?: () => void;
  enabled?: boolean;
}) {
  const {
    onGoNext,
    onGoPrevious,
    onMarkCompleted,
    onMarkRejected,
    onMarkVerified,
    enabled = true,
  } = props;

  useKeyPressEvent(useKeyFilter({ enabled, key: "n" }), onGoNext);
  useKeyPressEvent(useKeyFilter({ enabled, key: "p" }), onGoPrevious);
  useKeyPressEvent(useKeyFilter({ enabled, key: "g" }), onMarkCompleted);
  useKeyPressEvent(useKeyFilter({ enabled, key: "r" }), onMarkRejected);
  useKeyPressEvent(useKeyFilter({ enabled, key: "v" }), onMarkVerified);
}
