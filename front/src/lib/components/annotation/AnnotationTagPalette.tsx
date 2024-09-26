import { FC } from "react";

import { DeleteIcon, ToolsIcon } from "@/lib/components/icons";
import TagComponent from "@/lib/components/tags/Tag";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import { H4 } from "@/lib/components/ui/Headings";
import Tooltip from "@/lib/components/ui/Tooltip";

import type { Tag } from "@/lib/types";
import { type Color, getTagColor } from "@/lib/utils/tags";

export default function AnnotationTagPalette({
  tags,
  onClick,
  onRemoveTag,
  onClearTags,
  tagColorFn = getTagColor,
  TagSearchBar = TagSearchBarBase,
  ...props
}: {
  tags: Tag[];
  onClick?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onClearTags?: () => void;
  tagColorFn?: (tag: Tag) => Color;
  TagSearchBar?: FC<TagSearchBarProps>;
} & TagSearchBarProps) {
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
          <TagSearchBar placement="bottom-end" {...props} />
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-1">
        {tags.map((tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...tagColorFn(tag)}
            onClick={() => onClick?.(tag)}
            onClose={() => onRemoveTag?.(tag)}
          />
        ))}
      </div>
    </Card>
  );
}
