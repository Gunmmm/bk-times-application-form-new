import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import { Users, UserCheck, UserPlus, Filter, Search } from 'lucide-react';
import ReaderRegistration from '../components/ReaderRegistration';

export default function VillageCoordinatorDashboard() {
  const { user } = useAuth();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.village) {
      fetchReaders();
    }
  }, [user]);

  const fetchReaders = async () => {
    if (!user?.village) return;
    try {
      setLoading(true);
      // Step 4: API call with village filter
      const res = await fetch(`/api/readers?village=${user.village}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setReaders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching village readers:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: readers.length,
    guest: readers.filter(r => r.type === 'guest').length,
    registered: readers.filter(r => r.type === 'reader' || r.type === 'register').length,
    percent: readers.length > 0 ? Math.round((readers.filter(r => r.type === 'reader').length / readers.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* STEP 5: DEBUG HEADER */}
      <div className="bg-red-50 p-2 text-center border-b border-red-100">
        <h1 className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">
          DEBUG: {user?.village?.toUpperCase() || 'UNKNOWN'} VILLAGE DASHBOARD LOADED
        </h1>
        <div className="text-[8px] font-mono text-red-400 overflow-hidden truncate">
          {user ? JSON.stringify(user) : 'No User Data'}
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              {user?.village || 'Village'} Desk
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">
              Management • {user?.taluka || 'Unknown'} Taluka • {user?.district || 'Unknown'}
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
          >
            + REGISTER NEW SUBSCRIBER
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-black text-gray-300 uppercase">Total</span>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Village Subscribers</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <UserPlus className="w-5 h-5 text-orange-500" />
              <span className="text-[10px] font-black text-gray-300 uppercase">Prospects</span>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.guest}</p>
            <p className="text-[10px] font-bold text-orange-500 uppercase mt-1">Guest Subscribers</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-5 h-5 text-green-500" />
              <span className="text-[10px] font-black text-gray-300 uppercase">Retention</span>
            </div>
            <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.percent}%</p>
            <p className="text-[10px] font-bold text-green-500 uppercase mt-1">Success Rate</p>
          </div>
        </div>

        {/* SUBSCRIBERS TABLE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Subscribers Repository</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input type="text" placeholder="Search..." className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-full text-[10px] font-bold outline-none w-48" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest animate-pulse">Loading Village Repository...</td></tr>
                ) : readers.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-20 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">No subscribers found in {user?.village || 'this village'}</td></tr>
                ) : readers.map((r, idx) => (
                  <tr key={r._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-gray-800 uppercase tabular-nums">{(r.name || r.fullName || 'Unknown').toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{r.phone || r.mobile}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase rounded-md tracking-tighter">Active</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${
                         r.type === 'guest' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                       }`}>
                         {r.type === 'guest' ? 'Guest' : 'Subscriber'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 text-[10px] font-black uppercase hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[420px] bg-white rounded-3xl overflow-hidden shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-900 transition">✕</button>
            <div className="max-h-[85vh] overflow-y-auto">
              <ReaderRegistration onComplete={() => {setIsModalOpen(false); fetchReaders();}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
