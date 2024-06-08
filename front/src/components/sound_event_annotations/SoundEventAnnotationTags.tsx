import { useMemo } from "react";

import Empty from "@/components/Empty";
import { H4 } from "@/components/Headings";
import { TagsIcon } from "@/components/icons";
import AddTagButton from "@/components/tags/AddTagButton";
import TagComponent from "@/components/tags/Tag";
import useStore from "@/store";

import type { TagFilter } from "@/api/tags";
import type { SoundEventAnnotation, Tag } from "@/types";

function NoTags() {
  return <Empty padding="p-2">No tags</Empty>;
}

export default function SoundEventAnnotationTags({
  soundEventAnnotation,
  tagFilter,
  onAddTag,
  onRemoveTag,
  onClickTag,
  onCreateTag,
}: {
  soundEventAnnotation: SoundEventAnnotation;
  tagFilter?: TagFilter;
  onAddTag?: (tag: Tag) => void;
  onClickTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onCreateTag?: (tag: Tag) => void;
}) {
  const tags = useMemo(
    () => soundEventAnnotation.tags || [],
    [soundEventAnnotation],
  );

  const getTagColor = useStore((state) => state.getTagColor);
  return (
    <div className="flex flex-col gap-2">
      <H4 className="text-center">
        <TagsIcon className="inline-block mr-1 w-5 h-5" />
        Sound Event Tags
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
      <div className="flex flex-row justify-center gap-4 items-center">
        <AddTagButton
          variant="primary"
          onAdd={onAddTag}
          onCreate={onCreateTag}
          filter={tagFilter}
          text="Add tags"
          placeholder="Add tags..."
        />
      </div>
    </div>
  );
}
