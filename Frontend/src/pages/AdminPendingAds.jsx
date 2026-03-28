import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Check, X, Printer, Phone, Search, ArrowLeft } from 'lucide-react';

export default function AdminPendingAds() {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/ads/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (newStatus === 'Print Scheduled') {
        alert("✅ Ad Approved! Notification sent to customer phone and email: 'See your ad in tomorrow's newspaper!'");
      }
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAds = ads.filter(ad => 
    ad.advertiser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.id?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showNav={true} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {/* Formal Header with Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-100 transition shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">PENDING BOOKINGS</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Review & Print Schedule</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search Advertiser / ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600 w-full md:w-80 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-blue-600 font-bold uppercase tracking-widest animate-pulse">Syncing Database...</div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <Printer className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">No pending ads found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase text-[9px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">AD ID / CAT</th>
                    <th className="px-6 py-4">ADVERTISER</th>
                    <th className="px-6 py-4">ZONES</th>
                    <th className="px-6 py-4">PREVIEW</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAds.map((ad) => (
                    <tr key={ad._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-5">
                        <div className="text-[9px] font-bold text-blue-600 mb-0.5">#{ad.id}</div>
                        <p className="font-bold text-gray-800 text-xs uppercase">{ad.category}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-gray-900 text-sm">{ad.advertiser}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{ad.phone}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {ad.zones?.map(z => (
                            <span key={z} className="bg-white text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded border border-gray-100 uppercase">{z}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {ad.image ? (
                          <img src={ad.image} alt="Thumb" className="w-10 h-10 object-cover rounded shadow-sm border border-gray-100" />
                        ) : (
                          <span className="text-[9px] text-gray-300 font-bold">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border
                          ${ad.status === 'Pending Approval' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1.5">
                          {ad.status === 'Pending Approval' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(ad.id, 'Print Scheduled')}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-sm transition active:scale-90"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(ad.id, 'Rejected')}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-sm transition active:scale-90"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <Printer className="w-4 h-4 text-gray-300" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
