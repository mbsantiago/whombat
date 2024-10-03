import classNames from "classnames";

import {
  CheckIcon,
  CloseIcon,
  NeedsReviewIcon,
  UserIcon,
  VerifiedIcon,
} from "@/lib/components/icons";

import type { AnnotationStatusBadge } from "@/lib/types";

const ICONS = {
  assigned: UserIcon,
  completed: CheckIcon,
  verified: VerifiedIcon,
  rejected: NeedsReviewIcon,
};

const CLASSNAMES = {
  assigned: "bg-blue-100 border-blue-200 text-blue-500",
  completed: "bg-emerald-100 border-emerald-200 text-emerald-500",
  verified: "bg-amber-100 border-amber-200 text-amber-500",
  rejected: "bg-red-100 border-red-200 text-red-500",
};

export default function StatusBadge({
  badge,
  onClick,
  onRemove,
}: {
  badge: AnnotationStatusBadge;
  onClick?: () => void;
  onRemove?: () => void;
}) {
  const { state } = badge;
  const Icon = ICONS[state];
  const className = CLASSNAMES[state];
  return (
    <div
      className={classNames(
        className,
        "flex flex-row items-center rounded-full border max-w-fit p-1",
      )}
    >
      <button
        type="button"
        className="group focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-md"
        disabled={onClick == null}
        onClick={onClick}
      >
        <Icon
          className={classNames(
            "transition-all w-6 h-6 inline-block",
            onClick != null && "group-hover:stroke-3",
          )}
        />
        <span
          className={classNames(
            "transition-all text-stone-500 text-sm font-thin ml-1",
            onClick != null && "group-hover:font-medium",
          )}
        >
          {badge.user?.username}
        </span>
      </button>
      {onRemove != null && (
        <button
          type="button"
          className="ml-1 group focus:outline-none focus:ring-4 focus:ring-emerald-500/50 rounded-md"
          onClick={onRemove}
        >
          <CloseIcon className="transition-all w-4 h-4 group-hover:stroke-3" />
        </button>
      )}
    </div>
  );
}
