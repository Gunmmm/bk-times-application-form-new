import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trash2, Edit3, Filter, ChevronRight, UserMinus, ShieldCheck } from 'lucide-react';

export default function ReporterManagement({ role, token }) {
  const [reporters, setReporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState(role || "");

  useEffect(() => {
    fetchReporters();
  }, [role, filterRole]);

  const fetchReporters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reporters?role=${filterRole}&search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReporters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, soft = true) => {
    const confirmMsg = soft ? "Archive this record (soft delete)?" : "PERMANENTLY DELETE this record from database?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await fetch(`/api/admin/reporters/${id}?soft=${soft}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReporters();
    } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/admin/reporters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 'personal.status': newStatus })
      });
      fetchReporters();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">
            System Identity Registry
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3">
            {role ? `${role.toUpperCase()} LEVEL MANAGEMENT` : "COMPLETE DATABASE MANAGEMENT"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && fetchReporters()}
              className="bg-white border border-gray-100 px-10 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>
          <button onClick={fetchReporters} className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-xl shadow-blue-100"><Filter className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Master Identity</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Role/Scale</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Contact Point</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol Status</th>
                <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Admin Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {loading ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black text-blue-600 animate-pulse">Syncing Master Database...</td></tr>
              ) : reporters.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-[10px] font-black text-gray-300">No matching records found.</td></tr>
              ) : reporters.map((r) => (
                <tr key={r._id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <p className="text-[11px] font-black text-gray-800 uppercase tabular-nums">{(r.personal?.fullName || 'Identity Deleted').toUpperCase()}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-60 italic">{r.personal?.village || r.zone || 'Global'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-100/50 tracking-widest leading-none">
                      {r.role || 'Reporter'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[10px] font-mono text-gray-500 font-bold tabular-nums">{r.personal?.phone || r.phone}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => handleToggleStatus(r._id, r.personal?.status || 'active')}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all tracking-widest ${
                        (r.personal?.status || 'active') === 'active' 
                          ? 'bg-green-50 text-green-600 border border-green-100/50' 
                          : 'bg-red-50 text-red-600 border border-red-100/50'
                      }`}
                    >
                      {(r.personal?.status || 'active')}
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => handleDelete(r._id, true)} className="p-2.5 text-orange-400 hover:bg-orange-50 rounded-xl transition-all shadow-sm"><UserMinus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(r._id, false)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                    <button className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"><Edit3 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
