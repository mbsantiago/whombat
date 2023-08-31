import { useState } from "react";
import { type Tag } from "@/api/tags";
import { type Recording, type UpdateRecording } from "@/api/recordings";
import TableCheckbox from "@/components/TableCheckbox";
import TableInput from "@/components/TableInput";
import TableCell from "@/components/TableCell";
import TableTags from "@/components/TableTags";
import TableHeader from "@/components/TableHeader";
import * as icons from "@/components/icons";

import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  RowData,
} from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
    addTag: (rowIndex: number, tag: Tag) => void;
    removeTag: (rowIndex: number, tag: Tag) => void;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
  }
}

const defaultColumn: Partial<ColumnDef<Recording>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue() as string;
    const onChange = (value: string | null) => {
      table.options.meta?.updateData(index, id, value);
    };
    return <TableInput value={initialValue} onChange={onChange} />;
  },
};

const columns: ColumnDef<Recording>[] = [
  {
    id: "select",
    maxSize: 33,
    enableResizing: false,
    header: ({ table }) => (
      <TableCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center px-1">
        <TableCheckbox
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
      return <TableCell>{path}</TableCell>;
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
    id: "date",
    enableResizing: true,
    size: 140,
    header: () => {
      return (
          <TableHeader>
          <icons.DateIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Date
          </TableHeader>
      );
    },
    cell: ({ row, table, column }) => {
      const date = row.getValue("date") as string;
      return (
        <TableInput
          onChange={(value) =>
            table.options.meta?.updateData(row.index, column.id, value)
          }
          type="date"
          value={date}
        />
      );
    },
    accessorFn: (row) => row.date?.toLocaleDateString("en-CA"),
    meta: {
      editable: true,
    },
  },
  {
    id: "time",
    enableResizing: true,
    size: 120,
    header: () => {
      return (
        <TableHeader>
          <icons.TimeIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Time
        </TableHeader>
      );
    },
    cell: ({ row, table, column }) => {
      const time = row.getValue("time") as string;
      return (
        <TableInput
          onChange={(value) =>
            table.options.meta?.updateData(row.index, column.id, value)
          }
          type="time"
          value={time}
          step="1"
        />
      );
    },
    accessorFn: (row) => row.time,
    meta: {
      editable: true,
    },
  },
  {
    id: "location",
    enableResizing: true,
    header: () => {
      return (
        <TableHeader>
          <icons.LocationIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Location
        </TableHeader>
      );
    },
    accessorFn: (row) => {
      if (row.latitude === null || row.longitude === null) return null;
      return `${row.latitude}, ${row.longitude}`;
    },
    meta: {
      editable: true,
    },
  },
  {
    id: "tags",
    enableResizing: true,
    header: () => {
      return (
        <TableHeader>
          <icons.TagIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Tags
        </TableHeader>
      );
    },
    accessorFn: (row) => row.tags,
    cell: ({ row, table }) => {
      const tags = row.getValue("tags") as Tag[];
      return (
        <TableTags
          tags={tags}
          onAdd={(tag) => {
            console.log("add tag", tag);
            table.options.meta?.addTag(row.index, tag);
          }}
          onRemove={(tag) => table.options.meta?.removeTag(row.index, tag)}
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
          <icons.NotesIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Notes
        </TableHeader>
      );
    },
    accessorFn: (row) => row.notes,
  },
];

function useRecordingTable({
  data,
  updateData,
  addTag,
  removeTag,
}: {
  data: Recording[];
  updateData?: (recording_id: number, data: UpdateRecording) => void;
  addTag?: (recording_id: number, tag: Tag) => void;
  removeTag?: (recording_id: number, tag: Tag) => void;
}) {
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable<Recording>({
    data,
    columns,
    defaultColumn,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        const recording_id = data[rowIndex].id;
        updateData?.(recording_id, { [columnId]: value });
      },
      addTag: (rowIndex, tag) => {
        const recording_id = data[rowIndex].id;
        addTag?.(recording_id, tag);
      },
      removeTag: (rowIndex, tag) => {
        const recording_id = data[rowIndex].id;
        removeTag?.(recording_id, tag);
      },
    },
    debugTable: true,
  });

  return table;
}

export default useRecordingTable;
