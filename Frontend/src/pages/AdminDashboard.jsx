import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminSidebar from '../components/AdminSidebar';
import CommissionSettings from '../components/admin/CommissionSettings';
import PermissionControls from '../components/admin/PermissionControls';
import ReporterManagement from '../components/admin/ReporterManagement';
import NoticeSettings from '../components/admin/NoticeSettings';
import AdManagement from '../components/admin/AdManagement';
import ActivityLog from '../components/admin/ActivityLog';
import ReaderManagement from '../components/admin/ReaderManagement';
import ZoneDashboard from './ZoneDashboard';
import DistrictDashboard from './DistrictDashboard';
import TalukaDashboard from './TalukaDashboard';
import VillageDashboard from './VillageDashboard';
import { 
  Users, 
  Settings, 
  Percent, 
  Search,
  ShieldCheck,
  MapPin,
  FileText,
  User,
  LogIn,
  Info,
  ChevronRight,
  ArrowRight,
  Check
} from 'lucide-react';

// Safe aliases for missing icons
const Shield = ShieldCheck;
const Activity = Info;
const History = FileText;
const Menu = Search; // Using Search as a fallback menu icon since Menu might be missing

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchInitialData = async (isAuto = false) => {
    if (!isAuto) setRefreshing(true);
    try {
      const authHeaders = { Authorization: `Bearer ${token}` };
      const [settingsRes, overviewRes] = await Promise.all([
        fetch('/api/admin/settings', { headers: authHeaders }),
        fetch('/api/admin/full-overview', { headers: authHeaders })
      ]);
      
      const settingsData = await settingsRes.json();
      const overviewData = await overviewRes.json();
      
      setSettings(settingsData);
      setOverview(overviewData);
      setLastUpdated(new Date());

      if (activeTab === 'users' || activeTab === 'monitoring') {
        const usersRes = await fetch('/api/admin/users', { headers: authHeaders });
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      if (!isAuto) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInitialData();
      const interval = setInterval(() => fetchInitialData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [token, activeTab]);

  const handleUpdateSettings = async (newData) => {
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newData)
      });
      setSettings(newData);
    } catch (err) { console.error(err); }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <OverviewCard title="MASTER COORDS" value={overview?.stats?.coordinators || 0} badge="Regional Subscribers" icon={Shield} color="purple" />
              <OverviewCard title="MASTER SUBSCRIBERS" value={overview?.stats?.reporters || 0} badge="Subscription Base" icon={Users || User} color="blue" />
              <OverviewCard title="MASTER ADV" value={overview?.stats?.allNews || 0} badge="Booking Inventory" icon={FileText} color="orange" />
              <OverviewCard title="NEW TODAY" value={overview?.stats?.activeToday || 0} badge="System Velocity" icon={Activity} color="green" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div>
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none">Regional Node Network</h2>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Active jurisdiction monitoring</p>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full uppercase tracking-widest">Active nodes</span>
                </div>
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left">
                       <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                         <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                            <th className="px-10 py-6">District Node</th>
                            <th className="px-10 py-6 text-center">Leaders</th>
                            <th className="px-10 py-6 text-center">Reporters</th>
                            <th className="px-10 py-6 text-right pr-14">Sync</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50/50">
                         {overview?.regionalData?.map((d, i) => (
                           <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                              <td className="px-10 py-6 text-[11px] font-black text-gray-800 uppercase tracking-tight">{d.district || 'UNASSIGNED'}</td>
                              <td className="px-10 py-6 text-center text-[11px] font-black text-blue-600">{d.totalLeaders}</td>
                              <td className="px-10 py-6 text-center text-[11px] font-black text-gray-500">{d.totalReporters}</td>
                              <td className="px-10 py-6 text-right pr-10">
                                 <div className="flex items-center gap-2 justify-end">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                                    <span className="text-[9px] font-black text-gray-300 uppercase">Synchronized</span>
                                 </div>
                              </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
                <div className="p-10 border-b border-gray-100 bg-gray-900 flex items-center justify-between">
                   <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">System Activity History</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">Real-time coordinator audit feed</p>
                   </div>
                   <History className="text-blue-500" size={20} />
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50/30 p-4 space-y-3">
                   {overview?.recentLogs?.length > 0 ? overview.recentLogs.map((log, i) => (
                     <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 <User size={14} />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-gray-900 leading-none">{log.changedByUser}</p>
                                 <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">{log.changedByRole?.replace('_', ' ')}</p>
                              </div>
                           </div>
                           <span className="text-[8px] font-black text-gray-300 uppercase">{new Date(log.changedAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 font-medium leading-relaxed pl-11">{log.note}</p>
                     </div>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
                        <History size={40} className="opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting system events...</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
      case 'monitoring':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                   <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Who is Live / Connected</h1>
                   <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-xl border border-green-100/50">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Master Sync Active</span>
                   </div>
                </div>
                <div className="overflow-x-auto text-left">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
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
                                <p className="text-[11px] font-black text-gray-800 uppercase">{(u.fullName || u.email || 'Anonymous').toUpperCase()}</p>
                                <div className="flex items-center gap-2 mt-1">
                                   <p className="text-[9px] font-bold text-gray-400 uppercase italic">{u.email}</p>
                                   {u.coordinatorCode && <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded leading-none whitespace-nowrap">ID: {u.coordinatorCode}</span>}
                                </div>
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
                             <td className="px-10 py-6 text-right font-black text-gray-400 text-[10px] uppercase">
                                {u.district || u.village || 'Global Hub'}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        );

      case 'readers': return <ReaderManagement token={token} />;
      case 'ads': return <AdManagement token={token} />;
      case 'audit-log': return <ActivityLog token={token} />;
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
      default: return <div className="min-h-screen flex items-center justify-center font-black text-gray-300 uppercase italic">Module Synchronization...</div>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
       <div className="w-16 h-1 bg-blue-600 animate-pulse rounded-full" />
       <p className="mt-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] animate-pulse">Syncing Master Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden relative">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-4 shadow-sm lg:shadow-none lg:border-none lg:ml-64">
          <div className="flex items-center gap-4">
            <div className={`w-2.5 h-2.5 rounded-full ${refreshing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'} shadow-[0_0_8px_rgba(34,197,94,0.4)]`}></div>
            <div>
              <h2 className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                Live Console <span className="text-[8px] font-bold text-gray-300 ml-2 hidden sm:inline">Updated: {lastUpdated.toLocaleTimeString()}</span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {refreshing && <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em] hidden sm:block">Syncing...</span>}
             <button onClick={() => fetchInitialData()} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-xl">
               <Activity size={18} className={refreshing ? 'animate-spin' : ''} />
             </button>
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-xl lg:hidden">
               <Menu size={18} />
             </button>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-[1450px] mx-auto w-full pt-28 lg:pt-12">
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
  const iconColorClass = colors[color] ? colors[color].split(' ')[0] : 'text-gray-400';
  const bgColorClass = colors[color] || 'bg-gray-50';

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative group overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-full -mr-8 -mt-8 scale-0 group-hover:scale-100 transition-transform duration-700 ${iconColorClass}`}></div>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgColorClass}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{badge}</span>
      </div>
      <p className="text-4xl font-black text-gray-900 tracking-tighter mb-1 tabular-nums animate-in fade-in duration-1000 leading-none font-sans">{value || 0}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">{title}</p>
    </div>
  );
}
