// TODO: Remove this import
import useStore from "@/app/store";
import Search from "@/lib/components/inputs/Search";
import TagComponent from "@/lib/components/tags/Tag";
import Button from "@/lib/components/ui/Button";
import useListWithSearch from "@/lib/hooks/lists/useListWithSearch";
import type { Tag } from "@/lib/types";

export default function TagList({
  tags,
  onClick,
  onRemove,
  showMax = 10,
}: {
  tags: Tag[];
  onClick?: (tag: Tag) => void;
  onRemove?: (tag: Tag) => void;
  showMax?: number;
}) {
  const { items, setSearch, setLimit, hasMore } = useListWithSearch({
    options: tags,
    fields: ["key", "value"],
    limit: showMax,
  });
  const getTagColor = useStore((state) => state.getTagColor);
  return (
    <div className="flex flex-col gap-4">
      <Search onChange={(value) => setSearch(value as string)} />
      <div className="flex overflow-hidden flex-col gap-2 w-full">
        {tags.length === 0 && <p className="text-stone-500">No tags</p>}
        {items.length === 0 && tags.length > 0 && (
          <p className="text-stone-500">No tags found</p>
        )}
        {items.map((tag) => (
          <TagComponent
            key={`${tag.key}-${tag.value}`}
            tag={tag}
            {...getTagColor(tag)}
            onClick={onClick && (() => onClick(tag))}
            onClose={onRemove && (() => onRemove(tag))}
          />
        ))}
        {hasMore && (
          <Button
            mode="text"
            variant="primary"
            className="w-full"
            onClick={() => setLimit((limit) => limit + 10)}
          >
            Show more
          </Button>
        )}
      </div>
    </div>
  );
}
