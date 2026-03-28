import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import DetailPageWrapper from '../components/DetailPageWrapper';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#ea580c', '#2563eb', '#16a34a', '#9333ea', '#0891b2', '#db2777'];

export default function StatsCommission() {
  const { token } = useAuth();
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const COMMISSION_RATE = 0.18; // 18%

  useEffect(() => {
    if (!token) return;
    fetch('/api/readers', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setReaders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const totalIncome = readers.reduce((s, r) => s + (r.amount || 0), 0);
  const totalCommission = Math.floor(totalIncome * COMMISSION_RATE);

  const commissionData = readers.map((r) => ({
    name: r.fullName || 'Unknown',
    commission: Math.floor((r.amount || 0) * COMMISSION_RATE),
    amount: r.amount || 0,
    plan: r.plan,
    date: r.createdAt,
    _id: r._id,
  }));

  const fmt = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <DetailPageWrapper
      title="Total Commission"
      subtitle={`${fmt(totalCommission)} total earnings for reporter`}
    >
      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading commission data...</p>
      ) : readers.length === 0 ? (
        <p className="text-gray-400">No commission data yet.</p>
      ) : (
        <div className="space-y-6 mt-2">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">Commission per Reader</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={commissionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="commission" radius={[4, 4, 0, 0]}>
                  {commissionData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Reader</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-right">Commission (18%)</th>
                  <th className="px-4 py-3 text-right">% of Total</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {commissionData.map((r, i) => {
                  const pct = totalCommission > 0 ? ((r.commission / totalCommission) * 100).toFixed(1) : 0;
                  return (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                      <td className="px-4 py-3 text-blue-600">{r.plan}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600">{fmt(r.commission)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.date ? new Date(r.date).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-orange-50 font-bold">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-gray-700">Total Reward</td>
                  <td className="px-4 py-3 text-right text-orange-700">{fmt(totalCommission)}</td>
                  <td className="px-4 py-3 text-right text-gray-500">100%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </DetailPageWrapper>
  );
}
