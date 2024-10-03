import { useMemo } from "react";
import type { ComponentProps } from "react";

import NotesPanel from "@/lib/components/notes/NotesPanel";

import type { SoundEventAnnotation } from "@/lib/types";

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
