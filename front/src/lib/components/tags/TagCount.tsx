import ListSearch from "@/lib/components/lists/ListSearch";
import TagComponent from "@/lib/components/tags/Tag";
import useListWithSearch from "@/lib/hooks/lists/useListWithSearch";
import type { Tag } from "@/lib/types";
import { type Color, getTagColor } from "@/lib/utils/tags";
import { getTagKey } from "@/lib/utils/tags";
import { useMemo } from "react";

/**
 * Component to display tags and their respective frequencies.
 *
 * @param tagCount - An array of objects containing tags and their respective
 * counts.
 * @returns JSX element displaying tags.
 */
export default function TagCount({
  tagCount,
  showMax: initialShowMax = 5,
  onTagClick,
  tagColorFn = getTagColor,
}: {
  tagCount: { tag: Tag; count: number }[];
  showMax?: number;
  onTagClick?: (tag: Tag) => void;
  tagColorFn?: (tag: Tag) => Color;
}) {
  const sortedTagCount = useMemo(() => {
    return tagCount.sort((a, b) => b.count - a.count);
  }, [tagCount]);

  const { items, setSearch, setLimit, limit } = useListWithSearch<{
    tag: Tag;
    count: number;
  }>({
    options: sortedTagCount,
    fields: ["tag.key", "tag.value"],
    limit: initialShowMax,
    shouldSort: false,
    threshold: 0.3,
  });

  const maxCount = Math.max(...items.map(({ count }) => count));

  return (
    <div className="flex flex-col w-full">
      <ListSearch
        limit={limit}
        onChangeLimit={setLimit}
        onChangeSearch={setSearch}
      />
      <div className="grid grid-cols-2 gap-2 w-full">
        {items.map(({ tag, count }) => (
          <>
            <div
              key={getTagKey(tag)}
              className="flex flex-row items-center m-px h-6"
            >
              <div className="flex overflow-hidden flex-row w-full h-4 rounded-full bg-stone-200 dark:bg-stone-700">
                <div
                  className="flex flex-row justify-center items-center h-4 text-blue-100 bg-blue-600 dark:text-blue-900 dark:bg-blue-400"
                  style={{ width: `${(100 * count) / maxCount}%` }}
                >
                  {count}
                </div>
              </div>
            </div>
            <div key={`${getTagKey(tag)}-tag`}>
              <div className="flex flex-row justify-start">
                <TagComponent
                  tag={tag}
                  disabled
                  {...tagColorFn(tag)}
                  onClick={() => onTagClick?.(tag)}
                />
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
