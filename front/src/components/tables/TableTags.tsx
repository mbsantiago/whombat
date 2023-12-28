/** @module TableTags.
 * Definition of the TableTags component which displays a list of tags in a
 * table cell.
 */

import { type HTMLProps } from "react";

import { type Tag as TagType } from "@/api/schemas";
import AddTagButton from "@/components/tags/AddTagButton";
import Tag from "@/components/tags/Tag";
import useStore from "@/store";

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
    <div className="flex overflow-scroll flex-row flex-wrap gap-2 items-center px-1 m-0 w-full h-full">
      <AddTagButton onAdd={onAdd} {...props} />
      {/* Display the list of tags and allow users to remove a tag from */}
      {/* list by clicking on it*/}
      {tags.map((tag) => (
        <Tag
          key={`${tag.key}:${tag.value}`}
          tag={tag}
          className="hover:text-red-700 hover:bg-red-300 hover:border-red-500"
          {...getTagColor(tag)}
          onClick={() => {
            onRemove?.(tag);
          }}
        />
      ))}
    </div>
  );
}
