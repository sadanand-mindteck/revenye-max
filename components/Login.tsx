
import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { TrendingUp, ShieldCheck, Lock, ChevronRight, UserCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [loading, setLoading] = useState(false);

  const roles = Object.values(UserRole);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin({
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: 'Demo Executive',
        email: 'executive@revenuemax.enterprise',
        role: selectedRole
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-inter">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-6 text-white">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">RevenueMax MIS</h1>
          <p className="text-slate-500 font-medium mt-2">Enterprise Revenue Management Portal</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCircle size={14} /> Identity Management
              </label>
              <div className="relative group">
                <select 
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-900"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-all pointer-events-none rotate-90" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} /> Security Key
              </label>
              <input 
                type="password" 
                disabled
                value="••••••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-400"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Establish Session <ChevronRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vault Protected Environment</span>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Restricted Access Systems • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;
