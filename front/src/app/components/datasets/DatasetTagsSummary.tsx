import { useRouter } from "next/navigation";
import { useMemo } from "react";

import api from "@/app/api";
import useStore from "@/app/store";

import DatasetTagsSummaryBase from "@/lib/components/datasets/DatasetTagsSummary";

import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type { Dataset } from "@/lib/types";

/**
 * Component to display a summary of tags for a dataset.
 *
 * @param dataset - The dataset for which to display tag summary.
 */
export default function DatasetTagsSummary({ dataset }: { dataset: Dataset }) {
  const router = useRouter();

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
      onTagClick={(tag) =>
        router.push(
          `recordings/?dataset_uuid=${dataset.uuid}&tag__key=${tag.key}&tag__value=${tag.value}`,
        )
      }
    />
  );
}
