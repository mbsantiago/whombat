import { useMemo } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import Empty from "@/components/Empty";
import { H4 } from "@/components/Headings";
import { DeleteIcon, TagsIcon } from "@/components/icons";
import AddTagButton from "@/components/tags/AddTagButton";
import TagComponent from "@/components/tags/Tag";
import useStore from "@/store";

import type { TagFilter } from "@/api/tags";
import type { ClipAnnotation, Tag } from "@/types";

function NoTags() {
  return (
    <Empty padding="p-2">No tags currently registered in this clip.</Empty>
  );
}

export default function ClipAnnotationTags({
  clipAnnotation,
  tagFilter,
  onAddTag,
  onRemoveTag,
  onClickTag,
  onClearTags,
  onCreateTag,
  disabled = false,
}: {
  clipAnnotation?: ClipAnnotation;
  tagFilter?: TagFilter;
  onAddTag?: (tag: Tag) => void;
  onClickTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onCreateTag?: (tag: Tag) => void;
  onClearTags?: () => void;
  disabled?: boolean;
}) {
  const tags = useMemo(() => clipAnnotation?.tags || [], [clipAnnotation]);
  const getTagColor = useStore((state) => state.getTagColor);
  return (
    <Card>
      <H4 className="text-center">
        <TagsIcon className="inline-block mr-1 w-5 h-5" />
        Clip Tags
      </H4>
      <div className="flex flex-row items-center flex-wrap gap-1">
        {tags.map((tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...getTagColor(tag)}
            onClick={() => onClickTag?.(tag)}
            onClose={() => onRemoveTag?.(tag)}
          />
        ))}
        {tags.length === 0 && <NoTags />}
      </div>
      {!disabled && (
        <div className="flex flex-row justify-end gap-4 items-center">
          <Button
            className="flex flex-row items-center"
            onClick={onClearTags}
            mode="text"
            variant="danger"
          >
            Clear tags <DeleteIcon className="ms-2 w-5 h-5" />
          </Button>
          <AddTagButton
            variant="primary"
            onAdd={onAddTag}
            onCreate={onCreateTag}
            filter={tagFilter}
            text="Add tags"
            placeholder="Add tags..."
          />
        </div>
      )}
    </Card>
  );
}
