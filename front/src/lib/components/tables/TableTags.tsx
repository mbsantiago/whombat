/** @module TableTags.
 * Definition of the TableTags component which displays a list of tags in a
 * table cell.
 */

import { memo, type FC } from "react";
import AddTagButton from "@/lib/components/tags/AddTagButton";
import TagComponent from "@/lib/components/tags/Tag";

import type { Tag } from "@/lib/types";
import { getTagColor, type Color } from "@/lib/utils/tags";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";

const _emptyList: Tag[] = [];

/** A table cell that displays a list of tags.
 *
 * Has a popover that allows the user to add tags to the list by providing
 * a search bar that allows the user to search for tags and select them.
 * @component
 */
const TableTags = memo(function TableTags({
  tags = _emptyList,
  onDeleteTag,
  onClickTag,
  tagColorFn = getTagColor,
  TagSearchBar = TagSearchBarBase,
  ...props
}: {
  /** Tags to display in the table cell. */
  tags?: Tag[];
  /** Function to determine the color of a tag. */
  tagColorFn?: (tag: Tag) => Color;
  /** Callback function to handle clicking on a tag. */
  onClickTag?: (tag: Tag) => void;
  /** Callback function to handle deleting a tag. */
  onDeleteTag?: (tag: Tag) => void;
  /** The tag search bar component to render inside the add tag button popover.
   *
   * Can be a custom tag search bar component that accepts the same props as the
   * `TagSearchBarBase` component. Useful when you want to customize the tag
   * search bar with hooks or other logic.
   **/
  TagSearchBar?: FC<TagSearchBarProps>;
} & TagSearchBarProps) {
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
      <AddTagButton variant="primary" TagSearchBar={TagSearchBar} {...props} />
    </div>
  );
});

export default TableTags;
