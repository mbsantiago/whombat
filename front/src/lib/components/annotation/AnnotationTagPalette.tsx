import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import { H4 } from "@/lib/components/ui/Headings";
import { DeleteIcon, ToolsIcon } from "@/lib/components/icons";
import TagComponent from "@/lib/components/tags/Tag";
import TagSearchBar from "@/lib/components/tags/TagSearchBar";
import Tooltip from "@/lib/components/ui/Tooltip";

import type { TagFilter } from "@/lib/api/tags";
import {
  getTagColor as getTagColorDefault,
  type Color,
} from "@/lib/utils/tags";
import type { Tag } from "@/lib/types";

export default function AnnotationTagPalette({
  tags,
  tagFilter,
  onClick,
  onAddTag,
  onCreateTag,
  onRemoveTag,
  onClearTags,
  getTagColor = getTagColorDefault,
}: {
  tags: Tag[];
  tagFilter?: TagFilter;
  onCreateTag?: (tag: Tag) => void;
  onClick?: (tag: Tag) => void;
  onAddTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onClearTags?: () => void;
  getTagColor?: (tag: Tag) => Color;
}) {
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
          <ToolsIcon className="inline-block mr-1 w-5 h-5" />
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
