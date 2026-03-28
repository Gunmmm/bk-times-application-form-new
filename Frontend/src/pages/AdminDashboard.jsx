import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import AdminSidebar from '../components/AdminSidebar';
import CommissionSettings from '../components/admin/CommissionSettings';
import PermissionControls from '../components/admin/PermissionControls';
import ReporterManagement from '../components/admin/ReporterManagement';
import NoticeSettings from '../components/admin/NoticeSettings';
import ZoneDashboard from './ZoneDashboard';
import DistrictDashboard from './DistrictDashboard';
import TalukaDashboard from './TalukaDashboard';
import VillageDashboard from './VillageDashboard';
import { 
  Users, 
  ShieldAlert, 
  Settings, 
  Percent, 
  Bell, 
  LayoutDashboard,
  LineChart,
  Activity,
  UserCheck,
  Menu,
  Database,
  Search,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [token, activeTab]);

  const fetchInitialData = async () => {
    try {
      const [settingsRes, overviewRes] = await Promise.all([
        fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/full-overview', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const settingsData = await settingsRes.json();
      const overviewData = await overviewRes.json();
      
      setSettings(settingsData);
      setOverview(overviewData);

      if (activeTab === 'users' || activeTab === 'monitoring') {
        const usersRes = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        setUsers(await usersRes.json());
      }

    } catch (err) {
      console.error('Master Sync Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (newData) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newData)
      });
      const data = await res.json();
      setSettings(data);
    } catch (err) { console.error('Update failed:', err); }
  };

  const handleUpdateRole = async (userId, type, newRole) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole, type })
      });
      fetchInitialData();
    } catch (err) { console.error(err); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Master Hub</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3">Total Network Oversight</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <OverviewCard title="Master Users" value={overview?.stats?.coordinators || 0} badge="Live" icon={Activity} color="blue" />
               <OverviewCard title="Reporters" value={overview?.stats?.reporters || 0} badge="Registry" icon={Users} color="green" />
               <OverviewCard title="Active Today" value={overview?.stats?.activeToday || 0} badge="Live" icon={Clock} color="orange" />
               <OverviewCard title="Villages" value="156" badge="Verified" icon={MapPin} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-8">Performance Pipeline</h3>
                 <div className="space-y-8 mt-8">
                    <PerformanceIndicator label="Zone Sync" percent="94%" color="bg-blue-600" />
                    <PerformanceIndicator label="District Coverage" percent="82%" color="bg-green-500" />
                    <PerformanceIndicator label="Village Entry" percent="68%" color="bg-orange-500" />
                 </div>
              </div>
              <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000"><ShieldCheck className="w-48 h-48" /></div>
                  <h3 className="text-2xl font-black tracking-tight mb-4">Master Protocol Active.</h3>
                  <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-xs">You have full override permissions across the entire regional cluster. System integrity is monitored in real-time.</p>
              </div>
            </div>
          </div>
        );

      case 'monitoring':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                   <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Who is Live / Connected</h2>
                   <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100/50">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Master Sync Active</span>
                   </div>
                </div>
                <div className="overflow-x-auto text-left">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none border-b border-gray-50">
                           <th className="px-10 py-6">Master Identity</th>
                           <th className="px-10 py-6">Assigned Role</th>
                           <th className="px-10 py-6">Connectivity</th>
                           <th className="px-10 py-6 text-right">Jurisdiction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u, i) => (
                          <tr key={i} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50/50">
                             <td className="px-10 py-6">
                                <p className="text-[11px] font-black text-gray-800 uppercase">{(u.personal?.fullName || u.name || 'Anonymous').toUpperCase()}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 italic">{u.email}</p>
                             </td>
                             <td className="px-10 py-6">
                                <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                  u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>{u.role}</span>
                             </td>
                             <td className="px-10 py-6 font-mono text-[10px] text-gray-500">
                                <div className="flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${i % 3 === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                   {i % 3 === 0 ? 'CONNECTED' : 'LAST SEEN 2H AGO'}
                                </div>
                             </td>
                             <td className="px-10 py-6 text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{u.personal?.district || u.zone || 'Global'}</p>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case 'regional':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-gray-50">
                   <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase leading-none">Regional Scale Performance</h2>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-3">Aggregated Data Analysis</p>
                </div>
                <div className="overflow-x-auto text-left">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                           <th className="px-10 py-6">District Node</th>
                           <th className="px-10 py-6 text-center">Leaders</th>
                           <th className="px-10 py-6 text-center">Reporters</th>
                           <th className="px-10 py-6 text-center">Village Coverage</th>
                           <th className="px-10 py-6 text-right">Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.regionalData?.map((d, i) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50/50">
                             <td className="px-10 py-6 text-[11px] font-black text-gray-800 uppercase tracking-tight">{d.district || 'UNASSIGNED'}</td>
                             <td className="px-10 py-6 text-center text-[11px] font-black text-blue-600">{d.totalLeaders}</td>
                             <td className="px-10 py-6 text-center text-[11px] font-black text-gray-500">{d.totalReporters}</td>
                             <td className="px-10 py-6 text-center text-[11px] font-black text-green-600">{d.totalVillages}</td>
                             <td className="px-10 py-6 text-right">
                                <div className="h-1.5 w-24 bg-gray-100 rounded-full ml-auto overflow-hidden">
                                   <div className="h-full bg-blue-600" style={{ width: '85%' }} />
                                </div>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case 'district': return <ReporterManagement role="District" token={token} key="district" />;
      case 'taluka': return <ReporterManagement role="Taluka" token={token} key="taluka" />;
      case 'zone': return <ReporterManagement role="Zone" token={token} key="zone" />;
      case 'village': return <ReporterManagement role="Village" token={token} key="village" />;
      
      case 'preview-zone': return <div className="scale-[0.8] origin-top"><ZoneDashboard /></div>;
      case 'preview-district': return <div className="scale-[0.8] origin-top"><DistrictDashboard /></div>;
      case 'preview-taluka': return <div className="scale-[0.8] origin-top"><TalukaDashboard /></div>;
      case 'preview-village': return <div className="scale-[0.8] origin-top"><VillageDashboard /></div>;

      case 'commissions': return <CommissionSettings settings={settings} onUpdate={handleUpdateSettings} />;
      case 'permissions': return <PermissionControls settings={settings} onUpdate={handleUpdateSettings} />;
      case 'notice': return <NoticeSettings settings={settings} onUpdate={handleUpdateSettings} />;
      default: return <div className="min-h-screen flex items-center justify-center font-black text-gray-300 uppercase italic">Module Synchronization in Progress...</div>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
       <div className="w-16 h-1 bg-blue-600 animate-[loading-bar_1.5s_infinite] rounded-full" />
       <p className="mt-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] animate-pulse">Syncing Master Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
        {/* Mobile Header Toggle */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-4 lg:hidden shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-900 leading-none">Master Hub</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm active:scale-95"><Menu className="w-5 h-5 font-black" /></button>
        </header>

        <div className="hidden lg:block w-full">
          <Header />
        </div>
        
        <main className="p-6 md:p-12 max-w-7xl mx-auto w-full pt-28 lg:pt-12">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function OverviewCard({ title, value, badge, icon: Icon, color }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100/50',
    green: 'text-green-600 bg-green-50 border-green-100/50',
    orange: 'text-orange-600 bg-orange-50 border-orange-100/50',
    purple: 'text-purple-600 bg-purple-50 border-purple-100/50'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full -mr-8 -mt-8 scale-0 group-hover:scale-100 transition-transform duration-700 ${colors[color].split(' ')[0]}`}></div>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{badge}</span>
      </div>
      <p className="text-4xl font-black text-gray-900 tracking-tighter mb-1 tabular-nums animate-in fade-in duration-1000 leading-none">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">{title}</p>
    </div>
  );
}

function PerformanceIndicator({ label, percent, color }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-gray-900 tabular-nums tracking-widest">{percent}</span>
      </div>
      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: percent }}></div>
      </div>
    </div>
  );
}
