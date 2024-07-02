import { useHotkeys } from "react-hotkeys-hook";

export const ANNOTATE_TASKS_KEY_SHORTCUTS = [
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
  onGoNext: () => void;
  onGoPrevious: () => void;
  onMarkCompleted: () => void;
  onMarkRejected: () => void;
  onMarkVerified: () => void;
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

  useHotkeys("n", onGoNext, { enabled });
  useHotkeys("p", onGoPrevious, { enabled });
  useHotkeys("g", onMarkCompleted, { enabled });
  useHotkeys("r", onMarkRejected, { enabled });
  useHotkeys("v", onMarkVerified, { enabled });
}
