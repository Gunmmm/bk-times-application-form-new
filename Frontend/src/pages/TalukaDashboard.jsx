import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Layers, Users, FileText, CheckCircle, Clock, PlusCircle, Newspaper, Edit3, Edit2, ArrowRight } from 'lucide-react';

export default function TalukaDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    readers: { total: 0, today: 0 },
    ads: { total: 0, pending: 0, active: 0, totalRevenue: 0, yourCommission: 0 },
    notice: "Welcome to your Taluka Coordinator Portal. Data is syncing..."
  });
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [readers, setReaders] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [showReporterModal, setShowReporterModal] = useState(false);
  const [reportersCount, setReportersCount] = useState(0);
  const [reporters, setReporters] = useState([]);
  const [editingReporterId, setEditingReporterId] = useState(null);
  const [reporterForm, setReporterForm] = useState({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: 'none', paymentAmount: 0 });
  const [newsForm, setNewsForm] = useState({ name: '', phone: '', pinCode: '', category: 'Matrimonial', durationDays: 1, content: '', paymentAmount: 500, photo: null });
  const [readerForm, setReaderForm] = useState({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
  const [editingReaderId, setEditingReaderId] = useState(null);
  const [allAdsCount, setAllAdsCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [newsCommission, setNewsCommission] = useState(0);
  const [receiptInfo, setReceiptInfo] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSimpleNewsModal, setShowSimpleNewsModal] = useState(false);
  const [simpleNewsForm, setSimpleNewsForm] = useState({ title: '', content: '', photo: null, photoError: false });
  const [paymentContext, setPaymentContext] = useState(null);
  const [commissionRate, setCommissionRate] = useState(13);

  useEffect(() => {
    if (!token) return;

    fetch('http://localhost:5000/api/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && data.ads) {
          setCommissionRate(data.commissionRate || 13);
          setStats({
            readers: data.readers || { total: 0, today: 0 },
            ads: data.ads || { total: 0, pending: 0, active: 0, totalRevenue: 0, yourCommission: 0 },
            notice: data.notice || "Welcome to your Taluka Coordinator Portal."
          });
        }
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });

    fetch('http://localhost:5000/api/news')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
           setLatestNews(data.slice(0, 5));
           setAllAdsCount(data.length);
           const newsComm = data.reduce((sum, ad) => sum + ((ad.paymentAmount || 500) * (commissionRate / 100)), 0);
           setNewsCommission(newsComm);
        }
      })
      .catch(e => console.error('Failed news:', e));

    fetch('http://localhost:5000/api/readers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
           setReaders(data);
           const comm = data.reduce((sum, r) => sum + ((r.paymentAmount || 0) * (commissionRate / 100)), 0);
           setTotalCommission(comm);
        }
      })
      .catch(e => console.error('Failed readers:', e));

    fetch('http://localhost:5000/api/reporters', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
           const mapped = data.map(item => ({
             ...item.personal,
             name: item.personal.fullName,
             mobile: item.personal.phone,
             address: item.personal.street,
             applying_for: item.personal.plan,
             _id: item._id
           }));
           setReporters(mapped);
           setReportersCount(mapped.length);
        }
      })
      .catch(e => console.error('Failed reporters:', e));
  }, [token, commissionRate]);

  if (!user && token) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-navy animate-pulse">Syncing Session...</div>;
  }
  
  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-navy animate-pulse">Loading Taluka Dashboard Data...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={true} />
      
      <main className="flex-1 px-4 py-8 max-w-[1400px] mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Taluka Dashboard</h1>
        </div>

        {/* Global Notice */}
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-blue-900 relative overflow-hidden">
          <Layers className="absolute top-0 right-0 w-32 h-32 text-blue-500 opacity-10 -mr-6 -mt-6" />
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-steppergold uppercase tracking-[0.2em] mb-2">System Notice</h3>
            <p className="text-white font-medium text-sm leading-relaxed">{stats.notice}</p>
          </div>
        </div>        {/* Basic Stats Grid */}        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex flex-col hover:border-blue-500 transition-all cursor-default">
             <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-navy uppercase tracking-widest leading-relaxed">VILLAGE SUBSCRIBERS</h4>
                 <Users className="text-blue-500 w-4 h-4 shrink-0" />
             </div>
             <p className="text-2xl font-black text-gray-900 tracking-tighter">{reporters.length}</p>
             <p className="text-[8px] font-bold text-blue-400 uppercase mt-auto pt-2 leading-none">Local Area Leaders</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors cursor-default">
             <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-navy uppercase tracking-widest leading-relaxed">TALUKA SUBSCRIBERS</h4>
                 <Users className="text-blue-200 w-4 h-4 shrink-0" />
             </div>
             <p className="text-2xl font-black text-gray-900 tracking-tighter">{readers.length}</p>
             <p className="text-[8px] font-bold text-green-600 uppercase mt-auto pt-2">+{readers.filter(r => new Date(r.createdAt || Date.now()).toDateString() === new Date().toDateString()).length} Today</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-colors cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-steppergold/5 rounded-bl-[100%]"></div>
              <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] font-black text-navy uppercase tracking-widest leading-tight">SUBSCRIBER REVENUE</h4>
                 <span className="text-steppergold font-black text-sm">₹</span>
              </div>
              <p className="text-2xl font-black text-steppergold tracking-tighter">₹{totalCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[8px] font-bold text-navy uppercase tracking-widest mt-auto pt-2 leading-none">SUBSCRIBER INCOME</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-colors cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-steppergold/5 rounded-bl-[100%]"></div>
              <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] font-black text-navy uppercase tracking-widest leading-tight">ADVT REVENUE</h4>
                 <Clock className="text-steppergold w-4 h-4 shrink-0" />
              </div>
              <p className="text-2xl font-black text-steppergold tracking-tighter">₹{newsCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[8px] font-bold text-navy uppercase tracking-widest mt-auto pt-2 leading-none">ADVT INCOME</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors cursor-default relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">TOTAL ADVT</h4>
                 <FileText className="text-orange-500 w-4 h-4 shrink-0" />
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tighter">{allAdsCount}</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase mt-auto pt-2">ALL TIME</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors cursor-default relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ACTIVE ADVT</h4>
                 <CheckCircle className="text-green-500 w-4 h-4 shrink-0" />
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tighter">{stats.ads.active}</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase mt-auto pt-2 leading-none">LIVE NOW</p>
          </div>
        </div>

        {/* Dashboard Actions & News Setup */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          
          {/* Action Center */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-2 px-1">Taluka Actions</h3>
            
            <button 
              onClick={() => setShowReaderModal(true)}
              className="w-full p-5 bg-steppergold/10 hover:bg-steppergold/20 border-2 border-steppergold rounded-2xl flex items-center justify-between transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <PlusCircle className="text-steppergold w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] md:text-xs font-black text-navy uppercase">REGISTER NEW SUBSCRIBER</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase mt-0.5">Direct Reader Entry</p>
                </div>
              </div>
              <ArrowRight className="text-steppergold group-hover:translate-x-1 transition-transform" size={18} />
            </button>

            <button 
              onClick={() => setShowReporterModal(true)}
              className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-600 rounded-2xl flex items-center justify-between transition-all group active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Users className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] md:text-xs font-black text-blue-900 uppercase">REGISTER TALUKA REPOTER</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-blue-400 uppercase mt-0.5">New Coordinator Account</p>
                </div>
              </div>
              <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" size={18} />
            </button>

            <button 
              onClick={() => setShowNewsModal(true)}
              className="w-full p-5 bg-navy hover:bg-black border-2 border-navy hover:border-black rounded-2xl flex items-center justify-between transition-all shadow-lg group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 md:p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <Edit3 className="text-white w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] md:text-xs font-black text-white uppercase">BOOK ADVT</p>
                   <p className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase mt-0.5">Submit advert</p>
                </div>
              </div>
              <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={18} />
            </button>

            <button 
              onClick={() => setShowSimpleNewsModal(true)}
              className="w-full p-5 bg-navy/5 hover:bg-navy hover:text-white border-2 border-navy rounded-2xl flex items-center justify-between transition-all group active:scale-95 shadow-sm mt-2"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                   <Newspaper className="text-navy w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                   <p className="text-[10px] md:text-xs font-black text-navy group-hover:text-white uppercase transition-colors">NEWS</p>
                   <p className="text-[8px] md:text-[9px] font-bold text-gray-400 group-hover:text-blue-100 uppercase mt-0.5 transition-colors">SUBMIT NEWS PORTAL</p>
                </div>
              </div>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </div>

          {/* Latest News Feed */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
              <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-[10px] md:text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2">
                  <Newspaper className="text-blue-500" size={16} /> Latest Portal NEWS
                </h3>
                <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">Live Updates</span>
              </div>
              
              <div className="p-0 flex-1 overflow-y-auto max-h-[250px] md:max-h-[300px]">
                {latestNews.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No recent advt available.</div>
                ) : (
                  latestNews.map((news, idx) => (
                    <div key={idx} className="p-4 md:p-5 border-b border-gray-50 hover:bg-blue-50/30 transition-colors group cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 sm:mb-2 gap-1 sm:gap-4">
                        <h4 className="text-xs md:text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{news.title || 'Advert Banner'}</h4>
                        <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">{new Date(news.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-600 line-clamp-2 leading-relaxed">{news.content || news.description || 'View advt payload...'}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Area Management Directories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Village Leader Directory */}
          <div className="bg-white rounded-[2rem] shadow-md border border-blue-100 overflow-hidden flex flex-col h-64 lg:h-[450px]">
            <div className="p-4 md:p-6 border-b border-blue-50 flex items-center justify-between bg-blue-50/30">
              <h3 className="text-[10px] md:text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-3">
                <Users className="text-blue-600" size={18} /> Reporter Directory
              </h3>
              <span className="text-[8px] md:text-[10px] font-black text-blue-400 uppercase bg-white px-3 py-1.5 rounded-full shadow-sm border border-blue-50">Local Coordinators</span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto">
              {reporters.length === 0 ? (
                <div className="p-12 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px] italic flex flex-col items-center gap-3">
                   <Users size={32} opacity={0.2} />
                   No Village Leaders registered yet.
                </div>
              ) : (
                reporters.map((rep, idx) => (
                  <div key={idx} className="p-5 border-b border-gray-50 flex justify-between items-center hover:bg-blue-50/20 transition-all group">
                    <div>
                      <h4 className="text-sm font-black text-blue-900 tracking-tight">{rep.name}</h4>
                      <p className="text-[10px] text-gray-400 uppercase font-bold mt-1.5 flex items-center gap-2">
                         <span className="text-blue-400">📞 {rep.mobile}</span>
                         <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                         <span className="text-gray-400 flex items-center gap-1 leading-none">📍 {rep.village}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={() => {
                           setEditingReporterId(rep.id || idx);
                           setReporterForm(rep);
                           setShowReporterModal(true);
                         }}
                         className="p-2 text-blue-500 hover:text-white hover:bg-blue-600 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                         title="Edit Reporter Details"
                       >
                         <Edit3 size={16} />
                       </button>
                       <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subscriber Directory Feed */}
          <div className="bg-white rounded-[2rem] shadow-md border border-gray-100 overflow-hidden flex flex-col h-64 lg:h-[450px]">
            <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-[10px] md:text-xs font-black text-navy uppercase tracking-widest flex items-center gap-3">
                <Users className="text-green-500" size={18} /> Subscriber Directory
              </h3>
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">Direct Subscribers</span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto">
              {readers.length === 0 ? (
                <div className="p-12 text-center text-gray-300 font-bold uppercase tracking-widest text-[10px] italic flex flex-col items-center gap-3">
                   <Users size={32} opacity={0.2} />
                   No subscribers registered yet.
                </div>
              ) : (
                readers.map((reader, idx) => (
                  <div key={idx} className="p-5 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50/50 transition-all group">
                    <div>
                      <h4 className="text-sm font-black text-gray-900 tracking-tight">{reader.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-1.5 leading-none">📞 {reader.mobile}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                         onClick={() => {
                           setEditingReaderId(reader._id);
                           setReaderForm(reader);
                           setShowReaderModal(true);
                         }}
                         className="p-2 text-blue-400 hover:text-white hover:bg-blue-600 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                         title="Edit Reader"
                       >
                         <Edit2 size={16} />
                       </button>
                       <span className="text-[9px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Subscriber</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Register / Edit Reader Modal */}
      {showReaderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-6 md:p-8 bg-steppergold text-navy flex justify-between items-center relative gap-4">
              <div className="flex-1">
                 <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight line-clamp-1">{editingReaderId ? 'Update Subscriber' : 'REGISTER NEW SUBSCRIBER'}</h2>
                 <p className="text-[8px] md:text-[10px] text-navy/80 font-black uppercase tracking-widest mt-1">Taluka Coordinator Portal</p>
              </div>
              <button 
                onClick={() => {
                  setShowReaderModal(false);
                  setEditingReaderId(null);
                  setReaderForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
                }} 
                className="w-8 h-8 md:w-10 md:h-10 bg-navy/10 hover:bg-navy/20 rounded-full flex shrink-0 items-center justify-center transition-colors">
                <span className="font-bold text-navy text-sm md:text-base">✕</span>
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50">
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Reader Name</label>
                  <input type="text" value={readerForm.name} onChange={e => setReaderForm({...readerForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner" placeholder="Enter full name..." />
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Mobile Number</label>
                  <input type="tel" value={readerForm.mobile} onChange={e => {
                     const val = e.target.value.replace(/\D/g, '');
                     if (val.length <= 10) setReaderForm({...readerForm, mobile: val});
                  }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner" placeholder="10-digit mobile..." />
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Gender</label>
                  <select value={readerForm.gender} onChange={e => setReaderForm({...readerForm, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Education</label>
                  <select value={readerForm.education} onChange={e => setReaderForm({...readerForm, education: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner">
                    <option value="">Select Degree</option>
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                    <option value="ITI">ITI</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="POSTgraduate">POSTgraduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Advcate">Advcate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Full Address (Home No, Flat, Street)</label>
                  <textarea rows="2" value={readerForm.address} onChange={e => setReaderForm({...readerForm, address: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner resize-none" placeholder="Enter full address..." />
                </div>
                
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">District</label>
                   <select value={readerForm.district} onChange={e=>setReaderForm({...readerForm, district:e.target.value, taluka:'', village:''})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs">
                     <option value="">Select District</option>
                     {["Nashik", "Dhule", "Nandurbar", "Jalgaon", "Ahilyanagar", "Pune", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg", "Mumbai City", "Mumbai Suburban", "Chhatrapati Sambhajinagar", "Jalna", "Beed", "Latur", "Dharashiv", "Nanded", "Parbhani", "Hingoli", "Amravati", "Buldhana", "Akola", "Washim", "Yavatmal", "Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli", "Satara", "Sangli", "Solapur", "Kolhapur"].map(d=><option key={d} value={d}>{d}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Taluka</label>
                   <select value={readerForm.taluka} disabled={!readerForm.district} onChange={e=>setReaderForm({...readerForm, taluka:e.target.value, village:''})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs disabled:bg-gray-100">
                     <option value="">Select Taluka</option>
                     {( { Nashik:["Nashik","Sinnar","Igatpuri","Niphad","Nandgaon","Yeola","Kalwan","Baglan (Satana)","Surgana","Peint","Trimbakeshwar","Deola","Malegaon","Dindori","Chandwad"], Beed:["Beed","Ashti","Patoda","Shirur Kasar","Gevrai","Majalgaon","Kaij","Ambajogai","Parli","Wadwani","Dharur"] }[readerForm.district] || []).map(t=><option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Village</label>
                   <select value={readerForm.village} disabled={!readerForm.taluka} onChange={e=>setReaderForm({...readerForm, village:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs disabled:bg-gray-100">
                     <option value="">Select Village</option>
                     {( { Sinnar:["Adwadi","Agas Khind","Ashapur","Atkawade","Aundhewadi","Baragaon Pimpri","Belu"], Patoda:["Amalner","Ambewadi","Anpatwadi","Antapur","Bedarwadi","Bedukwadi"], Ashti:["Morala","Dadegaon","Sangvi Ashti","Deulgaon Ghat"] }[readerForm.taluka] || []).map(v=><option key={v} value={v}>{v}</option>)}
                     <option value="Other">Other...</option>
                   </select>
                </div>
                <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">PIN Code (6 Digits)</label>
                  <input type="text" value={readerForm.pinCode} 
                    onChange={e => {
                       const val = e.target.value.replace(/\D/g, '');
                       if (val.length <= 6) setReaderForm({...readerForm, pinCode: val});
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner" placeholder="6-digit PIN..." />
                </div>
              </div>

              {/* Subscription Options */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <label className="block text-[10px] md:text-sm font-black text-navy uppercase tracking-widest mb-3">Subscription Plan</label>
                <div className="flex flex-col gap-2">
                   <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan === '1_year' ? 'border-steppergold bg-steppergold/10' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                         <input type="radio" name="sub_plan_t" className="w-4 h-4 text-steppergold border-gray-300 focus:ring-steppergold" 
                           checked={readerForm.subscriptionPlan === '1_year'} 
                           onChange={() => setReaderForm({...readerForm, subscriptionPlan: '1_year', paymentAmount: 1000})} />
                         <span className="font-bold text-xs md:text-sm text-navy uppercase">1 Year Subscription</span>
                      </div>
                      <span className="font-black text-sm md:text-base text-navy">₹1,000</span>
                   </label>
                   <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan === '2_year' ? 'border-steppergold bg-steppergold/10' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                         <input type="radio" name="sub_plan_t" className="w-4 h-4 text-steppergold border-gray-300 focus:ring-steppergold" 
                           checked={readerForm.subscriptionPlan === '2_year'} 
                           onChange={() => setReaderForm({...readerForm, subscriptionPlan: '2_year', paymentAmount: 1800})} />
                         <span className="font-bold text-xs md:text-sm text-navy uppercase">2 Year Subscription</span>
                      </div>
                      <span className="font-black text-sm md:text-base text-navy">₹1,800</span>
                   </label>
                   <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan === '3_year' ? 'border-steppergold bg-steppergold/10' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                         <input type="radio" name="sub_plan_t" className="w-4 h-4 text-steppergold border-gray-300 focus:ring-steppergold" 
                           checked={readerForm.subscriptionPlan === '3_year'} 
                           onChange={() => setReaderForm({...readerForm, subscriptionPlan: '3_year', paymentAmount: 2600})} />
                         <span className="font-bold text-xs md:text-sm text-navy uppercase">3 Year Subscription</span>
                      </div>
                      <span className="font-black text-sm md:text-base text-navy">₹2,600</span>
                   </label>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="w-full flex items-center justify-between bg-navy text-white p-4 rounded-xl mt-2 shadow-inner">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-steppergold">Total Payment Due</span>
                <span className="text-xl md:text-2xl font-black">₹{readerForm.paymentAmount.toLocaleString()}</span>
              </div>

              <button 
                onClick={async () => {
                  if (!readerForm.name || !readerForm.mobile || !readerForm.district || !readerForm.address) {
                     alert("⚠️ Please fill in all the required details (Name, Mobile, Address, District) before proceeding to payment.");
                     return;
                  }
                  if (!editingReaderId) {
                     setPaymentContext('reader');
                     setShowPaymentOptions(true);
                     return;
                  }
                  const url = `http://localhost:5000/api/readers/${editingReaderId}`;
                  fetch(url, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(readerForm)
                  })
                  .then(r => r.json())
                  .then(data => {
                    if (data.reader) {
                       setReaders(readers.map(r => r._id === editingReaderId ? data.reader : r));
                    }
                    setShowReaderModal(false);
                    setEditingReaderId(null);
                    setReaderForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
                  })
                  .catch(() => {
                    alert('Submission saved (Offline/Demo Mode).');
                    setShowReaderModal(false);
                    setEditingReaderId(null);
                  });
                }}
                className="w-full h-10 md:h-12 bg-navy text-steppergold rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-black transition-all shadow-lg active:scale-95 mt-2 md:mt-4"
              >
                {editingReaderId ? 'Update Registration' : 'PROCEED TO PAYMENT →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Payment Options Overlay */}
      {showPaymentOptions && (<div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative">
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 flex flex-col items-center">
                 <button onClick={() => { setShowPaymentOptions(false); setPaymentContext(null); }} className="absolute top-4 right-4 text-white hover:text-blue-200">✕</button>
                 <span className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Razorpay Secured Checkout</span>
                 <span className="text-white text-3xl font-black">₹{(paymentContext === 'news' ? newsForm.paymentAmount : readerForm.paymentAmount).toLocaleString()}</span>
              </div>
              
              <div className="p-6">
                 {isProcessingPayment ? (
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                       <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">Processing Payment...</p>
                    </div>
                 ) : (
                    <div className="flex flex-col gap-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Select Payment Method</p>
                       
                       {['UPI / PayTM', 'Debit / Credit Card', 'Net Banking', 'Google Pay / PhonePe'].map((method, i) => (
                           <button 
                             key={i}
                             onClick={async () => {
                                setIsProcessingPayment(true);
                                await new Promise(res => setTimeout(res, 1500));
                                
                                try {
                                   if (paymentContext === 'reader') {
                                      const res = await fetch('http://localhost:5000/api/readers', {
                                         method: 'POST',
                                         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                         body: JSON.stringify(readerForm)
                                      });
                                      const data = await res.json();
                                      if (data.reader) {
                                         setReaders([data.reader, ...readers]);
                                         setTotalCommission(prev => prev + ((data.reader.paymentAmount || 0) * 0.18));
                                         setReceiptInfo({
                                            name: data.reader.name,
                                            plan: data.reader.subscriptionPlan,
                                            amount: data.reader.paymentAmount,
                                            commission: (data.reader.paymentAmount || 0) * 0.18,
                                            transactionId: `TXN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                                         });
                                      }
                                      setReaderForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
                                      setShowReaderModal(false);
                                   } else if (paymentContext === 'news') {
                                      const finalCat = newsForm.category === 'Other' ? (newsForm.customCategory || 'Other Announcements') : newsForm.category;
                                      const payload = {...newsForm, category: finalCat, title: `${finalCat} Ad from ${newsForm.name}`};
                                      
                                      await fetch('http://localhost:5000/api/news', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify(payload)
                                      });
                                      
                                      setLatestNews([{...payload, date: new Date().toISOString(), status: 'Pending Approval'}, ...latestNews].slice(0,5));
                                      setNewsCommission(prev => prev + (newsForm.paymentAmount * 0.18));
                                      setAllAdsCount(prev => prev + 1);
                                      setReceiptInfo({
                                         name: newsForm.name,
                                         plan: `${newsForm.durationDays} Day Ad (${finalCat})`,
                                         amount: newsForm.paymentAmount,
                                         commission: newsForm.paymentAmount * 0.18,
                                         transactionId: `AD_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                                      });
                                      setNewsForm({ name: '', phone: '', pinCode: '', category: 'Matrimonial', durationDays: 1, content: '', paymentAmount: 500, photo: null, customCategory: '' });
                                      setShowNewsModal(false);
                                   }
                                   
                                   setShowPaymentOptions(false);
                                   setIsProcessingPayment(false);
                                   setPaymentContext(null);
                                } catch (e) {
                                   alert("Payment verification failed. Please check backend connection.");
                                   setIsProcessingPayment(false);
                                }
                             }}
                             className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                           >
                            <span className="font-bold text-sm text-navy">{method}</span>
                            <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                           </button>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {receiptInfo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 p-6 flex flex-col items-center">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
               <CheckCircle className="text-green-500 w-8 h-8" />
             </div>
             <h2 className="text-xl font-black text-navy uppercase text-center mb-1">Payment Successful</h2>
             <p className="text-xs text-gray-500 font-bold uppercase text-center mb-6">{receiptInfo.transactionId}</p>

             <div className="w-full space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase">{receiptInfo.transactionId.startsWith('AD_') ? 'Advertiser Name' : 'Reader Name'}</span>
                  <span className="font-black text-gray-800">{receiptInfo.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase">{receiptInfo.transactionId.startsWith('AD_') ? 'Ad Package' : 'Subscription'}</span>
                  <span className="font-black text-gray-800">{receiptInfo.plan.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-400 uppercase">Total Paid</span>
                  <span className="font-black text-navy text-sm">₹{receiptInfo.amount.toLocaleString()}</span>
                </div>
             </div>

             <div className="w-full bg-steppergold/10 border-2 border-steppergold p-4 rounded-xl flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-navy uppercase tracking-widest">Your 18% Commission</span>
                <span className="text-xl font-black text-steppergold">₹{receiptInfo.commission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
             </div>

             <button 
                onClick={() => setReceiptInfo(null)}
                className="w-full h-12 bg-navy text-steppergold rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg active:scale-95"
             >
                Close Receipt
             </button>
          </div>
        </div>
      )}

      {/* ADVT Booking Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-6 md:p-8 bg-navy text-white flex justify-between items-center relative gap-4">
              <div className="flex-1">
                 <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight line-clamp-1">BOOK ADVT</h2>
                 <p className="text-[8px] md:text-[10px] text-steppergold font-black uppercase tracking-widest mt-1">Taluka Coordinator Portal</p>
              </div>
              <button 
                onClick={() => {
                   setShowNewsModal(false);
                   setNewsForm({ name: '', phone: '', pinCode: '', category: 'Matrimonial', durationDays: 1, content: '', paymentAmount: 500, photo: null, customCategory: '' });
                }} 
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex shrink-0 items-center justify-center transition-colors">
                <span className="font-bold text-sm md:text-base">✕</span>
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50">
              
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Advertiser Name</label>
                   <input type="text" value={newsForm.name} onChange={e => setNewsForm({...newsForm, name: e.target.value})}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 font-bold text-xs shadow-inner" placeholder="Full name..." />
                 </div>
                 <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Phone Number (10 Digits)</label>
                   <input type="tel" value={newsForm.phone} 
                     onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) setNewsForm({...newsForm, phone: val});
                     }}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 font-bold text-xs shadow-inner" placeholder="10-digit mobile..." />
                 </div>
                 <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">PIN Code (6 Digits)</label>
                   <input type="text" value={newsForm.pinCode} 
                     onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 6) setNewsForm({...newsForm, pinCode: val});
                     }}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 font-bold text-xs shadow-inner" placeholder="6-digit PIN..." />
                 </div>
                 <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Ad Category</label>
                   <select value={newsForm.category} onChange={e => setNewsForm({...newsForm, category: e.target.value})}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 font-bold text-xs shadow-inner">
                      <option value="Matrimonial">Matrimonial</option>
                      <option value="Recruitment">Recruitment</option>
                      <option value="Property Sale">Property Sale</option>
                      <option value="Property Rent">Property Rent</option>
                      <option value="Name Change">Name Change</option>
                      <option value="Lost & Found">Lost & Found</option>
                      <option value="Vehicle Sale">Vehicle Sale</option>
                      <option value="Services">Services / Business</option>
                      <option value="Other">Other Announcements</option>
                   </select>
                 </div>
                 
                 {newsForm.category === 'Other' && (
                    <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-[9px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Please Specify Your Custom Category</label>
                      <input type="text" value={newsForm.customCategory || ''} onChange={e => setNewsForm({...newsForm, customCategory: e.target.value})}
                        className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold text-xs shadow-inner" placeholder="E.g. Festival Greeting, Political, General Event..." />
                    </div>
                 )}
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest">Ad / News Content</label>
                  <span className={`text-[9px] font-black uppercase ${newsForm.content.length > 1900 ? 'text-red-500' : 'text-gray-400'}`}>{newsForm.content.length} / 2000</span>
                </div>
                <textarea 
                  maxLength={2000}
                  value={newsForm.content}
                  onChange={e => setNewsForm({...newsForm, content: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 font-bold text-xs md:text-sm shadow-inner resize-none"
                  placeholder="Type the full ad or news content here..."
                />
              </div>

              <div>
                 <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Attach Photo (Max 5MB)</label>
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                     <div className="relative flex-1">
                       <input type="file" id="news-photo-taluka" accept="image/*"
                           onChange={e => {
                             const file = e.target.files[0];
                             if(file && file.size > 5 * 1024 * 1024) {
                               e.target.value = null;
                               setNewsForm({...newsForm, photo: null, photoError: true, photoErrorMessage: '⚠️ Photo size MUST be less than 5MB.'});
                               return;
                             }
                             setNewsForm({...newsForm, photo: file, photoError: false});
                           }}
                           className="hidden" />
                       <label htmlFor="news-photo-taluka" className="w-full h-10 bg-navy text-steppergold rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-black transition-all">
                         <span>{newsForm.photo ? 'Change Photo' : 'Choose File'}</span>
                       </label>
                     </div>
                      {newsForm.photo && !newsForm.photoError && <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full animate-in zoom-in duration-300"><span className="font-black">✓</span></div>}
                      {newsForm.photoError && <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full"><span className="font-black">✕</span></div>}
                   </div>
                   
                   {newsForm.photoError && <p className="text-[10px] font-black text-red-500 uppercase mt-1">{newsForm.photoErrorMessage || '⚠️ Please select a smaller photo.'}</p>}

                   {newsForm.photo && (
                     <div className="p-2 bg-white rounded-xl border border-gray-200 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                       <img src={URL.createObjectURL(newsForm.photo)} className="w-full h-32 object-contain rounded-lg bg-gray-50" alt="Preview"/>
                       <p className="text-[9px] font-black text-navy uppercase truncate px-1">✅ {newsForm.photo.name}</p>
                     </div>
                   )}
                 </div>
              </div>

              <div className="pt-2 border-t border-gray-100 mt-2">
                <label className="block text-[10px] md:text-sm font-black text-navy uppercase tracking-widest mb-3">Booking Duration / Plan</label>
                <div className="flex flex-col gap-2">
                   {[
                     {days: 1, label: '1 Day', price: 500},
                     {days: 2, label: '2 Days', price: 1000},
                     {days: 5, label: '5 Days', price: 2500}
                   ].map(p => (
                      <label key={p.days} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${newsForm.durationDays == p.days ? 'border-navy bg-navy/5' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                         <div className="flex items-center gap-3">
                            <input type="radio" name="advt_plan" className="w-4 h-4 text-navy border-gray-300 focus:ring-navy" 
                              checked={newsForm.durationDays == p.days} 
                              onChange={() => setNewsForm({...newsForm, durationDays: p.days, paymentAmount: p.price})} />
                            <span className="font-bold text-xs md:text-sm text-navy uppercase">{p.label} ADVT SPACE</span>
                         </div>
                         <span className="font-black text-sm md:text-base text-navy">₹{p.price.toLocaleString()}</span>
                      </label>
                   ))}
                </div>
              </div>

              <div className="w-full flex items-center justify-between bg-navy text-white p-4 rounded-xl mt-2 shadow-inner">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-steppergold">Total Ad Payment</span>
                <span className="text-xl md:text-2xl font-black">₹{(newsForm.paymentAmount || 0).toLocaleString()}</span>
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <button 
                  onClick={async () => {
                    if (!newsForm.name || !newsForm.phone || !newsForm.content) {
                       alert("⚠️ Advertiser Name, Phone and Content are required before payment.");
                       return;
                    }
                    setPaymentContext('news');
                    setShowPaymentOptions(true);
                  }}
                  className="w-full h-12 bg-navy text-steppergold rounded-xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  PROCEED TO PAYMENT →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Submission Modal (no payment) */}
      {showSimpleNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-6 md:p-8 bg-navy text-white flex justify-between items-center gap-4 text-left">
              <div className="flex-1 text-left">
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-left">Submit News</h2>
                <p className="text-[8px] md:text-[10px] text-blue-200 font-black uppercase tracking-widest mt-1 text-left">Taluka Coordinator Portal</p>
              </div>
              <button onClick={()=>{setShowSimpleNewsModal(false);setSimpleNewsForm({title:'',content:'',photo:null,photoError:false});}} className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex shrink-0 items-center justify-center transition-colors">
                <span className="font-bold text-white text-sm md:text-base">✕</span>
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50 text-left">
              <div className="text-left">
                <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">News Title</label>
                <input type="text" value={simpleNewsForm.title} onChange={e=>setSimpleNewsForm({...simpleNewsForm,title:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs shadow-inner" placeholder="Enter news headline..."/>
              </div>
              <div className="text-left">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest text-left">News Content</label>
                  <div className={`px-2 py-0.5 rounded-md text-[8px] font-black border ${simpleNewsForm.content.length > 1900 ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-white text-gray-400'}`}>{simpleNewsForm.content.length} / 2000</div>
                </div>
                <textarea maxLength={2000} value={simpleNewsForm.content} onChange={e=>setSimpleNewsForm({...simpleNewsForm,content:e.target.value})} rows={5} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs resize-none shadow-inner" placeholder="Type the full news content here..."/>
              </div>
              <div className="text-left">
                <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Attach Photo (Max 5MB)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input type="file" id="news-photo-simple-taluka" accept="image/*" onChange={e=>{
                      const file = e.target.files[0];
                      if(file && file.size > 5 * 1024 * 1024) {
                        e.target.value = '';
                        setSimpleNewsForm({...simpleNewsForm, photo: null, photoError: true, photoErrorMessage: '⚠️ Photo size MUST be less than 5MB.'});
                        return;
                      }
                      setSimpleNewsForm({...simpleNewsForm, photo: file, photoError: false});
                    }} className="hidden"/>
                    <label htmlFor="news-photo-simple-taluka" className="flex items-center justify-center gap-2 w-full h-12 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-navy hover:bg-navy/5 transition-all">
                      <span className="text-[10px] font-black text-navy uppercase">{simpleNewsForm.photo ? 'Change Photo' : 'Choose File'}</span>
                    </label>
                  </div>
                  {simpleNewsForm.photo && !simpleNewsForm.photoError && <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-navy rounded-full animate-in zoom-in duration-300"><span className="font-black">✓</span></div>}
                  {simpleNewsForm.photoError && <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full"><span className="font-black">✕</span></div>}
                </div>
                {simpleNewsForm.photoError && <p className="text-[10px] font-black text-red-500 uppercase mt-2">{simpleNewsForm.photoErrorMessage || '⚠️ Please select a smaller photo.'}</p>}
                {simpleNewsForm.photo && !simpleNewsForm.photoError && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-gray-200 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-300">
                    <img src={URL.createObjectURL(simpleNewsForm.photo)} className="w-full h-32 object-contain rounded-lg bg-gray-50" alt="Preview"/>
                    <span className="text-[9px] font-black text-navy uppercase truncate px-1">✅ {simpleNewsForm.photo.name}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={async()=>{
                  if(!simpleNewsForm.title||!simpleNewsForm.content){alert('⚠️ Title and Content are required.');return;}
                  try {
                    const res = await fetch('http://localhost:5000/api/news', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ name: user?.fullName || 'Taluka Coordinator', title: simpleNewsForm.title, content: simpleNewsForm.content, category: 'News', paymentAmount: 0, village: user?.village, taluka: user?.taluka, district: user?.district })
                    });
                    const data = await res.json();
                    if(data.success || data._id) {
                       alert('✅ News persistence successful! Submitted to central database.');
                       setShowSimpleNewsModal(false);
                       setSimpleNewsForm({title:'',content:'',photo:null,photoError:false});
                    }
                  } catch(e) {
                    alert('Sync failure: Could not reach central news database.');
                  }
                }} 
                className="w-full h-14 bg-navy text-white rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-black transition-all shadow-xl active:scale-[0.98] mt-2"
              >
                PUBLISH NEWS PORTAL →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Village Leader Registration Modal (Identical to Subscriber Form) */}
      {showReporterModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-6 md:p-8 bg-blue-600 text-white flex justify-between items-center relative gap-4 text-left">
              <div className="flex-1 text-left">
                 <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight line-clamp-1">{editingReporterId ? 'Update Village Leader' : 'REGISTER TALUKA REPOTER'}</h2>
                 <p className="text-[8px] md:text-[10px] text-white/80 font-black uppercase tracking-widest mt-1 text-left uppercase">{editingReporterId ? 'Modify Coordinator Details' : 'Taluka Coordinator Portal'}</p>
              </div>
              <button 
                onClick={() => { setShowReporterModal(false); setEditingReporterId(null); setReporterForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: 'none', paymentAmount: 0 }); }} 
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex shrink-0 items-center justify-center transition-colors">
                <span className="font-bold text-white text-sm md:text-base">✕</span>
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50 text-left">
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4 text-left">
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Reporter Name</label>
                  <input type="text" value={reporterForm.name} onChange={e => setReporterForm({...reporterForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-bold text-xs shadow-inner" placeholder="Enter full name..." />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Mobile Number</label>
                  <input type="tel" value={reporterForm.mobile} onChange={e => {
                     const val = e.target.value.replace(/\D/g, '');
                     if (val.length <= 10) setReporterForm({...reporterForm, mobile: val});
                  }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-bold text-xs shadow-inner" placeholder="10-digit mobile..." />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Gender</label>
                  <select value={reporterForm.gender} onChange={e => setReporterForm({...reporterForm, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-bold text-xs shadow-inner text-left">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Education</label>
                  <select value={reporterForm.education} onChange={e => setReporterForm({...reporterForm, education: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-bold text-xs shadow-inner text-left">
                    <option value="">Select Degree</option>
                    <option value="SSC">SSC</option>
                    <option value="HSC">HSC</option>
                    <option value="ITI">ITI</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="POSTgraduate">POSTgraduate</option>
                    <option value="Doctorate">Doctorate</option>
                    <option value="Advcate">Advcate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2 text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Full Address (Home No, Flat, Street)</label>
                  <textarea rows="2" value={reporterForm.address} onChange={e => setReporterForm({...reporterForm, address: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-bold text-xs shadow-inner resize-none text-left" placeholder="Enter full address..." />
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">District</label>
                   <select value={reporterForm.district} onChange={e=>setReporterForm({...reporterForm, district:e.target.value, taluka:'', village:''})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs">
                     <option value="">Select District</option>
                     {["Nashik", "Dhule", "Nandurbar", "Jalgaon", "Ahilyanagar", "Pune", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg", "Mumbai City", "Mumbai Suburban", "Chhatrapati Sambhajinagar", "Jalna", "Beed", "Latur", "Dharashiv", "Nanded", "Parbhani", "Hingoli", "Amravati", "Buldhana", "Akola", "Washim", "Yavatmal", "Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli", "Satara", "Sangli", "Solapur", "Kolhapur"].map(d=><option key={d} value={d}>{d}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Taluka</label>
                   <select value={reporterForm.taluka} disabled={!reporterForm.district} onChange={e=>setReporterForm({...reporterForm, taluka:e.target.value, village:''})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs disabled:bg-gray-100">
                     <option value="">Select Taluka</option>
                     {( { Nashik:["Nashik","Sinnar","Igatpuri","Niphad","Nandgaon","Yeola","Kalwan","Baglan (Satana)","Surgana","Peint","Trimbakeshwar","Deola","Malegaon","Dindori","Chandwad"], Beed:["Beed","Ashti","Patoda","Shirur Kasar","Gevrai","Majalgaon","Kaij","Ambajogai","Parli","Wadwani","Dharur"] }[reporterForm.district] || []).map(t=><option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Village</label>
                   <select value={reporterForm.village} disabled={!reporterForm.taluka} onChange={e=>setReporterForm({...reporterForm, village:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs disabled:bg-gray-100">
                     <option value="">Select Village</option>
                     {( { Sinnar:["Adwadi","Agas Khind","Ashapur","Atkawade","Aundhewadi","Baragaon Pimpri","Belu"], Patoda:["Amalner","Ambewadi","Anpatwadi","Antapur","Bedarwadi","Bedukwadi"], Ashti:["Morala","Dadegaon","Sangvi Ashti","Deulgaon Ghat"] }[reporterForm.taluka] || []).map(v=><option key={v} value={v}>{v}</option>)}
                     <option value="Other">Other...</option>
                   </select>
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">PIN Code (6 Digits)</label>
                  <input type="text" value={reporterForm.pinCode} 
                    onChange={e => {
                       const val = e.target.value.replace(/\D/g, '');
                       if (val.length <= 6) setReporterForm({...reporterForm, pinCode: val});
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 font-bold text-xs shadow-inner text-left" placeholder="6-digit PIN..." />
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!reporterForm.name || !reporterForm.mobile || !reporterForm.district || !reporterForm.address) {
                     alert("⚠️ Please fill in all fields before submitting.");
                     return;
                  }
                  
                  if (editingReporterId !== null) {
                    const res = await fetch(`http://localhost:5000/api/reporters/${editingReporterId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify(reporterForm)
                    });
                    const data = await res.json();
                    if (data.success) {
                      setReporters(reporters.map(rep => rep._id === editingReporterId ? { ...reporterForm, _id: editingReporterId } : rep));
                      alert("✅ Village Leader details updated successfully!");
                    }
                  } else {
                    const res = await fetch('http://localhost:5000/api/reporters', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify(reporterForm)
                    });
                    const data = await res.json();
                    if (data.success) {
                      setReporters([{ ...reporterForm, _id: data.reporter._id }, ...reporters]);
                      setReportersCount(prev => prev + 1);
                      alert("🎉 Village Leader Successfully Registered!");
                    }
                  }
                  
                  setShowReporterModal(false);
                  setEditingReporterId(null);
                  setReporterForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', applying_for: 'reporter' });
                }}
                className="w-full h-12 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg active:scale-95 mt-4"
              >
                {editingReporterId ? 'Update Reporter Details' : 'Complete Reporter Registration →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Village Leader Directory */}
      <div className="mt-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
           <button onClick={() => setShowReporterModal(true)} className="text-xs font-black text-blue-600 uppercase hover:underline">+ Add New</button>
        </div>
        <div className="space-y-3">
           {reporters.length === 0 ? (
             <p className="text-center text-gray-400 text-xs py-8">No reporters registered yet.</p>
           ) : (
             reporters.map((rep) => (
               <div key={rep._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                     <p className="font-black text-navy text-sm">{rep.name}</p>
                     <p className="text-[10px] text-gray-500 font-bold uppercase">{rep.village}, {rep.taluka}</p>
                  </div>
                  <button onClick={() => { setEditingReporterId(rep._id); setReporterForm(rep); setShowReporterModal(true); }} className="text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-lg">Edit</button>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
