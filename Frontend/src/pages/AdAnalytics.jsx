import React, { useState } from 'react';
import DetailPageWrapper from '../components/DetailPageWrapper';
import { Filter, Play, Pause, CheckCircle, Search, MapPin } from 'lucide-react';

const CATEGORIES = ['All', 'Matrimonial', 'Recruitment', 'Property', 'Business', 'Services'];
const ZONES = ['All', 'Nashik', 'Chhatrapati Sambhaji Nagar', 'Nagpur', 'Mumbai', 'Pune', 'Amravati', 'Full Maharashtra'];
const STATUSES = ['All', 'Live', 'Pending', 'Paused'];

export default function AdAnalytics() {
  const [filterZone, setFilterZone] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAds();
  }, []);

  const filteredAds = ads.filter(ad => {
    const zonesStr = Array.isArray(ad.zones) ? ad.zones.join('+') : (ad.zones || '');
    const matchZone = filterZone === 'All' || zonesStr.includes(filterZone) || zonesStr.includes('Full Maharashtra');
    const matchCat = filterCat === 'All' || ad.category === filterCat;
    const matchStatus = filterStatus === 'All' || ad.status.includes(filterStatus);
    return matchZone && matchCat && matchStatus;
  });

  const toggleStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/ads/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const fmtCurrency = (v) => `₹${v.toLocaleString()}`;

  return (
    <DetailPageWrapper
      title="AD Analytics"
      subtitle="Today's Performance: 25 active ads | Live Campaign Tracking"
    >
      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 flex-1 min-w-[120px]">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          <select 
            value={filterZone} 
            onChange={(e) => {
              console.log('Zone changed:', e.target.value);
              setFilterZone(e.target.value);
            }}
            className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer w-full appearance-none"
          >
            {ZONES.map(z => <option key={z} value={z}>Zone: {z}</option>)}
          </select>
          <div className="pointer-events-none text-gray-400">▼</div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 flex-1 min-w-[120px]">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select 
            value={filterCat} 
            onChange={(e) => {
              console.log('Category changed:', e.target.value);
              setFilterCat(e.target.value);
            }}
            className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer w-full appearance-none"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>Category: {c}</option>)}
          </select>
          <div className="pointer-events-none text-gray-400">▼</div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 flex-1 min-w-[120px]">
          <div className={`w-2 h-2 rounded-full shrink-0 ${filterStatus === 'Live' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <select 
            value={filterStatus} 
            onChange={(e) => {
              console.log('Status changed:', e.target.value);
              setFilterStatus(e.target.value);
            }}
            className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer w-full appearance-none"
          >
            {STATUSES.map(s => <option key={s} value={s}>Status: {s}</option>)}
          </select>
          <div className="pointer-events-none text-gray-400">▼</div>
        </div>

        <div className="hidden lg:block flex-grow"></div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 whitespace-nowrap">
          {filteredAds.length} campaigns found
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider"></th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Advertiser</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">Zones</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAds.map((ad, idx) => (
                <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-300 font-bold text-xs">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{ad.advertiser}</div>
                    <div className="text-[10px] text-gray-400">ID: #{ad.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {ad.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                    {Array.isArray(ad.zones) ? ad.zones.join(' + ') : ad.zones}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-700">{ad.views || 0}</td>
                  <td className="px-6 py-4 text-right font-black text-blue-600">{fmtCurrency(ad.price || 0)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                      ${ad.status === 'Live' || ad.status === 'Print Scheduled' ? 'bg-green-100 text-green-700' : 
                        ad.status === 'Pending Approval' || ad.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {ad.status !== 'Live' && (
                        <button 
                          onClick={() => toggleStatus(ad.id, 'Live')}
                          title="Approve"
                          className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {ad.status === 'Live' && (
                        <button 
                          onClick={() => toggleStatus(ad.id, 'Paused')}
                          title="Pause"
                          className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition shadow-sm"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAds.length === 0 && (
            <div className="p-10 text-center text-gray-400 font-medium">
              No campaigns matching your filters found.
            </div>
          )}
        </div>
      </div>
    </DetailPageWrapper>
  );
}
