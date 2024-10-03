import Loading from "@/app/loading";

import StatusBadge from "@/lib/components/annotation_tasks/StatusBadge";
import { CheckIcon, CloseIcon, VerifiedIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import Tooltip from "@/lib/components/ui/Tooltip";

import type { AnnotationStatus, AnnotationTask } from "@/lib/types";

export default function AnnotationTaskStatus({
  task,
  isLoading = false,
  onDone,
  onReview,
  onVerify,
  onRemoveBadge,
}: {
  task?: AnnotationTask;
  isLoading?: boolean;
  onDone?: () => void;
  onReview?: () => void;
  onVerify?: () => void;
  onRemoveBadge?: (state: AnnotationStatus) => void;
}) {
  return (
    <div className="flex flex-row justify-between items-center px-6 rounded-md border border-stone-200 dark:border-stone-800">
      <div className="flex flex-row flex-wrap gap-2">
        {isLoading ? (
          <Loading />
        ) : (
          task?.status_badges?.map((badge) => (
            <StatusBadge
              key={`${badge.state}-${badge.user?.id}`}
              badge={badge}
              onRemove={() => onRemoveBadge?.(badge.state)}
            />
          ))
        )}
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <Tooltip
          tooltip={
            <div className="inline-flex gap-2 items-center">
              Task Done!
              <div className="text-xs">
                <KeyboardKey keys={["g"]} />
              </div>
            </div>
          }
          placement="bottom"
          autoPlacement={false}
        >
          <Button mode="text" variant="primary" onClick={onDone}>
            <CheckIcon className="w-8 h-8" />
          </Button>
        </Tooltip>
        <Tooltip
          tooltip={
            <div className="inline-flex gap-2 items-center">
              Needs Review
              <div className="text-xs">
                <KeyboardKey keys={["r"]} />
              </div>
            </div>
          }
          placement="bottom"
          autoPlacement={false}
        >
          <Button mode="text" variant="danger" onClick={onReview}>
            <CloseIcon className="w-8 h-8" />
          </Button>
        </Tooltip>
        <Tooltip
          tooltip={
            <div className="inline-flex gap-2 items-center">
              Verified
              <div className="text-xs">
                <KeyboardKey keys={["v"]} />
              </div>
            </div>
          }
          placement="bottom"
          autoPlacement={false}
        >
          <Button mode="text" variant="warning" onClick={onVerify}>
            <VerifiedIcon className="w-8 h-8" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
