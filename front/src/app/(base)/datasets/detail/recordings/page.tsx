"use client";
import { useContext } from "react";
import useRecordingTable from "@/hooks/useRecordingTable";
import useStore from "@/store";
import useRecordings from "@/hooks/useRecordings";
import { DatasetContext } from "../context";
import { parsePosition } from "@/components/TableMap";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Search from "@/components/Search";
import Table from "@/components/Table";
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

  const table = useRecordingTable({
    data: recordings.items ?? [],
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
      <Search
        label="Search"
        placeholder="Search recordings..."
        value={recordings.filter.get("search") ?? ""}
        onChange={(value) => recordings.filter.set("search", value)}
      />
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
