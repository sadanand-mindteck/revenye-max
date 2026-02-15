import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  pageIndex: number;
  pageSize: number;
  total: number;
  onPageChange: (nextPage: number) => void;
}

const DataTable = <TData,>({
  columns,
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    state: {
      pagination: { pageIndex, pageSize },
    },
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = pageIndex > 0;
  const canNext = pageIndex + 1 < totalPages;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-xs text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Page {pageIndex + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canPrev}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 disabled:opacity-60"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNext}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
