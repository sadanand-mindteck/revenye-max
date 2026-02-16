
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { NAVIGATION_ITEMS, ROLE_PERMISSIONS } from '@/constants';
import { TrendingUp, LogOut, Shield } from 'lucide-react';
import { User } from '@/types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  if (!user) return null;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      await apiClient.post(
        '/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
    },
    onSettled: () => {
      localStorage.removeItem('token');
      onLogout();
    },
  });

  const allowedTabs = ROLE_PERMISSIONS[user.role] || [];
  const filteredNav = NAVIGATION_ITEMS.filter(item => allowedTabs.includes(item.id));
  const routeMap: Record<string, string> = {
    dashboard: '/dashboard',
    deals: '/deals',
    entry: '/entry',
    analytics: '/analytics',
    regions: '/regions',
    upload: '/upload',
    settings: '/settings',
  };

  return (
    <aside className="w-56 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen transition-all duration-300 relative z-[60]">
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <TrendingUp size={20} />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Mindteck</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const path = routeMap[item.id];
          if (!path) return null;
          return (
            <NavLink
              key={item.id}
              to={path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-[13px] font-semibold group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 bg-slate-800/50 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 mb-3">
          <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-bold text-blue-400">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{user.name}</p>
            <p className="text-[9px] text-slate-500 font-semibold truncate">{user.email}</p>
            <div className="flex items-center gap-1">
              <Shield size={10} className="text-blue-400" />
              <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest truncate">{user.role}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all text-[13px] font-bold text-slate-400 group"
        >
          <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
