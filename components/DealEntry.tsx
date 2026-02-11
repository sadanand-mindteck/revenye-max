
import React, { useState, useMemo } from 'react';
import { Save, Calculator, ShieldCheck, Upload, FileText, Lock, ChevronDown } from 'lucide-react';
import { User, UserRole } from '../types';
import { MOCK_DEALS } from '../constants';

interface DealEntryProps {
  user: User;
}

const DealEntry: React.FC<DealEntryProps> = ({ user }) => {
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(MOCK_DEALS[0].id);
  
  const isEditor = user.role === UserRole.BDM || user.role === UserRole.PRACTICE_HEAD || user.role === UserRole.ADMIN;

  const [financials, setFinancials] = useState<Record<string, { fct: number; act: number; bgt: number }>>({
    'April': { fct: 120000, act: 115000, bgt: 100000 },
    'May': { fct: 150000, act: 145000, bgt: 100000 },
    'June': { fct: 180000, act: 190000, bgt: 150000 },
    'July': { fct: 200000, act: 0, bgt: 180000 },
    'August': { fct: 200000, act: 0, bgt: 180000 },
    'September': { fct: 220000, act: 0, bgt: 200000 },
  });

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const monthsByQuarter: Record<string, string[]> = {
    'Q1': ['April', 'May', 'June'],
    'Q2': ['July', 'August', 'September'],
    'Q3': ['October', 'November', 'December'],
    'Q4': ['January', 'February', 'March'],
  };

  const handleFinancialChange = (month: string, field: 'fct' | 'act', value: string) => {
    if (!isEditor) return;
    const numValue = parseFloat(value) || 0;
    setFinancials(prev => ({
      ...prev,
      [month]: { ...prev[month] || { fct: 0, act: 0, bgt: 0 }, [field]: numValue }
    }));
  };

  const currentDeal = useMemo(() => MOCK_DEALS.find(d => d.id === selectedProjectId) || MOCK_DEALS[0], [selectedProjectId]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-12">
      {/* Selection Control */}
      <div className="bg-white p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-[#1677ff]"><FileText size={18} /></div>
          <div className="relative">
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-800 appearance-none pr-8 focus:outline-none focus:border-[#1677ff]"
            >
              {MOCK_DEALS.map(d => (
                <option key={d.id} value={d.id}>{d.projectName} ({d.customer})</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-2">
          {isEditor && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              <Upload size={14} /> Import Excel
            </button>
          )}
          <button 
            disabled={!isEditor}
            className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              isEditor ? 'bg-[#1677ff] text-white hover:bg-[#4096ff]' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {isEditor ? 'Save Changes' : 'Locked'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Project Master Data */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#1677ff]" /> Project Attributes
          </h3>
          <div className="space-y-4">
            <AttributeItem label="Entity Name" value={currentDeal.projectName} />
            <AttributeItem label="Strategic Client" value={currentDeal.customer} />
            <AttributeItem label="Delivery Zone" value={currentDeal.region} />
            <AttributeItem label="Practice Lead" value={currentDeal.practiceHead} />
            <AttributeItem label="Ownership" value={currentDeal.bdm} />
            <AttributeItem label="Commercial Model" value={currentDeal.dealType} />
          </div>
          
          {!isEditor && (
             <div className="mt-6 p-3 bg-amber-50 border border-amber-100 flex gap-2">
               <Lock size={14} className="text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-700 font-medium">Read-only state active for role: {user.role}</p>
             </div>
          )}
        </div>

        {/* Financial Flow */}
        <div className="lg:col-span-8 bg-white border border-slate-200 flex flex-col">
          {/* AntD Tabs Layout */}
          <div className="flex border-b border-slate-200 px-2 bg-slate-50/50">
            {quarters.map((q) => (
              <div
                key={q}
                onClick={() => setActiveQuarter(q)}
                className={`ant-tabs-tab text-[11px] font-bold uppercase tracking-widest ${
                  activeQuarter === q ? 'ant-tabs-tab-active' : 'text-slate-400'
                }`}
              >
                {q} Financials
              </div>
            ))}
          </div>

          <div className="p-4 flex-1">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     <th className="py-2 pr-4">Month</th>
                     <th className="py-2 pr-4">Forecast (FCT)</th>
                     <th className="py-2 pr-4">Actual (ACT)</th>
                     <th className="py-2 pr-4">Budget</th>
                     <th className="py-2 text-right">Variance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {monthsByQuarter[activeQuarter].map((month) => {
                     const mData = financials[month] || { fct: 0, act: 0, bgt: 0 };
                     const variance = mData.fct - mData.bgt;
                     return (
                       <tr key={month} className="group">
                         <td className="py-3 pr-4 text-xs font-bold text-slate-700 uppercase">{month}</td>
                         <td className="py-3 pr-4">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]">$</span>
                              <input 
                                type="number" 
                                disabled={!isEditor}
                                value={mData.fct}
                                onChange={(e) => handleFinancialChange(month, 'fct', e.target.value)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 text-xs font-bold focus:border-[#1677ff] focus:outline-none bg-slate-50/50"
                              />
                            </div>
                         </td>
                         <td className="py-3 pr-4">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]">$</span>
                              <input 
                                type="number" 
                                disabled={!isEditor}
                                value={mData.act}
                                onChange={(e) => handleFinancialChange(month, 'act', e.target.value)}
                                className="w-full pl-5 pr-2 py-1.5 border border-slate-200 text-xs font-bold focus:border-[#52c41a] focus:outline-none bg-slate-50/50"
                              />
                            </div>
                         </td>
                         <td className="py-3 pr-4 text-xs font-medium text-slate-400">
                           ${mData.bgt.toLocaleString()}
                         </td>
                         <td className={`py-3 text-right text-xs font-bold ${variance >= 0 ? 'text-[#52c41a]' : 'text-[#ff4d4f]'}`}>
                           {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>

          <div className="bg-[#001529] p-4 text-white flex justify-between items-center">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">FY Cumulative Variance</p>
                <p className="text-lg font-bold text-[#52c41a]">+$42,150.00</p>
             </div>
             <button className="px-4 py-2 bg-[#1677ff] text-white text-[11px] font-bold uppercase hover:bg-[#4096ff]">Execute Sync</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttributeItem = ({ label, value }) => (
  <div className="space-y-0.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <p className="text-xs font-bold text-slate-800">{value}</p>
  </div>
);

export default DealEntry;
