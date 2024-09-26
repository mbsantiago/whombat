import { type FC } from "react";

import Empty from "@/lib/components/ui/Empty";
import { DeleteIcon, TagsIcon } from "@/lib/components/icons";
import AddTagButton from "@/lib/components/tags/AddTagButton";
import TagComponent from "@/lib/components/tags/Tag";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import Button from "@/lib/components/ui/Button";
import { H4 } from "@/lib/components/ui/Headings";

import type { Tag } from "@/lib/types";
import { type Color, getTagColor } from "@/lib/utils/tags";

const _emptyTags: Tag[] = [];

export default function TagPanel({
  tags = _emptyTags,
  title = "Tags",
  onAddTag,
  onRemoveTag,
  onClickTag,
  onCreateTag,
  onClearTags,
  tagColorFn = getTagColor,
  TagSearchBar = TagSearchBarBase,
  EmptyTags = <NoTags />,
}: {
  tags: Tag[];
  title?: string;
  onAddTag?: (tag: Tag) => void;
  onClickTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onCreateTag?: (tag: Tag) => void;
  tagColorFn?: (tag: Tag) => Color;
  onClearTags?: () => void;
  TagSearchBar?: FC<TagSearchBarProps>;
  EmptyTags?: JSX.Element;
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <H4 className="text-center">
        <TagsIcon className="inline-block mr-1 w-5 h-5" />
        {title}
      </H4>
      <div className="flex flex-row flex-wrap gap-1 items-center">
        {tags.map((tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...tagColorFn(tag)}
            onClick={() => onClickTag?.(tag)}
            onClose={() => onRemoveTag?.(tag)}
          />
        ))}
        {tags.length === 0 && EmptyTags}
      </div>
      <div className="flex flex-row gap-4 justify-end items-center">
        {onClearTags != null && (
          <Button
            className="flex flex-row items-center"
            onClick={onClearTags}
            mode="text"
            variant="danger"
          >
            Clear tags <DeleteIcon className="w-5 h-5 ms-2" />
          </Button>
        )}
        <AddTagButton
          variant="primary"
          placement="bottom-end"
          onSelectTag={onAddTag}
          onCreateTag={onCreateTag}
          TagSearchBar={TagSearchBar}
        />
      </div>
    </div>
  );
}

function NoTags() {
  return <Empty outerClassName="p-2">No tags</Empty>;
}
