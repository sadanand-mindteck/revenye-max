
import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, DollarSign, Users, TrendingUp, Globe, Activity, Target, Briefcase, Clock, Zap
} from 'lucide-react';
import { User, UserRole } from '../types';

const trendData = [
  { name: 'Apr', fct: 850, act: 820 },
  { name: 'May', fct: 940, act: 910 },
  { name: 'Jun', fct: 1100, act: 1250 },
  { name: 'Jul', fct: 1050, act: 1080 },
  { name: 'Aug', fct: 1200, act: 1150 },
  { name: 'Sep', fct: 1350, act: 1420 },
];

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isGlobalView = user.role === UserRole.CSO || user.role === UserRole.ADMIN;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-slate-500">Global Revenue Performance Summary</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#1677ff] text-white text-xs font-semibold hover:bg-[#4096ff] transition-colors">Export Data</button>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors">Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isGlobalView ? (
          <>
            <KPICard title="FY REVENUE" value="$24.82M" trend="+8.4%" icon={<DollarSign size={14} />} />
            <KPICard title="NET MARGIN" value="34.21%" trend="+2.1%" icon={<Activity size={14} />} />
            <KPICard title="GLOBAL HC" value="1,240" trend="+4%" icon={<Users size={14} />} />
            <KPICard title="PIPELINE" value="$142.5M" trend="+12%" icon={<TrendingUp size={14} />} />
          </>
        ) : (
          <>
            <KPICard title="TARGET" value="$4.5M" trend="82% achieved" icon={<Target size={14} />} />
            <KPICard title="ACTIVE DEALS" value="12" trend="+2 new" icon={<Briefcase size={14} />} />
            <KPICard title="UTILIZATION" value="88.2%" trend="-1.5%" icon={<Clock size={14} />} isPositive={false} />
            <KPICard title="UNIT RISK" value="LOW" trend="Stable" icon={<Zap size={14} />} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Revenue Projection Trend</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#1677ff]"></span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#52c41a]"></span>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Actual</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#8c8c8c', fontSize: 10}} />
                <Tooltip contentStyle={{ border: '1px solid #f0f0f0', boxShadow: 'none' }} />
                <Area type="monotone" dataKey="fct" stroke="#1677ff" strokeWidth={1.5} fill="#1677ff05" />
                <Area type="monotone" dataKey="act" stroke="#52c41a" strokeWidth={1.5} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-4 border border-slate-200 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Globe size={12} className="text-[#1677ff]" /> Region Performance
          </h3>
          <div className="space-y-4">
            {[
              { name: 'North America', val: 85, color: 'bg-[#1677ff]' },
              { name: 'Europe', val: 64, color: 'bg-[#1677ff]' },
              { name: 'APAC', val: 92, color: 'bg-[#52c41a]' },
              { name: 'LATAM', val: 32, color: 'bg-[#faad14]' }
            ].map((reg) => (
              <div key={reg.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-600">
                  <span>{reg.name}</span>
                  <span className="font-bold">{reg.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${reg.color}`} style={{ width: `${reg.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-slate-100">
             <div className="bg-slate-50 p-3 border border-slate-200">
               <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">System Health</p>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500"></div>
                 <span className="text-xs font-semibold text-slate-800">Operational Stable</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, icon, isPositive = true }) => (
  <div className="bg-white p-3 border border-slate-200 hover:border-[#1677ff] transition-all cursor-default">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${isPositive ? 'text-[#52c41a]' : 'text-[#ff4d4f]'}`}>
        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <h4 className="text-xl font-bold text-slate-800">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
