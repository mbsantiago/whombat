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

export default function DatasetRecordings({ dataset }: { dataset: Dataset }) {
  const filter = useMemo(() => ({ dataset__eq: dataset.uuid }), [dataset.uuid]);
  return <RecordingTable filter={filter} fixed={["dataset__eq"]} />;
}
