import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NetRevenueCard({ netRevenue = 0, todayNet = 0, adCommission = 0, todayAd = 0 }) {
  const navigate = useNavigate();
  const format = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Main Card */}
      <div className="sm:col-span-2 bg-white rounded-xl shadow-sm border-2 border-[#8B5A2B] p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-700 font-bold mb-2">Net Reporter Revenue</h3>
          <div className="text-4xl font-extrabold text-[#28a745] mb-1">{format(netRevenue)}</div>
          <div className="text-sm font-semibold text-gray-500 mb-6">
            +{format(todayNet)} today (net gain)
          </div>
        </div>
        <div>
          <button 
            onClick={() => navigate('/ads')}
            className="flex items-center text-[#28a745] font-bold text-sm tracking-wide hover:opacity-80 transition"
          >
            View details →
          </button>
        </div>
      </div>

      {/* Small Right Card */}
      <div className="sm:col-span-1 bg-white rounded-xl shadow-sm border-2 border-[#8B5A2B] p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-gray-700 font-bold mb-2">AD Commission</h3>
          <div className="text-3xl font-extrabold text-[#28a745] mb-1">{format(adCommission)}</div>
          <div className="text-sm font-semibold text-gray-500 mb-6">
            +{format(todayAd)} today
          </div>
        </div>
        <div>
          <button 
            onClick={() => navigate('/stats/commission')}
            className="flex items-center text-[#28a745] font-bold text-sm tracking-wide hover:opacity-80 transition"
          >
            View details →
          </button>
        </div>
      </div>
    </div>
  );
}
