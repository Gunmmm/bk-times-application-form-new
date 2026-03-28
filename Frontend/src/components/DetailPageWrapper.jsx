import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

/** Back button + page heading shared by all detail stat pages */
export default function DetailPageWrapper({ title, subtitle, children }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={true} />
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
        >
          ← Dashboard
        </button>
        <span className="text-gray-300">|</span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <main className="flex-1 px-4 pb-10">{children}</main>
    </div>
  );
}
