import Loading from "@/app/loading";
import Empty from "@/lib/components/Empty";
import { TagsIcon } from "@/lib/components/icons";
import TagCount from "@/lib/components/tags/TagCount";
import Card from "@/lib/components/ui/Card";
import { H3 } from "@/lib/components/ui/Headings";
import type { RecordingTag, Tag } from "@/lib/types";
import { getTagKey } from "@/lib/utils/tags";
import { type ComponentProps, useMemo } from "react";

/**
 * Component to display a summary of tags for a dataset.
 *
 * @param dataset - The dataset for which to display tag summary.
 * @param topK - The number of top tags to display (default is 5).
 * @returns JSX element displaying the tag summary.
 */
export default function DatasetTagsSummary({
  tags,
  isLoading = false,
  ...props
}: {
  tags: RecordingTag[];
  isLoading?: boolean;
} & Omit<ComponentProps<typeof TagCount>, "tagCount">) {
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
      <p className="text-stone-500">
        Tags used in this dataset and their respective frequencies.
      </p>
      {isLoading ? (
        <Loading />
      ) : tagCount.length === 0 ? (
        <NoTagsRecorded />
      ) : (
        <TagCount tagCount={tagCount} {...props} />
      )}
    </Card>
  );
}

/**
 * Counts the occurrences of unique tags and returns them in descending order
 * of frequency.
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
    <Empty>
      No tags used in this dataset. Edit the recordings metadata to add tags.
    </Empty>
  );
}
