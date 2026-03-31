import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit3, UserCheck, Shield, MapPin, Home, Briefcase, Globe } from 'lucide-react';

export default function ReaderManagement({ token }) {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReaders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/readers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReaders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReaders();
  }, []);

  const filteredReaders = readers.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile?.includes(searchTerm) ||
    r.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Master Subscriber Registry</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <UserCheck size={12} className="text-green-600" /> Unified database of all newspaper subscribers
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, mobile or district..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 w-full md:w-80 shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-blue-600 font-black uppercase tracking-widest animate-pulse gap-4">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           Syncing Shared Registry...
        </div>
      ) : filteredReaders.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
          <Shield className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <p className="text-gray-300 text-sm font-black uppercase tracking-[0.2em]">No subscribers found in the master collection.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-8">Subscriber Detail</th>
                  <th className="px-10 py-8">Jurisdiction Tag</th>
                  <th className="px-10 py-8">Plan / Type</th>
                  <th className="px-10 py-8">Registration Source</th>
                  <th className="px-10 py-8 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReaders.map((r) => (
                  <tr key={r._id} className="hover:bg-green-50/20 transition-all group">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                             <UserCheck size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-[13px] tracking-tight">{r.name.toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">📞 {r.mobile}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <MapPin size={10} className="text-blue-500" />
                             <span className="text-[10px] font-black text-gray-800 uppercase tabular-nums">{r.district}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-60">
                             <Home size={10} className="text-gray-400" />
                             <span className="text-[9px] font-bold text-gray-500 uppercase">{r.taluka || r.village || 'City Node'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100 font-black bg-blue-50 text-blue-600`}>
                         {r.subscriptionPlan.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-black text-gray-800 uppercase tracking-tighter">@{r.registeredBy.split('@')[0]}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">{r.registeredByRole?.replace('_', ' ')}</p>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition active:scale-95"><Edit3 size={16} /></button>
                          <button className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition active:scale-95"><Trash2 size={16} /></button>
                       </div>
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
