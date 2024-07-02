import { useCallback, useMemo } from "react";

import RecordingTable from "@/lib/components/recordings/RecordingTable";

import type { Dataset, Recording } from "@/lib/types";

export default function DatasetRecordings({
  dataset,
  getRecordingLink: getRecordingLinkFn,
}: {
  dataset: Dataset;
  getRecordingLink?: (recording: Recording) => string;
}) {
  const pathFormatter = useCallback(
    (path: string) => {
      const prefix = dataset.audio_dir;
      if (prefix == null) return path;
      if (path.startsWith(prefix)) {
        return path.slice(prefix.length);
      }
      return path;
    },
    [dataset.audio_dir],
  );

  const getRecordingLink = useMemo(() => {
    if (getRecordingLinkFn == null) return undefined;

    return (recording: Recording) => {
      const url = getRecordingLinkFn(recording);
      return `${url}&dataset_uuid=${dataset.uuid}`;
    };
  }, [getRecordingLinkFn, dataset.uuid]);
  const filter = useMemo(() => ({ dataset }), [dataset]);

  return (
    <RecordingTable
      filter={filter}
      fixed={["dataset"]}
      getRecordingLink={getRecordingLink}
      pathFormatter={pathFormatter}
    />
  );
}
