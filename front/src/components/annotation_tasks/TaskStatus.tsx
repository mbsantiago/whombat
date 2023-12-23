import Card from "@/components/Card";
import Tooltip from "@/components/Tooltip";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import Loading from "@/app/loading";
import { CheckIcon, CloseIcon, VerifiedIcon } from "@/components/icons";
import { H3 } from "@/components/Headings";
import { type AnnotationTask } from "@/api/schemas";
import { type AnnotationStatusBadge as BadgeType } from "@/api/schemas";

export default function TaskStatus({
  task,
  done,
  review,
  verify,
  removeBadge,
}: {
  task?: AnnotationTask;
  done?: () => void;
  review?: () => void;
  verify?: () => void;
  removeBadge?: (badge: BadgeType) => void;
}) {
  return (
    <Card>
      <H3 className="text-center">Task Status</H3>
      <div className="flex flex-row flex-wrap gap-2">
        {task == null ? (
          <Loading />
        ) : (
          task.status_badges?.map((badge) => (
            <StatusBadge
              key={`${badge.state}-${badge.user?.id}`}
              badge={badge}
              onRemove={() => removeBadge?.(badge)}
            />
          ))
        )}
      </div>
      <div className="flex flex-row gap-2 justify-center">
        <Tooltip tooltip="Task Done!" placement="bottom">
          <Button mode="text" variant="primary" onClick={done}>
            <CheckIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
        <Tooltip tooltip="Needs review" placement="bottom">
          <Button mode="text" variant="danger" onClick={review}>
            <CloseIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
        <Tooltip tooltip="Verified" placement="bottom">
          <Button mode="text" variant="warning" onClick={verify}>
            <VerifiedIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
