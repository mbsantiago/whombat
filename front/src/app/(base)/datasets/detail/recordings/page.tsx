"use client";
import { type RecordingFilter, type UpdateRecording } from "@/api/recordings";
import { useMutation } from "@tanstack/react-query";
import usePagedQuery from "@/hooks/usePagedQuery";
import useDataset from "@/hooks/useDataset";
import useFilter from "@/hooks/useFilter";
import useRecordingTable from "@/hooks/useRecordingTable";
import api from "@/app/api";
import useStore from "@/store";
import Pagination from "@/components/Pagination";
import Loading from "@/app/loading";
import Search from "@/components/Search";
import Table from "@/components/Table";
import "./page.css";

export default function DatasetRecordings() {
  const dataset = useDataset();

  const clipboard = useStore((state) => state.clipboard);
  const copy = useStore((state) => state.copy);

  const {
    filter,
    get: getFilter,
    set: setFilter,
  } = useFilter<RecordingFilter>({
    initialState: {
      dataset: dataset.data?.id,
    },
  });

  const { page, pagination, isLoading, refetch } = usePagedQuery({
    name: "dataset-recordings",
    func: api.recordings.getMany,
    pageSize: 10,
    filter,
  });

  const mutation = useMutation({
    mutationFn: ({
      recording_id,
      data,
    }: {
      recording_id: number;
      data: UpdateRecording;
    }) => {
      return api.recordings.update(recording_id, data);
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (dataset.data != null) {
    const length = dataset.data.audio_dir.length;
    page.forEach((recording) => {
      if (recording.path.startsWith(dataset.data.audio_dir)) {
        recording.path = recording.path.slice(length);
      }
    });
  }

  const updateRecording = (recording_id: number, data: UpdateRecording) => {
    mutation.mutate({ recording_id, data });
  };

  const table = useRecordingTable({
    data: page ?? [],
    updateData: updateRecording,
  });

  if (dataset.isLoading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="container">
      <Search
        label="Search"
        placeholder="Search recordings..."
        value={getFilter("search") ?? ""}
        onChange={(value) => setFilter("search", value)}
      />
      <div className="w-full py-4">
        <div className="w-full overflow-x-scroll outline outline-1 outline-stone-800 rounded-md shadow-xl">
          <Table
            onCopy={(value) => copy(value)}
            onPaste={({ row_id, column_id }) => {
              if (clipboard != null) {
                let recording_id = page[row_id].id;
                let data = { [column_id]: clipboard };
                updateRecording(recording_id, data);
              }
            }}
            onDelete={({ row_id, column_id }) => {
              let recording_id = page[row_id].id;
              let data = { [column_id]: null };
              updateRecording(recording_id, data);
            }}
            table={table}
          />
        </div>
      </div>
      <Pagination {...pagination} />
    </div>
  );
}
