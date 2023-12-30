import Button from "@/components/Button";
import Card from "@/components/Card";
import { H4 } from "@/components/Headings";
import { DeleteIcon, ToolsIcon } from "@/components/icons";
import TagComponent from "@/components/tags/Tag";
import TagSearchBar from "@/components/tags/TagSearchBar";
import Tooltip from "@/components/Tooltip";
import useStore from "@/store";

import type { TagFilter } from "@/api/tags";
import type { Tag } from "@/types";

export default function AnnotationTagPalette({
  tags,
  tagFilter,
  onClick,
  onAddTag,
  onRemoveTag,
  onClearTags,
}: {
  tags: Tag[];
  tagFilter?: TagFilter;
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
            onCreate={onAddTag}
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
