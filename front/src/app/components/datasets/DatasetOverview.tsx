import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import useDataset from "@/app/hooks/api/useDataset";
import useNotes from "@/app/hooks/api/useNotes";

import DatasetOverviewBase from "@/lib/components/datasets/DatasetOverview";

import type { Dataset } from "@/lib/types";

export default function DatasetOverview({ dataset }: { dataset: Dataset }) {
  const params = useSearchParams();
  const router = useRouter();

  const { data, state } = useDataset({
    uuid: dataset.uuid,
    dataset,
    withState: true,
  });

  const filter = useMemo(() => ({ dataset: data, is_issue: true }), [data]);

  const issues = useNotes({
    filter,
    pageSize: 0,
  });

  const { missing } = useMemo(() => {
    if (state.isLoading || state.data == null)
      return { missing: 0, newRecordings: 0 };
    return state.data.reduce(
      (acc, recording) => {
        if (recording.state == "missing") acc.missing++;
        if (recording.state == "unregistered") acc.newRecordings++;
        return acc;
      },
      { missing: 0, newRecordings: 0 },
    );
  }, [state]);

  const handleClickRecordings = useCallback(() => {
    router.push(`/datasets/detail/recordings?${params.toString()}`);
  }, [params, router]);

  return (
    <DatasetOverviewBase
      dataset={data || dataset}
      onClickDatasetRecordings={handleClickRecordings}
      numIssues={issues.total}
      numMissing={missing}
      isLoading={issues.isLoading}
    />
  );
}
