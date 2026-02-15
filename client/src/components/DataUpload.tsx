
import React, { useState, useRef } from 'react';
import { 
  FileUp, Database, FileSpreadsheet, Download, 
  CheckCircle2, AlertCircle, Loader2, Info, ArrowRight,
  ShieldAlert, Layers, Briefcase, Globe, X, FileText
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
    setStates(prev => ({
      ...prev,
      [type]: { file, status: 'uploading', progress: 0, message: 'Transferring to secure buffer...' }
    }));

    // Multi-stage simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        clearInterval(interval);
        processFile(type);
      } else {
        setStates(prev => ({
          ...prev,
          [type]: { ...prev[type], progress: Math.min(progress, 99) }
        }));
      }
    }, 400);
  };

  const processFile = (type: string) => {
    setStates(prev => ({
      ...prev,
      [type]: { ...prev[type], status: 'processing', progress: 100, message: 'Analyzing Schema & Mapping Headers...' }
    }));

    setTimeout(() => {
      setStates(prev => ({
        ...prev,
        [type]: { ...prev[type], message: 'Validating row integrity (842/842)...' }
      }));

      setTimeout(() => {
        setStates(prev => ({
          ...prev,
          [type]: { ...prev[type], status: 'success', message: 'Batch successfully committed to Master Ledger.' }
        }));
        
        // Final reset after a delay
        setTimeout(() => {
          setStates(prev => ({
            ...prev,
            [type]: { file: null, status: 'idle', progress: 0, message: '' }
          }));
        }, 5000);
      }, 2000);
    }, 2000);
  };

  const cancelUpload = (type: string) => {
    setStates(prev => ({
      ...prev,
      [type]: { file: null, status: 'idle', progress: 0, message: '' }
    }));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Admin Safety Header */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
          <Database size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                <ShieldAlert size={12} /> Critical System Path
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator Exclusive</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-2">Central Data Ingestion Hub</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Batch process global revenue data, master configurations, and project portfolio metadata. 
              Ensure Excel templates align with the <span className="text-blue-400 underline cursor-pointer">Mindteck V4 Schema</span>.
            </p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shrink-0">
            <Download size={16} /> Get Template Pack (.ZIP)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <UploadCard 
          id="master"
          title="Master Configuration"
          description="Update global Regions, Locations, BU Hierarchy, and Group Heads."
          icon={<Globe className="text-blue-500" />}
          state={states.master}
          onFileSelect={(file) => handleFileSelect('master', file)}
          onCancel={() => cancelUpload('master')}
          fields={['Location Mapping', 'Region Codes', 'BU Controller List']}
        />

        <UploadCard 
          id="financial"
          title="Financial Batch Sync"
          description="Bulk update Forecasts, Actuals, and Budgets across all active cost centers."
          icon={<FileSpreadsheet className="text-emerald-500" />}
          state={states.financial}
          onFileSelect={(file) => handleFileSelect('financial', file)}
          onCancel={() => cancelUpload('financial')}
          fields={['Monthly Projections', 'Budget Allotments', 'Actual Revenue']}
        />

        <UploadCard 
          id="projects"
          title="Project Portfolio Sync"
          description="Create or update high-level project metadata, BDMs, and Practice Heads."
          icon={<Briefcase className="text-indigo-500" />}
          state={states.projects}
          onFileSelect={(file) => handleFileSelect('projects', file)}
          onCancel={() => cancelUpload('projects')}
          fields={['Project Name', 'Customer Master', 'Deal Type Registry']}
        />
      </div>

      {/* Audit Log / History Preview */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm p-10 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Execution Logs</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">System Health Status: Optimized</p>
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
            <Info size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          <LogEntry 
            action="Financial Batch Update" 
            timestamp="Today, 09:42 AM" 
            status="Completed" 
            records={1240} 
            user="Admin Executive"
          />
          <LogEntry 
            action="Master Location Patch" 
            timestamp="Yesterday, 04:15 PM" 
            status="Completed" 
            records={12} 
            user="System Automation"
          />
          <LogEntry 
            action="Portfolio Metadata Sync" 
            timestamp="Nov 12, 11:20 AM" 
            status="Warning" 
            records={450} 
            user="Admin Executive"
            message="24 records skipped due to missing Customer ID"
          />
        </div>
      </div>
    </div>
  );
};

interface UploadCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  state: FileState;
  onFileSelect: (file: File) => void;
  onCancel: () => void;
  fields: string[];
}

const UploadCard: React.FC<UploadCardProps> = ({ id, title, description, icon, state, onFileSelect, onCancel, fields }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileSelect(file);
    } else {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
      <div className="flex justify-between items-start mb-6">
        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
          {icon}
        </div>
        <StatusBadge status={state.status} />
      </div>

      <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{description}</p>

      <div className="flex-1 space-y-6">
        {state.status === 'idle' ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[32px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleInputChange} 
              accept=".xlsx,.xls" 
              className="hidden" 
            />
            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <FileUp size={24} className="text-blue-500" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-1">Click to Upload</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">or drag & drop Excel file</p>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] relative overflow-hidden">
             <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm text-blue-500">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{state.file?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(state.file?.size || 0) / 1024 > 1024 ? `${((state.file?.size || 0) / 1048576).toFixed(1)} MB` : `${((state.file?.size || 0) / 1024).toFixed(1)} KB`}</p>
                </div>
                {state.status !== 'processing' && state.status !== 'success' && (
                  <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-400">
                    <X size={16} />
                  </button>
                )}
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                   <span className={state.status === 'success' ? 'text-emerald-600' : 'text-blue-600'}>
                     {state.message}
                   </span>
                   {state.status === 'uploading' && <span>{Math.round(state.progress)}%</span>}
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-300 ${state.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                    style={{ width: `${state.progress}%` }}
                   ></div>
                </div>
             </div>

             {state.status === 'processing' && (
                <div className="mt-4 flex items-center gap-2 animate-pulse">
                   <Loader2 size={12} className="animate-spin text-blue-500" />
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Core Engine Active</span>
                </div>
             )}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Required Template Headers</p>
          <div className="flex flex-wrap gap-2">
            {fields.map((f: string) => (
              <span key={f} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">{f}</span>
            ))}
          </div>
        </div>
      </div>
      
      {state.status === 'success' && (
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-300">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">System synchronized with cloud storage</p>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const styles = {
    idle: 'bg-slate-50 text-slate-400 border-slate-200',
    uploading: 'bg-blue-50 text-blue-600 border-blue-100',
    processing: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    error: 'bg-red-50 text-red-600 border-red-100'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
};

const LogEntry = ({ action, timestamp, status, records, user, message }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 transition-all border border-transparent hover:border-slate-200 group">
    <div className="flex items-center gap-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${status === 'Warning' ? 'bg-amber-500' : 'bg-slate-900'}`}>
        <FileSpreadsheet size={18} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-all">{action}</h4>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{timestamp}</p>
          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">User: {user}</p>
        </div>
        {message && <p className="text-[10px] text-amber-600 font-black uppercase mt-1.5 flex items-center gap-1"><AlertCircle size={10}/> {message}</p>}
      </div>
    </div>
    
    <div className="flex items-center gap-8 mt-4 md:mt-0">
      <div className="text-right">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Records Processed</p>
        <p className="text-lg font-black text-slate-900">{records.toLocaleString()}</p>
      </div>
      <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${
        status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
      }`}>
        {status === 'Completed' ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
      </div>
    </div>
  </div>
);

export default DataUpload;
