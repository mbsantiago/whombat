import NotesPanel from "@/lib/components/notes/NotesPanel";
import type { SoundEventAnnotation } from "@/lib/types";
import { useMemo } from "react";
import type { ComponentProps } from "react";

export default function SoundEventAnnotationNotes({
  soundEventAnnotation,
  ...props
}: {
  soundEventAnnotation: SoundEventAnnotation;
} & Omit<ComponentProps<typeof NotesPanel>, "title" | "notes">) {
  const notes = useMemo(
    () => soundEventAnnotation.notes || [],
    [soundEventAnnotation],
  );
  return <NotesPanel title="Sound Event Notes" notes={notes} {...props} />;
}
