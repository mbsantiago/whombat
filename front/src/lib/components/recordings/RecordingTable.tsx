import { type RecordingFilter } from "@/lib/api/recordings";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterPopover from "@/lib/components/filters/FilterMenu";
import recordingFilterDefs from "@/lib/components/filters/recordings";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import SelectedMenu from "@/lib/components/tables/SelectedMenu";
import Table from "@/lib/components/tables/Table";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import useRecordingTable from "@/lib/hooks/recordings/useRecordingTable";
import type { Recording, Tag } from "@/lib/types";
import { type Color } from "@/lib/utils/tags";
import { type ComponentProps, type FC, useCallback } from "react";

export default function RecordingTable({
  recordings,
  filter,
  numRecordings,
  fixedFilterFields,
  pathFormatter,
  onClickRecording,
  onSearchChange,
  onSetFilterField,
  onClearFilterField,
  onCellKeyDown,
  onUpdateRecording,
  onAddRecordingTag,
  onDeleteRecordingTag,
  onDeleteRecording,
  onClickTag,
  tagColorFn,
  canCreateTag = true,
  TagSearchBar = TagSearchBarBase,
  ...props
}: {
  /** The list of recordings to display. */
  recordings: Recording[];
  /** The filter that is currently applied to the recordings. */
  filter?: RecordingFilter;
  /** The total number of recordings. */
  numRecordings?: number;
  /** List of filter fields that should not be editable. */
  fixedFilterFields?: (keyof RecordingFilter)[];
  /** Function to format the path of a recording. */
  pathFormatter?: (path: string) => string;
  /** Callback function to handle clicking on a tag. */
  onClickTag?: (tag: Tag) => void;
  /** Callback function to handle searching for recordings. */
  onSearchChange?: (value: string) => void;
  /** Callback function to handle setting a filter field. */
  onSetFilterField?: <T extends keyof RecordingFilter>(
    key: T,
    value: RecordingFilter[T],
  ) => void;
  /** Callback function to handle clearing a filter field. */
  onClearFilterField?: (key: keyof RecordingFilter) => void;
  /** Callback function to handle keydown events on a cell. */
  onCellKeyDown?: ComponentProps<typeof Table>["onCellKeyDown"];
  /** Callback function to handle clicking on a recording. */
  onClickRecording?: (recording: Recording) => void;
  /** Callback function to handle deleting a tag from a recording. */
  onDeleteRecordingTag?: Parameters<
    typeof useRecordingTable
  >[0]["onDeleteRecordingTag"];
  /** Callback function to handle adding a tag to a recording. */
  onAddRecordingTag?: Parameters<
    typeof useRecordingTable
  >[0]["onAddRecordingTag"];
  /** Callback function to handle updating a recording. */
  onUpdateRecording?: Parameters<
    typeof useRecordingTable
  >[0]["onUpdateRecording"];
  /** Callback function to handle deleting a recording. */
  onDeleteRecording?: (data: { recording: Recording; index: number }) => void;
  /** Function to determine the color of a tag. */
  tagColorFn?: (tag: Tag) => Color;
  /** If true, the add tag button is disabled. */
  canCreateTag?: boolean;
  /** The tag search bar component to render inside the selected menu. */
  TagSearchBar?: FC<TagSearchBarProps>;
} & Omit<TagSearchBarProps, "onSelectTag" | "canCreate"> &
  ComponentProps<typeof Pagination>) {
  const table = useRecordingTable({
    data: recordings,
    pathFormatter,
    onCreateTag: props.onCreateTag,
    onClickRecording,
    onUpdateRecording,
    onAddRecordingTag,
    onDeleteRecordingTag,
    onClickTag,
    tagColorFn,
    TagSearchBar,
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
            onSetFilterField={onSetFilterField}
            filterDef={recordingFilterDefs}
          />
        </div>
        <SelectedMenu
          numSelected={Object.keys(rowSelection).length}
          canCreateTag={canCreateTag}
          onCreateTag={props.onCreateTag}
          onSelectTag={handleTagSelected}
          onDeleteSelected={handleDeleteSelected}
          TagSearchBar={TagSearchBar}
          {...props}
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
        onNextPage={props.onNextPage}
        hasNextPage={props.hasNextPage}
        hasPrevPage={props.hasPrevPage}
        onPrevPage={props.onPrevPage}
        onSetPage={props.onSetPage}
        pageSize={props.pageSize}
        onSetPageSize={props.onSetPageSize}
      />
    </div>
  );
}
