
import React, { useMemo, useState } from 'react';
import { 
  ChevronDown, ChevronRight, MoreHorizontal, Filter, 
  Search, Plus, ExternalLink, User, Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

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

  const getSessionYears = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const baseYear = now.getMonth() < 3 ? currentYear - 1 : currentYear;
    return [
      `${baseYear - 2}-${(baseYear - 1).toString().slice(-2)}`,
      `${baseYear - 1}-${baseYear.toString().slice(-2)}`,
      `${baseYear}-${(baseYear + 1).toString().slice(-2)}`,
      `${baseYear + 1}-${(baseYear + 2).toString().slice(-2)}`,
    ];
  };

  const sessionYears = useMemo(() => getSessionYears(), []);
  const [sessionYear, setSessionYear] = useState(sessionYears[2]);

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

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Closed Won': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lead': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'On Hold': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portfolio Governance</h2>
          <p className="text-slate-500 text-sm font-medium">Tracking {deals.length} major deals across 5 global regions</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FY</label>
            <select
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 bg-white"
              value={sessionYear}
              onChange={(event) => setSessionYear(event.target.value)}
            >
              {sessionYears.map((session) => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter projects..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={16} /> Advanced Filters
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Plus size={16} /> Register New Deal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-8 py-5 w-10"></th>
                <th className="px-6 py-5 min-w-[280px]">Project Entity</th>
                <th className="px-6 py-5">Region / BDM</th>
                <th className="px-6 py-5 text-right">FY Forecast</th>
                <th className="px-6 py-5 text-right">FY Budget</th>
                <th className="px-6 py-5 text-right">FY Variance</th>
                <th className="px-6 py-5">Execution Status</th>
                <th className="px-8 py-5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-8 py-10 text-center text-xs font-bold text-slate-400">
                    Loading projects...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={8} className="px-8 py-10 text-center text-xs font-bold text-red-500">
                    Failed to load projects.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && deals.map((deal) => {
                const isExpanded = expandedRows.has(deal.id);
                return (
                  <React.Fragment key={deal.id}>
                    <tr 
                      className={`group transition-all cursor-pointer ${isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleRow(deal.id)}
                    >
                      <td className="px-8 py-6">
                        <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{deal.projectName}</span>
                          <span className="text-xs text-slate-500 font-medium">{deal.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600 w-fit">
                            {deal.region}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <User size={12} /> {deal.bdm || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right font-bold text-slate-900 text-sm">
                        ${(deal.fyForecast / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-6 text-right text-slate-500 font-bold text-sm">
                        ${(deal.fyBudget / 1000).toFixed(1)}K
                      </td>
                      <td className={`px-6 py-6 text-right font-extrabold text-sm ${deal.fyForecast - deal.fyBudget >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {deal.fyForecast - deal.fyBudget >= 0 ? '+' : ''}${((deal.fyForecast - deal.fyBudget) / 1000).toFixed(1)}K
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border uppercase tracking-widest ${getStatusStyle(deal.status || 'In Progress')}`}>
                          {deal.status || 'In Progress'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm border border-transparent hover:border-slate-200">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expandable Breakdown */}
                    {isExpanded && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={8} className="px-12 py-8 border-l-4 border-blue-500">
                          <div className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 p-6 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between mb-6">
                              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                {/* Added missing Activity import */}
                                <Activity size={16} className="text-blue-500" />
                                Quarterly Financial Health
                              </h4>
                              <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">
                                Open Full Deal Log
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
                                const qVal = Math.floor(deal.fyForecast / 4);
                                return (
                                  <div key={q} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{q} Projection</p>
                                    <div className="flex justify-between items-end">
                                      <h5 className="text-xl font-black text-slate-900">${(qVal/1000).toFixed(1)}K</h5>
                                      <span className="text-[10px] font-bold text-emerald-600">+4.2%</span>
                                    </div>
                                    <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                       <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="mt-6 flex gap-3">
                               <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all">
                                 <Plus size={14} /> Update Monthly ACT
                               </button>
                               <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                                 <ExternalLink size={14} /> View CRM Entity
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
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Showing {deals.length} Priority Project Streams</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-not-allowed">Previous</button>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealManagement;
