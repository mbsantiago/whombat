import type { ComponentProps } from "react";

import { NotesIcon } from "@/lib/components/icons";
import NotesPanel from "@/lib/components/notes/NotesPanel";

function NoNotes() {
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col justify-center items-center p-8 w-full rounded-lg border border-dashed border-stone-500 bg-stone-300 dark:bg-stone-800">
        <span className="text-stone-700 dark:text-stone-300">
          <NotesIcon className="inline-block mr-1 w-5 h-5" /> No notes
        </span>
        <span className="text-sm text-stone-500">
          Create a note above to start a conversation about this recording.
        </span>
      </div>
    </div>
  );
}

export default function RecordingNotes(
  props: Omit<ComponentProps<typeof NotesPanel>, "title" | "EmptyNotes">,
) {
  return (
    <NotesPanel title="Recording Notes" EmptyNotes={<NoNotes />} {...props} />
  );
}
