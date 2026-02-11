
import React from 'react';
import { NAVIGATION_ITEMS, ROLE_PERMISSIONS } from '../constants';
import { TrendingUp, LogOut, Shield } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  if (!user) return null;

  const allowedTabs = ROLE_PERMISSIONS[user.role] || [];
  const filteredNav = NAVIGATION_ITEMS.filter(item => allowedTabs.includes(item.id));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen transition-all duration-300 relative z-[60]">
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2.5 text-white">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <TrendingUp size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">RevenueMax</span>
        </div>
      </div>

      <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        {filteredNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 bg-slate-800/50 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-blue-400" />
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest truncate">{user.role}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold text-slate-400 group"
        >
          <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          End Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
