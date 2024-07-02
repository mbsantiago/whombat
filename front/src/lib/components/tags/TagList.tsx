import Button from "@/components/Button";
import Search from "@/components/inputs/Search";
import TagComponent from "@/components/tags/Tag";
import useListWithSearch from "@/lib/hooks/lists/useListWithSearch";
import useStore from "@/app/store";

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
