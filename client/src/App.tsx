import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import DealManagement from '@/components/DealManagement';
import DealEntry from '@/components/DealEntry';
import Analytics from '@/components/Analytics';
import Regions from '@/components/Regions';
import DataUpload from '@/components/DataUpload';
import Login from '@/components/Login';
import Profile from '@/components/Profile';
import { User } from '@/types';
import { ROLE_PERMISSIONS } from '@/constants';
import { Lock, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Persistence simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('revenue_max_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3000); // Increased slightly
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('revenue_max_user', JSON.stringify(newUser));
    showToast('Session established successfully');
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('revenue_max_user');
    showToast('Session terminated');
    navigate('/login', { replace: true });
  };

  const routeConfig = useMemo(
    () => [
      { id: 'dashboard', path: '/dashboard', label: 'Executive Insights' },
      { id: 'deals', path: '/deals', label: 'Portfolio Control' },
      { id: 'entry', path: '/entry', label: 'Revenue Registration' },
      { id: 'analytics', path: '/analytics', label: 'Financial Intelligence' },
      { id: 'regions', path: '/regions', label: 'Global Zones' },
      { id: 'upload', path: '/upload', label: 'Data Ingestion Hub' },
      { id: 'profile', path: '/profile', label: 'Profile' },
      { id: 'settings', path: '/settings', label: 'System Settings' },
    ],
    [],
  );

  const activeRoute = routeConfig.find((route) => location.pathname.startsWith(route.path));
  const activeTabLabel = activeRoute?.label || 'Dashboard';

  const isTabAllowed = (tabId: string) => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(tabId);
  };

  // Refactored Access Denied View
  const AccessRestricted = ({ tabId }: { tabId: string }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-in fade-in zoom-in duration-300">
      <div className="p-4 bg-red-50 text-red-500 rounded-2xl border border-red-100 mb-6 shadow-sm">
        <Lock size={32} />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Restricted</h2>
      <p className="text-xs font-medium max-w-sm text-center mb-6 text-slate-500">
        Your profile clearance (<span className="text-blue-600 font-bold uppercase">{user?.role}</span>) is insufficient for the{' '}
        <span className="font-bold text-slate-700">"{tabId}"</span> directive.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
      >
        Return to Command Center
      </button>
    </div>
  );

  const guard = (tabId: string, element: React.ReactNode) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!isTabAllowed(tabId)) return <AccessRestricted tabId={tabId} />;
    return element;
  };

  const Toast = toast ? (
    <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`px-4 py-3 rounded-xl text-xs font-bold border shadow-lg flex items-center gap-2 ${
          toast.type === 'success'
            ? 'bg-white border-emerald-100 text-emerald-700 shadow-emerald-500/10'
            : 'bg-white border-red-100 text-red-600 shadow-red-500/10'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
        {toast.message}
      </div>
    </div>
  ) : null;

  return (
    <>
      {Toast}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/*"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : (
              <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-inter selection:bg-blue-100 selection:text-blue-900">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col min-w-0 h-screen">
                  <Header
                    activeTabLabel={activeTabLabel}
                    user={user}
                    onOpenProfile={() => navigate('/profile')}
                  />
                  <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {/* Reduced padding for main container */}
                    <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 min-h-full flex flex-col">
                      <div className="flex-1">
                        <Routes>
                          <Route path="/dashboard" element={guard('dashboard', <Dashboard user={user} />)} />
                          <Route path="/deals" element={guard('deals', <DealManagement />)} />
                          <Route path="/entry" element={guard('entry', <DealEntry user={user} />)} />
                          <Route path="/analytics" element={guard('analytics', <Analytics />)} />
                          <Route path="/regions" element={guard('regions', <Regions />)} />
                          <Route path="/upload" element={guard('upload', <DataUpload />)} />
                          <Route path="/profile" element={guard('profile', <Profile user={user} onPasswordChanged={() => showToast('Password updated')} />)} />
                          <Route path="/settings" element={guard('settings', <div />)} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </div>
                      
                      {/* Compact Footer */}
                      <footer className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest pb-4">
                        <div className="flex items-center gap-4">
                          <span>© 2024 Mindteck Enterprise</span>
                          <span className="h-3 w-px bg-slate-200"></span>
                          <a href="#" className="hover:text-blue-600 transition-colors">Compliance Hub</a>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-100 text-emerald-700">
                            <ShieldCheck size={10} /> Secure Channel Active
                          </span>
                          <span className="h-3 w-px bg-slate-200"></span>
                          <span>SYS V 4.2.0</span>
                        </div>
                      </footer>
                    </div>
                  </main>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;