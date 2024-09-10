import { type ComponentProps, useCallback } from "react";

import { type RecordingFilter } from "@/lib/api/recordings";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterPopover from "@/lib/components/filters/FilterMenu";
import recordingFilterDefs from "@/lib/components/filters/recordings";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import SelectedMenu from "@/lib/components/tables/SelectedMenu";
import Table from "@/lib/components/tables/Table";
import useRecordingTable from "@/lib/hooks/recordings/useRecordingTable";

import type { Recording, Tag } from "@/lib/types";

export default function RecordingTable({
  recordings,
  filter,
  numSelected = 0,
  numRecordings,
  fixedFilterFields,
  availableTags,
  pathFormatter,
  onClickRecording,
  onSearchChange,
  onFilterFieldSet,
  onClearFilterField,
  onCellKeyDown,
  onUpdateRecording,
  onAddRecordingTag,
  onDeleteRecordingTag,
  onDeleteRecording,
  ...props
}: {
  recordings: Recording[];
  filter?: RecordingFilter;
  numRecordings?: number;
  numSelected?: number;
  fixedFilterFields?: (keyof RecordingFilter)[];
  availableTags?: Tag[];
  pathFormatter?: (path: string) => string;
  onSearchChange?: (value: string) => void;
  onFilterFieldSet?: <T extends keyof RecordingFilter>(
    key: T,
    value: RecordingFilter[T],
  ) => void;
  onClearFilterField?: (key: keyof RecordingFilter) => void;
  onCellKeyDown?: ComponentProps<typeof Table>["onCellKeyDown"];
  onClickRecording?: (recording: Recording) => void;
  onDeleteRecordingTag?: Parameters<
    typeof useRecordingTable
  >[0]["onDeleteRecordingTag"];
  onAddRecordingTag?: Parameters<
    typeof useRecordingTable
  >[0]["onAddRecordingTag"];
  onUpdateRecording?: Parameters<
    typeof useRecordingTable
  >[0]["onUpdateRecording"];
  onDeleteRecording?: (data: { recording: Recording; index: number }) => void;
} & Pick<
  ComponentProps<typeof SelectedMenu>,
  "tagColorFn" | "tags" | "canCreateTag" | "onChangeTagQuery" | "onCreateTag"
> &
  ComponentProps<typeof Pagination>) {
  const table = useRecordingTable({
    data: recordings,
    pathFormatter,
    availableTags,
    onCreateTag: props.onCreateTag,
    onChangeTagQuery: props.onChangeTagQuery,
    tagColorFn: props.tagColorFn,
    onClickRecording,
    onUpdateRecording,
    onAddRecordingTag,
    onDeleteRecordingTag,
  });

  const rowSelection = table.getState().rowSelection;

  const handleTagSelected = useCallback(
    (tag: Tag) => {
      Object.values(rowSelection).forEach((isSelected, index) => {
        if (!isSelected) return;
        const recording = recordings[index];
        onAddRecordingTag?.({ recording, tag, index });
      });
    },
    [rowSelection, onAddRecordingTag, recordings],
  );

  const handleDeleteSelected = useCallback(() => {
    Object.values(rowSelection).forEach((isSelected, index) => {
      if (!isSelected) return;
      const recording = recordings[index];
      onDeleteRecording?.({ recording, index });
    });
  }, [rowSelection, onDeleteRecording, recordings]);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-row justify-between space-x-4">
        <div className="flex flex-row space-x-3 basis-1/2">
          <div className="grow">
            <Search
              label="Search"
              placeholder="Search recordings..."
              onChange={onSearchChange}
            />
          </div>
          <FilterPopover
            onSetFilterField={onFilterFieldSet}
            filterDef={recordingFilterDefs}
          />
        </div>
        <SelectedMenu
          numSelected={Object.keys(rowSelection).length}
          tags={availableTags}
          canCreateTag={props.canCreateTag}
          tagColorFn={props.tagColorFn}
          onCreateTag={props.onCreateTag}
          onChangeTagQuery={props.onChangeTagQuery}
          onTagSelected={handleTagSelected}
          onDeleteSelected={handleDeleteSelected}
        />
      </div>
      <FilterBar
        filter={filter}
        total={numRecordings}
        fixedFilterFields={fixedFilterFields}
        filterDef={recordingFilterDefs}
        onClearFilterField={onClearFilterField}
      />
      <div className="w-full">
        <div className="overflow-x-auto overflow-y-auto w-full max-h-screen rounded-md outline outline-1 outline-stone-200 dark:outline-stone-800">
          <Table table={table} onCellKeyDown={onCellKeyDown} />
        </div>
      </div>
      <Pagination
        page={props.page}
        numPages={props.numPages}
        nextPage={props.nextPage}
        hasNextPage={props.hasNextPage}
        hasPrevPage={props.hasPrevPage}
        prevPage={props.prevPage}
        setPage={props.setPage}
        pageSize={props.pageSize}
        setPageSize={props.setPageSize}
      />
    </div>
  );
}
