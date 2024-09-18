import classNames from "classnames";
import { useMemo } from "react";

import { CloseIcon } from "@/lib/components/icons";
import AddTagButton from "../tags/AddTagButton";

import {
  getTagColor,
  type TagElement,
  type TagGroup,
  type Color,
} from "@/lib/utils/tags";
import type { ComponentProps, ReactNode } from "react";
import type { Tag as TagType } from "@/lib/types";

export default function SpectrogramTags({
  children,
  tags,
  ...props
}: {
  children: ReactNode;
  tags: TagGroup[];
} & Omit<ComponentProps<typeof TagGroup>, "group">) {
  return (
    <div className="relative w-full h-full rounded">
      {children}
      {tags.map((group) => (
        <TagGroup key={group.annotation.uuid} group={group} {...props} />
      ))}
    </div>
  );
}

export function SpectrogramTag({
  tag,
  onClick,
  tagColorFn = getTagColor,
  disabled = false,
}: TagElement & { disabled?: boolean; tagColorFn: (tag: TagType) => Color }) {
  const color = tagColorFn(tag);
  const className = useMemo(() => {
    return `bg-${color.color}-500`;
  }, [color]);
  return (
    <span className="flex flex-row gap-1 items-center px-2 -my-2 rounded-full transition-all group bg-stone-200/0 dark:bg-stone-800/0 hover:bg-stone-200 hover:dark:bg-stone-800">
      <span
        className={`inline-block my-2 w-2 h-2 rounded-full ${className} ring-1 ring-stone-900 opacity-100`}
      ></span>
      <button
        type="button"
        className="hidden flex-row gap-1 items-center opacity-0 transition-all group-hover:flex group-hover:opacity-100 hover:text-red-500 text-stone-800 dark:text-stone-400"
        onClick={onClick}
      >
        <span className="hidden text-xs font-thin whitespace-nowrap opacity-0 transition-all group-hover:inline-block group-hover:opacity-100">
          {tag.key}
        </span>
        <span className="hidden text-sm font-medium whitespace-nowrap opacity-0 transition-all group-hover:inline-block group-hover:opacity-100">
          {tag.value}
        </span>
        {!disabled && <CloseIcon className="inline-block w-3 h-3 stroke-2" />}
      </button>
    </span>
  );
}

export function TagGroup({
  group,
  onCreate,
  disabled = false,
  tagColorFn = getTagColor,
  ...props
}: {
  group: TagGroup;
  disabled?: boolean;
  onCreate?: (tag: TagType) => void;
  tagColorFn?: (tag: TagType) => Color;
} & ComponentProps<typeof AddTagButton>) {
  const { x, y } = group.position;
  return (
    <div
      className={classNames(
        {
          "pointer-events-none": !group.active,
        },
        "h-5 flex flex-col absolute px-2 text-stone-300 hover:z-50 z-40",
      )}
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="flex relative right-0 flex-col hover:gap-2 -ms-2">
        {group.tags.map((tagElement) => (
          <SpectrogramTag
            key={`${tagElement.tag.key}:${tagElement.tag.value}`}
            disabled={disabled}
            tagColorFn={tagColorFn}
            {...tagElement}
          />
        ))}
      </div>
      {!disabled && (
        <AddTagButton
          onSelectTag={(tag) => {
            group.onAdd?.(tag);
          }}
          {...props}
        />
      )}
    </div>
  );
}
