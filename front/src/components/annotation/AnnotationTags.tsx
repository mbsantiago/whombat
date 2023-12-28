import { useMemo } from "react";

import Button from "@/components/Button";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { DeleteIcon } from "@/components/icons";
import Tag from "@/components/tags/Tag";
import TagSearchBar from "@/components/tags/TagSearchBar";
import Tooltip from "@/components/Tooltip";
import useStore from "@/store";

import type { AnnotationProject, Tag as TagType } from "@/types";

export default function AnnotationProjectTags({
  tags,
  project,
  onClick,
  onAddTag,
  onRemoveTag,
  onClearTags,
}: {
  tags: TagType[];
  project: AnnotationProject;
  onClick?: (tag: TagType) => void;
  onAddTag?: (tag: TagType) => void;
  onRemoveTag?: (tag: TagType) => void;
  onClearTags?: () => void;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  const filter = useMemo(
    () => ({ annotation_project__eq: project.uuid }),
    [project.uuid],
  );
  return (
    <Card>
      <H3 className="text-center">
        <Tooltip
          tooltip={
            <div className="w-48 text-center">
              The tags selected here will be automatically attached to newly
              created annotations.
            </div>
          }
          placement="top"
        >
          <span className="cursor-help">Current Tags</span>
        </Tooltip>
      </H3>
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
            initialFilter={filter}
            placeholder="Add tags..."
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-1">
        {tags.map((tag) => (
          <Tag
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
