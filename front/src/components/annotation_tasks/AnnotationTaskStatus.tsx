import Loading from "@/app/loading";
import Button from "@/components/Button";
import { H4 } from "@/components/Headings";
import { CheckIcon, CloseIcon, VerifiedIcon } from "@/components/icons";
import StatusBadge from "@/components/StatusBadge";
import Tooltip from "@/components/Tooltip";

import type { AnnotationStatus, AnnotationTask } from "@/types";

export default function AnnotationTaskStatus({
  task,
  onDone,
  onReview,
  onVerify,
  onRemoveBadge,
}: {
  task?: AnnotationTask;
  onDone?: () => void;
  onReview?: () => void;
  onVerify?: () => void;
  onRemoveBadge?: (state: AnnotationStatus) => void;
}) {
  return (
    <div className="flex flex-row justify-between items-center border rounded-md border-stone-800 px-6">
      <H4 className="text-center">Task Status</H4>
      <div className="flex flex-row flex-wrap gap-2">
        {task == null ? (
          <Loading />
        ) : (
          task.status_badges?.map((badge) => (
            <StatusBadge
              key={`${badge.state}-${badge.user?.id}`}
              badge={badge}
              onRemove={() => onRemoveBadge?.(badge.state)}
            />
          ))
        )}
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <Tooltip tooltip="Task Done!" placement="bottom">
          <Button mode="text" variant="primary" onClick={onDone}>
            <CheckIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
        <Tooltip tooltip="Needs review" placement="bottom">
          <Button mode="text" variant="danger" onClick={onReview}>
            <CloseIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
        <Tooltip tooltip="Verified" placement="bottom">
          <Button mode="text" variant="warning" onClick={onVerify}>
            <VerifiedIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
