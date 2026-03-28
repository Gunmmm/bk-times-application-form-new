import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#007bff', '#28a745', '#fd7e14'];

export default function SubscriptionPie({ readersData = [], peakJoin = 'N/A', peakExpiry = 'N/A' }) {
  // We expect exact 3 plans
  // If no data, use the fallback sample data of 11 readers as strictly requested just in case DB is empty.
  const hasData = readersData.length > 0 && readersData.some(d => d.count > 0);
  
  const displayData = (hasData ? readersData : [
    { plan: 'Plan 1', amount: 1000, count: 5 },
    { plan: 'Plan 2', amount: 2000, count: 4 },
    { plan: 'Plan 3', amount: 3000, count: 2 }
  ]).map(d => {
    const name = d.plan ? d.plan.split('(')[0].trim() : 'Plan';
    const price = d.amount ? `(₹${d.amount})` : '';
    return {
      ...d,
      cleanPlan: `${name} ${price}`.trim()
    };
  });

  const totalReaders = displayData.reduce((acc, curr) => acc + curr.count, 0);
  const totalRevenue = displayData.reduce((acc, curr) => acc + (curr.amount * (curr.count || 0)), 0);

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Custom tooltips
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { cleanPlan, count } = payload[0].payload;
      const percent = ((count / totalReaders) * 100).toFixed(1);
      return (
        <div className="bg-white border border-gray-200 shadow-md p-3 rounded-md text-sm">
          <p className="font-bold text-gray-800">{cleanPlan}</p>
          <p className="text-gray-600">{count} readers registered ({percent}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-full max-w-[450px] mx-auto">
      <div className="text-center mb-4">
        <h3 className="font-bold text-gray-800 text-sm mb-1">Total: {formatCurrency(totalRevenue)} from {totalReaders} reader(s)</h3>
        <h2 className="font-extrabold text-gray-900 text-base">Subscription Plans</h2>
        
        <div className="mt-2 flex justify-center gap-2 text-[10px]">
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium border border-blue-200">
            Peak Join: {peakJoin}
          </span>
          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-200">
            Peak Expiry: {peakExpiry}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-8">
        <div className="w-[180px] h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                dataKey="count"
                nameKey="cleanPlan"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40} // slight donut effect for modern look, but solid pie is outer=100
                paddingAngle={2}
                stroke="none"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2">
          {displayData.map((entry, index) => (
            <div key={entry.cleanPlan} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm shadow-sm flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs font-medium text-gray-700">
                {entry.cleanPlan}: <strong className="text-gray-900">{entry.count} readers</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
