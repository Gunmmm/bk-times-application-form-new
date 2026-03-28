import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStats } from '../hooks/useStats';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import ReaderRegistration from '../components/ReaderRegistration';
import NewsRegistration from '../components/NewsRegistration';
import { TrendingUp, PieChart, Zap, Layers, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const { stats, loading, error, refetch } = useStats(token);

  const { readers, ads, news } = stats || {
    readers: { total: 0, today: 0 },
    ads: { total: 0, pending: 0, active: 0, rejected: 0, converted: 0, totalRevenue: 0, payout: 0, gst: 0, yourCommission: 0 },
    news: { total: 0, today: 0 }
  };

  const fetchNews = () => {
    if (!token) return;
    fetch('/api/news', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setNewsList(Array.isArray(data) ? data.slice(0, 8) : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchNews();
  }, [token]);

  // CRITICAL: Prevent blank screen if user is null
  if (!user && token) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 animate-pulse text-lg font-bold tracking-widest uppercase">Syncing Identity...</div>
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 animate-pulse text-lg font-bold tracking-widest uppercase">Loading Dashboard...</div>
      </div>
    );

  const handleCloseModal = () => { setIsModalOpen(false); refetch(); };
  const handleCloseNewsModal = () => { setIsNewsModalOpen(false); fetchNews(); refetch(); };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={true} />

      {/* ── ACTION BAR ── */}
      <div className="px-4 pt-6 pb-2 max-w-5xl mx-auto w-full flex flex-wrap gap-2">
        <button onClick={() => navigate('/book-ad')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition active:scale-95 text-[10px] uppercase tracking-widest">+ Book Ad</button>
        <button onClick={() => setIsNewsModalOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition active:scale-95 text-[10px] uppercase tracking-widest">+ Submit News</button>
        <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-lg transition active:scale-95 text-[10px] uppercase tracking-widest">+ Register Reader</button>
      </div>

      <main className="px-4 pb-12 max-w-5xl mx-auto w-full">
        
        {/* ── ROLE-SPECIFIC GREETING ── */}
        <div className="my-6 px-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase tabular-nums">
            Welcome {user?.role === 'admin' ? 'Master Admin' : 
                     user?.role === 'zone' ? 'Zone Coordinator' :
                     user?.role === 'district' ? 'District Coordinator' :
                     user?.role === 'taluka' ? 'Taluka Coordinator' :
                     user?.role === 'village' ? 'Village Coordinator' : 'Coordinator'}
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
            {user?.village || user?.taluka || user?.district || user?.zone || 'Maharashtra HQ'} • Live Monitoring
          </p>
        </div>

        {/* ── MAIN KPI CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard title="Total Readers" value={readers.total} badge={`+${readers.today} Today`} color="text-blue-600" to="/stats/readers" />
          <StatCard title="Total Ads" value={ads.total} badge="Jurisdiction" color="text-blue-600" to="/stats/ads" />
          <StatCard title="News Stories" value={news.total} badge={`${news.today} Today`} color="text-blue-600" to="/news-stories" />
          <StatCard title="Total Revenue" value={`₹${Math.floor(ads.totalRevenue || 0).toLocaleString()}`} badge="Gross" color="text-blue-600" to="/ads-analytics" />
        </div>

        {/* ── COORDINATOR SPECIAL DESK ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 scroll-mt-20">
           <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-100 flex flex-col justify-between min-h-[240px]">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Meeting</span>
                    <span className="flex h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2 tracking-tight">{user?.role === 'village' ? 'Village' : 'Taluka'} Revenue Collection Strategy</h2>
                  <p className="text-blue-100 text-sm font-medium opacity-90 max-w-md tracking-wide">
                    {user?.village || user?.taluka || user?.district || user?.zone || 'Region'} Jurisdiction Review • Join the live briefing.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <button className="bg-white text-blue-700 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition active:scale-95 shadow-md">Join Video Call</button>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-700 bg-blue-400 flex items-center justify-center text-[10px] font-bold">C{i}</div>)}
                    <div className="w-8 h-8 rounded-full border-2 border-blue-700 bg-blue-500 flex items-center justify-center text-[10px] font-bold">+12</div>
                  </div>
                </div>
           </div>

           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-50 pb-2">Upcoming Programs</h3>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 shadow-inner">
                         <span className="text-[10px] font-black text-blue-600">28</span>
                         <span className="text-[8px] font-bold text-gray-400 uppercase">MAR</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Coordinator Meetup</p>
                        <p className="text-[10px] font-bold text-gray-400">04:00 PM • HQ</p>
                      </div>
                   </div>
                   <div className="flex gap-4 opacity-50">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center">
                         <span className="text-[10px] font-black text-gray-400">02</span>
                         <span className="text-[8px] font-bold text-gray-400 uppercase">APR</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Training Session</p>
                        <p className="text-[10px] font-bold text-gray-400">11:00 AM • Remote</p>
                      </div>
                   </div>
                </div>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           {/* COORDINATOR EARNINGS */}
           <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[160px]">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Net Commissions</h3>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{Math.floor(ads.yourCommission || 0).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-green-500 mt-1 uppercase tracking-widest">+12% increase this week</p>
              </div>
              <div className="pt-4 border-t border-gray-50 mt-4 flex items-center justify-between">
                <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Payout Ready</span>
                <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">REF: MH-C02A</span>
              </div>
           </div>

           {/* ACTIVE AD STATS */}
           <div className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${user?.role === 'admin' ? 'md:col-span-1' : 'md:col-span-2'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Live Ad Management</h3>
                <Layers className="w-4 h-4 text-gray-300" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl text-center border border-transparent">
                  <p className="text-2xl font-black text-gray-800">{ads.pending}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Pending</p>
                </div>
                <div className="p-4 bg-blue-50/50 rounded-xl text-center border border-blue-50">
                  <p className="text-2xl font-black text-blue-600">{ads.active}</p>
                  <p className="text-[9px] font-bold text-blue-400 uppercase mt-1 tracking-widest">Live</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-2xl font-black text-gray-800">{ads.converted}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Success</p>
                </div>
              </div>
           </div>

           {/* ── ADMIN ONLY CONTROLS ── */}
           {user?.role === 'admin' && (
             <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm md:col-span-1">
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Master Controls</h3>
                <div className="space-y-3">
                   <button className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100">Add Admin</button>
                   <button className="w-full py-2 bg-gray-50 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-100">Manage All Users</button>
                </div>
             </div>
           )}
        </div>
      </main>


      {/* Action Modals */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden relative shadow-2xl border border-gray-200">
             <button onClick={handleCloseModal} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600">✕</button>
             <div className="max-h-[85vh] overflow-y-auto">
                <ReaderRegistration onComplete={handleCloseModal} />
             </div>
           </div>
        </div>
      )}

      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
           <div className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden relative shadow-2xl border border-gray-200">
             <button onClick={handleCloseNewsModal} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600">✕</button>
             <div className="max-h-[85vh] overflow-y-auto">
                <NewsRegistration onComplete={handleCloseNewsModal} />
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
