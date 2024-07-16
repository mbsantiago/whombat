import { TagIcon } from "@/lib/components/icons";
import AddTagButton from "@/lib/components/tags/AddTagButton";
import TagComponent from "@/lib/components/tags/Tag";
import { getTagColor, type Color } from "@/lib/utils/tags";

import type { Tag } from "@/lib/types";

export default function RecordingTagBar({
  tags,
  label = "Tags",
  onTagAdd,
  onTagClick,
  onTagRemove,
  colorFn = getTagColor,
  disabled = false,
}: {
  tags: Tag[];
  label?: string;
  onTagAdd?: (tag: Tag) => void;
  onTagClick?: (tag: Tag) => void;
  onTagRemove?: (tag: Tag) => void;
  colorFn: (tag: Tag) => Color;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="inline-flex">
        <TagIcon className="inline-block mr-1 w-5 h-5 text-stone-400 dark:text-stone-600" />
        <span className="text-sm font-medium text-stone-500">{label}</span>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {tags?.map((tag: Tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...colorFn(tag)}
            onClick={() => onTagClick?.(tag)}
            onClose={() => onTagRemove?.(tag)}
          />
        ))}
        {tags?.length === 0 && (
          <span className="text-sm text-stone-400 dark:text-stone-600">
            No tags
          </span>
        )}
        {!disabled && <AddTagButton variant="primary" onAdd={onTagAdd} />}
      </div>
    </div>
  );
}
