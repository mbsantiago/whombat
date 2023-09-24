import { type Tag as TagType } from "@/api/tags";
import { type TaskTag } from "@/api/tasks";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import useStore from "@/store";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import { AddTagButton } from "@/components/SpectrogramTags";
import { DeleteIcon } from "@/components/icons";

export default function TaskTags({
  tags,
  onRemoveTag,
  onAddTag,
  onClearTags,
}: {
  tags: TaskTag[];
  onRemoveTag?: (tag: TaskTag) => void;
  onAddTag?: (tag: TagType) => void;
  onClearTags?: () => void;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <Card>
      <H3 className="text-center">Clip Tags</H3>
      <div className="flex flex-row flex-wrap items-center gap-2 text-stone-500">
        {tags.length === 0 && (
          <span className="inline-block text-sm">No tags...</span>
        )}
        {tags.map((taskTag) => (
          <Tag
            key={taskTag.id}
            tag={taskTag.tag}
            withClose={true}
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
          <Button mode="text" variant="danger" padding="p-1" onClick={onClearTags}>
            <DeleteIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
