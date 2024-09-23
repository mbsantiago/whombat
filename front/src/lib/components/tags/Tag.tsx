/** @module Tag.
 * Definition of the Tag component.
 */
import classnames from "classnames";
import { type HTMLProps } from "react";

import { CloseIcon } from "@/lib/components/icons";

import type { Tag } from "@/lib/types";
import { COLOR_NAMES, LEVELS, getTagClassNames } from "@/lib/utils/tags";

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
  canClose = true,
  onClick,
  onClose,
  ...props
}: {
  tag: Tag;
  level: (typeof LEVELS)[number];
  color: (typeof COLOR_NAMES)[number];
  canClose?: boolean;
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
      {onClose != null && canClose && (
        <button type="button" className="group min-w-fit" onClick={onClose}>
          <CloseIcon className="inline-block w-4 h-4 group-hover:text-red-500 group-hover:stroke-3" />
        </button>
      )}
      <button
        type="button"
        className="flex flex-row items-center max-w-full group"
        onClick={onClick}
      >
        <span className="font-thin min-w-fit shrink">{tag.key}</span>
        <span className="flex-1 ml-1 font-bold group-hover:underline grow truncate group-hover:decoration-2 group-hover:underline-offset-2">
          {tag.value}
        </span>
      </button>
    </div>
  );
}

export { COLOR_NAMES, LEVELS };
