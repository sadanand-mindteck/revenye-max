
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import DealManagement from '@/components/DealManagement';
import DealEntry from '@/components/DealEntry';
import Analytics from '@/components/Analytics';
import Regions from '@/components/Regions';
import DataUpload from '@/components/DataUpload';
import Login from '@/components/Login';
import { User, UserRole } from '@/types';
import { ROLE_PERMISSIONS } from '@/constants';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fiscalYear, setFiscalYear] = useState('FY 2024-25');

  // Persistence simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('revenue_max_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('revenue_max_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('revenue_max_user');
  };

  const getActiveTabLabel = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Insights';
      case 'deals': return 'Portfolio Control';
      case 'entry': return 'Revenue Registration';
      case 'analytics': return 'Financial Intelligence';
      case 'regions': return 'Global Zones';
      case 'upload': return 'Data Ingestion Hub';
      case 'settings': return 'System Settings';
      default: return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    }
  };

  const isTabAllowed = (tabId: string) => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(tabId);
  };

  const renderContent = () => {
    if (!user) return null;

    if (!isTabAllowed(activeTab)) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 animate-in fade-in zoom-in duration-500">
          <div className="p-8 bg-red-50 text-red-500 rounded-[40px] border border-red-100 mb-8 shadow-2xl shadow-red-500/10">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Access Restricted</h2>
          <p className="text-sm font-medium max-w-sm text-center">Your profile (<span className="text-blue-600 font-bold">{user.role}</span>) does not have the required clearance level for the <span className="font-bold">"{activeTab}"</span> directive.</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl"
          >
            Return to Command Center
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'deals':
        return <DealManagement />;
      case 'entry':
        return <DealEntry user={user} />;
      case 'analytics':
        return <Analytics />;
      case 'regions':
        return <Regions />;
      case 'upload':
        return <DataUpload />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <div className="p-6 bg-slate-100 rounded-full mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Module Offline</h2>
            <p className="text-sm font-medium">The <span className="text-blue-600 font-bold">"{activeTab}"</span> interface is currently undergoing scheduled maintenance.</p>
          </div>
        );
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-inter selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Layer */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Orchestration Layer */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header 
          fiscalYear={fiscalYear} 
          setFiscalYear={setFiscalYear} 
          activeTabLabel={getActiveTabLabel()}
          user={user}
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {/* Content Wrapper */}
          <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-12 min-h-full">
            {renderContent()}
            
            <footer className="mt-20 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pb-12">
              <div className="flex items-center gap-4">
                <span>© 2024 RevenueMax Enterprise</span>
                <span className="h-4 w-px bg-slate-200"></span>
                <a href="#" className="hover:text-blue-600 transition-colors">Compliance Hub</a>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Secure Channel Active
                </span>
                <span className="h-4 w-px bg-slate-200"></span>
                <span>V 4.2.0-STABLE</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
