
import React from 'react';
import { NAVIGATION_ITEMS, ROLE_PERMISSIONS } from '../constants';
import { TrendingUp, LogOut } from 'lucide-react';
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
    <aside className="w-56 bg-[#001529] text-[#ffffffa6] flex flex-col shrink-0 h-screen sticky top-0 z-[60]">
      <div className="h-12 flex items-center px-4 bg-[#002140]">
        <div className="flex items-center gap-2 text-white">
          <TrendingUp size={14} className="text-[#1677ff]" />
          <span className="font-bold text-sm tracking-tight">RevenueMax MIS</span>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        <div className="space-y-0.5">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-sm relative group ${
                activeTab === item.id
                  ? 'bg-[#1677ff] text-white'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-white' : 'text-[#ffffff73]'}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 14 })}
              </span>
              {item.label}
              {activeTab === item.id && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white"></div>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-auto bg-[#001d33] border-t border-white/10">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
          <p className="text-[10px] text-[#ffffff73] uppercase mt-0.5">{user.role}</p>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 transition-all text-xs border-t border-white/5"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
