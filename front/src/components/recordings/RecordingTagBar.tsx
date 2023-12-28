import { TagIcon } from "@/components/icons";
import AddTagButton from "@/components/tags/AddTagButton";
import TagComponent from "@/components/tags/Tag";
import useRecording from "@/hooks/api/useRecording";
import useStore from "@/store";

import type { Recording, Tag } from "@/types";

export default function RecordingTagBar({
  recording: data,
}: {
  recording: Recording;
}) {
  const getTagColor = useStore((state) => state.getTagColor);
  const recording = useRecording({
    uuid: data.uuid,
    recording: data,
  });

  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="inline-flex">
        <TagIcon className="inline-block mr-1 w-5 h-5 text-stone-500" />
        <span className="text-sm text-stone-400 dark:text-stone-600">
          Tags:
        </span>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {data.tags?.map((tag: Tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...getTagColor(tag)}
            onClose={() => recording.removeTag.mutate(tag)}
          />
        ))}
        <AddTagButton variant="primary" onAdd={recording.addTag.mutate} />
      </div>
    </div>
  );
}
