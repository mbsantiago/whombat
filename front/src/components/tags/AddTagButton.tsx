import { Popover } from "@headlessui/react";
import { Float } from "@headlessui-float/react";

import Button from "@/components/Button";
import { AddIcon } from "@/components/icons";
import TagSearchBar from "@/components/tags/TagSearchBar";

import type { TagFilter } from "@/api/tags";
import type { Tag as TagType } from "@/types";
import type { HTMLProps } from "react";

function TagBarPopover({
  onClose,
  onAdd,
  filter,
  ...props
}: {
  onClose?: () => void;
  filter?: TagFilter;
  onAdd?: (tag: TagType) => void;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  return (
    <TagSearchBar
      // @ts-ignore
      onSelect={(tag) => {
        onAdd?.(tag);
      }}
      onCreate={(tag) => {
        onAdd?.(tag);
      }}
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

export default function AddTagButton({
  onAdd,
  text = "add",
  variant = "secondary",
  filter,
  ...props
}: {
  text?: string;
  filter?: TagFilter;
  onAdd?: (tag: TagType) => void;
  variant?: "primary" | "secondary" | "danger";
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  return (
    <Popover as="div" className="inline-block text-left">
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
        <Popover.Button as="div">
          <Button mode="text" variant={variant} padding="py-1">
            <AddIcon className="inline-block w-5 h-5 align-middle" />
            {text}
          </Button>
        </Popover.Button>
        <Popover.Panel className="w-72" focus unmount>
          {({ close }) => (
            <TagBarPopover
              onClose={close}
              onAdd={onAdd}
              filter={filter}
              {...props}
            />
          )}
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
