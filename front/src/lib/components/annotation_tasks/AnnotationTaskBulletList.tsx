import classNames from "classnames";

import { CLASS_NAMES } from "@/lib/components/ui/Button";
import type { AnnotationTask } from "@/lib/types";
import { getAnnotationTaskStatus } from "@/lib/utils/annotation_tasks";

interface AnnotationTaskBulletProps {
  task: AnnotationTask;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

interface AnnotationTaskBulletListProps {
  tasks: AnnotationTask[];
  currentTask?: AnnotationTask;
  onTaskClick?: (task: AnnotationTask) => void;
}

const STATUS_TO_VARIANT = {
  pending: "secondary",
  assigned: "secondary",
  completed: "primary",
  verified: "warning",
  rejected: "danger",
  active: "info",
} as const;

function AnnotationTaskBullet({
  task,
  isActive = false,
  disabled = false,
  onClick,
}: AnnotationTaskBulletProps) {
  const status = isActive ? "active" : getAnnotationTaskStatus(task);
  const variant = STATUS_TO_VARIANT[status] || "secondary";
  return (
    <button
      disabled={isActive}
      onClick={onClick}
      className={classNames(
        "w-6 h-6 rounded-full transition-all duration-200",
        "flex items-center justify-center shrink-0 shadow-xs",
        CLASS_NAMES.filled[variant],
        CLASS_NAMES.filled.common,
        {
          "hover:scale-110 active:scale-95 hover:z-10": !disabled,
        },
        isActive
          ? "ring-4 scale-110 z-10"
          : "focus:ring-4 focus:ring-emerald-500/30",
      )}
      title={`Task UUID: ${task.uuid}\nStatus: ${status}\nCreated: ${task.created_on.toLocaleString()}`}
    >
      {isActive && (
        <span className="absolute w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      )}
    </button>
  );
}

export default function AnnotationTaskBulletList({
  tasks,
  currentTask,
  onTaskClick,
}: AnnotationTaskBulletListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          Click a task button to navigate directly to it. Bullets are ordered by
          creation date, and colors represent the current status of each task.
        </p>
      </div>
      <div className="flex overflow-y-auto flex-row flex-wrap gap-x-2 gap-y-2 p-2 max-h-96">
        {tasks.map((task) => (
          <AnnotationTaskBullet
            key={task.uuid}
            task={task}
            isActive={task.uuid === currentTask?.uuid}
            onClick={() => onTaskClick?.(task)}
          />
        ))}
      </div>
    </div>
  );
}
