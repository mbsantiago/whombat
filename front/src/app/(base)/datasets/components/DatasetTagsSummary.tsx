import { useMemo } from "react";
import Card from "@/components/Card";
import Tag from "@/components/Tag";
import { H3 } from "@/components/Headings";
import { type Tag as TagType } from "@/api/tags";
import { type RecordingTag } from "@/api/recordings";
import Loading from "@/app/loading";
import useStore from "@/store";
import { TagsIcon } from "@/components/icons";

function getTagCount(tags: RecordingTag[]): [TagType, number][] {
  const tagCount = new Map<number, number>();
  const tagMap = new Map<number, TagType>();

  tags.forEach(({ tag }) => {
    if (!tagMap.has(tag.id)) {
      tagMap.set(tag.id, tag);
    }
    tagCount.set(tag.id, (tagCount.get(tag.id) ?? 0) + 1);
  });

  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => [tagMap.get(id) as TagType, count]);
}

function NoTagsRecorded() {
  return (
    <div>
      No tags used in this dataset. Edit the recordings metadata to add tags.
    </div>
  );
}

function PopularTags({ popularTags }: { popularTags: [TagType, number][] }) {
  const maxCount = popularTags[0]?.[1] ?? 0;
  const getTagColor = useStore((state) => state.getTagColor);

  return (
    <>
      <div>Top {popularTags.length} by number of recordings tagged</div>
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-stone-500 text-right pr-2">Tag</div>
          {popularTags.map(([tag, _]) => (
            <div className="flex-row flex justify-end">
              <Tag tag={tag} disabled {...getTagColor(tag)} />
            </div>
          ))}
        </div>
        <div className="grow flex flex-col gap-1">
          <div className="text-sm text-stone-500 whitespace-nowrap text-left">
            Recordings
          </div>
          {popularTags.map(([_, count]) => (
            <div className="flex flex-row items-center h-6 m-px">
              <div className="w-full flex flex-row h-4 overflow-hidden bg-stone-200 rounded-full dark:bg-stone-700">
                <div
                  className="flex flex-row items-center justify-center h-4 bg-blue-600 dark:bg-blue-400 text-blue-100 dark:text-blue-900"
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

export default function DatasetTagsSummary({
  tags,
  isLoading = false,
  topK = 5,
}: {
  tags: RecordingTag[];
  isLoading?: boolean;
  topK?: number;
}) {
  const tagCount: [TagType, number][] = useMemo(() => {
    return getTagCount(tags);
  }, [tags]);

  const popularTags = tagCount.slice(0, topK);
  return (
    <Card>
      <H3>
        <TagsIcon className="h-6 w-6 inline-block text-emerald-500 mr-2" />
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
