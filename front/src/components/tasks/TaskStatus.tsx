import Card from "@/components/Card";
import Tooltip from "@/components/Tooltip";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import { CheckIcon, CloseIcon, VerifiedIcon } from "@/components/icons";
import { H3 } from "@/components/Headings";
import { type Task } from "@/api/tasks";
import { type StatusBadge as BadgeType } from "@/api/tasks";

export default function TaskStatus({
  task,
  done,
  review,
  verify,
  removeBadge,
}: {
  task: Task;
  done?: () => void;
  review?: () => void;
  verify?: () => void;
  removeBadge?: (badge: BadgeType) => void;
}) {
  return (
    <Card>
      <H3 className="text-center">Task Status</H3>
      <div className="flex flex-row flex-wrap gap-2">
        {task.status_badges.map((badge) => (
          <StatusBadge
            key={badge.id}
            badge={badge}
            onRemove={() => removeBadge?.(badge)}
          />
        ))}
      </div>
      <div className="flex flex-row justify-center gap-2">
        <Tooltip tooltip="Task Done!" placement="bottom">
          <Button mode="outline" variant="primary" onClick={done}>
            <CheckIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
        <Tooltip tooltip="Needs review" placement="bottom">
          <Button mode="outline" variant="danger" onClick={review}>
            <CloseIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
        <Tooltip tooltip="Verified" placement="bottom">
          <Button mode="outline" variant="warning" onClick={verify}>
            <VerifiedIcon className="w-6 h-6" />
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}
