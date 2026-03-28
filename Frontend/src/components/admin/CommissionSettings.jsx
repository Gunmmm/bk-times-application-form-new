import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Percent, Shield, Globe, MapPin, Home, Briefcase, Plus, Minus } from 'lucide-react';

export default function CommissionSettings({ settings, onUpdate }) {
  const [commissions, setCommissions] = useState({
    zone: 18,
    district: 15,
    taluka: 13,
    village: 12
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings && settings.commissions) {
      setCommissions({
        zone: settings.commissions.zone || 18,
        district: settings.commissions.district || 15,
        taluka: settings.commissions.taluka || 13,
        village: settings.commissions.village || 12
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate({ 
        ...settings,
        commissions: {
          zone: Number(commissions.zone),
          district: Number(commissions.district),
          taluka: Number(commissions.taluka),
          village: Number(commissions.village)
        }
      });
      alert('🚀 Global Commission Registry Updated! All coordinator dashboards will sync in real-time.');
    } catch (err) {
      console.error(err);
      alert('Error updating commissions.');
    } finally {
      setLoading(false);
    }
  };

  const adjustValue = (role, amt) => {
    setCommissions(prev => ({
      ...prev,
      [role]: Math.max(0, Math.min(100, (Number(prev[role]) || 0) + amt))
    }));
  };

  const roles = [
    { key: 'zone', label: 'Zone Coordinator', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50', barColor: 'bg-purple-600' },
    { key: 'district', label: 'District Coordinator', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', barColor: 'bg-blue-600' },
    { key: 'taluka', label: 'Taluka Coordinator', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50', barColor: 'bg-orange-600' },
    { key: 'village', label: 'Village Coordinator', icon: Home, color: 'text-green-600', bg: 'bg-green-50', barColor: 'bg-green-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">Management Control</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-4 flex items-center gap-2">
            <Shield size={12} className="text-blue-600" /> Administrative Revenue Distribution
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-navy text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-navy/20 hover:bg-black transition-all active:scale-95 group disabled:opacity-50"
        >
          {loading ? <RefreshCcw className="w-4 h-4 animate-spin text-steppergold" /> : <Save className="w-4 h-4 text-steppergold group-hover:scale-125 transition-transform" />}
          Update All Commissions
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Main Panel */}
        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="flex items-center gap-3 mb-10 relative">
            <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Commission Tier Management</h3>
          </div>

          <div className="space-y-12 relative">
            {roles.map((role) => (
              <div key={role.key} className="group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${role.bg} ${role.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                      <role.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-900 uppercase tracking-wider block">
                        {role.label}
                      </label>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Admin Defined Rate</p>
                    </div>
                  </div>
                  
                  {/* Control UI */}
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <button onClick={() => adjustValue(role.key, -1)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-colors shadow-sm"><Minus size={16}/></button>
                    <div className="relative">
                      <input
                        type="number"
                        value={commissions[role.key]}
                        onChange={(e) => setCommissions({...commissions, [role.key]: e.target.value})}
                        className="w-20 bg-white border-2 border-transparent focus:border-blue-600 rounded-xl py-3 text-lg font-black text-navy outline-none transition-all text-center"
                      />
                      <span className="absolute right-2 top-1 text-[8px] font-black text-blue-600 bg-blue-50 px-1 rounded">%</span>
                    </div>
                    <button onClick={() => adjustValue(role.key, 1)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-green-600 transition-colors shadow-sm"><Plus size={16}/></button>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                  <div 
                    className={`h-full transition-all duration-1000 ${role.barColor} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                    style={{ width: `${commissions[role.key]}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insight Panel */}
        <div className="space-y-8">
           <div className="bg-navy rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute bottom-0 right-0 p-10 opacity-10"><Percent className="w-64 h-64" /></div>
              <h3 className="text-2xl font-black tracking-tight mb-6">Revenue Scaling</h3>
              <p className="text-blue-200 text-sm leading-relaxed mb-8 font-medium">Changing these values will instantly update the earnings calculation for all personnel on their respective dashboards. This is a real-time system sync.</p>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                    <p className="text-[9px] font-black text-steppergold uppercase tracking-[0.2em] mb-2">High Tier Max</p>
                    <p className="text-3xl font-black">25%</p>
                 </div>
                 <div className="bg-white/10 p-6 rounded-3xl border border-white/10">
                    <p className="text-[9px] font-black text-steppergold uppercase tracking-[0.2em] mb-2">System Avg</p>
                    <p className="text-3xl font-black">14%</p>
                 </div>
              </div>
           </div>

           <div className="bg-blue-600 text-white rounded-[3rem] p-10 flex items-start gap-6 shadow-xl shadow-blue-200">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0">
                 <RefreshCcw className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
              </div>
              <div>
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-2">Live Cloud Sync</h4>
                 <p className="text-xs text-blue-100 font-bold leading-relaxed">System-wide propagation is active. Once you click Update, all coordinator portals (Zone, District, Taluka, Village) will reflect these new rates immediately.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
