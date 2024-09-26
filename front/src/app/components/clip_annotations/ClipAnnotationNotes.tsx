import { useContext } from "react";
import toast from "react-hot-toast";

import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import UserContext from "@/app/contexts/user";

import ClipAnnotationNotesBase from "@/lib/components/clip_annotations/ClipAnnotationNotes";

import type { ClipAnnotation } from "@/lib/types";

export default function ClipAnnotationNotes({
  clipAnnotation,
}: {
  clipAnnotation: ClipAnnotation;
}) {
  const user = useContext(UserContext);
  const {
    data,
    addClipAnnotationNote,
    removeClipAnnotationNote,
    updateClipAnnotationNote,
  } = useClipAnnotation({
    uuid: clipAnnotation?.uuid,
    clipAnnotation,
    onAddClipAnnotationNote: () => toast.success("Note added."),
    onRemoveClipAnnotationNote: () => toast.success("Note removed."),
    onUpdateClipAnnotationNote: () => toast.success("Note updated."),
  });

  return (
    <ClipAnnotationNotesBase
      currentUser={user}
      notes={data?.notes || []}
      onCreateNote={addClipAnnotationNote.mutate}
      onUpdateNote={(note, data) =>
        updateClipAnnotationNote.mutate({ note, data })
      }
      onDeleteNote={removeClipAnnotationNote.mutate}
    />
  );
}
