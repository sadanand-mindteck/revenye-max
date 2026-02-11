
import React, { useState } from 'react';
import { 
  ChevronDown, ChevronRight, MoreHorizontal, Filter, Search, Plus, User, Activity 
} from 'lucide-react';
import { MOCK_DEALS } from '../constants';

const DealManagement: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Closed Won': return 'bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]';
      case 'In Progress': return 'bg-[#e6f4ff] text-[#1677ff] border-[#91caff]';
      case 'On Hold': return 'bg-[#fff7e6] text-[#faad14] border-[#ffe58f]';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 p-3 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase">Project Portfolio Registry</h2>
          <p className="text-[11px] text-slate-400 font-medium">Monitoring {MOCK_DEALS.length} global deals</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Query deals..." 
              className="pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 text-xs font-medium focus:border-[#1677ff] focus:outline-none w-48"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50">
            <Filter size={12} /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1 bg-[#1677ff] text-white text-[11px] font-bold hover:bg-[#4096ff]">
            <Plus size={12} /> New Deal
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <th className="px-3 py-2 w-10"></th>
              <th className="px-3 py-2">Entity Description</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2 text-right">FY FCT</th>
              <th className="px-3 py-2 text-right">FY BGT</th>
              <th className="px-3 py-2 text-right">Variance</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-center w-10">...</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_DEALS.map((deal) => {
              const isExpanded = expandedRows.has(deal.id);
              return (
                <React.Fragment key={deal.id}>
                  <tr 
                    className={`group transition-all cursor-pointer ${isExpanded ? 'bg-[#f0f5ff]' : 'hover:bg-slate-50/50'}`}
                    onClick={() => toggleRow(deal.id)}
                  >
                    <td className="px-3 py-2 text-center">
                      <div className={isExpanded ? 'text-[#1677ff]' : 'text-slate-300'}>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">{deal.projectName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{deal.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <User size={10} className="text-slate-300" /> {deal.bdm}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-slate-800 text-xs">
                      ${deal.fyForecast.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-400 text-xs font-medium">
                      ${deal.fyBudget.toLocaleString()}
                    </td>
                    <td className={`px-3 py-2 text-right font-bold text-xs ${deal.variance >= 0 ? 'text-[#52c41a]' : 'text-[#ff4d4f]'}`}>
                      {deal.variance >= 0 ? '+' : ''}{deal.variance.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold border uppercase ${getStatusStyle(deal.status)}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <MoreHorizontal size={14} className="text-slate-300 group-hover:text-slate-600" />
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-white">
                      <td colSpan={8} className="p-3 border-l-2 border-[#1677ff] bg-slate-50/30">
                        <div className="border border-slate-200 p-3 bg-white space-y-3">
                          <h4 className="text-[10px] font-bold text-[#1677ff] uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} /> Regional Metadata Analysis
                          </h4>
                          <div className="grid grid-cols-5 gap-4">
                             <DetailItem label="Location" value={deal.location} />
                             <DetailItem label="BU Head" value={deal.buHead} />
                             <DetailItem label="Practice Head" value={deal.practiceHead} />
                             <DetailItem label="Deal Type" value={deal.dealType} />
                             <DetailItem label="Note" value={deal.note} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
    <p className="text-[11px] font-semibold text-slate-700">{value}</p>
  </div>
);

export default DealManagement;
