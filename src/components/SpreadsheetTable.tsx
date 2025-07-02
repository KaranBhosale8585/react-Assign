"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import type { ColumnResizeMode } from "@tanstack/react-table";
import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { useState, useEffect, useCallback, useRef } from "react";

type Data = {
  name: string;
  role: string;
  status: string;
  email: string;
};

const defaultData: Data[] = [
  {
    name: "Alice Johnson",
    role: "Designer",
    status: "Active",
    email: "alice@gob.io",
  },
  {
    name: "Bob Smith",
    role: "Developer",
    status: "Inactive",
    email: "bob@gob.io",
  },
  {
    name: "Charlie Brown",
    role: "Product Manager",
    status: "Active",
    email: "charlie@gob.io",
  },
];

const defaultColumns: ColumnDef<Data>[] = [
  {
    accessorKey: "name",
    header: () => "Name",
    enableResizing: true,
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "role",
    header: () => "Role",
    enableResizing: true,
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: () => "Status",
    enableResizing: true,
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "email",
    header: () => "Email",
    enableResizing: true,
    cell: (info) => info.getValue(),
  },
];

export default function SpreadsheetTable() {
  const [data, setData] = useState<Data[]>(defaultData);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [focusedCell, setFocusedCell] = useState<{
    rowIdx: number;
    colIdx: number;
  } | null>(null);
  const tableRef = useRef<HTMLTableCellElement[][]>([]);

  const table = useReactTable({
    data,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: "onChange" as ColumnResizeMode,
    enableColumnResizing: true,
  });

  const visibleCols = table.getAllColumns().filter((col) => col.getIsVisible());

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focusedCell) return;

      const maxRow = data.length - 1;
      const maxCol = visibleCols.length - 1;

      let { rowIdx, colIdx } = focusedCell;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          rowIdx = Math.min(rowIdx + 1, maxRow);
          break;
        case "ArrowUp":
          e.preventDefault();
          rowIdx = Math.max(rowIdx - 1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          colIdx = Math.min(colIdx + 1, maxCol);
          break;
        case "ArrowLeft":
          e.preventDefault();
          colIdx = Math.max(colIdx - 1, 0);
          break;
        case "Enter":
          e.preventDefault();
          const newValue = prompt("Edit cell value:");
          if (newValue !== null) {
            const colId = visibleCols[colIdx]?.id;
            const updated = [...data];
            (updated[rowIdx] as any)[colId] = newValue;
            setData(updated);
          }
          return;
        default:
          return;
      }

      setFocusedCell({ rowIdx, colIdx });
    },
    [focusedCell, data, visibleCols]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (
      focusedCell &&
      tableRef.current[focusedCell.rowIdx]?.[focusedCell.colIdx]
    ) {
      tableRef.current[focusedCell.rowIdx][focusedCell.colIdx]?.focus();
    }
  }, [focusedCell]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">📊 Spreadsheet Table</h2>

      <div className="flex flex-wrap gap-4 text-sm">
        {table.getAllLeafColumns().map((column) => (
          <label key={column.id} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={column.getIsVisible()}
              onChange={() => column.toggleVisibility()}
            />
            {column.id}
          </label>
        ))}
      </div>

      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full border-separate border-spacing-0 text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="relative group px-4 py-2 border-b border-gray-300 bg-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent group-hover:bg-blue-300 transition-all duration-150"
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="text-gray-800">
            {table.getRowModel().rows.map((row, rowIdx) => {
              tableRef.current[rowIdx] = [];

              return (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell, colIdx) => {
                    const isFocused =
                      focusedCell?.rowIdx === rowIdx &&
                      focusedCell?.colIdx === colIdx;

                    return (
                      <td
                        key={cell.id}
                        ref={(el) => {
                          if (el) tableRef.current[rowIdx][colIdx] = el;
                        }}
                        style={{ width: cell.column.getSize() }}
                        className={`px-4 py-2 border-b border-gray-200 outline-none ${
                          isFocused ? "ring-2 ring-blue-500 bg-blue-50" : ""
                        }`}
                        tabIndex={0}
                        onClick={() => {
                          console.log(
                            `Clicked cell: row ${rowIdx}, col ${colIdx}`
                          );
                          setFocusedCell({ rowIdx, colIdx });
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
