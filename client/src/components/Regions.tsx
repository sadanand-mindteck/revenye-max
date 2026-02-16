import React, { useMemo, useState } from 'react';
import { 
  MapPin, Users, Globe, ChevronRight, Zap, ArrowLeft, 
  Layers, Activity, DollarSign
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useSessionYearStore } from '@/store/sessionYear';

type ViewLevel = 'global' | 'region' | 'bu' | 'bdm';

const Regions = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('global');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedBU, setSelectedBU] = useState<string | null>(null);

  const sessionYear = useSessionYearStore((state) => state.sessionYear);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['regions-summary', sessionYear],
    queryFn: async () => {
      const response = await apiClient.get<Array<{ 
        projectId: number;
        region: string;
        buHead: string;
        bdm: string;
        fyForecast: number;
      }>>('/regions/summary', {
        params: { financialYear: sessionYear },
      });
      return response.data;
    },
  });

  const deals = useMemo(() => data ?? [], [data]);

  // Derived Data
  const regionsSummary = useMemo(() => {
    const summary: Record<string, { rev: number; deals: number; lead: string }> = {};

    deals.forEach((deal) => {
      const regionName = deal.region || 'Unassigned';
      if (!summary[regionName]) {
        summary[regionName] = { rev: 0, deals: 0, lead: deal.buHead || 'Unassigned' };
      }
      summary[regionName].rev += deal.fyForecast;
      summary[regionName].deals += 1;
    });

    return Object.entries(summary).map(([name, data]) => ({
      name,
      ...data,
      health: 80 + Math.floor(Math.random() * 20),
    }));
  }, [deals]);

  const busInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    const filtered = deals.filter((d) => d.region === selectedRegion);
    const bus: Record<string, { rev: number; deals: number; bdmCount: number; status: string }> = {};
    
    filtered.forEach(d => {
      const buName = d.buHead || 'Unassigned';
      if (!bus[buName]) {
        bus[buName] = { rev: 0, deals: 0, bdmCount: 0, status: 'On Track' };
      }
      bus[buName].rev += d.fyForecast;
      bus[buName].deals += 1;
    });

    return Object.entries(bus).map(([name, data]) => ({ name, ...data }));
  }, [selectedRegion]);

  const bdmsInBU = useMemo(() => {
    if (!selectedBU || !selectedRegion) return [];
    const filtered = deals.filter((d) => d.region === selectedRegion && (d.buHead || 'Unassigned') === selectedBU);
    const bdms: Record<string, { rev: number; deals: number; winRate: string }> = {};

    filtered.forEach(d => {
      const bdmName = d.bdm || 'Unassigned';
      if (!bdms[bdmName]) {
        bdms[bdmName] = { rev: 0, deals: 0, winRate: '68%' };
      }
      bdms[bdmName].rev += d.fyForecast;
      bdms[bdmName].deals += 1;
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
    <div className="space-y-6  animate-in fade-in slide-in-from-right-4 duration-500 max-w-400 mx-auto pb-20">
      {/* Compact Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky  bg-white/80 backdrop-blur-md p-3 rounded-xl border border-slate-200/50 shadow-sm">
        <div className="flex items-center gap-3">
          {viewLevel !== 'global' && (
            <button 
              onClick={navigateBack}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200 shrink-0">
            {viewLevel === 'global' ? <Globe size={18} /> : 
             viewLevel === 'region' ? <MapPin size={18} /> : 
             <Layers size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              <span className={viewLevel === 'global' ? 'text-blue-600 cursor-pointer hover:underline' : 'cursor-pointer hover:text-blue-500'} onClick={() => { setViewLevel('global'); setSelectedRegion(null); setSelectedBU(null); }}>Global</span>
              {selectedRegion && (
                <>
                  <ChevronRight size={10} />
                  <span className={viewLevel === 'region' ? 'text-blue-600' : 'cursor-pointer hover:text-blue-500'} onClick={() => { setViewLevel('region'); setSelectedBU(null); }}>{selectedRegion}</span>
                </>
              )}
              {selectedBU && (
                <>
                  <ChevronRight size={10} />
                  <span className={viewLevel === 'bu' ? 'text-blue-600' : ''}>{selectedBU}</span>
                </>
              )}
            </div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              {viewLevel === 'global' ? 'Global Operations' : 
               viewLevel === 'region' ? `${selectedRegion} Overview` : 
               `Business Unit: ${selectedBU}`}
            </h2>
          </div>
        </div>

        {viewLevel === 'global' && (
          <div className="hidden lg:flex items-center gap-4 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-center px-2">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Regions</p>
               <p className="text-sm font-black text-slate-900">{regionsSummary.length}</p>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="text-center px-2">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deals</p>
               <p className="text-sm font-black text-slate-900">{deals.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Level 0: Global View (Regions) */}
      {viewLevel === 'global' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading && (
              <div className="col-span-full text-center text-[10px] font-bold text-slate-400 py-10">Loading operational data...</div>
            )}
            {isError && (
              <div className="col-span-full text-center text-[10px] font-bold text-red-500 py-10">System error: Unable to load region data.</div>
            )}
            {regionsSummary.map((reg, i) => (
              <div 
                key={i} 
                onClick={() => handleRegionClick(reg.name)}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                     <MapPin size={18} />
                   </div>
                   <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                     reg.health > 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                   }`}>
                     Health: {reg.health}%
                   </div>
                </div>
                
                <h3 className="text-sm font-black text-slate-900 mb-1">{reg.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center gap-1.5 truncate">
                  <Users size={12} /> {reg.lead}
                </p>
                
                <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
                   <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</span>
                     <span className="text-sm font-black text-slate-900">${(reg.rev/1000).toFixed(1)}K</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Deals</span>
                     <span className="text-sm font-black text-slate-900">{reg.deals}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>

           {/* Global Context Footer */}
          <div className="bg-slate-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-slate-200 mt-2">
            <div className="h-16 w-16 rounded-full border-[6px] border-blue-500/20 border-t-blue-500 flex items-center justify-center text-sm font-black shrink-0">
              84%
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-xs font-black uppercase tracking-tight mb-1 flex items-center justify-center md:justify-start gap-2 text-slate-300">
                  <Zap size={14} className="text-amber-400" /> Systemic Integration Efficiency
                </h3>
                <p className="text-slate-400 text-[10px] font-medium leading-relaxed max-w-2xl mx-auto md:mx-0">
                  Cross-regional deal flow synchronization is operating at high efficiency. Current lead-to-revenue conversion cycle reduced by 14 days vs LY.
                </p>
            </div>
          </div>
        </>
      )}

      {/* Level 1: Region Detail (BUs) */}
      {viewLevel === 'region' && (
        <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <KPICard title="Projected Actuals" value={`$${(busInRegion.reduce((acc, curr) => acc + curr.rev, 0)/1000).toFixed(1)}K`} icon={<DollarSign size={16}/>} color="blue" />
             <KPICard title="Execution Score" value="92%" icon={<Activity size={16}/>} color="emerald" />
             <KPICard title="Strategic Units" value={busInRegion.length.toString()} icon={<Layers size={16}/>} color="slate" />
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Business Units: {selectedRegion}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Select Unit for Details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {busInRegion.map((bu, i) => (
                <div 
                  key={i} 
                  onClick={() => handleBUClick(bu.name)}
                  className="p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-black text-slate-900">{bu.name}</h4>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase rounded border border-emerald-200">
                      {bu.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[10px] font-bold border-b border-slate-200/50 pb-1">
                       <span className="text-slate-400 uppercase tracking-widest">Revenue</span>
                       <span className="text-slate-900">${(bu.rev/1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold pt-1">
                       <span className="text-slate-400 uppercase tracking-widest">Deals</span>
                       <span className="text-slate-900">{bu.deals}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                     Inspect Unit <ChevronRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Level 2: BU Detail (BDMs) */}
      {viewLevel === 'bu' && (
        <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900 p-5 rounded-xl text-white shadow-lg shadow-slate-200">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-sm font-black">
                       {selectedBU?.charAt(0)}
                    </div>
                    <div>
                       <h4 className="text-sm font-black">{selectedBU}</h4>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">BU Controller</p>
                    </div>
                 </div>
                 <div className="space-y-2 pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quarterly Target</span>
                       <span className="font-bold text-xs">$2.4M</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Margin Threshold</span>
                       <span className="font-bold text-xs">32%</span>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Unit Intelligence</h3>
                 <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
                       <Zap size={14} className="text-emerald-600" />
                       <span className="text-[10px] font-bold text-emerald-800">Growth +14% YoY</span>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
                       <Activity size={14} className="text-amber-600" />
                       <span className="text-[10px] font-bold text-amber-800">2 deals in 'Risk' status</span>
                    </div>
                 </div>
              </div>
            </div>

            <div className="lg:col-span-2">
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active BDM Roster</h3>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-widest">Performance View</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     {bdmsInBU.map((bdm, i) => (
                       <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-md transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                             <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                                {bdm.name.charAt(0)}
                             </div>
                             <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-black text-slate-900 truncate">{bdm.name}</h5>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{bdm.deals} Deals</p>
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pipeline</p>
                                <p className="text-xs font-black text-slate-900">${(bdm.rev/1000).toFixed(1)}K</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Win Rate</p>
                                <p className="text-xs font-black text-emerald-600">{bdm.winRate}</p>
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
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-lg border ${colorMap[color]} shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-base font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};

export default Regions;