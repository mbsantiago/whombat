import { useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type KeyboardEvent } from "react";

import recordingFilterDefs from "@/components/filters/recordings";
import useRecordings from "@/hooks/api/useRecordings";
import useRecordingTable from "@/hooks/useRecordingTable";
import useStore from "@/store";
import { parsePosition } from "@/components/tables/TableMap";
import api from "@/app/api";
import SelectedMenu from "@/components/tables/SelectedMenu";
import Pagination from "@/components/lists/Pagination";
import Loading from "@/app/loading";
import Search from "@/components/inputs/Search";
import FilterPopover from "@/components/filters/FilterMenu";
import FilterBar from "@/components/filters/FilterBar";
import Table from "@/components/tables/Table";
import {
  type RecordingUpdate,
  type RecordingFilter,
  type RecordingPage,
} from "@/api/recordings";
import { type Recording, type Tag } from "@/api/schemas";

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

export default function RecordingTable({
  filter,
  fixed,
  getRecordingLink,
}: {
  filter: RecordingFilter;
  fixed?: (keyof RecordingFilter)[];
  getRecordingLink?: (recording: Recording) => string;
}) {
  const client = useQueryClient();
  const recordings = useRecordings({ filter, fixed });

  const updater = useCallback(
    (
      updatedRecording: Recording,
      {
        index,
      }: {
        index: number;
      },
    ) => {
      client.setQueryData(recordings.queryKey, (old: RecordingPage) => {
        return {
          ...old,
          items: old.items.map((recording, other) => {
            if (other !== index) return recording;
            return updatedRecording;
          }),
        };
      });
    },
    [client, recordings.queryKey],
  );

  const updateRecording = useMutation({
    mutationFn: async ({
      recording,
      data,
    }: {
      recording: Recording;
      data: RecordingUpdate;
      index: number;
    }) => await api.recordings.update(recording, data),
    onSuccess: updater,
  });

  const addTag = useMutation({
    mutationFn: async ({
      recording,
      tag,
    }: {
      recording: Recording;
      tag: Tag;
      index: number;
    }) => await api.recordings.addTag(recording, tag),
    onSuccess: updater,
  });

  const removeTag = useMutation({
    mutationFn: async ({
      recording,
      tag,
    }: {
      recording: Recording;
      tag: Tag;
      index: number;
    }) => await api.recordings.removeTag(recording, tag),
    onSuccess: updater,
  });

  const table = useRecordingTable({
    data: recordings.items,
    getRecordingLink,
    onUpdate: updateRecording.mutate,
    onAddTag: addTag.mutate,
    onRemoveTag: removeTag.mutate,
  });

  const handleKeyDown = useRecordingTableKeyShortcuts({
    onUpdate: updateRecording.mutate,
    onAddTag: addTag.mutate,
    onRemoveTag: removeTag.mutate,
  });

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
              onChange={(value) => recordings.filter.set("search", value)}
            />
          </div>
          <FilterPopover
            filter={recordings.filter}
            filterDefs={recordingFilterDefs}
          />
        </div>
        <SelectedMenu
          selected={Object.keys(table.options.state.rowSelection ?? {}).length}
        />
      </div>
      <FilterBar filter={recordings.filter} total={recordings.total} />
      <div className="w-full">
        <div className="overflow-x-scroll overflow-y-scroll w-full max-h-screen rounded-md outline outline-1 outline-stone-200 dark:outline-stone-800">
          <Table table={table} onCellKeyDown={handleKeyDown} />
        </div>
      </div>
      <Pagination {...recordings.pagination} />
    </div>
  );
}
