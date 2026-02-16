
import React from 'react';
import { Calendar, Bell, ChevronDown, UserCircle, ShieldCheck } from 'lucide-react';
import { User } from '@/types';
import { useSessionYearStore } from '@/store/sessionYear';

interface HeaderProps {
  activeTabLabel: string;
  user: User | null;
  onOpenProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTabLabel, user, onOpenProfile }) => {
  if (!user) return null;
  const { sessionYear, sessionYears, setSessionYear } = useSessionYearStore();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">{activeTabLabel}</h1>
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        
        <div className="relative group">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
            <Calendar size={16} className="text-blue-500" />
            <select 
              value={sessionYear}
              onChange={(e) => setSessionYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              {sessionYears.map((fy) => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
           <ShieldCheck size={14} className="text-blue-600" />
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user.role} Context</span>
        </div>

        <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 ring-2 ring-white rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight">{user.name}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
          </div>
          <UserCircle size={32} className="text-slate-200" />
        </button>
      </div>
    </header>
  );
};

export default Header;
