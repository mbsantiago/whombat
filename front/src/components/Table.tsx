import { flexRender } from "@tanstack/react-table";
import { useTableNav } from "@table-nav/react";
import { type Table } from "@tanstack/react-table";

export default function Table<S>({
  table,
  onCopy,
  onPaste,
}: {
  table: Table<S>;
  onCopy?: (value: string) => void;
  onPaste?: () => void;
}) {
  const {
    listeners: { onKeyUp, onKeyDown },
  } = useTableNav();

  return (
    <table
      className="min-w-full table-fixed border-collapse rounded-lg border border-stone-300 text-stone-700 dark:border-stone-700 dark:text-stone-300"
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
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300"
          >
            {headerGroup.headers.map((header) => (
              <th
                className="relative whitespace-nowrap border border-stone-400 px-2 py-1 dark:border-stone-500"
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
      <tbody>
        {table.getRowModel().rows.map((row) => {
          return (
            <tr key={row.id} className="hover:dark:bg-stone-800">
              {row.getVisibleCells().map((cell) => {
                return (
                  <td
                    role="gridcell"
                    className="border border-stone-300 outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent dark:border-stone-600"
                    tabIndex={-1}
                    key={cell.id}
                    onKeyDown={(event) => {
                      // Copy value on ctrl+c
                      if (event.key === "c" && event.ctrlKey) {
                        const value = row.getValue(cell.column.id) as string;
                        onCopy?.(value);
                      }

                      // Paste value on ctrl+v
                      if (event.key === "v" && event.ctrlKey) {
                        row.meta.editable = true;
                        onPaste?.();
                      }
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
