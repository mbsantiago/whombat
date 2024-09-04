/** @module Tag.
 * Definition of the Tag component.
 */
import classnames from "classnames";
import { type HTMLProps } from "react";

import { ALL_COLORS } from "@/components/colors";
import { CloseIcon } from "@/components/icons";

import type { Tag } from "@/types";

const COLOR_NAMES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const LEVELS = [1, 2, 3, 4, 5, 6];

export function getTagClassNames(color: string, level: number) {
  const background = `bg-${color}-${level}00 dark:bg-${color}-${10 - level}00`;
  const border = `border-${color}-${level + 2}00 dark:border-${color}-${
    10 - level - 2
  }00`;
  const text = `text-${color}-${level + 3}00 dark:text-${color}-${
    10 - level - 3
  }00`;
  return {
    background,
    border,
    text,
  };
}

/** A Tag.
 * Will display a tag. The aspect can be customized by specifying
 * the color (hue) and the level (brightness).
 * @component
 */
export default function Tag({
  tag,
  color,
  level = 1,
  className,
  onClick,
  onClose,
  ...props
}: {
  tag: Tag;
  level: (typeof LEVELS)[number];
  color: (typeof COLOR_NAMES)[number];
  onClick?: () => void;
  onClose?: () => void;
} & HTMLProps<HTMLDivElement>) {
  const classNames = getTagClassNames(color, level);

  return (
    <div
      className={classnames(
        "border rounded-md px-1 whitespace-nowrap tracking-tighter inline-flex w-fit max-w-full flex-nowrap",
        classNames.background,
        classNames.text,
        classNames.border,
        className,
      )}
      {...props}
    >
      {onClose != null && (
        <button type="button" className="group min-w-fit" onClick={onClose}>
          <CloseIcon className="inline-block w-4 h-4 group-hover:text-red-500 group-hover:stroke-3" />
        </button>
      )}
      <button
        type="button"
        className="group flex flex-row items-center max-w-full"
        onClick={onClick}
      >
        <span className="font-thin min-w-fit shrink">{tag.key}</span>
        <span className="ml-1 grow flex-1 font-bold group-hover:underline truncate group-hover:decoration-2 group-hover:underline-offset-2">
          {tag.value}
        </span>
      </button>
    </div>
  );
}

export { ALL_COLORS, COLOR_NAMES, LEVELS, getTagClassNames as getClassNames };
