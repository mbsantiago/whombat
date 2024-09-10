import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState, type ComponentProps } from "react";

import {
  DateIcon,
  LocationIcon,
  NotesIcon,
  SunIcon,
  TagIcon,
  TimeIcon,
} from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import TableCell from "@/lib/components/tables/TableCell";
import Checkbox from "@/lib/components/tables/TableCheckbox";
import TableHeader from "@/lib/components/tables/TableHeader";
import TableInput from "@/lib/components/tables/TableInput";
import TableMap from "@/lib/components/tables/TableMap";
import TableTags from "@/lib/components/tables/TableTags";

import type { RecordingUpdate } from "@/lib/api/recordings";
import type { Note, Recording, Tag } from "@/lib/types";

const defaultPathFormatter = (path: string) => path;

export default function useRecordingTable({
  data,
  availableTags,
  canCreateTag = true,
  tagColorFn,
  pathFormatter = defaultPathFormatter,
  onCreateTag,
  onChangeTagQuery,
  onClickRecording,
  onUpdateRecording,
  onAddRecordingTag,
  onDeleteRecordingTag,
}: {
  data: Recording[];
  pathFormatter?: (path: string) => string;
  availableTags?: Tag[];
  canCreateTag?: boolean;
  tagColorFn?: ComponentProps<typeof TableTags>["tagColorFn"];
  onCreateTag?: ComponentProps<typeof TableTags>["onCreateTag"];
  onChangeTagQuery?: ComponentProps<typeof TableTags>["onChangeQuery"];
  onUpdateRecording?: ({
    recording,
    data,
    index,
  }: {
    recording: Recording;
    data: RecordingUpdate;
    index: number;
  }) => void;
  onClickRecording?: (recording: Recording) => void;
  onAddRecordingTag?: ({
    recording,
    tag,
    index,
  }: {
    recording: Recording;
    tag: Tag;
    index: number;
  }) => void;
  onDeleteRecordingTag?: ({
    recording,
    tag,
    index,
  }: {
    recording: Recording;
    tag: Tag;
    index: number;
  }) => void;
}) {
  const [rowSelection, setRowSelection] = useState({});

  // Column definitions
  const columns = useMemo<ColumnDef<Recording>[]>(
    () => [
      {
        id: "select",
        maxSize: 33,
        enableResizing: false,
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center px-1">
            <Checkbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        accessorFn: (row) => row.path,
        id: "path",
        header: () => <TableHeader>Path</TableHeader>,
        size: 200,
        enableResizing: true,
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          const path = row.getValue("path") as string;
          return (
            <TableCell>
              <Button
                mode="text"
                onClick={() => onClickRecording?.(row.original)}
              >
                {pathFormatter(path)}
              </Button>
            </TableCell>
          );
        },
      },
      {
        id: "duration",
        header: () => <TableHeader>Duration</TableHeader>,
        enableResizing: true,
        size: 100,
        accessorFn: (row) => row.duration.toFixed(2),
        cell: ({ row }) => {
          const duration = row.getValue("duration") as string;
          return <TableCell>{duration}</TableCell>;
        },
      },
      {
        id: "samplerate",
        accessorKey: "samplerate",
        header: () => <TableHeader>Sample Rate</TableHeader>,
        enableResizing: true,
        size: 120,
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          const samplerate = row.getValue("samplerate") as string;
          return <TableCell>{samplerate}</TableCell>;
        },
      },
      {
        id: "time_expansion",
        accessorKey: "time_expansion",
        header: () => <TableHeader>Time Expansion</TableHeader>,
        enableResizing: true,
        size: 120,
        footer: (props) => props.column.id,
        cell: ({ row }) => {
          const value = row.getValue("time_expansion") as string;
          return (
            <TableInput
              onChange={(value) => {
                if (value === null) return;
                onUpdateRecording?.({
                  recording: row.original,
                  data: { time_expansion: parseFloat(value) },
                  index: row.index,
                });
              }}
              type="number"
              value={value}
            />
          );
        },
      },
      {
        id: "date",
        enableResizing: true,
        size: 140,
        header: () => {
          return (
            <TableHeader>
              <DateIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              Date
            </TableHeader>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("date") as string;
          return (
            <TableInput
              onChange={(value) => {
                if (value === null) return;
                onUpdateRecording?.({
                  recording: row.original,
                  data: { date: new Date(value) },
                  index: row.index,
                });
              }}
              type="date"
              value={date}
            />
          );
        },
        accessorFn: (row) => row.date?.toLocaleDateString("en-CA"),
      },
      {
        id: "time",
        enableResizing: true,
        size: 120,
        header: () => {
          return (
            <TableHeader>
              <TimeIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              Time
            </TableHeader>
          );
        },
        cell: ({ row }) => {
          const time = row.getValue("time") as string;
          return (
            <TableInput
              onChange={(value) => {
                if (value === null) return;
                onUpdateRecording?.({
                  recording: row.original,
                  data: { time: value },
                  index: row.index,
                });
              }}
              type="time"
              value={time}
              step="1"
            />
          );
        },
        accessorFn: (row) => row.time,
      },
      {
        id: "location",
        enableResizing: true,
        header: () => {
          return (
            <TableHeader>
              <LocationIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              Location
            </TableHeader>
          );
        },
        accessorFn: (row) => ({
          latitude: row.latitude,
          longitude: row.longitude,
        }),
        cell: ({ row }) => {
          const location = row.getValue("location") as {
            latitude: number | null;
            longitude: number | null;
          };
          return (
            <TableMap
              onChange={(value) => {
                if (value === null) return;
                onUpdateRecording?.({
                  recording: row.original,
                  data: value,
                  index: row.index,
                });
              }}
              value={location}
            />
          );
        },
      },
      {
        id: "tags",
        enableResizing: true,
        header: () => {
          return (
            <TableHeader>
              <TagIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              Tags
            </TableHeader>
          );
        },
        accessorFn: (row) => row.tags,
        cell: ({ row }) => {
          const tags = row.getValue("tags") as Tag[];
          return (
            <TableTags
              tags={tags || []}
              availableTags={availableTags}
              canCreate={canCreateTag}
              tagColorFn={tagColorFn}
              onChangeQuery={onChangeTagQuery}
              onCreateTag={onCreateTag}
              onAddTag={(tag) =>
                onAddRecordingTag?.({
                  recording: row.original,
                  tag,
                  index: row.index,
                })
              }
              onDeleteTag={(tag) =>
                onDeleteRecordingTag?.({
                  recording: row.original,
                  tag,
                  index: row.index,
                })
              }
            />
          );
        },
      },
      {
        id: "notes",
        enableResizing: true,
        header: () => {
          return (
            <TableHeader>
              <NotesIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
              Notes
            </TableHeader>
          );
        },
        accessorFn: (row) => row.notes,
        cell: ({ row }) => {
          const notes = row.getValue("notes") as Note[];
          if ((notes || []).length == 0) return null;

          return (
            <span className="ms-2">
              <SunIcon className="inline-block mr-2 w-5 h-5 text-blue-500 align-middle" />
              {notes.length} notes
            </span>
          );
        },
      },
    ],
    [
      availableTags,
      canCreateTag,
      pathFormatter,
      onAddRecordingTag,
      onDeleteRecordingTag,
      onUpdateRecording,
      onClickRecording,
      onCreateTag,
      onChangeTagQuery,
      tagColorFn,
    ],
  );

  return useReactTable<Recording>({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });
}
