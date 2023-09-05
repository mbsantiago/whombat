"use client";
import { useContext, useMemo } from "react";
import useRecordingTable from "@/hooks/useRecordingTable";
import useStore from "@/store";
import useRecordings from "@/hooks/useRecordings";
import { DatasetContext } from "../context";
import { parsePosition } from "@/components/TableMap";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Search from "@/components/Search";
import Table from "@/components/Table";
import FilterPopover from "@/components/FilterMenu";
import FilterBar from "@/components/FilterBar";
import { RecordingsNav, SelectedMenu } from "./components";
import recordingFilterDefs from "@/components/filters/recordings";
import "./page.css";

export default function DatasetRecordings() {
  const dataset = useContext(DatasetContext);
  const clipboard = useStore((state) => state.clipboard);
  const copy = useStore((state) => state.copy);
  const recordings = useRecordings({
    filter: {
      dataset: dataset?.query.data?.id,
    },
  });

  // Remove audio_dir prefix from recording paths
  const items = useMemo(() => {
    const prefix = dataset?.query.data?.audio_dir;
    if (prefix == null) return recordings.items ?? [];
    return recordings.items.map((recording) => {
      let path = recording.path;
      if (path.startsWith(prefix)) {
        recording.path = path.slice(prefix.length);
      }
      return recording;
    });
  }, [recordings.items, dataset?.query.data?.audio_dir]);

  const table = useRecordingTable({
    data: items,
    updateData: (recording_id, data) =>
      recordings.update.mutate({ recording_id, data }),
    addTag: (recording_id, tag) =>
      recordings.addTag.mutate({ recording_id, tag_id: tag.id }),
    removeTag: (recording_id, tag) =>
      recordings.removeTag.mutate({ recording_id, tag_id: tag.id }),
  });

  if (dataset?.query.isLoading || recordings.query.isLoading) {
    return <Loading />;
  }

  return (
    <div className="container">
      <RecordingsNav dataset={dataset?.query.data} />
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
        <div className="w-full overflow-x-scroll outline outline-1 outline-stone-200 dark:outline-stone-800 rounded-md">
          <Table
            onCopy={(value) => copy(value)}
            onPaste={({ row_id, column_id }) => {
              if (clipboard != null) {
                let recording_id = recordings.items[row_id].id;

                if (column_id === "location") {
                  let { position, isComplete } = parsePosition(clipboard);

                  if (!isComplete) return;

                  let data = {
                    latitude: position.lat,
                    longitude: position.lng,
                  };
                  recordings.update.mutate({ recording_id, data });
                  return;
                }

                let data = { [column_id]: clipboard };
                recordings.update.mutate({ recording_id, data });
              }
            }}
            onDelete={({ row_id, column_id }) => {
              let recording_id = recordings.items[row_id].id;

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

              let data = { [column_id]: null };
              recordings.update.mutate({ recording_id, data });
            }}
            table={table}
          />
        </div>
      </div>
      <Pagination {...recordings.pagination} />
    </div>
  );
}
