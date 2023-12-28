import { useMemo } from "react";

import { type Dataset, type Tag as TagType } from "@/api/schemas";
import { type RecordingTag } from "@/api/tags";
import api from "@/app/api";
import Loading from "@/app/loading";
import Card from "@/components/Card";
import { H3 } from "@/components/Headings";
import { TagsIcon } from "@/components/icons";
import Tag from "@/components/tags/Tag";
import usePagedQuery from "@/hooks/utils/usePagedQuery";
import useStore from "@/store";

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
}: {
  dataset: Dataset;
  topK?: number;
}) {
  const filter = useMemo(
    () => ({
      dataset__eq: dataset.uuid,
    }),
    [dataset.uuid],
  );

  const {
    query: { isLoading },
    items: tags,
  } = usePagedQuery({
    name: "recording_tags",
    queryFn: api.tags.getRecordingTags,
    filter,
    pageSize: -1,
  });

  const tagCount: [TagType, number][] = useMemo(() => {
    if (isLoading || tags == null) {
      return [];
    }
    return getTagCount(tags);
  }, [tags, isLoading]);

  const popularTags = tagCount.slice(0, topK);
  return (
    <Card>
      <H3>
        <TagsIcon className="inline-block mr-2 w-6 h-6 text-emerald-500" />
        Tags
      </H3>
      {isLoading ? (
        <Loading />
      ) : popularTags.length === 0 ? (
        <NoTagsRecorded />
      ) : (
        <PopularTags popularTags={popularTags} />
      )}
    </Card>
  );
}

function getTagKey(tag: TagType): string {
  return `${tag.key}-${tag.value}`;
}

/**
 * Counts the occurrences of unique tags and returns them in descending order of frequency.
 *
 * @param tags - An array of tag instances.
 * @returns An array of tuples containing tags and their respective counts.
 */
function getTagCount(tags: RecordingTag[]): [TagType, number][] {
  const tagCount = new Map<string, number>();
  const tagMap = new Map<string, TagType>();

  tags.forEach(({ tag }) => {
    const key = getTagKey(tag);
    if (!tagMap.has(key)) {
      tagMap.set(key, tag);
    }
    tagCount.set(key, (tagCount.get(key) ?? 0) + 1);
  });

  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => [tagMap.get(id) as TagType, count]);
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
 * Component to display popular tags and their respective frequencies.
 *
 * @param popularTags - An array of tuples containing tags and their counts.
 * @returns JSX element displaying popular tags.
 */
function PopularTags({ popularTags }: { popularTags: [TagType, number][] }) {
  const maxCount = popularTags[0]?.[1] ?? 0;
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <>
      <div>Top {popularTags.length} by number of recordings tagged</div>
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-1">
          <div className="pr-2 text-sm text-right text-stone-500">Tag</div>
          {popularTags.map(([tag, _]) => (
            <div key={getTagKey(tag)} className="flex flex-row justify-end">
              <Tag tag={tag} disabled {...getTagColor(tag)} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 grow">
          <div className="text-sm text-left whitespace-nowrap text-stone-500">
            Recordings
          </div>
          {popularTags.map(([tag, count]) => (
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
          ))}
        </div>
      </div>
    </>
  );
}
