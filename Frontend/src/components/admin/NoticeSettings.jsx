import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Bell, Info } from 'lucide-react';

export default function NoticeSettings({ settings, onUpdate }) {
  const [notice, setNotice] = useState(settings?.notice || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setNotice(settings.notice);
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({ notice });
      alert('Global Broadcast Notice Published!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Global Broadcast Center</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3">Publish System-Wide Communications</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
        >
          {loading ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Publish Master Update
        </button>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100/50">
            <Bell className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Broadcast Message</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Master Protocol 01</p>
          </div>
        </div>

        <textarea
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] p-8 text-sm font-medium text-gray-600 outline-none focus:ring-4 focus:ring-blue-100 transition-all min-h-[250px] leading-relaxed shadow-inner"
          placeholder="Enter the message you want every coordinator to see on their dashboard..."
        />

        <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-50 flex items-start gap-4">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Impact Analysis</p>
            <p className="text-xs text-blue-700 font-medium">This message is instantly visible to all Village, Taluka, District, and Zone coordinators across your entire regional network. Use this for critical policy updates or system maintenance windows.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
