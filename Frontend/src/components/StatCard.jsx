import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable clickable stat card for the dashboard.
 * Props: title, value, unit, badge, color, bg, to (route)
 */
export default function StatCard({ title, value, unit, badge, color = 'text-blue-600', bg = 'bg-blue-50', to }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => to && navigate(to)}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between
        ${to ? 'cursor-pointer hover:shadow-md hover:border-blue-300 active:scale-95 transition-all duration-150' : ''}`}
    >
      <h3 className="text-gray-500 text-sm font-medium border-b border-gray-100 pb-2 mb-3">
        {title}
      </h3>
      <div className={`text-3xl font-extrabold ${color} mb-2`}>
        {value}
        {unit && <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>}
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${bg} ${color}`}>
          {badge} ▶
        </span>
        {to && (
          <span className="text-xs text-blue-400 font-medium">View details →</span>
        )}
      </div>
    </div>
  );
}
