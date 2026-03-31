import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  Printer, 
  Search, 
  FileText, 
  MapPin, 
  Home, 
  Briefcase,
  Info
} from 'lucide-react';

// Safe fallbacks
const Globe = Search;

export default function AdManagement({ token }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/news', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpdateStatus = async (id, newStatus, role) => {
    try {
      alert(`✅ Status updated to ${newStatus} (Feature integration mapping in progress)`);
      setAds(prev => prev.map(ad => ad._id === id ? { ...ad, status: newStatus } : ad));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAds = ads.filter(ad => 
    (ad.name || ad.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ad._id || '').includes(searchTerm)
  );

  const getRoleIcon = (role) => {
    switch(role) {
      case 'zone_coordinator': return Globe;
      case 'district_coordinator': return MapPin;
      case 'taluka_coordinator': return Briefcase;
      case 'village_coordinator': return Home;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">ADVT Inventory</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            Master aggregation of all regional bookings
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Advertiser / Category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 w-full md:w-80 shadow-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-blue-600 font-black uppercase tracking-widest animate-pulse gap-4">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
           Syncing All Regional Data...
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm">
          <Printer className="w-16 h-16 text-gray-100 mx-auto mb-6" />
          <p className="text-gray-300 text-sm font-black uppercase tracking-[0.2em]">No ADVT found in the system registry.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-10 py-8">Origin / Client</th>
                  <th className="px-10 py-8">Category / Package</th>
                  <th className="px-10 py-8">Content Preview</th>
                  <th className="px-10 py-8">Amount</th>
                  <th className="px-10 py-8">Status</th>
                  <th className="px-10 py-8 text-center">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAds.map((ad) => {
                  const RoleIcon = getRoleIcon(ad.submittedByRole);
                  return (
                    <tr key={ad._id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                             <RoleIcon size={18} />
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-[13px] tracking-tight">{ad.name || ad.title || 'Anonymous'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{ad.phone || 'NO PHONE'} • {ad.village || ad.taluka || 'Portal'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-blue-600 text-[11px] uppercase tracking-widest">{ad.category}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{ad.durationDays} Day Duration</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 max-w-xs">
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-medium italic">"{ad.content}"</p>
                      </td>
                      <td className="px-10 py-8 font-black text-gray-900 text-[13px]">
                        ₹{ad.paymentAmount?.toLocaleString() || 0}
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border
                          ${ad.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center justify-center gap-2">
                          {ad.status === 'Pending Approval' ? (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(ad._id, 'Print Scheduled', ad.submittedByRole)}
                                className="bg-blue-600 hover:bg-black text-white p-3 rounded-2xl shadow-xl shadow-blue-100 transition active:scale-95"
                                title="Approve & Schedule"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(ad._id, 'Rejected', ad.submittedByRole)}
                                className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-2xl transition active:scale-95"
                                title="Reject ADVT"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <div className="p-3 bg-gray-50 text-gray-300 rounded-2xl">
                               <Printer size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
