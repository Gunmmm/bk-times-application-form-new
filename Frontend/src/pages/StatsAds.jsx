import React, { useEffect, useState } from 'react';
import DetailPageWrapper from '../components/DetailPageWrapper';
import { useAuth } from '../hooks/useAuth';

export default function StatsAds() {
  const { token } = useAuth();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!token) return;
    fetch('/api/readers', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setReaders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  // Derive ads from readers (each reader is assigned a slot of ads based on their plan)
  const adsPerPlan = { '1 Year': 50, '2 Year': 120, '3 Year': 200 };
  const BASE_ADS = 456;

  const readerAds = readers.map((r, i) => ({
    adNo: `AD-${String(i + 1).padStart(4, '0')}`,
    reader: r.fullName || 'Unknown',
    email: r.email,
    plan: r.plan,
    slots: adsPerPlan[r.plan] || 50,
    revenue: r.amount,
    status: r.status || 'active',
  }));

  const totalAds = BASE_ADS + readerAds.reduce((s, a) => s + a.slots, 0);

  const filtered = filter === 'all' ? readerAds : readerAds.filter((a) => a.status === filter);

  const fmt = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <DetailPageWrapper
      title="Total Ads Running"
      subtitle={`${totalAds} ads total across ${readers.length} reader slot(s)`}
    >
      {/* Filter Bar */}
      <div className="flex gap-2 my-3 flex-wrap">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
              filter === f ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading ads data...</p>
      ) : (
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-extrabold text-purple-600">{totalAds}</div>
              <div className="text-xs text-gray-500 mt-1">Total Ads</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-extrabold text-green-600">{readerAds.length}</div>
              <div className="text-xs text-gray-500 mt-1">Active Reader Slots</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl font-extrabold text-blue-600">{BASE_ADS}</div>
              <div className="text-xs text-gray-500 mt-1">Base Inventory</div>
            </div>
          </div>

          {/* Ads Table */}
          {filtered.length === 0 ? (
            <p className="text-gray-400">No ads match this filter.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Ad #</th>
                    <th className="px-4 py-3 text-left">Reader</th>
                    <th className="px-4 py-3 text-left">Plan</th>
                    <th className="px-4 py-3 text-right">Ad Slots</th>
                    <th className="px-4 py-3 text-right">Revenue</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((ad) => (
                    <tr key={ad.adNo} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{ad.adNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{ad.reader}</td>
                      <td className="px-4 py-3 text-blue-600">{ad.plan}</td>
                      <td className="px-4 py-3 text-right font-semibold text-purple-700">{ad.slots}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(ad.revenue)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${ad.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ad.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DetailPageWrapper>
  );
}
