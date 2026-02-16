
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
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">{activeTabLabel}</h1>
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
        
        <div className="relative group">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-slate-100 transition-all shadow-sm">
            <Calendar size={16} className="text-blue-500" />
            <select 
              value={sessionYear}
              onChange={(e) => setSessionYear(e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer appearance-none pr-6"
            >
              {sessionYears.map((fy) => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Role Badge */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full">
           <ShieldCheck size={14} className="text-blue-600" />
           <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{user.role} Context</span>
        </div>

        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 ring-2 ring-white rounded-full"></span>
        </button>
        
        <div className="h-7 w-px bg-slate-200 mx-2"></div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all"
        >
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">{user.name}</p>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{user.role}</p>
          </div>
          <UserCircle size={28} className="text-slate-200" />
        </button>
      </div>
    </header>
  );
};

export default Header;
