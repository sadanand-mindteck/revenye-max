import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileUp, Database, FileSpreadsheet, Download, 
  CheckCircle2, AlertCircle, Loader2, Info, ArrowRight,
  ShieldAlert, Layers, Briefcase, Globe, X, FileText, ChevronDown, Table
} from 'lucide-react';
import { apiClient } from '@/api/client';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface FileState {
  file: File | null;
  status: UploadStatus;
  progress: number;
  message: string;
}

const getSessionYears = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  // If before April, treat as previous session
  const baseYear = now.getMonth() < 3 ? currentYear - 1 : currentYear;
  return [
    `${baseYear - 2}-${(baseYear - 1).toString().slice(-2)}`,
    `${baseYear - 1}-${baseYear.toString().slice(-2)}`,
    `${baseYear}-${(baseYear + 1).toString().slice(-2)}`,
    `${baseYear + 1}-${(baseYear + 2).toString().slice(-2)}`,
  ];
};

const DEFAULT_HEADERS = [
  "MS/PS", "Entity", "GR Entity", "ROW/US", "Resource ID", "Resource Name", "Deal Type", "EEENNN", "Bill Rate", "Start Date", "End Date",
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar","FY",
  "Customer Name", "Project Name", "Practice Head", "BDM", "GeoHead", "Vertical", "Horizontal"
];

const DataUpload: React.FC = () => {
  const [states, setStates] = useState<Record<string, FileState>>({
    master: { file: null, status: 'idle', progress: 0, message: '' },
    financial: { file: null, status: 'idle', progress: 0, message: '' },
    projects: { file: null, status: 'idle', progress: 0, message: '' }
  });
  const sessionYears = getSessionYears();
  const [selectedSession, setSelectedSession] = useState(sessionYears[2]);

  const [pendingUpload, setPendingUpload] = useState<{type: string, file: File} | null>(null);
  const [cols, setCols] = useState([] as string[]);

  const handleFileSelect = async (type: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const range = sheet['!ref'];
      if (range) {
        const [start, end] = range.split(':');
        const headerStart = start.replace(/[0-9]/g, '');
        const headerEnd = end.replace(/[0-9]/g, '');
        
        function colToNum(col: string) {
          let num = 0;
          for (let i = 0; i < col.length; i++) {
            num = num * 26 + (col.charCodeAt(i) - 64);
          }
          return num;
        }
        function numToCol(num: number) {
          let col = '';
          while (num > 0) {
            let rem = (num - 1) % 26;
            col = String.fromCharCode(65 + rem) + col;
            num = Math.floor((num - 1) / 26);
          }
          return col;
        }
        const startNum = colToNum(headerStart);
        const endNum = colToNum(headerEnd);
        const allCols = [];
        for (let n = startNum; n <= endNum; n++) {
          allCols.push(numToCol(n));
        }
        setCols(allCols);
        setPendingUpload({ type, file });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadFile = async (type: string, file: File) => {
    setStates(prev => ({
      ...prev,
      [type]: { file, status: 'uploading', progress: 0, message: 'Transferring...' }
    }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session', selectedSession);
    formData.append('mappedHeaders', JSON.stringify(Object.assign({},...DEFAULT_HEADERS.map((headerField, i) => ({[headerField]: cols[i]})))));
    
    try {
      await apiClient.post('/data/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setStates(prev => ({
            ...prev,
            [type]: { ...prev[type], progress: percent }
          }));
        }
      });

      setStates(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'success', message: 'Success' }
      }));

    } catch (error) {
      setStates(prev => ({
        ...prev,
        [type]: { ...prev[type], status: 'error', progress: 0, message: 'Failed' }
      }));
    }
  };

  const confirmHeaderMapping = () => {
    if (pendingUpload) {
      uploadFile(pendingUpload.type, pendingUpload.file); // Start upload process
      setPendingUpload(null); // Clear pending state
      setCols([]); // Close the dialog
    }
  };

  const cancelHeaderMapping = () => {
    setPendingUpload(null);
    setCols([]);
  };

  const cancelUpload = (type: string) => {
    setStates(prev => ({
      ...prev,
      [type]: { file: null, status: 'idle', progress: 0, message: '' }
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-[1600px] mx-auto">
      {/* Header Mapping Modal - Fixed & Improved */}
      {cols.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 ring-1 ring-slate-900/5">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 backdrop-blur shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-lg">
                  <Table size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-900">Map File Columns</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    Match source columns to system requirements
                  </p>
                </div>
              </div>
              <button 
                onClick={cancelHeaderMapping} 
                className="p-2 hover:bg-slate-200/80 rounded-lg transition-colors text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content - Scrollable Table */}
            <div className="flex-1 overflow-auto bg-white min-h-0">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">#</th>
                    <th className="px-6 py-3 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-slate-900">Required System Field</th>
                    <th className="px-6 py-3 border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-slate-500">Source Column (Excel)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEFAULT_HEADERS.map((actualHeader, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-2.5 text-center text-slate-400 font-mono text-[10px] bg-slate-50/30">{i + 1}</td>
                      <td className="px-6 py-2.5 font-bold text-slate-700">{actualHeader}</td>
                      <td className="px-6 py-2.5">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-10 flex items-center justify-center bg-slate-100 border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-500 shadow-sm">
                             {cols[i] || '?'}
                           </div>
                           <input
                            className="flex-1 h-9 border border-slate-200 rounded-lg px-3 text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 placeholder:font-normal uppercase"
                            value={cols[i] || ''}
                            onChange={e => {
                              const newMap = [...cols];
                              newMap[i] = e.target.value.toUpperCase();
                              setCols(newMap);
                            }}
                            placeholder="Enter Column (e.g. A, AA)"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/80 backdrop-blur flex justify-between items-center shrink-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {DEFAULT_HEADERS.length} Fields Mapped
              </div>
              <div className="flex gap-3">
                <button 
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm" 
                  onClick={cancelHeaderMapping}
                >
                  Cancel
                </button>
                <button 
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg shadow-blue-900/20 active:translate-y-0.5 transition-all flex items-center gap-2" 
                  onClick={confirmHeaderMapping}
                >
                  <CheckCircle2 size={14} /> Confirm Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Database size={18} />
           </div>
           <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Data Ingestion Hub</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Central Repository Control</p>
           </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Session</span>
           <div className="h-3 w-px bg-slate-200"></div>
           <select
             className="bg-transparent text-xs font-black text-slate-900 focus:outline-none cursor-pointer uppercase tracking-tight"
             value={selectedSession}
             onChange={e => setSelectedSession(e.target.value)}
           >
             {sessionYears.map((session) => (
               <option key={session} value={session}>FY {session}</option>
             ))}
           </select>
           <ChevronDown size={12} className="text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Upload Card */}
        <UploadCard 
          id="master"
          title="Master Data Source"
          description="Primary system of record for Revenue, Cost Center allocation, and Employee mapping."
          icon={<FileSpreadsheet className="text-blue-500" strokeWidth={1.5} />}
          state={states.master}
          onFileSelect={(file) => handleFileSelect('master', file)}
          onCancel={() => cancelUpload('master')}
          fields={['Entity', 'Resource ID', 'Bill Rate', 'Revenue Model']}
          color="blue"
        />

        {/* Placeholder Cards for Future Impl - Visual Consistency */}
        <div className="lg:col-span-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center opacity-60">
           <Briefcase size={24} className="text-slate-300 mb-2" />
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Sync Module</h3>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Coming in v4.3 Update</p>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[300px]">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Info size={12} className="text-blue-500" /> System Audit Logs
          </h3>
          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">Service Operational</span>
        </div>

        <div className="overflow-auto p-2 space-y-2">
          <LogEntry 
            action="Financial Batch Update" 
            timestamp="Today, 09:42" 
            status="Completed" 
            records={1240} 
            user="Admin Executive"
          />
          <LogEntry 
            action="Master Location Patch" 
            timestamp="Yesterday, 16:15" 
            status="Completed" 
            records={12} 
            user="System Automation"
          />
          <LogEntry 
            action="Portfolio Metadata Sync" 
            timestamp="Nov 12, 11:20" 
            status="Warning" 
            records={450} 
            user="Admin Executive"
            message="24 records skipped: ID Missing"
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
  color?: string;
}

const UploadCard: React.FC<UploadCardProps> = ({ id, title, description, icon, state, onFileSelect, onCancel, fields, color = 'blue' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      onFileSelect(file);
    } else {
      alert("Invalid format");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all flex flex-col h-full group relative overflow-hidden">
      <div className="flex justify-between items-start mb-3 z-10 relative">
        <div className="flex items-center gap-3">
           <div className={`p-2.5 rounded-lg border bg-white shadow-sm text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors`}>
             {icon}
           </div>
           <div>
             <h3 className="text-sm font-black text-slate-900 tracking-tight">{title}</h3>
             <StatusBadge status={state.status} />
           </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4 min-h-[2.5em]">{description}</p>

      <div className="flex-1 flex flex-col gap-3">
        {state.status === 'idle' ? (
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-32 ${
              isDragging ? 'bg-blue-50/50 border-blue-400' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleInputChange} accept=".xlsx,.xls" className="hidden" />
            <div className="mb-2 p-2 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
               <FileUp size={16} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Click to Upload</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">XLSX / XLS Formats</p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden h-32 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                   <FileText size={14} className="text-slate-400 shrink-0" />
                   <span className="text-[10px] font-bold text-slate-700 truncate">{state.file?.name}</span>
                </div>
                {state.status !== 'processing' && state.status !== 'success' && (
                  <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors"><X size={12} /></button>
                )}
             </div>

             <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                   <span className={state.status === 'success' ? 'text-emerald-600' : 'text-blue-600'}>{state.message}</span>
                   {state.status === 'uploading' && <span>{state.progress}%</span>}
                </div>
                <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${state.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${state.progress}%` }}></div>
                </div>
             </div>
             
             {state.status === 'processing' && (
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[8px] font-bold text-slate-400 uppercase animate-pulse">
                   <Loader2 size={10} className="animate-spin" /> Processing...
                </div>
             )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-50">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Required Fields</p>
          <div className="flex flex-wrap gap-1">
            {fields.map((f) => (
              <span key={f} className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-bold text-slate-500 uppercase">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const styles = {
    idle: 'hidden',
    uploading: 'text-blue-500 bg-blue-50 border-blue-100',
    processing: 'text-indigo-500 bg-indigo-50 border-indigo-100',
    success: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    error: 'text-red-500 bg-red-50 border-red-100'
  };

  if(status === 'idle') return null;

  return (
    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
};

const LogEntry = ({ action, timestamp, status, records, user, message }: any) => (
  <div className="flex items-center justify-between p-2.5 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition-all group">
    <div className="flex items-center gap-3">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${status === 'Warning' ? 'bg-amber-500' : 'bg-slate-800'}`}>
        <FileSpreadsheet size={14} />
      </div>
      <div>
        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wide group-hover:text-blue-600 transition-colors">{action}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{timestamp}</span>
          <span className="h-0.5 w-0.5 rounded-full bg-slate-300"></span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{user}</span>
        </div>
        {message && <p className="text-[8px] text-amber-600 font-bold uppercase mt-0.5 flex items-center gap-1"><AlertCircle size={8}/> {message}</p>}
      </div>
    </div>
    
    <div className="flex items-center gap-4 text-right">
      <div>
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Records</p>
        <p className="text-xs font-black text-slate-700">{records.toLocaleString()}</p>
      </div>
      <div className={`hidden sm:flex h-6 w-6 rounded-full items-center justify-center border ${
        status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
      }`}>
        {status === 'Completed' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
      </div>
    </div>
  </div>
);

export default DataUpload;