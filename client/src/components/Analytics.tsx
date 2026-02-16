import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Area
} from 'recharts';
import { TrendingUp, Filter, Download, Activity, BrainCircuit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useSessionYearStore } from '@/store/sessionYear';

const Analytics = () => {
  const sessionYear = useSessionYearStore((state) => state.sessionYear);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics-summary', sessionYear],
    queryFn: async () => {
      const response = await apiClient.get<Array<{ period: string; revenue: number; profit: number; margin: number }>>(
        '/analytics/summary',
        { params: { financialYear: sessionYear } },
      );
      return response.data;
    },
  });

  const analyticsData = useMemo(() => data ?? [], [data]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500 max-w-[1600px] mx-auto pb-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">Financial Intelligence</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Predictive margin analysis & trend modeling</p>
          {isLoading && <p className="text-[10px] font-bold text-slate-400 mt-1">Fetching datasets...</p>}
          {isError && <p className="text-[10px] font-bold text-red-500 mt-1">Data unavailable</p>}
        </div>
        <div className="flex gap-2 items-center">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all uppercase tracking-wide">
            <Filter size={14} /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 shadow-sm transition-all uppercase tracking-wide">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Chart Section */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-[420px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
                  <Activity size={16} />
               </div>
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Revenue vs Profit Growth</h3>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Revenue</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Profit</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Margin %</span>
               </div>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" fill="#3b82f6" fillOpacity={0.05} stroke="#3b82f6" strokeWidth={2} />
                <Bar dataKey="profit" barSize={32} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={2} dot={{r: 4, fill: '#f59e0b'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel: Predictions & Insights */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Prediction Card */}
          <div className="bg-indigo-600 p-5 rounded-xl text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden h-[180px]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <BrainCircuit size={80} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <TrendingUp size={14} className="text-indigo-200" /> AI Prediction Engine
            </h3>
            <div className="space-y-4 relative z-10">
               <div>
                 <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest mb-0.5">Projected FY Closing</p>
                 <p className="text-3xl font-black">$32.5M</p>
               </div>
               <div className="pt-4 border-t border-indigo-500/30">
                 <div className="flex justify-between items-end mb-1">
                    <p className="text-indigo-200 text-[9px] font-black uppercase tracking-widest">Confidence Score</p>
                    <p className="text-xs font-black">94%</p>
                 </div>
                 <div className="h-1.5 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{width: '94%'}}></div>
                 </div>
               </div>
            </div>
          </div>
          
          {/* Insights Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Generated Insights</h3>
             <ul className="space-y-3">
               {[
                 'AI deals are driving 40% higher margins.',
                 'Q3 Europe forecast needs 12% adjustment.',
                 'BDM churn is at historical low (2.1%).'
               ].map((text, i) => (
                 <li key={i} className="flex gap-2.5 items-start text-[11px] font-semibold text-slate-600 leading-snug">
                   <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                   {text}
                 </li>
               ))}
             </ul>
             
             <div className="mt-6 pt-4 border-t border-slate-100">
               <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 hover:text-slate-700 transition-all">
                  View Full Report
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;