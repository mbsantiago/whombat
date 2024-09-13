import { useMemo } from "react";

import useNotes from "@/app/hooks/api/useNotes";
import DatasetNotesSummaryBase from "@/lib/components/datasets/DatasetNotesSummary";
import type { Dataset } from "@/lib/types";

export default function DatasetNotesSummary({ dataset }: { dataset: Dataset }) {
  const filter = useMemo(() => ({ dataset: dataset }), [dataset]);
  const notes = useNotes({ pageSize: -1, filter });
  return (
    <DatasetNotesSummaryBase notes={notes.items} isLoading={notes.isLoading} />
  );
}
