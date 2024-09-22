import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import api from "@/app/api";

import DatasetNotesSummaryBase from "@/lib/components/datasets/DatasetNotesSummary";

import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type * as types from "@/lib/types";

export default function DatasetNotesSummary({
  dataset,
}: {
  dataset: types.Dataset;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const filter: types.RecordingNoteFilter = useMemo(
    () => ({ dataset, issues: { eq: true } }),
    [dataset],
  );

  const handleClickNote = useCallback(
    (recordingNote: types.RecordingNote) => {
      router.push(
        `/datasets/detail/recordings/detail/?recording_uuid=${recordingNote.recording_uuid}&${params.toString()}`,
      );
    },
    [router, params],
  );

  const {
    query: { isLoading },
    items: notes,
  } = usePagedQuery({
    name: "recording_notes",
    queryFn: api.notes.getRecordingNotes,
    filter,
    pageSize: -1,
  });

  return (
    <DatasetNotesSummaryBase
      notes={notes}
      isLoading={isLoading}
      onClickNote={handleClickNote}
    />
  );
}
