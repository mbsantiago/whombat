import AnnotationTaskStatusBase from "@/lib/components/annotation_tasks/AnnotationTaskStatus";
import toast from "react-hot-toast";

import type { AnnotationTask } from "@/lib/types";
import useAnnotationTask from "@/app/hooks/api/useAnnotationTask";

export default function AnnotationTaskStatus({
  task,
}: {
  task?: AnnotationTask;
}) {
  const { data, addBadge, removeBadge } = useAnnotationTask({
    uuid: task?.uuid || "",
    annotationTask: task || undefined,
    enabled: task != null,
  });

  return (
    <AnnotationTaskStatusBase
      task={data || task}
      onDone={() =>
        addBadge.mutate("completed", {
          onSuccess: () => toast.success("Task completed."),
        })
      }
      onReview={() =>
        addBadge.mutate("rejected", {
          onSuccess: () => toast.success("Task marked for review."),
        })
      }
      onVerify={() =>
        addBadge.mutate("verified", {
          onSuccess: () => toast.success("Task verified."),
        })
      }
      onRemoveBadge={(badge) =>
        removeBadge.mutate(badge, {
          onSuccess: () => toast.success("Removed."),
        })
      }
    />
  );
}
