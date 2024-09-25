import { type ComponentProps } from "react";

import Loading from "@/app/loading";

import { TagsIcon } from "@/lib/components/icons";
import TagCount from "@/lib/components/tags/TagCount";
import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/ui/Empty";
import { H3 } from "@/lib/components/ui/Headings";

import type * as types from "@/lib/types";

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
  tags: types.TagCount[];
  isLoading?: boolean;
} & Omit<ComponentProps<typeof TagCount>, "tagCount">) {
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
      ) : tags.length === 0 ? (
        <NoTagsRecorded />
      ) : (
        <TagCount tagCount={tags} {...props} />
      )}
    </Card>
  );
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
