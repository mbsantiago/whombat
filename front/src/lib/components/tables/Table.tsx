import { useTableNav } from "@table-nav/react";
import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import type { KeyboardEvent } from "react";

import "./Table.css";

/** A Table component.
 * Will display a table.
 * We use the `@tanstack/react-table` library to manage the table state.
 * and column definitions.
 * This defines the basic aspect of the table, while the actual content
 * and cell rendering is controlled by the `table` prop.
 */
export default function Table<S>({
  table,
  onCellKeyDown,
}: {
  table: Table<S>;
  onCellKeyDown?: ({
    data,
    row,
    column,
    event,
  }: {
    data: S;
    row: number;
    column: string;
    value: any;
    event: KeyboardEvent;
  }) => void;
}) {
  const {
    listeners: { onKeyUp, onKeyDown },
  } = useTableNav();

  return (
    <table
      className="relative min-w-full rounded-lg border border-collapse table-fixed border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300"
      onKeyUp={(event) => {
        if (event.target instanceof HTMLInputElement) return;
        onKeyUp();
      }}
      onKeyDown={(event) => {
        if (event.target instanceof HTMLInputElement) return;
        onKeyDown(event);
      }}
      {...{
        style: {
          width: table.getCenterTotalSize(),
        },
      }}
    >
      <thead className="sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
          >
            {headerGroup.headers.map((header) => (
              <th
                className="overflow-x-auto relative py-1 px-2 whitespace-nowrap border border-stone-400 dark:border-stone-500"
                key={header.id}
                colSpan={header.colSpan}
                style={{
                  width: header.getSize(),
                }}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                <div
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className={`resizer ${
                    header.column.getIsResizing() ? "isResizing" : ""
                  }`}
                />
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="z-0 text-sm text-stone-800 dark:text-stone-300">
        {table.getRowModel().rows.map((row) => {
          return (
            <tr
              key={row.id}
              className="max-h-40 h-min hover:dark:bg-stone-800 hover:bg-stone-200"
            >
              {row.getVisibleCells().map((cell) => {
                return (
                  <td
                    role="gridcell"
                    className="max-h-40 border outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-1 focus:ring-offset-transparent border-stone-300 dark:border-stone-600"
                    tabIndex={-1}
                    key={cell.id}
                    onKeyDown={(event) => {
                      if (event.target instanceof HTMLInputElement) return;
                      onCellKeyDown?.({
                        data: row.original,
                        row: row.index,
                        column: cell.column.id,
                        value: row.getValue(cell.column.id),
                        event,
                      });
                    }}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
