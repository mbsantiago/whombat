import TagSearchBar from "@/app/components/tags/TagSearchBar";
import useRecordings from "@/app/hooks/api/useRecordings";
import Loading from "@/app/loading";
import useStore from "@/app/store";
import { type RecordingUpdate } from "@/lib/api/recordings";
import RecordingTable from "@/lib/components/recordings/RecordingTable";
import { parsePosition } from "@/lib/components/tables/TableMap";
import type { Dataset, Recording, Tag } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { KeyboardEvent } from "react";

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
      event: KeyboardEvent<Element>;
      data: unknown;
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
        handlePaste({ recording: data as Recording, column, value, row });
      }

      // Delete value on delete or backspace
      if (event.key === "Delete" || event.key === "Backspace") {
        handleDelete({ recording: data as Recording, column, row });
      }
    };
  }, [clipboard, onUpdate, onAddTag, onRemoveTag, copy]);

  return handleKeyDown;
}

export default function DatasetRecordings({ dataset }: { dataset: Dataset }) {
  const router = useRouter();

  const tagColorFn = useStore((state) => state.getTagColor);

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

  const onClickRecording = useCallback(
    (recording: Recording) => {
      const url = `detail/?recording_uuid=${recording.uuid}`;
      router.push(`${url}&dataset_uuid=${dataset.uuid}`);
    },
    [dataset.uuid, router],
  );

  const filter = useMemo(() => ({ dataset }), [dataset]);
  const recordings = useRecordings({ filter, fixed: ["dataset"] });

  const handleKeyDown = useRecordingTableKeyShortcuts({
    onUpdate: recordings.updateRecording.mutate,
    onAddTag: recordings.addTag.mutate,
    onRemoveTag: recordings.removeTag.mutate,
  });

  const handleClickTag = useCallback(
    (tag: Tag) => {
      recordings.filter.set("tag", tag);
    },
    [recordings.filter],
  );

  const handleSearchChange = useCallback(
    (q) => recordings.filter.set("search", q),
    [recordings.filter],
  );

  const handleSetFilterField = useCallback(
    (field, value) => recordings.filter.set(field, value),
    [recordings.filter],
  );

  const handleClearFilterField = useCallback(
    (field) => recordings.filter.clear(field),
    [recordings.filter],
  );

  const handleDeleteRecordingTag = useCallback(
    (data) => recordings.removeTag.mutate(data),
    [recordings.removeTag],
  );

  const handleAddRecordingTag = useCallback(
    (data) => recordings.addTag.mutate(data),
    [recordings.addTag],
  );

  const handleUpdateRecording = useCallback(
    (data) => recordings.updateRecording.mutate(data),
    [recordings.updateRecording],
  );

  const handleDeleteRecording = useCallback(
    (data) => recordings.deleteRecording.mutate(data),
    [recordings.deleteRecording],
  );

  if (recordings.isLoading || recordings.data == null) {
    return <Loading />;
  }

  return (
    <RecordingTable
      recordings={recordings.items}
      filter={recordings.filter.filter}
      numRecordings={recordings.total}
      fixedFilterFields={recordings.filter.fixed}
      pathFormatter={pathFormatter}
      onSearchChange={handleSearchChange}
      onSetFilterField={handleSetFilterField}
      onClearFilterField={handleClearFilterField}
      onCellKeyDown={handleKeyDown}
      onClickRecording={onClickRecording}
      tagColorFn={tagColorFn}
      onDeleteRecordingTag={handleDeleteRecordingTag}
      onAddRecordingTag={handleAddRecordingTag}
      onUpdateRecording={handleUpdateRecording}
      onDeleteRecording={handleDeleteRecording}
      onClickTag={handleClickTag}
      TagSearchBar={TagSearchBar}
      page={recordings.pagination.page}
      numPages={recordings.pagination.numPages}
      pageSize={recordings.pagination.pageSize}
      hasNextPage={recordings.pagination.hasNextPage}
      hasPrevPage={recordings.pagination.hasPrevPage}
      onSetPageSize={recordings.pagination.setPageSize}
      onSetPage={recordings.pagination.setPage}
      onPrevPage={recordings.pagination.prevPage}
      onNextPage={recordings.pagination.nextPage}
    />
  );
}
