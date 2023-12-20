import { type Tag as TagType } from "@/api/schemas";
import { type AnnotationTag } from "@/api/schemas";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import useStore from "@/store";
import Tag from "@/components/tags/Tag";
import Button from "@/components/Button";
import { AddTagButton } from "@/components/SpectrogramTags";
import { DeleteIcon } from "@/components/icons";

export default function TaskTags({
  tags,
  onRemoveTag,
  onAddTag,
  onClearTags,
}: {
  tags: AnnotationTag[];
  onRemoveTag?: (tag: AnnotationTag) => void;
  onAddTag?: (tag: TagType) => void;
  onClearTags?: () => void;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <Card>
      <H3 className="text-center">Clip Tags</H3>
      <div className="flex flex-row flex-wrap gap-2 items-center text-stone-500">
        {tags.length === 0 && (
          <span className="inline-block text-sm">No tags...</span>
        )}
        {tags.map((taskTag) => (
          <Tag
            key={`${taskTag.tag.key}-${taskTag.tag.value}-${taskTag.created_by?.id}`}
            tag={taskTag.tag}
            {...getTagColor(taskTag.tag)}
            onClose={() => onRemoveTag?.(taskTag)}
          />
        ))}
        <div className="inline-block">
          <AddTagButton
            onAdd={onAddTag}
            onCreate={(tag) => {
              onAddTag?.(tag);
            }}
          />
        </div>
        {tags.length > 0 && (
          <Button
            mode="text"
            variant="danger"
            padding="p-1"
            onClick={onClearTags}
          >
            <DeleteIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
