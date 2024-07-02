import Button from "@/lib/components/Button";
import Card from "@/lib/components/Card";
import { H4 } from "@/lib/components/Headings";
import { DeleteIcon, ToolsIcon } from "@/lib/components/icons";
import TagComponent from "@/lib/components/tags/Tag";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";
import Tooltip from "@/lib/components/Tooltip";
import useStore from "@/app/store";

import type { TagFilter } from "@/lib/api/tags";
import type { Tag } from "@/lib/types";

export default function AnnotationTagPalette({
  tags,
  tagFilter,
  onClick,
  onAddTag,
  onCreateTag,
  onRemoveTag,
  onClearTags,
}: {
  tags: Tag[];
  tagFilter?: TagFilter;
  onCreateTag?: (tag: Tag) => void;
  onClick?: (tag: Tag) => void;
  onAddTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onClearTags?: () => void;
}) {
  const getTagColor = useStore((state) => state.getTagColor);
  return (
    <Card>
      <H4 className="text-center">
        <Tooltip
          tooltip={
            <div className="w-48 text-center">
              The tags selected here will be automatically attached to newly
              created annotations.
            </div>
          }
          placement="top"
        >
          <ToolsIcon className="inline-block w-5 h-5 mr-1" />
          <span className="cursor-help">Tag Palette</span>
        </Tooltip>
      </H4>
      <div className="flex flex-row gap-1 w-full">
        <Tooltip tooltip="Clear tags" placement="top">
          <Button onClick={onClearTags} mode="text" variant="danger">
            <DeleteIcon className="w-5 h-5" />
          </Button>
        </Tooltip>
        <div className="grow">
          <TagSearchBar
            onSelect={onAddTag}
            onCreate={onCreateTag}
            initialFilter={tagFilter}
            placeholder="Add tags..."
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-1">
        {tags.map((tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...getTagColor(tag)}
            onClick={() => onClick?.(tag)}
            onClose={() => onRemoveTag?.(tag)}
          />
        ))}
      </div>
    </Card>
  );
}