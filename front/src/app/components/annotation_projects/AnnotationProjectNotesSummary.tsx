import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import Note from "@/app/components/notes/Note";

import api from "@/app/api";

import AnnotationProjectNotesSummaryBase from "@/lib/components/annotation_projects/AnnotationProjectNotesSummary";

import usePagedQuery from "@/lib/hooks/utils/usePagedQuery";

import type * as types from "@/lib/types";

export default function AnnotationProjectNotesSummary({
  annotationProject,
}: {
  annotationProject: types.AnnotationProject;
}) {
  const filter = useMemo(
    () => ({ annotation_project: annotationProject, issues: { eq: true } }),
    [annotationProject],
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
      isLoading={isLoadingClipNotes || isLoadingSoundEventNotes}
      clipNotes={clipAnnotationNotes}
      soundEventNotes={soundEventAnnotationNotes}
      SoundEventAnnotationNote={SoundEventAnnotationNote}
      ClipAnnotationNote={ClipAnnotationNote}
    />
  );
}

function SoundEventAnnotationNote({
  soundEventAnnotationNote,
}: {
  soundEventAnnotationNote: types.SoundEventAnnotationNote;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(async () => {
    const annotationTask = await api.soundEventAnnotations.getAnnotationTask(
      soundEventAnnotationNote.sound_event_annotation_uuid,
    );
    router.push(
      `/annotation_projects/detail/annotation/?annotation_task_uuid=${annotationTask.uuid}&${params.toString()}`,
    );
  }, [router, params, soundEventAnnotationNote.sound_event_annotation_uuid]);

  return (
    <Note
      noteType="Sound Event Note"
      note={soundEventAnnotationNote.note}
      canDelete={false}
      canResolve={false}
      onClickNote={handleClick}
    />
  );
}

function ClipAnnotationNote({
  clipAnnotationNote,
}: {
  clipAnnotationNote: types.ClipAnnotationNote;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const handleClick = useCallback(async () => {
    const annotationTask = await api.clipAnnotations.getAnnotationTask(
      clipAnnotationNote.clip_annotation_uuid,
    );
    router.push(
      `/annotation_projects/detail/annotation/?annotation_task_uuid=${annotationTask.uuid}&${params.toString()}`,
    );
  }, [router, params, clipAnnotationNote.clip_annotation_uuid]);

  return (
    <Note
      noteType="Clip Note"
      note={clipAnnotationNote.note}
      canDelete={false}
      canResolve={false}
      onClickNote={handleClick}
    />
  );
}
