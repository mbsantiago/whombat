import api from "@/app/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useCallback } from "react";

import AnnotationProjectNotesSummaryBase from "@/lib/components/annotation_projects/AnnotationProjectNotesSummary";
import type * as types from "@/lib/types";

import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

export default function AnnotationProjectNotesSummary({
  annotationProject,
}: {
  annotationProject: types.AnnotationProject;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const filter = useMemo(
    () => ({ annotationProject, issues: { eq: true } }),
    [annotationProject],
  );

  const handleClickNote = useCallback(
    (note: types.ClipAnnotationNote | types.SoundEventAnnotationNote) => {
      if (note.clip_annotation_uuid != null) {
        router.push(
          `/annotation_projects/detail/annotation/?clip_annotation_uuid=${recordingNote.recording_uuid}&${params.toString()}`,
        );
      }
    },
    [router, params],
  );

  const {
    query: { isLoading: isLoadingClipNotes },
    items: clipAnnotationNotes,
  } = usePagedQuery({
    name: "clip_annotation_notes",
    queryFn: api.notes.getClipAnnotationNotes,
    filter,
    pageSize: 10,
  });

  const {
    query: { isLoading: isLoadingSoundEventNotes },
    items: soundEventAnnotationNotes,
  } = usePagedQuery({
    name: "sound_event_annotation_notes",
    queryFn: api.notes.getSoundEventAnnotationNotes,
    filter,
    pageSize: 10,
  });

  return (
    <AnnotationProjectNotesSummaryBase
      canDelete={false}
      canResolve={false}
      isLoading={isLoadingClipNotes || isLoadingSoundEventNotes}
      clipNotes={clipAnnotationNotes}
      soundEventNotes={soundEventAnnotationNotes}
    />
  );
}
