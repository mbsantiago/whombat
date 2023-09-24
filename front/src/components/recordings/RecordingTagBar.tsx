import { type Tag as TagType } from "@/api/tags";
import useStore from "@/store";
import { TagIcon } from "@/components/icons";
import Tag from "@/components/Tag";

export default function RecordingTagBar({
  tags,
  label = "Tags",
  onClick,
}: {
  tags: TagType[]
  label?: string;
  onClick?: (tag: TagType) => void;
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
        {tags.map((tag: TagType) => (
          <Tag
            key={tag.id}
            tag={tag}
            {...getTagColor(tag)}
            onClick={() => onClick?.(tag)}
          />
        ))}
      </div>
    </div>
  );
}
