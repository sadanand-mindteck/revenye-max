
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Target, Activity, DollarSign, Wallet, Globe, 
  Users, Layers, Zap, Briefcase, TrendingUp, Search, MessageSquare, Clock, Filter
} from 'lucide-react';
import { User, UserRole } from '../types';

// Specialized Data for different roles
const trendData = [
  { name: 'Apr', fct: 850, act: 820, bgt: 800 },
  { name: 'May', fct: 940, act: 910, bgt: 800 },
  { name: 'Jun', fct: 1100, act: 1250, bgt: 900 },
  { name: 'Jul', fct: 1050, act: 1080, bgt: 900 },
  { name: 'Aug', fct: 1200, act: 1150, bgt: 1000 },
  { name: 'Sep', fct: 1350, act: 1420, bgt: 1000 },
];

const buPerformance = [
  { name: 'Cloud & Infrastructure', revenue: 4500, growth: 12.5, status: 'On Track' },
  { name: 'Digital Engineering', revenue: 3800, growth: 8.2, status: 'At Risk' },
  { name: 'Artificial Intelligence', revenue: 5200, growth: 24.1, status: 'High Growth' },
  { name: 'Cybersecurity', revenue: 2100, growth: -2.4, status: 'Steady' },
];

const marketingLeads = [
  { name: 'Q1', leads: 400, conv: 12 },
  { name: 'Q2', leads: 520, conv: 15 },
  { name: 'Q3', leads: 480, conv: 11 },
  { name: 'Q4', leads: 610, conv: 18 },
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Dynamic Role-Based Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-blue-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
          {isGlobalView && <Globe size={180} />}
          {isBDMView && <Briefcase size={180} />}
          {isBUHView && <Layers size={180} />}
          {isPracticeView && <Zap size={180} />}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300">
              {user.role} Control Panel
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Welcome Back, {user.name.split(' ')[0]}</h2>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
            {isGlobalView && "Global revenue streams are exceeding current FY targets by 12.4%. Major growth detected in APAC region."}
            {isBUHView && "Your Business Unit is currently at 84% capacity. Margin protection is high, but delivery velocity needs attention."}
            {isBDMView && "You are 12% ahead of your quarterly quota. Two high-value deals in 'Final Negotiation' require immediate focus."}
            {isPracticeView && "Resource utilization has stabilized at 88%. Training certification for Cloud Practice is now 92% complete."}
          </p>
        </div>
      </div>

      {/* KPI Section - Heavily Custom per Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {isGlobalView && (
          <>
            <KPICard title="Total FY Revenue" value="$24.8M" trend="+8.4%" icon={<DollarSign size={22} />} color="blue" />
            <KPICard title="Operating Margin" value="34.2%" trend="+2.1%" icon={<Activity size={22} />} color="emerald" />
            <KPICard title="Total Headcount" value="1,240" trend="+4%" icon={<Users size={22} />} color="slate" />
            <KPICard title="Pipeline Value" value="$142M" trend="+12%" icon={<TrendingUp size={22} />} color="indigo" />
          </>
        )}
        {isBDMView && (
          <>
            <KPICard title="My Quarterly Quota" value="$450K" trend="78% Done" icon={<Target size={22} />} color="blue" />
            <KPICard title="Deal Velocity" value="24 Days" trend="-4 Days" icon={<Clock size={22} />} color="emerald" />
            <KPICard title="Win Rate" value="42%" trend="+5%" icon={<Activity size={22} />} color="slate" />
            <KPICard title="Estimated Commission" value="$18.4K" trend="Pending" icon={<Wallet size={22} />} color="indigo" />
          </>
        )}
        {isBUHView && (
          <>
            <KPICard title="BU Revenue YTD" value="$8.4M" trend="+14%" icon={<Layers size={22} />} color="blue" />
            <KPICard title="Utilized Budget" value="$6.2M" trend="On Track" icon={<Wallet size={22} />} color="emerald" />
            <KPICard title="Billable Hours" value="14.2K" trend="+8%" icon={<Clock size={22} />} color="slate" />
            <KPICard title="Bench Strength" value="14%" trend="-2%" icon={<Users size={22} />} color="indigo" isPositive={false} />
          </>
        )}
        {isPracticeView && (
          <>
            <KPICard title="Practice Delivery" value="$4.2M" trend="+6%" icon={<Zap size={22} />} color="blue" />
            <KPICard title="Delivery Excellence" value="4.8/5" trend="+0.2" icon={<Activity size={22} />} color="emerald" />
            <KPICard title="SLA Compliance" value="99.4%" trend="+0.1%" icon={<ShieldCheck size={22} />} color="slate" />
            <KPICard title="Risk Factor" value="Low" trend="Stable" icon={<AlertCircle size={22} />} color="indigo" />
          </>
        )}
      
      </div>

      {/* Primary Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {isPracticeView ? "Project Delivery Timeline" : "Revenue Trajectory Analysis"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Data Stream • FY 2024</p>
            </div>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"><Filter size={18} /></button>
               <button className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"><Search size={18} /></button>
            </div>
          </div>
          
          <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
             
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorFct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="fct" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorFct)" />
                  <Area type="monotone" dataKey="act" stroke="#10b981" strokeWidth={4} fill="transparent" />
                  <Line type="monotone" dataKey="bgt" stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 8" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Specialized Secondary Metric Block */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm h-full">
              {isGlobalView && (
                <div className="space-y-8">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Globe size={18} className="text-blue-500" /> Regional P&L Breakdown
                   </h3>
                   <div className="space-y-6">
                      {[
                        { name: 'Americas', val: 85, color: 'bg-blue-600' },
                        { name: 'Europe', val: 64, color: 'bg-indigo-600' },
                        { name: 'APAC', val: 92, color: 'bg-emerald-600' },
                        { name: 'LATAM', val: 32, color: 'bg-amber-600' }
                      ].map((reg) => (
                        <div key={reg.name} className="space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
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
                <div className="space-y-8">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Target size={18} className="text-indigo-500" /> Conversion Funnel
                   </h3>
                   <div className="flex flex-col gap-4">
                      {[
                        { label: 'Leads', val: 120, col: 'bg-slate-900' },
                        { label: 'Qualified', val: 84, col: 'bg-slate-800' },
                        { label: 'Proposal', val: 32, col: 'bg-blue-600' },
                        { label: 'Negotiation', val: 12, col: 'bg-blue-700' },
                        { label: 'Won', val: 8, col: 'bg-emerald-600' }
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-4">
                           <div className={`h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold ${s.col}`} style={{ width: `${(s.val/120)*100}%` }}>
                             {s.val}
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase">{s.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {isPracticeView && (
                <div className="space-y-8">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Zap size={18} className="text-amber-500" /> Skill Inventory Index
                   </h3>
                   <div className="h-70">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                          <PolarGrid stroke="#f1f5f9" />
                          <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                          <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              )}

            
              {isBUHView && (
                <div className="space-y-8">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Layers size={18} className="text-blue-500" /> BU Talent Distribution
                   </h3>
                   <div className="space-y-5">
                      {buPerformance.map((bu) => (
                        <div key={bu.name} className="flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-900">{bu.name}</span>
                              <span className="text-[9px] text-slate-400 uppercase font-black">{bu.status}</span>
                           </div>
                           <div className="flex -space-x-2">
                              {[1,2,3,4].map(i => (
                                <div key={i} className={`h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold ${['bg-blue-100 text-blue-600', 'bg-indigo-100 text-indigo-600', 'bg-emerald-100 text-emerald-600', 'bg-slate-100 text-slate-600'][i-1]}`}>
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
      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute bottom-0 right-0 p-12 opacity-5 translate-y-12">
            <TrendingUp size={300} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
               <div>
                 <h3 className="text-2xl font-black uppercase tracking-tight">Active Command Queue</h3>
                 <p className="text-slate-400 text-sm font-medium">Critical items requiring immediate session authentication.</p>
               </div>
               <button className="px-6 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                 View History
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <ActionCard 
                 title={isBDMView ? "Deal Staleness" : "Governance Alert"}
                 desc={isBDMView ? "Alpha Corp deal hasn't moved stages in 12 days. Requires engagement." : 
                       "Three projects in Europe Zone missing Q3 forecast baseline."}
                 tag="High Priority"
                 color="text-red-400"
               />
               <ActionCard 
                 title={isPracticeView ? "Utilization Risk" : isBUHView ? "P&L Variance" : "System Update"}
                 desc={isPracticeView ? "AI Practice utilization hitting 98%. Risk of developer burnout detected." :
                       isBUHView ? "Digital Engineering BU showing 4% negative variance in actual costs." :
                       "Monthly Mindteck core logic updated to version 4.2. Review documentation."}
                 tag="Action Needed"
                 color="text-amber-400"
               />
               <ActionCard 
                 title="Compliance Audit"
                 desc="Bi-annual revenue compliance audit starting Monday. Prepare legal data entities."
                 tag="Scheduled"
                 color="text-blue-400"
               />
            </div>
         </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, desc, tag, color }) => (
  <div className="p-8 bg-white/5 border border-white/10 rounded-4xl hover:bg-white/10 transition-all cursor-pointer group">
    <div className="flex items-center justify-between mb-4">
       <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{tag}</span>
       <ArrowUpRight size={16} className="text-slate-500 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
    </div>
    <h4 className="text-lg font-bold mb-2">{title}</h4>
    <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
  </div>
);

const KPICard = ({ title, value, trend, icon, color, isPositive = true }) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl border transition-colors ${colorMap[color]} group-hover:bg-slate-900 group-hover:text-white`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h4>
      </div>
    </div>
  );
};

// Missing Icons
// Fixed: Made className optional with a default value to satisfy TypeScript and call sites where it's not provided
const AlertCircle = ({ size, className = "" }: { size: number; className?: string }) => <Activity size={size} className={className} />;
const ShieldCheck = ({ size, className = "" }: { size: number; className?: string }) => <Globe size={size} className={className} />;

export default Dashboard;
