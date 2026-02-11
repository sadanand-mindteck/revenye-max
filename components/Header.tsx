
import React from 'react';
import { Calendar, Bell, ChevronDown, UserCircle } from 'lucide-react';
import { FISCAL_YEARS } from '../constants';
import { User } from '../types';

interface HeaderProps {
  fiscalYear: string;
  setFiscalYear: (fy: string) => void;
  activeTabLabel: string;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ fiscalYear, setFiscalYear, activeTabLabel, user }) => {
  if (!user) return null;

  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-slate-800">{activeTabLabel}</h1>
        <div className="h-4 w-px bg-slate-200"></div>
        
        <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 cursor-pointer">
          <Calendar size={12} className="text-slate-400" />
          <select 
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none cursor-pointer appearance-none pr-4"
          >
            {FISCAL_YEARS.map(fy => (
              <option key={fy} value={fy}>{fy}</option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-1 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-1.5 text-slate-500 hover:bg-slate-100 relative transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500"></span>
        </button>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-2 px-1 py-1 hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-slate-700 leading-tight">{user.name}</p>
            <p className="text-[9px] text-slate-400 uppercase">{user.role}</p>
          </div>
          <UserCircle size={24} className="text-slate-300" />
        </div>
      </div>
    </header>
  );
};

export default Header;
