/** @module TableTags.
 * Definition of the TableTags component which displays a list of tags in a
 * table cell.
 */

import { Float } from "@headlessui-float/react";
import { type HTMLProps } from "react";
import { Popover } from "@headlessui/react";

import { type Tag as TagType } from "@/api/tags";
import Tag from "@/components/Tag";
import TagSearchBar from "@/components/TagSearchBar";
import { AddIcon } from "@/components/icons";
import useStore from "@/store";
import Button from "@/components/Button";

function TagBarPopover({
  onClose,
  onAdd,
  ...props
}: {
  onClose?: () => void;
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
      {...props}
    />
  );
}

/** A table cell that displays a list of tags.
 *
 * Has a popover that allows the user to add tags to the list by providing
 * a search bar that allows the user to search for tags and select them.
 * @component
 */
export default function TableTags({
  tags,
  onAdd,
  onRemove,
  ...props
}: {
  tags: TagType[];
  onAdd?: (tag: TagType) => void;
  onRemove?: (tag: TagType) => void;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  // Get each tag color from the store to provide a consistent color
  // experience across the app
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <div className="m-0 h-full flex w-full flex-row flex-wrap items-center overflow-scroll gap-2 px-1">
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
          <Popover.Button
            as="div"
          >
            <Button mode="text" variant="secondary" padding="py-1">
              <AddIcon className="inline-block h-5 w-5 align-middle" />
              add
            </Button>
          </Popover.Button>
          <Popover.Panel className="w-72" focus unmount>
            {({ close }) => (
              <TagBarPopover onClose={close} onAdd={onAdd} {...props} />
            )}
          </Popover.Panel>
        </Float>
      </Popover>
      {/* Display the list of tags and allow users to remove a tag from */}
      {/* list by clicking on it*/}
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          tag={tag}
          className="hover:bg-red-300 hover:border-red-500 hover:text-red-700"
          {...getTagColor(tag)}
          onClick={() => {
            onRemove?.(tag);
          }}
        />
      ))}
    </div>
  );
}
