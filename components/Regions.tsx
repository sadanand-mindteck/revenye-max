
import React, { useState, useMemo } from 'react';
import { MapPin, Globe, ChevronRight, ArrowLeft, Layers, Users } from 'lucide-react';
import { MOCK_DEALS } from '../constants';

type ViewLevel = 'global' | 'region' | 'bu' | 'bdm';

const Regions: React.FC = () => {
  const [viewLevel, setViewLevel] = useState<ViewLevel>('global');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedBU, setSelectedBU] = useState<string | null>(null);

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
    return Object.entries(summary).map(([name, data]) => ({ name, ...data }));
  }, []);

  const busInRegion = useMemo(() => {
    if (!selectedRegion) return [];
    const deals = MOCK_DEALS.filter(d => d.region === selectedRegion);
    const bus: Record<string, { rev: number; deals: number }> = {};
    deals.forEach(d => {
      if (!bus[d.buHead]) bus[d.buHead] = { rev: 0, deals: 0 };
      bus[d.buHead].rev += d.fyForecast;
      bus[d.buHead].deals += 1;
    });
    return Object.entries(bus).map(([name, data]) => ({ name, ...data }));
  }, [selectedRegion]);

  const navigateBack = () => {
    if (viewLevel === 'bu') { setViewLevel('region'); setSelectedBU(null); }
    else if (viewLevel === 'region') { setViewLevel('global'); setSelectedRegion(null); }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {viewLevel !== 'global' && (
            <button onClick={navigateBack} className="p-1 border border-slate-200 text-slate-400 hover:text-[#1677ff] hover:border-[#1677ff] transition-all">
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="text-[#1677ff]"><Globe size={18} /></div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
              {viewLevel === 'global' ? 'Global Operations Registry' : selectedRegion}
            </h2>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
               <span>Global</span>
               {selectedRegion && <><ChevronRight size={8} /> <span>{selectedRegion}</span></>}
               {selectedBU && <><ChevronRight size={8} /> <span>{selectedBU}</span></>}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-3 py-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Zones: 4</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {viewLevel === 'global' && regionsSummary.map((reg, i) => (
          <div 
            key={i} 
            onClick={() => { setSelectedRegion(reg.name); setViewLevel('region'); }}
            className="bg-white border border-slate-200 p-4 hover:border-[#1677ff] cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <MapPin size={16} className="text-[#1677ff]" />
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 uppercase">Healthy</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase mb-4">{reg.name}</h3>
            <div className="space-y-2 border-t border-slate-50 pt-3">
               <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-slate-400 uppercase">Revenue</span>
                 <span className="text-slate-800">${(reg.rev/1000).toFixed(1)}K</span>
               </div>
               <div className="flex justify-between text-[10px] font-bold">
                 <span className="text-slate-400 uppercase">Portfolio</span>
                 <span className="text-slate-800">{reg.deals} Deal(s)</span>
               </div>
            </div>
          </div>
        ))}

        {viewLevel === 'region' && busInRegion.map((bu, i) => (
          <div 
            key={i} 
            className="bg-white border border-slate-200 p-4 hover:border-[#1677ff] transition-all cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <Layers size={16} className="text-[#1677ff]" />
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 uppercase">Active</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800 uppercase mb-4">{bu.name}</h3>
            <div className="space-y-2 border-t border-slate-50 pt-3">
               <AttributeBlock label="Unit Revenue" value={`$${(bu.rev/1000).toFixed(1)}K`} />
               <AttributeBlock label="Managed Assets" value={`${bu.deals} Engagement(s)`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttributeBlock = ({ label, value }) => (
  <div className="flex justify-between text-[10px] font-bold">
    <span className="text-slate-400 uppercase">{label}</span>
    <span className="text-slate-800">{value}</span>
  </div>
);

export default Regions;
