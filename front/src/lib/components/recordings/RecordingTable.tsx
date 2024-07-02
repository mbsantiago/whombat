import { useCallback, useMemo } from "react";
import { type KeyboardEvent } from "react";

import { type RecordingFilter, type RecordingUpdate } from "@/lib/api/recordings";
import Loading from "@/app/loading";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterPopover from "@/lib/components/filters/FilterMenu";
import recordingFilterDefs from "@/lib/components/filters/recordings";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import SelectedMenu from "@/lib/components/tables/SelectedMenu";
import Table from "@/lib/components/tables/Table";
import { parsePosition } from "@/lib/components/tables/TableMap";
import useRecordings from "@/lib/hooks/api/useRecordings";
import useRecordingTable from "@/lib/hooks/recordings/useRecordingTable";
import useStore from "@/app/store";

import type { Recording, Tag } from "@/lib/types";

const EDITABLE_COLUMNS = ["date", "time", "location", "tags"];

export default function RecordingTable({
  filter,
  fixed,
  getRecordingLink,
  pathFormatter,
}: {
  filter: RecordingFilter;
  fixed?: (keyof RecordingFilter)[];
  getRecordingLink?: (recording: Recording) => string;
  pathFormatter?: (path: string) => string;
}) {
  const recordings = useRecordings({ filter, fixed });

  const table = useRecordingTable({
    data: recordings.items,
    getRecordingLink,
    pathFormatter,
    onUpdate: recordings.updateRecording.mutate,
    onAddTag: recordings.addTag.mutate,
    onRemoveTag: recordings.removeTag.mutate,
  });

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
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-row justify-between space-x-4">
        <div className="flex flex-row space-x-3 basis-1/2">
          <div className="grow">
            <Search
              label="Search"
              placeholder="Search recordings..."
              value={recordings.filter.get("search") ?? ""}
              onChange={(value) =>
                recordings.filter.set("search", value as string)
              }
            />
          </div>
          <FilterPopover
            filter={recordings.filter}
            filterDef={recordingFilterDefs}
          />
        </div>
        <SelectedMenu
          selected={Object.keys(rowSelection ?? {}).length}
          onTag={handleTagSelected}
          onDelete={handleDeleteSelected}
        />
      </div>
      <FilterBar
        filter={recordings.filter}
        total={recordings.total}
        filterDef={recordingFilterDefs}
      />
      <div className="w-full">
        <div className="overflow-x-auto overflow-y-auto w-full max-h-screen rounded-md outline outline-1 outline-stone-200 dark:outline-stone-800">
          <Table table={table} onCellKeyDown={handleKeyDown} />
        </div>
      </div>
      <Pagination {...recordings.pagination} />
    </div>
  );
}

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
