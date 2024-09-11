import { TagIcon } from "@/lib/components/icons";
import AddTagButton from "@/lib/components/tags/AddTagButton";
import TagComponent from "@/lib/components/tags/Tag";
import { getTagColor, type Color } from "@/lib/utils/tags";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import type { Tag } from "@/lib/types";
import { type FC } from "react";

/**
 * RecordingTagBar Component
 *
 * This component renders a bar that displays a list of tags associated with a
 * recording. It includes an optional label, a list of tags, and a button to
 * add new tags.
 *
 * Example usage:
 *
 * ```tsx
 * <RecordingTagBar
 *   tags={[{ key: '1', value: 'example' }]}
 *   label="Recording Tags"
 *   onClickTag={(tag) => console.log(tag)}
 *   onDeleteTag={(tag) => console.log(tag)}
 *   disabled={false}
 * />
 * ```
 */
export default function RecordingTagBar({
  tags,
  label = "Tags",
  onClickTag,
  onDeleteTag,
  colorFn = getTagColor,
  disabled = false,
  TagSearchBar = TagSearchBarBase,
  ...props
}: {
  /** The list of tags associated with the recording. */
  tags: Tag[];
  /** The label to display next to the tag icon. */
  label?: string;
  /** Callback function to handle clicking on a tag. */
  onClickTag?: (tag: Tag) => void;
  /** Callback function to handle deleting a tag. */
  onDeleteTag?: (tag: Tag) => void;
  /** Function to determine the color of a tag. */
  colorFn?: (tag: Tag) => Color;
  /** If true, the add tag button is disabled. */
  disabled?: boolean;
  /** The tag search bar component to render inside the add tag button popover.
   *
   * Can be a custom tag search bar component that accepts the same props as the
   * `TagSearchBarBase` component. Useful when you want to customize the tag
   * search bar with hooks or other logic.
   * */
  TagSearchBar?: FC<TagSearchBarProps>;
} & TagSearchBarProps) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="inline-flex">
        <TagIcon className="inline-block mr-1 w-5 h-5 text-stone-400 dark:text-stone-600" />
        <span className="text-sm font-medium text-stone-500">{label}</span>
      </div>
      <div className="flex flex-row flex-wrap gap-2 items-center">
        {tags?.map((tag: Tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...colorFn(tag)}
            onClick={() => onClickTag?.(tag)}
            onClose={() => onDeleteTag?.(tag)}
          />
        ))}
        {tags?.length === 0 && (
          <span className="text-sm text-stone-400 dark:text-stone-600">
            No tags
          </span>
        )}
        {!disabled && (
          <AddTagButton
            variant="primary"
            TagSearchBar={TagSearchBar}
            {...props}
          />
        )}
      </div>
    </div>
  );
}
