
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, ComposedChart, Line, Area
} from 'recharts';
import { TrendingUp, Filter, Download } from 'lucide-react';

const analyticsData = [
  { period: '2023-H1', revenue: 4200, profit: 1200, margin: 28 },
  { period: '2023-H2', revenue: 5800, profit: 1800, margin: 31 },
  { period: '2024-H1', revenue: 6400, profit: 2100, margin: 32 },
  { period: '2024-H2', revenue: 7900, profit: 2800, margin: 35 },
];

const Analytics = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Financial Intelligence</h2>
          <p className="text-slate-500 text-sm font-medium">Advanced trend modeling and predictive margin analysis.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all">
            <Download size={16} /> Export Dataset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Revenue vs Profit Growth</h3>
            <div className="flex gap-6">
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                 <span className="text-[10px] font-black text-slate-500 uppercase">Revenue</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                 <span className="text-[10px] font-black text-slate-500 uppercase">Profit</span>
               </div>
            </div>
          </div>
          <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" fill="#3b82f6" fillOpacity={0.05} stroke="#3b82f6" strokeWidth={4} />
                <Bar dataKey="profit" barSize={40} fill="#10b981" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="margin" stroke="#f59e0b" strokeWidth={3} dot={{r: 6, fill: '#f59e0b'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-indigo-600 p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-200">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={18} /> Prediction Engine
            </h3>
            <div className="space-y-6">
               <div>
                 <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Estimated 2025 Revenue</p>
                 <p className="text-4xl font-black">$32.5M</p>
               </div>
               <div className="pt-6 border-t border-white/10">
                 <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Confidence Score</p>
                 <div className="flex items-center gap-4">
                    <p className="text-xl font-black">94%</p>
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white rounded-full" style={{width: '94%'}}></div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Key Insights</h3>
             <ul className="space-y-4">
               {[
                 'AI deals are driving 40% higher margins.',
                 'Q3 Europe forecast needs 12% adjustment.',
                 'BDM churn is at historical low (2.1%).'
               ].map((text, i) => (
                 <li key={i} className="flex gap-3 text-xs font-medium text-slate-600">
                   <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                   {text}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
