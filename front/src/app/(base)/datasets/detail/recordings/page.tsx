"use client";
import { useContext, useMemo } from "react";

import recordingFilterDefs from "@/components/filters/recordings";
import useRecordingTable from "@/hooks/useRecordingTable";
import useStore from "@/store";
import useRecordings from "@/hooks/api/useRecordings";
import { parsePosition } from "@/components/TableMap";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Search from "@/components/Search";
import Table from "@/components/Table";
import FilterPopover from "@/components/FilterMenu";
import FilterBar from "@/components/FilterBar";
import { type Tag } from "@/api/tags";
import { DatasetContext } from "@/app/contexts";

import { RecordingsNav, SelectedMenu } from "./components";
import "./page.css";

export default function DatasetRecordings() {
  const { dataset, isLoading } = useContext(DatasetContext);

  // Fetch recordings for this dataset
  const recordings = useRecordings({
    filter: {
      dataset: dataset?.id,
    },
  });

  // Remove audio_dir prefix from recording paths
  const items = useMemo(() => {
    const prefix = dataset?.audio_dir;
    if (prefix == null) return recordings.items ?? [];
    return recordings.items.map((recording) => {
      let path = recording.path;
      if (path.startsWith(prefix)) {
        recording.path = path.slice(prefix.length);
      }
      return recording;
    });
  }, [recordings.items, dataset?.audio_dir]);

  // Create a table with fetched recordings
  const table = useRecordingTable({
    data: items,
    updateData: (recording_id, data) =>
      recordings.update.mutate({ recording_id, data }),
    addTag: (recording_id, tag) =>
      recordings.addTag.mutate({ recording_id, tag_id: tag.id }),
    removeTag: (recording_id, tag) =>
      recordings.removeTag.mutate({ recording_id, tag_id: tag.id }),
  });

  // Access global clipboard state
  const clipboard = useStore((state) => state.clipboard);
  const copy = useStore((state) => state.copy);

  // Handle for copying a value from a table cell
  const handleCopy = (column_id: string, value: string) => {
    copy({
      context: "recordings_table",
      column: column_id,
      value,
    });
  };

  // Handle for pasting a value into a table cell
  const handlePaste = ({
    row_id,
    column_id,
  }: {
    row_id: number;
    column_id: string;
  }) => {
    // Check that value in clipboard came from the same column
    // in this table
    if (clipboard == null) return;
    if (typeof clipboard !== "object") return;
    if (clipboard.context !== "recordings_table") return;
    if (clipboard.column !== column_id) return;

    // Get recording id
    let recording_id = recordings.items[row_id].id;

    // Handle special cases
    if (column_id === "location") {
      let { position, isComplete } = parsePosition(clipboard.value);

      if (!isComplete) return;

      let data = {
        latitude: position.lat,
        longitude: position.lng,
      };
      recordings.update.mutate({ recording_id, data });
      return;
    }

    if (column_id === "tags") {
      try {
        (clipboard.value as Tag[]).forEach((tag: Tag) => {
          recordings.addTag.mutate({
            recording_id,
            tag_id: tag.id,
          });
        });
      } catch {
        return;
      }
    }

    // Handle default case
    let data = { [column_id]: clipboard.value };
    recordings.update.mutate({ recording_id, data });
  };

  // Handle for deleting a value from a table cell
  const handleDelete = ({
    row_id,
    column_id,
  }: {
    row_id: number;
    column_id: string;
  }) => {
    // Get recording id
    let recording_id = recordings.items[row_id].id;

    // Handle special cases
    if (column_id === "location") {
      let data = { latitude: null, longitude: null };
      recordings.update.mutate({ recording_id, data });
      return;
    }

    if (column_id === "time_expansion") {
      let data = { time_expansion: 1 };
      recordings.update.mutate({ recording_id, data });
      return;
    }

    if (column_id === "tags") {
      let currentTags = recordings.items[row_id].tags;
      currentTags.forEach((tag: Tag) => {
        recordings.removeTag.mutate({
          recording_id,
          tag_id: tag.id,
        });
      });
    }

    // Handle default case
    let data = { [column_id]: null };
    recordings.update.mutate({ recording_id, data });
  };

  if (isLoading || recordings.query.isLoading || dataset == null) {
    return <Loading />;
  }

  return (
    <div className="container">
      <RecordingsNav dataset={dataset} />
      <div className="flex flex-row space-x-4 justify-between">
        <div className="flex flex-row basis-1/2 space-x-3">
          <div className="grow">
            <Search
              label="Search"
              placeholder="Search recordings..."
              value={recordings.filter.get("search") ?? ""}
              onChange={(value) => recordings.filter.set("search", value)}
              withButton={false}
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
      <div className="w-full py-4">
        <div className="relative w-full max-h-screen overflow-y-scroll overflow-x-scroll outline outline-1 outline-stone-200 dark:outline-stone-800 rounded-md">
          <Table
            onCopy={handleCopy}
            onPaste={handlePaste}
            onDelete={handleDelete}
            table={table}
          />
        </div>
      </div>
      <Pagination {...recordings.pagination} />
    </div>
  );
}
