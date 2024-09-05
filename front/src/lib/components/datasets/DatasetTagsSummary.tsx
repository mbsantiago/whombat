import { useMemo } from "react";

import api from "@/app/api";
import Loading from "@/app/loading";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import { TagsIcon } from "@/lib/components/icons";
import TagComponent from "@/lib/components/tags/Tag";
import InputGroup from "@/lib/components/inputs/InputGroup";
import Select from "@/lib/components/inputs/Select";
import Search from "@/lib/components/inputs/Search";
import useListWithSearch from "@/lib/hooks/lists/useListWithSearch";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";
import useStore from "@/app/store";

import type { RecordingTag } from "@/lib/api/tags";
import type { Dataset, Tag } from "@/lib/types";

/**
 * Component to display a summary of tags for a dataset.
 *
 * @param dataset - The dataset for which to display tag summary.
 * @param topK - The number of top tags to display (default is 5).
 * @returns JSX element displaying the tag summary.
 */
export default function DatasetTagsSummary({
  dataset,
  topK = 5,
  onTagClick,
}: {
  dataset: Dataset;
  topK?: number;
  onTagClick?: (tag: Tag) => void;
}) {
  const filter = useMemo(() => ({ dataset: dataset }), [dataset]);

  const {
    query: { isLoading },
    items: tags,
  } = usePagedQuery({
    name: "recording_tags",
    queryFn: api.tags.getRecordingTags,
    filter,
    pageSize: -1,
  });

  const tagCount: { tag: Tag; count: number }[] = useMemo(() => {
    if (isLoading || tags == null) {
      return [];
    }
    return getTagCount(tags);
  }, [tags, isLoading]);

  return (
    <Card>
      <H3>
        <TagsIcon className="inline-block mr-2 w-6 h-6 text-emerald-500" />
        Tags
      </H3>
      {isLoading ? (
        <Loading />
      ) : tagCount.length === 0 ? (
        <NoTagsRecorded />
      ) : (
        <TagCount tagCount={tagCount} onTagClick={onTagClick} />
      )}
    </Card>
  );
}

function getTagKey(tag: Tag): string {
  return `${tag.key}-${tag.value}`;
}

/**
 * Counts the occurrences of unique tags and returns them in descending order of frequency.
 *
 * @param tags - An array of tag instances.
 * @returns An array of tuples containing tags and their respective counts.
 */
function getTagCount(tags: RecordingTag[]): {
  tag: Tag;
  count: number;
}[] {
  const tagCount = new Map<string, number>();
  const tagMap = new Map<string, Tag>();

  tags.forEach(({ tag }) => {
    const key = getTagKey(tag);
    if (!tagMap.has(key)) {
      tagMap.set(key, tag);
    }
    tagCount.set(key, (tagCount.get(key) ?? 0) + 1);
  });

  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      tag: tagMap.get(id) as Tag,
      count,
    }));
}

/**
 * Component to display a message when no tags are recorded in the dataset.
 *
 * @returns JSX element displaying a message.
 */
function NoTagsRecorded() {
  return (
    <div>
      No tags used in this dataset. Edit the recordings metadata to add tags.
    </div>
  );
}

/**
 * Component to display tags and their respective frequencies.
 *
 * @param tagCount - An array of objects containing tags and their respective
 * counts.
 * @returns JSX element displaying tags.
 */
function TagCount({
  tagCount,
  showMax: initialShowMax = 5,
  onTagClick,
}: {
  tagCount: { tag: Tag; count: number }[];
  showMax?: number;
  onTagClick?: (tag: Tag) => void;
}) {
  const { items, setSearch, setLimit, limit } = useListWithSearch({
    options: tagCount,
    fields: ["tag.key", "tag.value"],
    limit: initialShowMax,
    shouldSort: false,
  });
  const getTagColor = useStore((state) => state.getTagColor);
  const maxCount = Math.max(...items.map(({ count }) => count));

  return (
    <>
      <p className="text-stone-500">
        Use the search bar to find a specific tag and discover how many
        recordings have been associated with it.
      </p>
      <div className="inline-flex gap-2 justify-between items-center">
        <div className="grow">
          <InputGroup name="search" label="Search">
            <Search onChange={(value) => setSearch(value as string)} />
          </InputGroup>
        </div>
        <div className="w-24">
          <InputGroup name="limit" label="Show Max">
            <Select
              selected={{ id: limit, label: limit, value: limit }}
              onChange={(value) => setLimit(value as number)}
              options={[5, 10, 20, 50, 100].map((value) => ({
                id: value,
                label: value,
                value,
              }))}
            />
          </InputGroup>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map(({ tag, count }) => (
          <>
            <div key={`${tag.key}-${tag.value}-tag`}>
              <div className="flex flex-row justify-end">
                <TagComponent
                  tag={tag}
                  disabled
                  {...getTagColor(tag)}
                  onClick={() => onTagClick?.(tag)}
                />
              </div>
            </div>
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
          </>
        ))}
      </div>
    </>
  );
}
