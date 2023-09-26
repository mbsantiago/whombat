import { useMemo } from "react";

import useStore from "@/store";
import { type Tag as TagType } from "@/api/tags";
import { DeleteIcon } from "@/components/icons";
import { type AnnotationProject } from "@/api/annotation_projects";
import Tooltip from "@/components/Tooltip";
import Tag from "@/components/Tag";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { H3 } from "@/components/Headings";
import TagSearchBar from "@/components/TagSearchBar";

export default function AnnotationTags({
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

  const filter = useMemo(() => ({ project__eq: project.id }), [project.id]);
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
      <div className="flex flex-row w-full gap-1">
        <Tooltip tooltip="Clear tags" placement="top">
          <Button onClick={onClearTags} mode="text" variant="danger">
            <DeleteIcon className="h-5 w-5" />
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
            key={tag.id}
            tag={tag}
            withClose={true}
            {...getTagColor(tag)}
            onClick={() => onClick?.(tag)}
            onClose={() => onRemoveTag?.(tag)}
          />
        ))}
      </div>
    </Card>
  );
}
