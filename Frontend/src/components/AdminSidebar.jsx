import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Settings, 
  Bell, 
  Percent, 
  LogOut,
  ChevronRight,
  UserCog,
  X,
  Map,
  Home,
  FileText,
  Activity,
  Globe
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Monitor Live', icon: Activity, group: 'Strategy' },
    { id: 'regional', label: 'Regional Overview', icon: Map, group: 'Strategy' },
    
    { id: 'users', label: 'Master User Registry', icon: UserCog, group: 'Management' },
    { id: 'district', label: 'District Registry', icon: Users, group: 'Management' },
    { id: 'taluka', label: 'Taluka Registry', icon: Users, group: 'Management' },
    { id: 'zone', label: 'Zone Registry', icon: Users, group: 'Management' },
    { id: 'village', label: 'Village Registry', icon: Users, group: 'Management' },
    
    { id: 'preview-zone', label: 'Zone Dashboard', icon: Globe, group: 'Live Views' },
    { id: 'preview-district', label: 'District Dashboard', icon: Globe, group: 'Live Views' },
    { id: 'preview-taluka', label: 'Taluka Dashboard', icon: Globe, group: 'Live Views' },
    { id: 'preview-village', label: 'Village Dashboard', icon: Globe, group: 'Live Views' },

    { id: 'commissions', label: 'Commissions', icon: Percent, group: 'Global' },
    { id: 'permissions', label: 'Permissions', icon: ShieldAlert, group: 'Global' },
    { id: 'notice', label: 'Global Notice', icon: Bell, group: 'Global' },
    { id: 'settings', label: 'Global Settings', icon: Settings, group: 'Global' },
  ];

  const groupedItems = menuItems.reduce((acc, item) => {
    const group = item.group || 'General';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-[70] transition-all duration-500 ease-out
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-64'}
      `}>
        {/* Close Button (Mobile Only) */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-6 right-6 p-2 bg-gray-50 rounded-xl text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 mt-10 mb-8 border-b border-gray-50 pb-6">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Master Console</p>
          <h1 className="text-xl font-black text-gray-900 tracking-tighter mt-1">SUPER ADMIN</h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar pb-10">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="space-y-1.5">
              <p className="px-5 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">{group}</p>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if(window.innerWidth < 1024) setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-5 py-2.5 rounded-xl transition-all group ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                      : 'text-gray-500 hover:bg-blue-50/50 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className={`w-3.5 h-3.5 ${activeTab === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100 transition-opacity'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight className="w-3 h-3 animate-in fade-in slide-in-from-left-2 duration-300" />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 bg-gray-50/30">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-4 px-5 py-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 group"
          >
            <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            <span className="text-[11px] font-black uppercase tracking-widest">Master Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
