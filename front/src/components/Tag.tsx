/** @module Tag.
 * Definition of the Tag component.
 */
import { type ButtonHTMLAttributes } from "react";
import classnames from "classnames";

import { type Tag } from "@/api/tags";
import { CloseIcon } from "@/components/icons";
import { ALL_COLORS } from "@/components/colors";

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

function getClassNames(color: string, level: number) {
  const bg = `bg-${color}-${level}00 dark:bg-${color}-${10 - level}00`;
  const border = `border-${color}-${level + 2}00 dark:border-${color}-${
    10 - level - 2
  }00`;
  const text = `text-${color}-${level + 3}00 dark:text-${color}-${
    10 - level - 3
  }00`;
  return `${bg} ${border} ${text}`;
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
  withClose = false,
  className,
  ...props
}: {
  tag: Tag;
  level: (typeof LEVELS)[number];
  color: (typeof COLOR_NAMES)[number];
  withClose?: boolean;
  onRemove?: () => void;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const classNames = getClassNames(color, level);
  return (
    <button
      className={classnames(
        "border rounded-md px-2 whitespace-nowrap tracking-tighter",
        classNames,
        className,
      )}
      {...props}
    >
      <span className="font-thin">{tag.key}</span>
      <span className="ml-1 font-bold">{tag.value}</span>
      {withClose && <CloseIcon className="inline-block w-4 h-4 ml-1" />}
    </button>
  );
}

export { ALL_COLORS, COLOR_NAMES, LEVELS, getClassNames };
