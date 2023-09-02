/** @module TableTags.
 * Definition of the TableTags component which displays a list of tags in a
 * table cell.
 */

import { type Tag as TagType } from "@/api/tags";
import { useState, useEffect, useRef, type HTMLProps } from "react";
import { Popover } from "@headlessui/react";
import Tag from "@/components/Tag";
import TagSearchBar from "@/components/TagSearchBar";
import { AddIcon } from "@/components/icons";
import useStore from "@/store";
import Button from "@/components/Button";

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

  // Keep track of whether the popover is open or not so we can focus
  // the input when it opens
  const ref = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (active) {
      ref.current?.focus();
    }
  }, [active]);

  return (
    <div className="m-0 h-full flex w-full flex-row flex-wrap items-center overflow-scroll gap-2 px-1">
      <Popover as="div" className="inline-block text-left">
        <Popover.Button
          as={Button}
          variant="secondary"
          mode="text"
          className="whitespace-nowrap py-1"
          onClick={() => setActive(true)}
        >
          <AddIcon className="inline-block h-5 w-5 align-middle" />
          add
        </Popover.Button>
        <Popover.Panel
          className="absolute mt-1 w-72 origin-top-right z-10"
          focus
          unmount
          onBlur={() => setActive(false)}
        >
          {({ close }) => (
            <TagSearchBar
              // @ts-ignore
              ref={ref}
              // @ts-ignore
              onSelect={(tag) => {
                onAdd?.(tag);
                setActive(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  close();
                  setActive(false);
                } else if (e.key === "Enter") {
                  close();
                  setActive(false);
                }
              }}
              {...props}
            />
          )}
        </Popover.Panel>
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
