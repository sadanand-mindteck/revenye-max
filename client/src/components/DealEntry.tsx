import React, { useEffect, useMemo, useState } from 'react';
import { Save, Calculator, TrendingUp, ShieldCheck, Search, Upload, FileText, Info, ChevronDown, Lock, DollarSign } from 'lucide-react';
import { User, UserRole } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useSessionYearStore } from '@/store/sessionYear';

interface DealEntryProps {
  user: User;
}

const DealEntry: React.FC<DealEntryProps> = ({ user }) => {
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const isEditor = user.role === UserRole.BDM || user.role === UserRole.PRACTICE_HEAD || user.role === UserRole.ADMIN;

  const sessionYear = useSessionYearStore((state) => state.sessionYear);

  const { data: projectOptions } = useQuery({
    queryKey: ['entry-options'],
    queryFn: async () => {
      const response = await apiClient.get<Array<{ id: number; projectName: string; customer: string; region: string; bdm: string }>>(
        '/projects/entry-options',
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (!selectedProjectId && projectOptions && projectOptions.length > 0) {
      setSelectedProjectId(String(projectOptions[0].id));
    }
  }, [selectedProjectId, projectOptions]);

  const { data: entryData } = useQuery({
    queryKey: ['project-entry', selectedProjectId, sessionYear],
    enabled: Boolean(selectedProjectId),
    queryFn: async () => {
      const response = await apiClient.get<{ 
        projectName: string;
        customer: string;
        region: string;
        buHead: string;
        projectType: string;
        dealType: string;
        businessType: string;
        practiceHead: string;
        bdm: string;
        note: string;
        monthly: Record<string, { fct: number; act: number; bgt: number }>;
      }>(`/projects/${selectedProjectId}/entry`, {
        params: { financialYear: sessionYear },
      });
      return response.data;
    },
  });

  const saveEntryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      await apiClient.put(`/projects/${selectedProjectId}/entry`, {
        financialYear: sessionYear,
        note: metadata.note,
        monthly: financials,
      });
    },
  });

  const currentDeal = useMemo(() => {
    const found = projectOptions?.find((deal) => String(deal.id) === selectedProjectId);
    return found ?? { id: 0, projectName: '', customer: '', region: '', bdm: '' };
  }, [projectOptions, selectedProjectId]);

  const [metadata, setMetadata] = useState({
    location: 'San Jose, CA',
    buHead: 'Sarah Miller',
    projectType: 'Managed Services',
    dealType: 'Fixed Bid',
    businessType: 'Existing Customer',
    changeCount: 2,
    note: 'Initial forecast based on signed MSA. Budget locked after Q1 review.',
    practiceHead: 'Li Wei'
  });

  const [financials, setFinancials] = useState<Record<string, { fct: number; act: number; bgt: number }>>({
    'April': { fct: 120000, act: 115000, bgt: 100000 },
    'May': { fct: 150000, act: 145000, bgt: 100000 },
    'June': { fct: 180000, act: 190000, bgt: 150000 },
    'July': { fct: 200000, act: 0, bgt: 180000 },
    'August': { fct: 200000, act: 0, bgt: 180000 },
    'September': { fct: 220000, act: 0, bgt: 200000 },
  });

  useEffect(() => {
    if (!entryData) return;
    setMetadata((prev) => ({
      ...prev,
      buHead: entryData.buHead || '',
      projectType: entryData.projectType || '',
      dealType: entryData.dealType || '',
      businessType: entryData.businessType || '',
      practiceHead: entryData.practiceHead || '',
      note: entryData.note || '',
    }));
    setFinancials((prev) => ({
      ...prev,
      ...entryData.monthly,
    }));
  }, [entryData]);

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

  const handleMetadataChange = (field: string, value: string) => {
    if (!isEditor) return;
    setMetadata(prev => ({ ...prev, [field]: value }));
  };

  const simulateExcelImport = () => {
    alert("Simulating Excel Data Ingestion...\nBudget data and metadata headers detected.\nPopulating form fields from source worksheet 'FY25_Budget_Final'.");
    setMetadata(prev => ({ ...prev, changeCount: prev.changeCount + 1 }));
    setIsImportModalOpen(false);
  };

  const totals = useMemo(() => {
    let fyFct = 0, fyBgt = 0, fyAct = 0;
    Object.values(financials).forEach(val => {
      fyFct += val.fct;
      fyBgt += val.bgt;
      fyAct += val.act;
    });
    return { fyFct, fyBgt, fyAct, fyVar: fyFct - fyBgt };
  }, [financials]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 pb-20">
      {/* Compact Selection & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20 shrink-0">
            <FileText size={16} />
          </div>
          <div className="flex-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Project Scope</label>
            <div className="relative">
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full md:w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
              >
                {projectOptions?.length === 0 && (
                  <option value="">No projects available</option>
                )}
                {projectOptions?.map((deal) => (
                  <option key={deal.id} value={deal.id}>{deal.projectName} ({deal.customer})</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Compact Metadata Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-50">
              <ShieldCheck size={16} className="text-blue-600" />
              <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Master Data</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1 content-start">
              <MetadataItem label="Project Name" value={currentDeal.projectName} />
              <MetadataItem label="Customer" value={currentDeal.customer} />
              <MetadataItem label="Region" value={currentDeal.region} />
              <MetadataEdit label="Location" value={metadata.location} onChange={(v) => handleMetadataChange('location', v)} editable={isEditor} />
              <MetadataEdit label="BU Head" value={metadata.buHead} onChange={(v) => handleMetadataChange('buHead', v)} editable={isEditor} />
              <MetadataEdit label="Practice Head" value={metadata.practiceHead} onChange={(v) => handleMetadataChange('practiceHead', v)} editable={isEditor} />
              <MetadataItem label="BDM" value={currentDeal.bdm} />
              <MetadataEdit label="Project Type" value={metadata.projectType} onChange={(v) => handleMetadataChange('projectType', v)} editable={isEditor} />
              <MetadataEdit label="Deal Type" value={metadata.dealType} onChange={(v) => handleMetadataChange('dealType', v)} editable={isEditor} />
              <MetadataEdit label="Business Type" value={metadata.businessType} onChange={(v) => handleMetadataChange('businessType', v)} editable={isEditor} />
              <MetadataItem label="Revisions" value={metadata.changeCount.toString()} isBadge={true} />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Governance Notes</label>
              <textarea 
                readOnly={!isEditor}
                value={metadata.note}
                onChange={(e) => handleMetadataChange('note', e.target.value)}
                className={`w-full p-2.5 rounded-lg text-[11px] font-medium min-h-[80px] border transition-all resize-none ${
                  isEditor ? 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500/10 focus:bg-white' : 'bg-slate-50/50 border-transparent text-slate-500 cursor-default'
                }`}
              />
            </div>

             {!isEditor && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 items-center">
                  <Lock size={14} className="text-amber-600 shrink-0" />
                  <p className="text-[10px] text-amber-800 font-bold leading-tight">View Only Mode</p>
                </div>
             )}
          </div>
        </div>

        {/* Compact Financial Entry Grid */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex bg-slate-50 p-1 border-b border-slate-100 gap-1 overflow-x-auto">
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q)}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap px-4 ${
                    activeQuarter === q 
                    ? 'bg-white text-blue-600 border border-slate-200 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100/50'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-4 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                     <DollarSign size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Financial Input</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Values in USD currency</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl border-slate-100 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <div className="col-span-2 flex items-center">Month</div>
                  <div className="col-span-3">Forecast</div>
                  <div className="col-span-3">Actual</div>
                  <div className="col-span-2 text-right">Budget</div>
                  <div className="col-span-2 text-right">Var</div>
                </div>

                {monthsByQuarter[activeQuarter].map((month) => {
                  const mData = financials[month] || { fct: 0, act: 0, bgt: 0 };
                  const variance = mData.fct - mData.bgt;
                  
                  return (
                    <div key={month} className="grid grid-cols-12 gap-2 px-4 py-2 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <div className="col-span-2 font-bold text-slate-700 text-[10px] uppercase tracking-wide">{month}</div>
                      <div className="col-span-3">
                        <div className="relative">
                          <input 
                            type="number" 
                            disabled={!isEditor}
                            value={mData.fct}
                            onChange={(e) => handleFinancialChange(month, 'fct', e.target.value)}
                            className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-bold text-right shadow-sm transition-all focus:z-10 relative ${
                              isEditor ? 'bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400' : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <input 
                            type="number" 
                            disabled={!isEditor}
                            value={mData.act}
                            onChange={(e) => handleFinancialChange(month, 'act', e.target.value)}
                            className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-bold text-right shadow-sm transition-all focus:z-10 relative ${
                              isEditor ? 'bg-white border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400' : 'bg-slate-50 border-transparent text-slate-500 cursor-default'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="col-span-2 text-right font-bold text-slate-400 text-[11px]">
                        {mData.bgt.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={`text-[11px] font-black ${variance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-right w-full">
          
          <button 
            disabled={!isEditor || saveEntryMutation.isPending}
            onClick={() => saveEntryMutation.mutate()}
            className={`flex items-center justify-center gap-1.5 px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              isEditor ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save size={14} />
            {isEditor ? (saveEntryMutation.isPending ? 'Saving...' : 'Commit') : 'Read Only'}
          </button>
        </div>

      {/* Compact Summary View */}
      <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
            <TrendingUp size={120} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full">
               <h3 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 text-slate-300">
                  <Calculator size={14} className="text-blue-400" /> FY Performance Summary
               </h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SummaryBlock label="Forecast" value={`$${(totals.fyFct/1000).toFixed(1)}k`} color="text-white" />
                  <SummaryBlock label="Budget" value={`$${(totals.fyBgt/1000).toFixed(1)}k`} color="text-slate-400" />
                  <SummaryBlock label="Realized" value={`$${(totals.fyAct/1000).toFixed(1)}k`} color="text-emerald-400" />
                  <SummaryBlock 
                    label="Variance" 
                    value={`${totals.fyVar >= 0 ? '+' : ''}${(totals.fyVar/1000).toFixed(1)}k`} 
                    color={totals.fyVar >= 0 ? 'text-emerald-400' : 'text-red-400'} 
                  />
               </div>
            </div>
         </div>
      </div>

      {/* Compact Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Upload size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Data Ingestion</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Auto-mapping budget columns</p>
                 </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 border-dashed cursor-pointer hover:border-blue-400 hover:bg-slate-100 transition-all group text-center">
                 <Upload size={24} className="mx-auto text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600">Click or Drag Excel File</p>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                 <button onClick={simulateExcelImport} className="flex-1 py-2 bg-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all">Process</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MetadataItem = ({ label, value, isBadge = false }: {label: string, value: string, isBadge?: boolean}) => (
  <div className="space-y-0.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    {isBadge ? (
      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-bold uppercase">{value}</span>
    ) : (
      <p className="text-xs font-bold text-slate-800 truncate">{value || 'N/A'}</p>
    )}
  </div>
);

const MetadataEdit = ({ label, value, onChange, editable }: {label: string, value: string, onChange: (v: string) => void, editable: boolean}) => (
  <div className="space-y-0.5">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    {editable ? (
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-colors" 
      />
    ) : (
      <p className="text-xs font-bold text-slate-800 truncate">{value || 'N/A'}</p>
    )}
  </div>
);

const SummaryBlock = ({ label, value, color }: {label: string, value: string, color: string}) => (
  <div>
    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
    <p className={`text-lg font-black tracking-tight ${color}`}>{value}</p>
  </div>
);

export default DealEntry;