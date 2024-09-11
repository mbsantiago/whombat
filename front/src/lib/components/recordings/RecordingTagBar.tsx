import { TagIcon } from "@/lib/components/icons";
import AddTagButton from "@/lib/components/tags/AddTagButton";
import TagComponent from "@/lib/components/tags/Tag";
import { getTagColor, type Color } from "@/lib/utils/tags";

import type { Tag } from "@/lib/types";
import { ComponentProps } from "react";

export default function RecordingTagBar({
  tags,
  label = "Tags",
  onClickTag,
  onDeleteTag,
  onCreateTag,
  onAddTag,
  colorFn = getTagColor,
  disabled = false,
  TagSearchBar,
}: {
  tags: Tag[];
  label?: string;
  onAddTag?: (tag: Tag) => void;
  onClickTag?: (tag: Tag) => void;
  onDeleteTag?: (tag: Tag) => void;
  onCreateTag?: ComponentProps<typeof AddTagButton>["onCreateTag"];
  colorFn?: (tag: Tag) => Color;
  disabled?: boolean;
  TagSearchBar?: ComponentProps<typeof AddTagButton>["TagSearchBar"];
}) {
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
            onSelectTag={onAddTag}
            onCreateTag={onCreateTag}
            TagSearchBar={TagSearchBar}
          />
        )}
      </div>
    </div>
  );
}
