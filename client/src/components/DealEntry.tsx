
import React, { useEffect, useMemo, useState } from 'react';
import { Save, Calculator, TrendingUp, PieChart, ShieldCheck, Search, Upload, FileText, Info, CheckCircle2, ChevronDown, Lock } from 'lucide-react';
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

  // Extended metadata for the current deal
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

  // Monthly financial data state
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
    // In a real app, this would process an .xlsx file via a library
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 duration-500 pb-32">
      {/* Selection & Actions Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 shrink-0">
            <FileText size={20} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active Project Selection</label>
            <div className="relative">
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full xl:w-[320px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                {projectOptions?.length === 0 && (
                  <option value="">No projects available</option>
                )}
                {projectOptions?.map((deal) => (
                  <option key={deal.id} value={deal.id}>{deal.projectName} ({deal.customer})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          {isEditor && (
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Upload size={16} /> Import from Excel
            </button>
          )}
          <button 
            disabled={!isEditor || saveEntryMutation.isPending}
            onClick={() => saveEntryMutation.mutate()}
            className={`flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              isEditor ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save size={18} />
            {isEditor ? (saveEntryMutation.isPending ? 'Saving...' : 'Commit Changes') : 'Viewing Only'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Metadata Details Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <ShieldCheck size={20} className="text-blue-600" />
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Project Master Data</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
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
              <MetadataItem label="Change Count" value={metadata.changeCount.toString()} isBadge={true} />
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Notes & Governance</label>
              <textarea 
                readOnly={!isEditor}
                value={metadata.note}
                onChange={(e) => handleMetadataChange('note', e.target.value)}
                className={`w-full p-4 rounded-2xl text-xs font-medium min-h-[100px] border transition-all ${
                  isEditor ? 'bg-slate-50 border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:bg-white' : 'bg-slate-50/50 border-transparent text-slate-500 cursor-default'
                }`}
              />
            </div>
          </div>

          {!isEditor && (
             <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4 items-start">
               <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><Lock size={18} /></div>
               <div>
                  <h4 className="text-sm font-bold text-amber-900">Read-Only Access</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium mt-1">
                    Your role (<span className="font-bold">{user.role}</span>) has been granted viewing privileges only. Revenue entry is restricted to BDM and Practice Heads.
                  </p>
               </div>
             </div>
          )}
        </div>

        {/* Financial Entry Grid */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex bg-slate-50/50 p-2 border-b border-slate-100">
              {quarters.map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q)}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] transition-all ${
                    activeQuarter === q 
                    ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/5' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {q} Flow
                </button>
              ))}
            </div>

            <div className="p-10 flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Financial Records</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Budget is imported from Excel Source</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] rounded-2xl">
                  <div className="col-span-2">Month</div>
                  <div className="col-span-3">Forecast (FCT)</div>
                  <div className="col-span-3">Actual (ACT)</div>
                  <div className="col-span-2 text-blue-400">Budget</div>
                  <div className="col-span-2 text-right">Var</div>
                </div>

                {monthsByQuarter[activeQuarter].map((month) => {
                  const mData = financials[month] || { fct: 0, act: 0, bgt: 0 };
                  const variance = mData.fct - mData.bgt;
                  
                  return (
                    <div key={month} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 group hover:bg-slate-50/50 transition-all rounded-2xl">
                      <div className="col-span-2 font-black text-slate-900 text-sm uppercase tracking-tighter">{month}</div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">$</span>
                          <input 
                            type="number" 
                            disabled={!isEditor}
                            value={mData.fct}
                            onChange={(e) => handleFinancialChange(month, 'fct', e.target.value)}
                            className={`w-full pl-7 pr-3 py-3 rounded-xl text-sm font-bold shadow-sm transition-all ${
                              isEditor ? 'bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500' : 'bg-slate-50 border-transparent text-slate-500'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">$</span>
                          <input 
                            type="number" 
                            disabled={!isEditor}
                            value={mData.act}
                            onChange={(e) => handleFinancialChange(month, 'act', e.target.value)}
                            className={`w-full pl-7 pr-3 py-3 rounded-xl text-sm font-bold shadow-sm transition-all ${
                              isEditor ? 'bg-white border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500' : 'bg-slate-50 border-transparent text-slate-500'
                            }`}
                          />
                        </div>
                      </div>
                      <div className="col-span-2 font-bold text-slate-400 text-sm">
                        ${mData.bgt.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className={`text-sm font-black ${variance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
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

      {/* Summary View */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl overflow-hidden relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
            <TrendingUp size={240} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
               <h3 className="text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                  <Calculator size={24} className="text-blue-400" /> FY Cumulative Projection
               </h3>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <SummaryBlock label="FY FORECAST" value={`$${(totals.fyFct/1000).toFixed(1)}K`} color="text-white" />
                  <SummaryBlock label="FY BUDGET" value={`$${(totals.fyBgt/1000).toFixed(1)}K`} color="text-slate-400" />
                  <SummaryBlock label="FY REALIZED" value={`$${(totals.fyAct/1000).toFixed(1)}K`} color="text-emerald-400" />
                  <SummaryBlock 
                    label="FY VARIANCE" 
                    value={`${totals.fyVar >= 0 ? '+' : ''}${(totals.fyVar/1000).toFixed(1)}K`} 
                    color={totals.fyVar >= 0 ? 'text-emerald-400' : 'text-red-400'} 
                  />
               </div>
            </div>
            <button className="px-10 py-5 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
               Review Compliance Audit
            </button>
         </div>
      </div>

      {/* Excel Import Simulation Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-14 w-14 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Upload size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Excel Intelligence Ingestion</h3>
                    <p className="text-slate-400 text-sm font-medium">Auto-mapping budget and governance headers.</p>
                 </div>
              </div>
              
              <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Template Headers:</p>
                 <div className="flex flex-wrap gap-2">
                    {['Budget', 'Location', 'Region', 'BU Head', 'Project Type', 'Customer Name', 'Project Name', 'Deal Type', 'BDM'].map(h => (
                       <span key={h} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600">{h}</span>
                    ))}
                 </div>
                 <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer group bg-white">
                    <Upload size={32} className="mb-4 group-hover:-translate-y-1 transition-transform" />
                    <p className="text-xs font-black uppercase tracking-widest">Drag Excel Workbook or Browse</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setIsImportModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                 <button onClick={simulateExcelImport} className="flex-1 py-4 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all">Start Processing</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const MetadataItem = ({ label, value, isBadge = false }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    {isBadge ? (
      <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-black uppercase">{value}</span>
    ) : (
      <p className="text-sm font-bold text-slate-900">{value || 'Not Specified'}</p>
    )}
  </div>
);

const MetadataEdit = ({ label, value, onChange, editable }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    {editable ? (
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
      />
    ) : (
      <p className="text-sm font-bold text-slate-900">{value || 'Not Specified'}</p>
    )}
  </div>
);

const SummaryBlock = ({ label, value, color }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
  </div>
);

// Missing icons for the role check section
const AlertCircle = ({ size, className }: { size: number; className?: string }) => <Info size={size} className={className} />;

export default DealEntry;
