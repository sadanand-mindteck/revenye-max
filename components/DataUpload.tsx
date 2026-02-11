
import React, { useState, useRef } from 'react';
import { 
  FileUp, Database, FileSpreadsheet, Download, 
  CheckCircle2, Loader2, Info, ArrowRight, ShieldAlert, Globe, X, FileText
} from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface FileState {
  file: File | null;
  status: UploadStatus;
  progress: number;
  message: string;
}

const DataUpload: React.FC = () => {
  const [states, setStates] = useState<Record<string, FileState>>({
    master: { file: null, status: 'idle', progress: 0, message: '' },
    financial: { file: null, status: 'idle', progress: 0, message: '' },
    projects: { file: null, status: 'idle', progress: 0, message: '' }
  });

  const handleFileSelect = (type: string, file: File) => {
    setStates(prev => ({ ...prev, [type]: { file, status: 'uploading', progress: 0, message: 'Initiating Transfer...' } }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStates(prev => ({ ...prev, [type]: { ...prev[type], status: 'success', progress: 100, message: 'Sync Committed.' } }));
        }, 1000);
      } else {
        setStates(prev => ({ ...prev, [type]: { ...prev[type], progress: progress } }));
      }
    }, 200);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-20">
      <div className="bg-[#001529] p-6 text-white border-l-4 border-[#1677ff] flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} className="text-[#faad14]" />
            <span className="text-[10px] font-bold text-[#ffffffa6] uppercase tracking-widest">Admin Control Layer</span>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-tight">System Data Ingestion Hub</h2>
          <p className="text-xs text-[#ffffff73] mt-1">Maintenance of core MIS ledgers via batch processing.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1677ff] text-white text-[11px] font-bold uppercase hover:bg-[#4096ff] transition-colors">
          <Download size={14} /> Download Templates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <UploadBox 
          id="master" 
          title="Master Config" 
          icon={<Globe size={14} className="text-[#1677ff]" />} 
          state={states.master}
          onSelect={(f) => handleFileSelect('master', f)}
          onCancel={() => setStates(prev => ({ ...prev, master: { file: null, status: 'idle', progress: 0, message: '' } }))}
        />
        <UploadBox 
          id="financial" 
          title="Revenue Ledger" 
          icon={<FileSpreadsheet size={14} className="text-[#52c41a]" />} 
          state={states.financial}
          onSelect={(f) => handleFileSelect('financial', f)}
          onCancel={() => setStates(prev => ({ ...prev, financial: { file: null, status: 'idle', progress: 0, message: '' } }))}
        />
        <UploadBox 
          id="projects" 
          title="Portfolio Sync" 
          icon={<Database size={14} className="text-[#1890ff]" />} 
          state={states.projects}
          onSelect={(f) => handleFileSelect('projects', f)}
          onCancel={() => setStates(prev => ({ ...prev, projects: { file: null, status: 'idle', progress: 0, message: '' } }))}
        />
      </div>

      <div className="bg-white border border-slate-200">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase">Recent System Ingestions</h3>
          <Info size={12} className="text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100">
          <IngestLog action="Financial Batch Update" user="System_Admin" status="Success" time="09:42:15 UTC" />
          <IngestLog action="Portfolio Metadata Patch" user="System_Admin" status="Success" time="Yesterday 14:10:02" />
        </div>
      </div>
    </div>
  );
};

const UploadBox = ({ title, icon, state, onSelect, onCancel }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="bg-white border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-xs font-bold text-slate-800 uppercase">{title}</h3>
        </div>
        <StatusDot status={state.status} />
      </div>

      {state.status === 'idle' ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-[#1677ff]/30 transition-all"
        >
          <input type="file" ref={inputRef} onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])} className="hidden" accept=".xlsx,.xls" />
          <FileUp size={20} className="text-slate-300 mb-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase">Click to Ingest Excel</p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
               <FileText size={14} className="text-[#1677ff] shrink-0" />
               <span className="text-[10px] font-bold text-slate-700 truncate">{state.file?.name}</span>
            </div>
            {state.status !== 'success' && <button onClick={onCancel} className="text-slate-400 hover:text-red-500"><X size={12}/></button>}
          </div>
          <div className="space-y-1">
             <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
               <span>{state.message}</span>
               {state.status === 'uploading' && <span>{state.progress}%</span>}
             </div>
             <div className="h-1 bg-slate-200">
               <div className={`h-full transition-all ${state.status === 'success' ? 'bg-[#52c41a]' : 'bg-[#1677ff]'}`} style={{ width: `${state.progress}%` }}></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusDot = ({ status }: { status: string }) => {
  const colors = { idle: 'bg-slate-200', uploading: 'bg-blue-500', success: 'bg-emerald-500' };
  return <div className={`w-1.5 h-1.5 ${colors[status] || 'bg-slate-200'}`}></div>;
};

const IngestLog = ({ action, user, status, time }: any) => (
  <div className="px-4 py-3 flex justify-between items-center text-[11px] font-medium hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-4">
      <FileSpreadsheet size={14} className="text-slate-300" />
      <div>
        <p className="font-bold text-slate-700 uppercase">{action}</p>
        <p className="text-[9px] text-slate-400 uppercase tracking-tighter">Executor: {user} | {time}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">{status}</span>
      <ArrowRight size={12} className="text-slate-300" />
    </div>
  </div>
);

export default DataUpload;
