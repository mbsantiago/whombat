import { useMutation } from "@tanstack/react-query";

import useRecordingTable from "@/hooks/useRecordingTable";
import useStore from "@/store";
import { parsePosition } from "@/components/tables/TableMap";
import api from "@/app/api";
import Table from "@/components/tables/Table";
import { type RecordingUpdate } from "@/api/recordings";
import { type Recording, type Tag } from "@/api/schemas";

function useRecordinTableKeyShortcuts({
  recordings,
}: {
  recordings: Recording[];
}) {
  // Access global clipboard state
  const clipboard = useStore((state) => state.clipboard);
  const copy = useStore((state) => state.copy);

  const update = useMutation({
    mutationFn: async ({
      recording,
      data,
    }: {
      recording: Recording;
      data: RecordingUpdate;
    }) => await api.recordings.update(recording, data),
  });

  const addTag = useMutation({
    mutationFn: async ({
      recording,
      tag,
    }: {
      recording: Recording;
      tag: Tag;
    }) => await api.recordings.addTag(recording, tag),
  });

  const removeTag = useMutation({
    mutationFn: async ({
      recording,
      tag,
    }: {
      recording: Recording;
      tag: Tag;
    }) => await api.recordings.removeTag(recording, tag),
  });

  // Handle for copying a value from a table cell
  const handleCopy = (column: string, value: any) => {
    copy({ context: "recordings_table", column, value });
  };

  // Handle for pasting a value into a table cell
  const handlePaste = ({
    recording,
    column,
  }: {
    recording: Recording;
    column: string;
  }) => {
    if (clipboard == null) return;
    if (typeof clipboard !== "object") return;
    if (clipboard.context !== "recordings_table") return;
    if (clipboard.column !== column) return;

    // Handle special cases
    if (column === "location") {
      const { position, isComplete } = parsePosition(clipboard.value);

      if (!isComplete) return;

      const data = {
        latitude: position.lat,
        longitude: position.lng,
      };
      update.mutate({ recording, data });
      return;
    }

    if (column === "tags") {
      try {
        (clipboard.value as Tag[]).forEach((tag: Tag) => {
          addTag.mutate({ recording, tag });
        });
      } catch {
        return;
      }
    }

    // Handle default case
    const data = { [column]: clipboard.value };
    update.mutate({ recording, data });
  };

  // Handle for deleting a value from a table cell
  const handleDelete = ({
    recording,
    column,
  }: {
    recording: Recording;
    column: string;
  }) => {
    // Handle special cases
    if (column === "location") {
      let data = { latitude: null, longitude: null };
      update.mutate({ recording, data });
      return;
    }

    if (column === "time_expansion") {
      let data = { time_expansion: 1 };
      update.mutate({ recording, data });
      return;
    }

    if (column === "tags") {
      let currentTags = recording.tags || [];
      currentTags.forEach((tag: Tag) => {
        removeTag.mutate({ recording, tag });
      });
    }

    // Handle default case
    let data = { [column]: null };
    update.mutate({ recording, data });
  };

  const handleKeyDown = ({
    event,
    data,
    row,
    value,
    column,
  }: {
    event: KeyboardEvent;
    data: Recording;
    row: number;
    value: any;
    column: string;
  }) => {
    // Copy value on ctrl+c
    if (event.key === "c" && event.ctrlKey) {
      handleCopy(column, value);
      navigator.clipboard.writeText(value);
    }

    // Paste value on ctrl+v
    if (event.key === "v" && event.ctrlKey) {
      handlePaste({ recording: data, column });
    }

    if (event.key === "Delete" || event.key === "Backspace") {
      handleDelete({ recording: data, column });
    }
  };

  return handleKeyDown;
}

export default function RecordingTable({
  recordings,
}: {
  recordings: Recording[];
}) {
  const table = useRecordingTable({ data: recordings });

  const handleKeyDown = useRecordinTableKeyShortcuts({
    recordings,
  });

  return (
    <div className="py-4 w-full">
      <div className="overflow-x-scroll overflow-y-scroll w-full max-h-screen rounded-md outline outline-1 outline-stone-200 dark:outline-stone-800">
        <Table table={table} onCellKeyDown={handleKeyDown} />
      </div>
    </div>
  );
}
