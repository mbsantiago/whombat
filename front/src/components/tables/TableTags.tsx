/** @module TableTags.
 * Definition of the TableTags component which displays a list of tags in a
 * table cell.
 */

import AddTagButton from "@/components/tags/AddTagButton";
import TagComponent from "@/components/tags/Tag";
import useStore from "@/store";

import type { Tag } from "@/types";
import type { HTMLProps } from "react";

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
  onClick,
  ...props
}: {
  tags: Tag[];
  onAdd?: (tag: Tag) => void;
  onClick?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
} & Omit<HTMLProps<HTMLInputElement>, "value" | "onChange" | "onBlur">) {
  // Get each tag color from the store to provide a consistent color
  // experience across the app
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <div className="flex overflow-scroll flex-row flex-wrap gap-2 items-center px-1 m-0 w-full max-h-40">
      {/* Display the list of tags and allow users to remove a tag from */}
      {/* list by clicking on it*/}
      {tags.map((tag) => (
        <TagComponent
          key={`${tag.key}:${tag.value}`}
          tag={tag}
          {...getTagColor(tag)}
          onClick={() => onClick?.(tag)}
          onClose={() => onRemove?.(tag)}
        />
      ))}
      <AddTagButton variant="primary" onAdd={onAdd} {...props} />
    </div>
  );
}
