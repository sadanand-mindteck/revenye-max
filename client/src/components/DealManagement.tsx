import React, { useMemo, useState } from 'react';
import { 
  ChevronDown, ChevronRight, MoreHorizontal, Filter, 
  Search, Plus, ExternalLink, User, Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { apiClient } from '@/api/client';
import { useSessionYearStore } from '@/store/sessionYear';

type DealSummary = {
  id: number;
  projectName: string;
  customer: string;
  region: string;
  projectType: string;
  dealType: string;
  businessType: string;
  status: string;
  bdm: string;
  fyForecast: number;
  fyActual: number;
  fyBudget: number;
};

const DealManagement = () => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 12 }); // Increased page size slightly for dense view

  const sessionYear = useSessionYearStore((state) => state.sessionYear);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects-summary', sessionYear],
    queryFn: async () => {
      const response = await apiClient.get<DealSummary[]>('/projects/summary', {
        params: { financialYear: sessionYear },
      });
      return response.data;
    },
  });

  const deals = useMemo(() => data ?? [], [data]);

  const columns = useMemo<ColumnDef<DealSummary>[]>(
    () => [
      { id: 'expand', header: '', accessorKey: 'id' },
      { header: 'Project Entity', accessorKey: 'projectName' },
      { header: 'Region / BDM', accessorKey: 'region' },
      { header: 'FY Forecast', accessorKey: 'fyForecast' },
      { header: 'FY Budget', accessorKey: 'fyBudget' },
      { header: 'FY Variance', accessorKey: 'fyActual' },
      { header: 'Execution Status', accessorKey: 'status' },
      { id: 'manage', header: 'Manage', accessorKey: 'id' },
    ],
    [],
  );

  const table = useReactTable({
    data: deals,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Closed Won': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Lead': return 'bg-slate-50 text-slate-700 border-slate-100';
      case 'On Hold': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Compact Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Portfolio Governance</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">
            Active: {deals.length} Projects
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter..." 
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold w-48 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
            <Filter size={14} /> 
            <span className="uppercase tracking-wide">Filters</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white border border-slate-900 rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-all shadow-sm">
            <Plus size={14} /> 
            <span className="uppercase tracking-wide">New Deal</span>
          </button>
        </div>
      </div>

      {/* Compact Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest">
                <th className="px-4 py-3 w-8 text-center sticky left-0 bg-slate-50/80">#</th>
                <th className="px-4 py-3 min-w-[200px]">Project Entity</th>
                <th className="px-4 py-3">Region / BDM</th>
                <th className="px-4 py-3 text-right">Forecast</th>
                <th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Variance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center w-14">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Loading data...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    Unable to load projects
                  </td>
                </tr>
              )}
              {!isLoading && !isError && table.getRowModel().rows.map((row) => {
                const deal = row.original;
                const isExpanded = expandedRows.has(deal.id);
                return (
                  <React.Fragment key={deal.id}>
                    <tr 
                      className={`group transition-all hover:bg-slate-50/80 ${isExpanded ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-4 py-2.5">
                        <button 
                          onClick={() => toggleRow(deal.id)}
                          className={`p-1 rounded-md transition-all ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'}`}
                        >
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-xs leading-tight group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => toggleRow(deal.id)}>{deal.projectName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold tracking-wide mt-0.5">{deal.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black float-left tracking-widest text-slate-500 uppercase">
                            {deal.region}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                            <span className="truncate max-w-[100px]">{deal.bdm || 'Unassigned'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-700 text-xs tabular-nums">
                        ${(deal.fyForecast / 1000).toFixed(1)}k
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-400 font-semibold text-xs tabular-nums">
                        ${(deal.fyBudget / 1000).toFixed(1)}k
                      </td>
                      <td className={`px-4 py-2.5 text-right font-bold text-xs tabular-nums ${deal.fyForecast - deal.fyBudget >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {deal.fyForecast - deal.fyBudget >= 0 ? '+' : ''}${((deal.fyForecast - deal.fyBudget) / 1000).toFixed(1)}k
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-wider ${getStatusStyle(deal.status || 'In Progress')}`}>
                          {deal.status || 'In Progress'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button className="p-1.5 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Compact Expanded View */}
                    {isExpanded && (
                      <tr className="bg-blue-50/10">
                        <td colSpan={8} className="px-0 py-0 border-b border-blue-50">
                          <div className="bg-slate-50/50 px-4 py-4 flex gap-4 animate-in slide-in-from-top-1 duration-200">
                             {/* Mini Dashboard inside row */}
                             <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-start justify-between gap-4">
                                <div className="space-y-3 w-full">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                                      <Activity size={12} className="text-blue-500" />
                                      Quarterly Performance
                                    </h4>
                                    <button className="text-[9px] font-bold text-blue-600 hover:underline">Full Log &rarr;</button>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                                      const qVal = Math.floor(deal.fyForecast / 4);
                                      return (
                                        <div key={q} className="bg-slate-50 rounded border border-slate-100 p-2">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase">{q}</p>
                                          <div className="flex items-baseline justify-between mt-0.5">
                                            <span className="text-xs font-black text-slate-700">${(qVal/1000).toFixed(0)}k</span>
                                            <div className="h-1 w-8 bg-slate-200 rounded-full overflow-hidden">
                                              <div className="h-full bg-blue-500 w-2/3"></div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                             </div>
                             
                             {/* Actions */}
                             <div className="w-48 flex flex-col gap-2">
                                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm">
                                  <Plus size={12} /> Add Revenue
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm">
                                  <ExternalLink size={12} /> CRM View
                                </button>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Compact Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Rows {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, deals.length)} of {deals.length}
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`px-3 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-bold uppercase tracking-widest ${table.getCanPreviousPage() ? 'text-slate-600 hover:bg-slate-50 hover:text-blue-600' : 'text-slate-300 cursor-not-allowed'} transition-all shadow-sm`}
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`px-3 py-1 bg-white border border-slate-200 rounded-md text-[9px] font-bold uppercase tracking-widest ${table.getCanNextPage() ? 'text-slate-600 hover:bg-slate-50 hover:text-blue-600' : 'text-slate-300 cursor-not-allowed'} transition-all shadow-sm`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealManagement;