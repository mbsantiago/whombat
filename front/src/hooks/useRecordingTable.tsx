import { useState } from "react";
import { type Recording, type UpdateRecording } from "@/api/recordings";
import TableCheckbox from "@/components/TableCheckbox";
import TableInput from "@/components/TableInput";
import TableCell from "@/components/TableCell";
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
    header: "Path",
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
    header: "Duration",
    enableResizing: true,
    size: 100,
    minSize: 100,
    accessorFn: (row) => row.duration.toFixed(2),
    cell: ({ row }) => {
      const duration = row.getValue("duration") as string;
      return <TableCell>{duration}</TableCell>;
    },
  },
  {
    id: "samplerate",
    accessorKey: "samplerate",
    header: "Samplerate",
    enableResizing: true,
    size: 120,
    minSize: 120,
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
    minSize: 140,
    header: () => {
      return (
        <span className="align-middle">
          <icons.DateIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Date
        </span>
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
    minSize: 120,
    header: () => {
      return (
        <span className="align-middle">
          <icons.TimeIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Time
        </span>
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
        <span className="align-middle">
          <icons.LocationIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Location
        </span>
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
        <span className="align-middle">
          <icons.TagIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Tags
        </span>
      );
    },
    accessorFn: (row) => row.tags,
  },
  {
    id: "notes",
    enableResizing: true,
    header: () => {
      return (
        <span className="align-middle">
          <icons.NotesIcon className="mr-2 inline-block h-5 w-5 align-middle text-stone-500" />
          Notes
        </span>
      );
    },
    accessorFn: (row) => row.notes,
  },
];

function useRecordingTable({
  data,
  updateData,
}: {
  data: Recording[];
  updateData?: (recording_id: number, data: UpdateRecording) => void;
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
        if (updateData != null) {
          updateData(recording_id, {
            [columnId]: value,
          });
        }
      },
    },
    debugTable: true,
  });

  return table;
}

export default useRecordingTable;
