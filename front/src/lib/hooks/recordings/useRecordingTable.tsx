import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo, type FC } from "react";

import {
  DateIcon,
  LocationIcon,
  NotesIcon,
  SunIcon,
  TagIcon,
  TimeIcon,
} from "@/lib/components/icons";
import { type Color } from "@/lib/utils/tags";
import Button from "@/lib/components/ui/Button";
import TableCell from "@/lib/components/tables/TableCell";
import Checkbox from "@/lib/components/tables/TableCheckbox";
import TableHeader from "@/lib/components/tables/TableHeader";
import TableInput from "@/lib/components/tables/TableInput";
import TableMap from "@/lib/components/tables/TableMap";
import TableTags from "@/lib/components/tables/TableTags";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";

import type { RecordingUpdate } from "@/lib/api/recordings";
import type { Note, Recording, Tag } from "@/lib/types";

const defaultPathFormatter = (path: string) => path;

export default function useRecordingTable({
  data,
  canCreateTag = true,
  pathFormatter = defaultPathFormatter,
  TagSearchBar = TagSearchBarBase,
  onClickRecording,
  onCreateTag,
  onUpdateRecording,
  onAddRecordingTag,
  onDeleteRecordingTag,
  onClickTag,
  tagColorFn,
}: {
  data: Recording[];
  pathFormatter?: (path: string) => string;
  canCreateTag?: boolean;
  TagSearchBar?: FC<TagSearchBarProps>;
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
  onClickTag?: (tag: Tag) => void;
  tagColorFn?: (tag: Tag) => Color;
} & Omit<TagSearchBarProps, "onSelectTag" | "canCreate">) {
  const [rowSelection, setRowSelection] = useState({});

  const tagRow: ColumnDef<Recording> = useMemo(
    () => ({
      id: "tags",
      enableResizing: true,
      header: () => (
        <TableHeader>
          <TagIcon className="inline-block mr-2 w-5 h-5 align-middle text-stone-500" />
          Tags
        </TableHeader>
      ),
      accessorFn: (row) => row.tags,
      cell: ({ row }) => {
        const tags = row.getValue("tags") as Tag[];
        return (
          <TableTags
            tags={tags}
            canCreate={canCreateTag}
            tagColorFn={tagColorFn}
            TagSearchBar={TagSearchBar}
            onClickTag={onClickTag}
            onCreateTag={onCreateTag}
            onSelectTag={(tag) =>
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
    }),
    [
      tagColorFn,
      TagSearchBar,
      canCreateTag,
      onAddRecordingTag,
      onClickTag,
      onCreateTag,
      onDeleteRecordingTag,
    ],
  );

  const selectRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [],
  );

  const pathRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [onClickRecording, pathFormatter],
  );

  const durationRow: ColumnDef<Recording> = useMemo(
    () => ({
      id: "duration",
      header: () => <TableHeader>Duration</TableHeader>,
      enableResizing: true,
      size: 100,
      accessorFn: (row) => row.duration.toFixed(2),
      cell: ({ row }) => {
        const duration = row.getValue("duration") as string;
        return <TableCell>{duration}</TableCell>;
      },
    }),
    [],
  );

  const samplerateRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [],
  );

  const timeExpansionRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [onUpdateRecording],
  );

  const dateRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [onUpdateRecording],
  );

  const timeRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [onUpdateRecording],
  );

  const locationRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [onUpdateRecording],
  );

  const notesRow: ColumnDef<Recording> = useMemo(
    () => ({
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
    }),
    [],
  );

  // Column definitions
  const columns: ColumnDef<Recording>[] = useMemo(
    () => [
      selectRow,
      pathRow,
      durationRow,
      samplerateRow,
      timeExpansionRow,
      dateRow,
      timeRow,
      locationRow,
      tagRow,
      notesRow,
    ],
    [
      selectRow,
      pathRow,
      durationRow,
      samplerateRow,
      timeExpansionRow,
      dateRow,
      timeRow,
      locationRow,
      tagRow,
      notesRow,
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
