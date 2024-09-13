import { useMemo } from "react";

import api from "@/app/api";
import DatasetTagsSummaryBase from "@/lib/components/datasets/DatasetTagsSummary";
import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";
import useStore from "@/app/store";

import type { Dataset } from "@/lib/types";

/**
 * Component to display a summary of tags for a dataset.
 *
 * @param dataset - The dataset for which to display tag summary.
 */
export default function DatasetTagsSummary({ dataset }: { dataset: Dataset }) {
  const filter = useMemo(() => ({ dataset: dataset }), [dataset]);
  const tagColorFn = useStore((state) => state.getTagColor);

  const {
    query: { isLoading },
    items: tags,
  } = usePagedQuery({
    name: "recording_tags",
    queryFn: api.tags.getRecordingTags,
    filter,
    pageSize: -1,
  });

  return (
    <DatasetTagsSummaryBase
      tags={tags}
      isLoading={isLoading}
      tagColorFn={tagColorFn}
    />
  );
}
