import React, { useState, useEffect } from 'react';
import { ShieldCheck, ToggleLeft, ToggleRight, Lock, Unlock, Database, Cpu } from 'lucide-react';

export default function PermissionControls({ settings, onUpdate }) {
  const [permissions, setPermissions] = useState(settings?.permissions || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setPermissions(settings.permissions);
    }
  }, [settings]);

  const handleToggle = async (role, key) => {
    const updated = {
      ...permissions,
      [role]: { ...permissions[role], [key]: !permissions[role][key] }
    };
    setPermissions(updated);
    setLoading(true);
    try {
      await onUpdate({ permissions: updated });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const sections = ['district', 'taluka', 'zone', 'village'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter leading-none">Access Protocol Management</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3">Toggle Role Capabilities Across Master Registry</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl border border-blue-100/50">
          <Cpu className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">Real-Time Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((role) => (
          <div key={role} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100/30">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{role} Level</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Protocol Matrix</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-green-500 opacity-20" />
            </div>

            <div className="space-y-5">
              {['canAdd', 'canEdit', 'canDelete', 'canView'].map((key) => (
                <div key={key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {permissions[role]?.[key] ? <Unlock className="w-3.5 h-3.5 text-blue-500" /> : <Lock className="w-3.5 h-3.5 text-gray-300" />}
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                      {key.replace('can', 'Master ')}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleToggle(role, key)}
                    disabled={loading}
                    className="transition-all transform active:scale-90"
                  >
                    {permissions[role]?.[key] ? (
                      <ToggleRight className="w-10 h-10 text-blue-600 stroke-[1.5]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-200 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
