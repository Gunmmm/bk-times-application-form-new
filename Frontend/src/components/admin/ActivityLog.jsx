import React, { useEffect, useState } from 'react';
import { Clock, User, Shield, AlertCircle, ArrowRight, History, Search } from 'lucide-react';

export default function ActivityLog({ token }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const filteredLogs = logs.filter(log => 
    log.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.changedByUser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionStyles = (type) => {
    switch(type) {
      case 'Create': return 'bg-green-50 text-green-700 border-green-100';
      case 'Approve': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Reject': return 'bg-red-50 text-red-700 border-red-100';
      case 'Forward': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">System Audit Log</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <History size={12} className="text-blue-600" /> Complete operational history of the portal
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Filter by applicant, user, or action..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 w-full md:w-80 shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-blue-600 font-black uppercase tracking-widest animate-pulse gap-4">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           Syncing Audit Registry...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
          <AlertCircle className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <p className="text-gray-300 text-sm font-black uppercase tracking-[0.2em]">No system activity recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-8">Timestamp</th>
                  <th className="px-10 py-8">Actor</th>
                  <th className="px-10 py-8">Record / Type</th>
                  <th className="px-10 py-8">Activity Detail</th>
                  <th className="px-10 py-8">Status Transition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-blue-50/20 transition-all group">
                    <td className="px-10 py-8 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Clock size={14} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-gray-900 leading-none mb-1">{new Date(log.changedAt).toLocaleTimeString()}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(log.changedAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all">
                           <User size={14} />
                         </div>
                         <div>
                           <p className="font-black text-gray-800 text-[11px] uppercase tracking-tight">{log.changedByUser}</p>
                           <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{log.changedByRole.replace('_', ' ')}</p>
                         </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-1">
                         <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border w-fit ${getActionStyles(log.actionType)}`}>
                           {log.actionType}
                         </span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">ID: ...{log.applicationId.slice(-6)}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 max-w-xs">
                       <p className="text-xs text-gray-600 font-medium leading-relaxed">{log.note}</p>
                       <p className="text-[9px] text-gray-400 font-black uppercase mt-1.5">{log.district || 'Pan-State'} • {log.taluka || log.village || 'Admin Hub'}</p>
                    </td>
                    <td className="px-10 py-8">
                       {log.newStatus && (
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] font-bold text-gray-400 line-through uppercase">{log.oldStatus || 'NONE'}</span>
                            <ArrowRight size={12} className="text-gray-300" />
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{log.newStatus}</span>
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
