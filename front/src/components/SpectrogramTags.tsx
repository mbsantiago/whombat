// Purpose: React component for displaying tags on the spectrogram.
import { useMemo } from "react";
import { type ReactNode, type HTMLProps } from "react";
import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";
import classNames from "classnames";

import useStore from "@/store";
import TagSearchBar from "@/components/TagSearchBar";
import { type Tag as TagType, type TagFilter } from "@/api/tags";
import { TagIcon, CloseIcon } from "@/components/icons";
import {
  type TagGroup,
  type TagElement,
} from "@/hooks/annotation/useAnnotationTags";

function TagBarPopover({
  onClose,
  onAdd,
  onCreate,
  filter,
  ...props
}: {
  onClose?: () => void;
  onAdd?: (tag: TagType) => void;
  onCreate?: (tag: TagType) => void;
  filter?: TagFilter;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  return (
    <TagSearchBar
      // @ts-ignore
      onSelect={(tag) => {
        onAdd?.(tag);
      }}
      onCreate={onCreate}
      autoFocus={true}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose?.();
        } else if (e.key === "Enter") {
          onClose?.();
        }
      }}
      initialFilter={filter}
      {...props}
    />
  );
}

export function SpectrogramTag({ tag: annotationTag, onClick }: TagElement) {
  const getTagColor = useStore((state) => state.getTagColor);
  const color = getTagColor(annotationTag.tag);
  const className = useMemo(() => {
    return `bg-${color.color}-500`;
  }, [color]);

  return (
    <span className="transition-all group flex flex-row items-center gap-1 rounded-full bg-stone-200/0 dark:bg-stone-800/0 px-2 hover:bg-stone-200 hover:dark:bg-stone-800">
      <span
        className={`inline-block my-2 w-2 h-2 rounded-full ${className} ring-1 ring-stone-900 opacity-100`}
      ></span>
      <button
        type="button"
        className="transition-all text-stone-800 dark:text-stone-400 flex-row items-center gap-1 hidden opacity-0 group-hover:flex group-hover:opacity-100 hover:text-red-500"
        onClick={onClick}
      >
        <span className="transition-all whitespace-nowrap text-xs font-thin hidden opacity-0 group-hover:inline-block group-hover:opacity-100">
          {annotationTag.tag.key}
        </span>
        <span className="transition-all whitespace-nowrap text-sm font-medium hidden opacity-0 group-hover:inline-block group-hover:opacity-100">
          {annotationTag.tag.value}
        </span>
        <CloseIcon className="w-3 h-3 stroke-2 inline-block" />
      </button>
    </span>
  );
}

export function AddTagButton({
  filter,
  onCreate,
  onAdd,
}: {
  filter?: TagFilter;
  onCreate?: (tag: TagType) => void;
  onAdd?: (tag: TagType) => void;
}) {
  return (
    <Popover as="div">
      <Float
        zIndex={999}
        placement="bottom"
        offset={4}
        enter="transition duration-200 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-150 ease-in"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
        portal={true}
      >
        <Popover.Button className="group focus:outline-none rounded focus:ring-4 focus:ring-emerald-500/50 hover:text-emerald-500">
          +<TagIcon className="w-4 h-4 inline-block ml-1 stroke-2" />
          <span className="absolute whitespace-nowrap hidden transition-all duration-200 ml-1 opacity-0 group-hover:inline-block group-hover:opacity-100">
            Add tag
          </span>
        </Popover.Button>
        <Popover.Panel className="w-52" focus unmount>
          {({ close }) => (
            <TagBarPopover
              filter={filter}
              onClose={close}
              onCreate={(tag) => {
                onCreate?.(tag);
                close();
              }}
              onAdd={(tag) => {
                onAdd?.(tag);
                close();
              }}
            />
          )}
        </Popover.Panel>
      </Float>
    </Popover>
  );
}

export function TagGroup({
  group,
  filter,
  onCreate,
}: {
  group: TagGroup;
  filter?: TagFilter;
  onCreate?: (tag: TagType) => void;
}) {
  const { x, y } = group.position;
  return (
    <div
      className={classNames(
        {
          "pointer-events-none": !group.active,
        },
        "h-5 flex flex-col gap-2 absolute px-2 text-stone-300 ",
      )}
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="relative right-0">
        {group.tags.map((tagElement) => (
          <SpectrogramTag key={tagElement.tag.id} {...tagElement} />
        ))}
      </div>
      <AddTagButton
        filter={filter}
        onCreate={(tag) => {
          onCreate?.(tag);
          group.onAdd(tag);
        }}
        onAdd={(tag) => {
          group.onAdd(tag);
        }}
      />
    </div>
  );
}

export default function SpectrogramTags({
  tags,
  children,
  filter,
  onCreate,
}: {
  tags: TagGroup[];
  children: ReactNode;
  filter?: TagFilter;
  onCreate?: (tag: TagType) => void;
}) {
  return (
    <div className="rounded w-full h-full relative overflow-hidden">
      {children}
      {tags.map((group) => (
        <TagGroup
          key={group.annotation.id}
          group={group}
          filter={filter}
          onCreate={onCreate}
        />
      ))}
    </div>
  );
}
