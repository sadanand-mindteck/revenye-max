
import React, { useState, useMemo } from 'react';
import { 
  MapPin, Users, Globe, ChevronRight, Zap, ArrowLeft, 
  Layers, Briefcase, TrendingUp, DollarSign, Activity, ChevronLeft
} from 'lucide-react';
import { MOCK_DEALS } from '../constants';

type ViewLevel = 'global' | 'region' | 'bu' | 'bdm';

const Regions: React.FC = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('global');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedBU, setSelectedBU] = useState<string | null>(null);

  // Derived Data for Regions Grid
  const regionsSummary = useMemo(() => {
    const summary: Record<string, { rev: number; deals: number; lead: string }> = {
      'North America': { rev: 0, deals: 0, lead: 'Sarah Miller' },
      'Europe': { rev: 0, deals: 0, lead: 'Marcus Brandt' },
      'APAC': { rev: 0, deals: 0, lead: 'Li Wei' },
      'LATAM': { rev: 0, deals: 0, lead: 'Roberto Silva' },
    };

    MOCK_DEALS.forEach(deal => {
      if (summary[deal.region]) {
        summary[deal.region].rev += deal.fyForecast;
        summary[deal.region].deals += 1;
      }
    });

    return Object.entries(summary).map(([name, data]) => ({
      name,
      ...data,
      health: 80 + Math.floor(Math.random() * 20) // Simulated health score
    }));
  }, []);

  // Derived BUs for selected region
  const busInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    const deals = MOCK_DEALS.filter(d => d.region === selectedRegion);
    const bus: Record<string, { rev: number; deals: number; bdmCount: number; status: string }> = {};
    
    deals.forEach(d => {
      if (!bus[d.buHead]) {
        bus[d.buHead] = { rev: 0, deals: 0, bdmCount: 0, status: 'On Track' };
      }
      bus[d.buHead].rev += d.fyForecast;
      bus[d.buHead].deals += 1;
    });

    return Object.entries(bus).map(([name, data]) => ({ name, ...data }));
  }, [selectedRegion]);

  // Derived BDMs for selected BU
  const bdmsInBU = useMemo(() => {
    if (!selectedBU || !selectedRegion) return [];
    const deals = MOCK_DEALS.filter(d => d.region === selectedRegion && d.buHead === selectedBU);
    const bdms: Record<string, { rev: number; deals: number; winRate: string }> = {};

    deals.forEach(d => {
      if (!bdms[d.bdm]) {
        bdms[d.bdm] = { rev: 0, deals: 0, winRate: '68%' };
      }
      bdms[d.bdm].rev += d.fyForecast;
      bdms[d.bdm].deals += 1;
    });

    return Object.entries(bdms).map(([name, data]) => ({ name, ...data }));
  }, [selectedBU, selectedRegion]);

  const navigateBack = () => {
    if (viewLevel === 'bdm') {
      setViewLevel('bu');
    } else if (viewLevel === 'bu') {
      setViewLevel('region');
      setSelectedBU(null);
    } else if (viewLevel === 'region') {
      setViewLevel('global');
      setSelectedRegion(null);
    }
  };

  const handleRegionClick = (name: string) => {
    setSelectedRegion(name);
    setViewLevel('region');
  };

  const handleBUClick = (name: string) => {
    setSelectedBU(name);
    setViewLevel('bu');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Dynamic Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {viewLevel !== 'global' && (
            <button 
              onClick={navigateBack}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200">
            {viewLevel === 'global' ? <Globe size={24} /> : 
             viewLevel === 'region' ? <MapPin size={24} /> : 
             <Layers size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              <span className={viewLevel === 'global' ? 'text-blue-600' : ''}>Global</span>
              {selectedRegion && (
                <>
                  <ChevronRight size={10} />
                  <span className={viewLevel === 'region' ? 'text-blue-600' : ''}>{selectedRegion}</span>
                </>
              )}
              {selectedBU && (
                <>
                  <ChevronRight size={10} />
                  <span className={viewLevel === 'bu' ? 'text-blue-600' : ''}>BU: {selectedBU}</span>
                </>
              )}
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {viewLevel === 'global' ? 'Global Operation Zones' : 
               viewLevel === 'region' ? `${selectedRegion} Operations` : 
               `Business Unit: ${selectedBU}`}
            </h2>
          </div>
        </div>

        {viewLevel === 'global' && (
          <div className="hidden lg:flex items-center gap-6 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-center px-4">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Zones</p>
               <p className="text-xl font-black text-slate-900">4</p>
            </div>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="text-center px-4">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Deals</p>
               <p className="text-xl font-black text-slate-900">{MOCK_DEALS.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Level 0: Global View (Regions) */}
      {viewLevel === 'global' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {regionsSummary.map((reg, i) => (
            <div 
              key={i} 
              onClick={() => handleRegionClick(reg.name)}
              className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-2 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-8">
                 <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <MapPin size={22} />
                 </div>
                 <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                   reg.health > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                 }`}>
                   Health: {reg.health}%
                 </div>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-1">{reg.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 flex items-center gap-1.5">
                <Users size={12} /> {reg.lead}
              </p>
              
              <div className="space-y-4 pt-6 border-t border-slate-50">
                 <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                   <span className="text-lg font-black text-slate-900">${(reg.rev/1000).toFixed(1)}K</span>
                 </div>
                 <div className="flex justify-between items-end">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Deals</span>
                   <span className="text-lg font-black text-slate-900">{reg.deals}</span>
                 </div>
              </div>
              
              <button className="w-full mt-8 py-3 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                Drill Down <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Level 1: Region Detail (BUs) */}
      {viewLevel === 'region' && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <KPICard title="Region Actuals" value={`$${(busInRegion.reduce((acc, curr) => acc + curr.rev, 0)/1000).toFixed(1)}K`} icon={<DollarSign size={20}/>} color="blue" />
             <KPICard title="BU Execution Score" value="92%" icon={<Activity size={20}/>} color="emerald" />
             <KPICard title="Strategic BUs" value={busInRegion.length.toString()} icon={<Layers size={20}/>} color="slate" />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Business Units in {selectedRegion}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Select a BU for Resource Allocation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {busInRegion.map((bu, i) => (
                <div 
                  key={i} 
                  onClick={() => handleBUClick(bu.name)}
                  className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="p-2.5 bg-white rounded-xl text-blue-600 border border-slate-100 shadow-sm">
                      <Layers size={20} />
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-full">
                      {bu.status}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-4">{bu.name}</h4>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="text-slate-400 uppercase tracking-widest">Revenue Flow</span>
                       <span className="text-slate-900">${(bu.rev/1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                       <span className="text-slate-400 uppercase tracking-widest">Deal Count</span>
                       <span className="text-slate-900">{bu.deals} Strategic Deals</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => (
                          <div key={j} className="h-7 w-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600">
                             BD
                          </div>
                        ))}
                     </div>
                     <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Level 2: BU Detail (BDMs) */}
      {viewLevel === 'bu' && (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">BU Controller Profile</h3>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="h-16 w-16 rounded-3xl bg-blue-600 flex items-center justify-center text-xl font-black">
                       {selectedBU?.charAt(0)}
                    </div>
                    <div>
                       <h4 className="text-xl font-black">{selectedBU}</h4>
                       <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">Business Unit Head</p>
                    </div>
                 </div>
                 <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Quarterly Target</span>
                       <span className="font-bold text-sm">$2.4M</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase">Margin Threshold</span>
                       <span className="font-bold text-sm">32%</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">BU Intelligence</h3>
                 <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                       <Zap size={18} className="text-emerald-600" />
                       <span className="text-xs font-bold text-emerald-800">Growth trajectory +14% YoY</span>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                       <Activity size={18} className="text-amber-600" />
                       <span className="text-xs font-bold text-amber-800">2 deals in 'Risk' status</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">BDM Roster in {selectedBU}</h3>
                    <button className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-widest">View Performance Matrix</button>
                  </div>

                  <div className="space-y-4">
                     {bdmsInBU.map((bdm, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Users size={20} />
                             </div>
                             <div>
                                <h5 className="text-sm font-black text-slate-900">{bdm.name}</h5>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Senior BDM • {bdm.deals} Deals</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                             <div className="text-right hidden sm:block">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Managed Pipeline</p>
                                <p className="text-base font-black text-slate-900">${(bdm.rev/1000).toFixed(1)}K</p>
                             </div>
                             <div className="text-right hidden sm:block">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Win Rate</p>
                                <p className="text-base font-black text-emerald-600">{bdm.winRate}</p>
                             </div>
                             <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-all cursor-pointer">
                                <ChevronRight size={18} />
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Context Footer for the Main Page */}
      {viewLevel === 'global' && (
        <div className="bg-slate-900 p-12 rounded-[48px] text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-slate-300">
          <div className="h-32 w-32 rounded-full border-[10px] border-blue-500/20 border-t-blue-500 flex items-center justify-center text-2xl font-black">
            84%
          </div>
          <div className="flex-1">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
                <Zap size={24} className="text-amber-400" /> Systemic Integration Efficiency
              </h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                Cross-regional deal flow synchronization is operating at high efficiency. Current lead-to-revenue conversion cycle has been reduced by 14 days compared to previous FY.
              </p>
          </div>
          <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
            Review Global SRC Report
          </button>
        </div>
      )}
    </div>
  );
};

const KPICard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100'
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-2xl border ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default Regions;
