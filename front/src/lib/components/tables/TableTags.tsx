/** @module TableTags.
 * Definition of the TableTags component which displays a list of tags in a
 * table cell.
 */

import AddTagButton from "@/lib/components/tags/AddTagButton";
import TagComponent from "@/lib/components/tags/Tag";

import type { Tag } from "@/lib/types";
import { getTagColor } from "@/lib/utils/tags";
import type { ComponentProps } from "react";

/** A table cell that displays a list of tags.
 *
 * Has a popover that allows the user to add tags to the list by providing
 * a search bar that allows the user to search for tags and select them.
 * @component
 */
export default function TableTags({
  tags,
  variant = "primary",
  availableTags,
  tagColorFn = getTagColor,
  onAddTag,
  onDeleteTag,
  onClickTag,
  ...props
}: {
  tags: Tag[];
  availableTags?: Tag[];
  onAddTag?: (tag: Tag) => void;
  onClickTag?: (tag: Tag) => void;
  onDeleteTag?: (tag: Tag) => void;
} & Omit<ComponentProps<typeof AddTagButton>, "tags" | "onSelectTag">) {
  return (
    <div className="flex overflow-auto flex-row flex-wrap gap-2 items-center px-1 m-0 w-full max-h-40">
      {tags.map((tag) => (
        <TagComponent
          key={`${tag.key}:${tag.value}`}
          tag={tag}
          {...tagColorFn(tag)}
          onClick={() => onClickTag?.(tag)}
          onClose={() => onDeleteTag?.(tag)}
        />
      ))}
      <AddTagButton
        tags={availableTags}
        tagColorFn={tagColorFn}
        variant={variant}
        onSelectTag={onAddTag}
        {...props}
      />
    </div>
  );
}
