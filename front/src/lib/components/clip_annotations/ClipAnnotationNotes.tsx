import { ComponentProps } from "react";

import Empty from "@/lib/components/ui/Empty";
import NotesPanel from "@/lib/components/notes/NotesPanel";

export default function ClipAnnotationNotes(
  props: Omit<ComponentProps<typeof NotesPanel>, "title" | "EmptyNotes">,
) {
  return <NotesPanel title="Clip Notes" EmptyNotes={<NoNotes />} {...props} />;
}

function NoNotes() {
  return <Empty outerClassName="p-2">No notes</Empty>;
}
