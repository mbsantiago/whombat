import { useCallback, useMemo } from "react";
import { parsePosition } from "@/lib/components/tables/TableMap";
import useRecordings from "@/app/hooks/api/useRecordings";
import useRecordingTable from "@/lib/hooks/recordings/useRecordingTable";
import useStore from "@/app/store";

import Loading from "@/app/loading";
import RecordingTable from "@/lib/components/recordings/RecordingTable";

import { type RecordingUpdate } from "@/lib/api/recordings";
import type { Recording, Tag, Dataset } from "@/lib/types";

const EDITABLE_COLUMNS = ["date", "time", "location", "tags"];

function useRecordingTableKeyShortcuts({
  onUpdate,
  onAddTag,
  onRemoveTag,
}: {
  onUpdate: (data: {
    recording: Recording;
    data: RecordingUpdate;
    index: number;
  }) => void;
  onAddTag: (data: { recording: Recording; tag: Tag; index: number }) => void;
  onRemoveTag: (data: {
    recording: Recording;
    tag: Tag;
    index: number;
  }) => void;
}) {
  const clipboard = useStore((state) => state.clipboard);
  const copy = useStore((state) => state.copy);

  const handleKeyDown = useMemo(() => {
    // Handle for copying a value from a table cell
    const handleCopy = (column: string, value: any) => {
      copy({ context: "recordings_table", column, value });
    };

    // Handle for pasting a value into a table cell
    const handlePaste = ({
      recording,
      column,
      value,
      row,
    }: {
      recording: Recording;
      column: string;
      value: any;
      row: number;
    }) => {
      // Handle special cases
      if (column === "location") {
        const { position, isComplete } = parsePosition(value);
        if (!isComplete) return;

        const data = {
          latitude: position.lat,
          longitude: position.lng,
        };
        onUpdate({ recording, data, index: row });
        return;
      }

      if (column === "tags") {
        try {
          (value as Tag[]).forEach((tag: Tag) => {
            onAddTag({ recording, tag, index: row });
          });
        } catch {
          return;
        }
      }

      // Handle default case
      const data = { [column]: value };
      onUpdate({ recording, data, index: row });
    };

    // Handle for deleting a value from a table cell
    const handleDelete = ({
      recording,
      column,
      row,
    }: {
      recording: Recording;
      column: string;
      row: number;
    }) => {
      // Handle special cases
      if (column === "location") {
        let data = { latitude: null, longitude: null };
        onUpdate({ recording, data, index: row });
        return;
      }

      if (column === "time_expansion") {
        let data = { time_expansion: 1 };
        onUpdate({ recording, data, index: row });
        return;
      }

      if (column === "tags") {
        let currentTags = recording.tags || [];
        currentTags.forEach((tag: Tag) => {
          onRemoveTag({ recording, tag, index: row });
        });
      }

      // Handle default case
      let data = { [column]: null };
      onUpdate({ recording, data, index: row });
    };

    return ({
      event,
      data,
      value,
      column,
      row,
    }: {
      event: KeyboardEvent;
      data: Recording;
      row: number;
      value: any;
      column: string;
    }) => {
      if (!EDITABLE_COLUMNS.includes(column)) return;

      // Copy value on ctrl+c
      if (event.key === "c" && event.ctrlKey) {
        handleCopy(column, value);
        navigator.clipboard.writeText(value);
      }

      // Paste value on ctrl+v
      if (event.key === "v" && event.ctrlKey) {
        if (clipboard == null) return;
        if (typeof clipboard !== "object") return;
        if (clipboard.context !== "recordings_table") return;
        if (clipboard.column !== column) return;
        const value = clipboard.value;
        handlePaste({ recording: data, column, value, row });
      }

      // Delete value on delete or backspace
      if (event.key === "Delete" || event.key === "Backspace") {
        handleDelete({ recording: data, column, row });
      }
    };
  }, [clipboard, onUpdate, onAddTag, onRemoveTag, copy]);

  return handleKeyDown;
}

export default function DatasetRecordings({
  dataset,
  getRecordingLink: getRecordingLinkFn,
}: {
  dataset: Dataset;
  getRecordingLink?: (recording: Recording) => string;
}) {
  const pathFormatter = useCallback(
    (path: string) => {
      const prefix = dataset.audio_dir;
      if (prefix == null) return path;
      if (path.startsWith(prefix)) {
        return path.slice(prefix.length);
      }
      return path;
    },
    [dataset.audio_dir],
  );

  const getRecordingLink = useMemo(() => {
    if (getRecordingLinkFn == null) return undefined;

    return (recording: Recording) => {
      const url = getRecordingLinkFn(recording);
      return `${url}&dataset_uuid=${dataset.uuid}`;
    };
  }, [getRecordingLinkFn, dataset.uuid]);

  const filter = useMemo(() => ({ dataset }), [dataset]);

  const recordings = useRecordings({ filter, fixed: ["dataset"] });

  const handleKeyDown = useRecordingTableKeyShortcuts({
    onUpdate: recordings.updateRecording.mutate,
    onAddTag: recordings.addTag.mutate,
    onRemoveTag: recordings.removeTag.mutate,
  });

  const { rowSelection } = table.options.state;
  const handleTagSelected = useCallback(
    async (tag: Tag) => {
      if (rowSelection == null) return;
      for (const index of Object.keys(rowSelection)) {
        if (!rowSelection[index]) continue;
        const recording = recordings.items[Number(index)];
        await recordings.addTag.mutateAsync({
          recording,
          tag,
          index: Number(index),
        });
      }
    },
    [rowSelection, recordings.addTag, recordings.items],
  );

  const handleDeleteSelected = useCallback(async () => {
    if (rowSelection == null) return;
    for (const index of Object.keys(rowSelection)) {
      if (!rowSelection[index]) continue;
      const recording = recordings.items[Number(index)];
      await recordings.deleteRecording.mutateAsync({
        recording,
        index: Number(index),
      });
    }
  }, [rowSelection, recordings.items, recordings.deleteRecording]);

  if (recordings.isLoading || recordings.data == null) {
    return <Loading />;
  }

  return (
    <RecordingTable
      filter={filter}
      fixed={["dataset"]}
      getRecordingLink={getRecordingLink}
      pathFormatter={pathFormatter}
    />
  );
}
