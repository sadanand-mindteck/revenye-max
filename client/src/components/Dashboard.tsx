import React from 'react';
import { 
  Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Target, Activity, DollarSign, Wallet, Globe, 
  Users, Layers, Zap, Briefcase, TrendingUp, Search, Filter, AlertCircle, ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useSessionYearStore } from '@/store/sessionYear';

// Specialized Data for different roles
const buPerformance = [
  { name: 'Cloud & Infra', revenue: 4500, growth: 12.5, status: 'On Track' },
  { name: 'Digital Eng', revenue: 3800, growth: 8.2, status: 'At Risk' },
  { name: 'AI & Data', revenue: 5200, growth: 24.1, status: 'High Growth' },
  { name: 'Cybersecurity', revenue: 2100, growth: -2.4, status: 'Steady' },
];

const skillData = [
  { subject: 'Cloud', A: 120, fullMark: 150 },
  { subject: 'AI/ML', A: 98, fullMark: 150 },
  { subject: 'UI/UX', A: 86, fullMark: 150 },
  { subject: 'Cyber', A: 99, fullMark: 150 },
  { subject: 'DevOps', A: 110, fullMark: 150 },
];

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isGlobalView = user.role === UserRole.CSO || user.role === UserRole.ADMIN;
  const isBUHView = user.role === UserRole.BUH;
  const isBDMView = user.role === UserRole.BDM;
  const isPracticeView = user.role === UserRole.PRACTICE_HEAD;

  const sessionYear = useSessionYearStore((state) => state.sessionYear);

  const { data: trendData, isLoading, isError } = useQuery({
    queryKey: ['dashboard-trends', sessionYear],
    queryFn: async () => {
      const response = await apiClient.get<Array<{ name: string; fct: number; act: number; bgt: number }>>(
        '/dashboard/trends',
        { params: { financialYear: sessionYear } },
      );
      return response.data;
    },
  });

  const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
    queryKey: ['dashboard-summary', sessionYear],
    queryFn: async () => {
      const response = await apiClient.get<{ 
        totalRevenue: number;
        operatingMargin: number;
        totalHeadcount: number;
        pipelineValue: number;
        projectCount: number;
        avgForecastPerProject: number;
      }>(
        '/dashboard/summary',
        { params: { financialYear: sessionYear, role: user.role, userId: Number(user.id) } },
      );
      return response.data;
    },
  });

  const totalRevenue = summaryData?.totalRevenue ?? 0;
  const operatingMargin = summaryData?.operatingMargin ?? 0;
  const totalHeadcount = summaryData?.totalHeadcount ?? 0;
  const pipelineValue = summaryData?.pipelineValue ?? 0;
  const projectCount = summaryData?.projectCount ?? 0;
  const avgForecastPerProject = summaryData?.avgForecastPerProject ?? 0;
  const summaryTrend = isSummaryLoading ? 'Loading' : isSummaryError ? 'Error' : 'Live';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4 max-w-[1600px] mx-auto">
      {/* Dynamic Role-Based Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group h-[140px] flex flex-col justify-center">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          {isGlobalView && <Globe size={100} />}
          {isBDMView && <Briefcase size={100} />}
          {isBUHView && <Layers size={100} />}
          {isPracticeView && <Zap size={100} />}
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded text-[9px] font-black uppercase tracking-widest text-blue-300">
              {user.role} Control Panel
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Welcome Back, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-400 text-xs font-medium max-w-xl leading-relaxed truncate">
            {isGlobalView && "Global revenue streams are exceeding current FY targets by 12.4%. Major growth detected in APAC region."}
            {isBUHView && "Your Business Unit is currently at 84% capacity. Margin protection is high."}
            {isBDMView && "You are 12% ahead of your quarterly quota. Two high-value deals in 'Final Negotiation' require immediate focus."}
            {isPracticeView && "Resource utilization has stabilized at 88%. Training certification for Cloud Practice is now 92% complete."}
          </p>
        </div>
      </div>

      {/* KPI Section - Heavily Custom per Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(isSummaryLoading || isSummaryError) && (
          <div className="md:col-span-2 xl:col-span-4">
            <div className={`rounded-xl border px-3 py-2 text-[10px] font-bold ${isSummaryError ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {isSummaryError ? 'KPI summary failed to load.' : 'Loading KPI summary...'}
            </div>
          </div>
        )}
        {isGlobalView && (
          <>
            <KPICard title="Total FY Revenue" value={`$${(totalRevenue / 1_000_000).toFixed(1)}M`} trend={summaryTrend} icon={<DollarSign size={16} />} color="blue" />
            <KPICard title="Operating Margin" value={`${operatingMargin.toFixed(1)}%`} trend={summaryTrend} icon={<Activity size={16} />} color="emerald" />
            <KPICard title="Total Headcount" value={totalHeadcount.toLocaleString()} trend={summaryTrend} icon={<Users size={16} />} color="slate" />
            <KPICard title="Pipeline Value" value={`$${(pipelineValue / 1_000_000).toFixed(1)}M`} trend={summaryTrend} icon={<TrendingUp size={16} />} color="indigo" />
          </>
        )}
        {isBDMView && (
          <>
            <KPICard title="My FY Forecast" value={`$${(pipelineValue / 1000).toFixed(1)}K`} trend={summaryTrend} icon={<Target size={16} />} color="blue" />
            <KPICard title="Active Deals" value={projectCount.toLocaleString()} trend={summaryTrend} icon={<Briefcase size={16} />} color="emerald" />
            <KPICard title="Avg Deal Size" value={`$${(avgForecastPerProject / 1000).toFixed(1)}K`} trend={summaryTrend} icon={<Activity size={16} />} color="slate" />
            <KPICard title="My FY Revenue" value={`$${(totalRevenue / 1000).toFixed(1)}K`} trend={summaryTrend} icon={<Wallet size={16} />} color="indigo" />
          </>
        )}
        {isBUHView && (
          <>
            <KPICard title="BU Revenue YTD" value={`$${(totalRevenue / 1_000_000).toFixed(1)}M`} trend={summaryTrend} icon={<Layers size={16} />} color="blue" />
            <KPICard title="Utilized Budget" value={`$${(pipelineValue / 1_000_000).toFixed(1)}M`} trend={summaryTrend} icon={<Wallet size={16} />} color="emerald" />
            <KPICard title="Active Projects" value={projectCount.toLocaleString()} trend={summaryTrend} icon={<Briefcase size={16} />} color="slate" />
            <KPICard title="Bench Strength" value="14%" trend="-2%" icon={<Users size={16} />} color="indigo" isPositive={false} />
          </>
        )}
        {isPracticeView && (
          <>
            <KPICard title="Practice Delivery" value={`$${(totalRevenue / 1_000_000).toFixed(1)}M`} trend={summaryTrend} icon={<Zap size={16} />} color="blue" />
            <KPICard title="Delivery Excellence" value={`${operatingMargin.toFixed(1)}%`} trend={summaryTrend} icon={<Activity size={16} />} color="emerald" />
            <KPICard title="Active Projects" value={projectCount.toLocaleString()} trend={summaryTrend} icon={<ShieldCheck size={16} />} color="slate" />
            <KPICard title="Avg Project Size" value={`$${(avgForecastPerProject / 1_000_000).toFixed(2)}M`} trend={summaryTrend} icon={<AlertCircle size={16} />} color="indigo" />
          </>
        )}
      
      </div>

      {/* Primary Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                {isPracticeView ? "Project Delivery Timeline" : "Revenue Trajectory Analysis"}
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Real-time Data Stream • FY {sessionYear}</p>
              {isLoading && <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Fetching...</p>}
            </div>
            <div className="flex gap-1.5 items-center">
               <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600"><Filter size={14} /></button>
               <button className="p-1.5 hover:bg-slate-50 rounded-lg transition-all border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-600"><Search size={14} /></button>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="fct" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorFct)" />
                  <Area type="monotone" dataKey="act" stroke="#10b981" strokeWidth={2} fill="transparent" />
                  <Line type="monotone" dataKey="bgt" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialized Secondary Metric Block */}
        <div className="lg:col-span-4 flex flex-col h-[400px]">
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1 overflow-auto">
              {isGlobalView && (
                <div className="space-y-6 h-full flex flex-col">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Globe size={14} className="text-blue-500" /> Regional Breakdown
                   </h3>
                   <div className="space-y-4 flex-1">
                      {[
                        { name: 'Americas', val: 85, color: 'bg-blue-600' },
                        { name: 'Europe', val: 64, color: 'bg-indigo-600' },
                        { name: 'APAC', val: 92, color: 'bg-emerald-600' },
                        { name: 'LATAM', val: 32, color: 'bg-amber-600' }
                      ].map((reg) => (
                        <div key={reg.name} className="space-y-1.5">
                           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                             <span>{reg.name}</span>
                             <span className="text-slate-900">{reg.val}% Capacity</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${reg.color}`} style={{ width: `${reg.val}%` }}></div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {isBDMView && (
                <div className="space-y-6 h-full flex flex-col">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Target size={14} className="text-indigo-500" /> Conversion Funnel
                   </h3>
                   <div className="flex flex-col gap-3 flex-1 justify-center">
                      {[
                        { label: 'Leads', val: 120, col: 'bg-slate-900' },
                        { label: 'Qualified', val: 84, col: 'bg-slate-800' },
                        { label: 'Proposal', val: 32, col: 'bg-blue-600' },
                        { label: 'Negotiation', val: 12, col: 'bg-blue-700' },
                        { label: 'Won', val: 8, col: 'bg-emerald-600' }
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-3">
                           <div className={`h-6 rounded flex items-center justify-center text-white text-[9px] font-bold ${s.col}`} style={{ width: `${Math.max(20, (s.val/120)*100)}%` }}>
                             {s.val}
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase">{s.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {isPracticeView && (
                <div className="space-y-4 h-full flex flex-col">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Zap size={14} className="text-amber-500" /> Skill Inventory
                   </h3>
                   <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                          <PolarGrid stroke="#f1f5f9" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                          <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}

              {isBUHView && (
                <div className="space-y-6 h-full flex flex-col">
                   <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Layers size={14} className="text-blue-500" /> BU Talent Distribution
                   </h3>
                   <div className="space-y-4 flex-1">
                      {buPerformance.map((bu) => (
                        <div key={bu.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-900">{bu.name}</span>
                              <span className="text-[8px] text-slate-400 uppercase font-black">{bu.status}</span>
                           </div>
                           <div className="flex -space-x-1.5">
                              {[1,2,3].map(i => (
                                <div key={i} className={`h-5 w-5 rounded-full border border-white flex items-center justify-center text-[6px] font-bold ${i === 3 ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                                   EM
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Role-Based Priority Actions Section */}
      <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden shadow-lg h-[200px] flex flex-col">
         <div className="absolute bottom-0 right-0 p-4 opacity-5 translate-y-4">
            <TrendingUp size={150} />
         </div>
         <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className="text-sm font-black uppercase tracking-tight">Active Command Queue</h3>
                 <p className="text-slate-400 text-[10px] font-medium">Critical items requiring immediate session authentication.</p>
               </div>
               <button className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                 View History
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 min-h-0">
               <ActionCard 
                 title={isBDMView ? "Deal Staleness" : "Governance Alert"}
                 desc={isBDMView ? "Alpha Corp deal stalled 12 days." : "3 EU projects missing Q3 baseline."}
                 tag="High Priority"
                 color="text-red-400"
               />
               <ActionCard 
                 title={isPracticeView ? "Utilization Risk" : isBUHView ? "P&L Variance" : "System Update"}
                 desc={isPracticeView ? "AI Practice utilization at 98%." :
                       isBUHView ? "Digital Eng BU 4% neg variance." :
                       "Logic updated v4.2. Review docs."}
                 tag="Action Needed"
                 color="text-amber-400"
               />
               <ActionCard 
                 title="Audit Prep"
                 desc="Rev compliance audit on Mon."
                 tag="Scheduled"
                 color="text-blue-400"
               />
            </div>
         </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, desc, tag, color }: { title: string; desc: string; tag: string; color: string }) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all cursor-pointer group flex flex-col justify-center h-full">
    <div className="flex items-center justify-between mb-1.5">
       <span className={`text-[8px] font-black uppercase tracking-widest ${color}`}>{tag}</span>
       <ArrowUpRight size={12} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </div>
    <h4 className="text-xs font-bold mb-0.5 text-white truncate">{title}</h4>
    <p className="text-[10px] text-slate-400 leading-snug font-medium line-clamp-2">{desc}</p>
  </div>
);

const KPICard = ({ title, value, trend, icon, color, isPositive = true }: { title: string; value: string; trend: string; icon: React.ReactNode; color: 'blue' | 'emerald' | 'slate' | 'indigo'; isPositive?: boolean }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg border transition-colors ${colorMap[color]} group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-800`}>
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-[9px] font-bold ${isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className="text-lg font-black text-slate-900 tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

export default Dashboard;