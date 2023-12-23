import { useMemo } from "react";

import RecordingTable from "@/components/recordings/RecordingTable";
import { type Dataset, type Recording } from "@/api/schemas";

function fixRecordingPath(recording: Recording, dataset: Dataset): Recording {
  const path = recording.path;
  const prefix = dataset.audio_dir;
  if (prefix == null) return recording;
  if (path.startsWith(prefix)) {
    return { ...recording, path: path.slice(prefix.length) };
  }
  return recording;
}

export default function DatasetRecordings({
  dataset,
  getRecordingLink: getRecordingLinkFn,
}: {
  dataset: Dataset;
  getRecordingLink?: (recording: Recording) => string;
}) {
  const getRecordingLink = useMemo(() => {
    if (getRecordingLinkFn == null) return undefined;

    return (recording: Recording) => {
      const url = getRecordingLinkFn(recording);
      return `${url}&dataset_uuid=${dataset.uuid}`;
    };
  }, [getRecordingLinkFn, dataset.uuid]);
  const filter = useMemo(() => ({ dataset__eq: dataset.uuid }), [dataset.uuid]);
  return (
    <RecordingTable
      filter={filter}
      fixed={["dataset__eq"]}
      getRecordingLink={getRecordingLink}
    />
  );
}
