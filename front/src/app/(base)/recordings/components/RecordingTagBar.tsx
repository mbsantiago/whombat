import { type Recording } from "@/api/recordings";
import { type Tag as TagType } from "@/api/tags";
import useStore from "@/store";
import { TagIcon } from "@/components/icons";
import Tag from "@/components/Tag";

export default function RecordingTagBar({
  recording,
  label = "Tags",
}: {
  recording: Recording;
  label?: string;
}) {
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="inline-flex">
        <TagIcon className="w-5 h-5 text-stone-500 inline-block mr-1" />
        <span className="text-stone-400 dark:text-stone-600 text-sm">
          {label}:
        </span>
      </div>
      <div className="flex flex-row flex-wrap gap-2">
        {recording.tags.map((tag: TagType) => (
          <Tag key={tag.id} tag={tag} {...getTagColor(tag)} />
        ))}
      </div>
    </div>
  );
}
