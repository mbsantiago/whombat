import Empty from "@/lib/components/Empty";
import NotesPanel from "@/lib/components/notes/NotesPanel";
import { ComponentProps } from "react";

export default function ClipAnnotationNotes(
  props: Omit<ComponentProps<typeof NotesPanel>, "title" | "EmptyNotes">,
) {
  return <NotesPanel title="Clip Notes" EmptyNotes={<NoNotes />} {...props} />;
}

function NoNotes() {
  return <Empty padding="p-2">No notes</Empty>;
}
