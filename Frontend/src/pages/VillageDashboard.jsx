import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Layers, Users, FileText, CheckCircle, Clock, PlusCircle, Newspaper, Edit3, Edit2, ArrowRight } from 'lucide-react';

const DISTRICTS = ["Nashik", "Dhule", "Nandurbar", "Jalgaon", "Ahilyanagar", "Pune", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg", "Mumbai City", "Mumbai Suburban", "Chhatrapati Sambhajinagar", "Jalna", "Beed", "Latur", "Dharashiv", "Nanded", "Parbhani", "Hingoli", "Amravati", "Buldhana", "Akola", "Washim", "Yavatmal", "Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli", "Satara", "Sangli", "Solapur", "Kolhapur"];

const DISTRICT_TALUKAS = {
  "Nashik": ["Nashik", "Sinnar", "Igatpuri", "Niphad", "Nandgaon", "Yeola", "Kalwan", "Baglan (Satana)", "Surgana", "Peint", "Trimbakeshwar", "Deola", "Malegaon", "Dindori", "Chandwad"],
  "Beed": ["Beed", "Ashti", "Patoda", "Shirur Kasar", "Gevrai", "Majalgaon", "Kaij", "Ambajogai", "Parli", "Wadwani", "Dharur"]
};

const TALUKA_VILLAGES = {
  "Sinnar": ["Adwadi", "Agas Khind", "Ashapur", "Atkawade", "Aundhewadi", "Baragaon Pimpri", "Belu", "Bharatpur", "Bhatwadi", "Bhojapur", "Bhokani", "Borkhind", "Bramhan Wade", "Chandrapur", "Chapadgaon", "Chas", "Chincholi", "Chondhi"],
  "Nashik": ["Ambebahula", "Babhaleshwar", "Belatgavhan", "Belgaon Dhaga", "Bhagur Rural", "Chandgiri", "Chandshi", "Dahegaon", "Dari", "Devargaon", "Dhondegaon", "Donwade", "Dudgaon", "Dugaon", "Eklahare", "Ganeshgaon"],
  "Patoda": ["Amalner", "Ambewadi", "Anpatwadi", "Antapur", "Bedarwadi", "Bedukwadi", "Belewadi", "Bensur", "Bhaktache Gothe", "Bhatewadi", "Bhurewadi", "Bhusanarwadi", "Bhyala", "Chanderwadi", "Chikhali", "Chincholi"],
  "Ashti": ["Morala", "Dadegaon", "Sangvi Ashti", "Deulgaon Ghat", "Jamgaon", "Parodi", "Takalsing", "Tavalwadi", "Hatolan", "Kanadi Bk", "Kanadi Kh", "Karkhel Bk", "Karkhel Kh", "Sheri Bk", "Sheri Kh", "Ambewadi"],
  "Kaij": ["Borgaon Bk", "Adas", "Anandgaon Sarni", "Andhalewadi", "Anegaon", "Arangaon", "Aurangpur", "Awasgaon", "Banegaon", "Bankaranja", "Bansarola", "Bawachi", "Belgaon", "Bhalgaon", "Bhatumba", "Bhopala"],
  "Ambajogai": ["Akola", "Ambajogai", "Ambaltek", "Ambalwadi", "Anjanpur", "Apegaon", "Babhalgaon", "Bagzari", "Bardapur", "Bharaj", "Bhatanwadi", "Bhawthana", "Chanai", "Chandanwadi", "Chichkhandi"]
};

export default function VillageDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    readers: { total: 0, today: 0 },
    ads: { total: 0, pending: 0, active: 0, totalRevenue: 0, yourCommission: 0 },
    notice: "Welcome to your Basic Village Coordinator Portal. Data is syncing..."
  });
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [readers, setReaders] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [showSimpleNewsModal, setShowSimpleNewsModal] = useState(false);
  const [newsForm, setNewsForm] = useState({ name: '', phone: '', pinCode: '', category: 'Matrimonial', durationDays: 1, content: '', paymentAmount: 500, photo: null });
  const [simpleNewsForm, setSimpleNewsForm] = useState({ headline: '', name: '', category: 'Village Update', content: '' });
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [readerForm, setReaderForm] = useState({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
  const [editingReaderId, setEditingReaderId] = useState(null);
  const [allAdsCount, setAllAdsCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [newsCommission, setNewsCommission] = useState(0);
  const [receiptInfo, setReceiptInfo] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentContext, setPaymentContext] = useState(null);
  const [commissionRate, setCommissionRate] = useState(13);

  const refetchAll = async () => {
    if (!token) return;
    try {
      const [statsRes, newsRes, readersRes] = await Promise.all([
        fetch('http://localhost:5000/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/news', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/readers', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      const statsData = await statsRes.json();
      if (statsData?.ads) {
        setCommissionRate(statsData.commissionRate || 13);
        setStats({
          readers: statsData.readers || { total: 0, today: 0 },
          ads: statsData.ads || { total: 0, pending: 0, active: 0, totalRevenue: 0, yourCommission: 0 },
          notice: statsData.notice || "Welcome to your Village Coordinator Portal."
        });
      }

      const newsData = await newsRes.json();
      if (Array.isArray(newsData)) {
        setLatestNews(newsData.slice(0, 20));
        setAllAdsCount(newsData.length);
        const newsComm = newsData.reduce((sum, ad) => sum + ((ad.paymentAmount || 500) * (commissionRate / 100)), 0);
        setNewsCommission(newsComm);
      }

      const readersData = await readersRes.json();
      if (Array.isArray(readersData)) {
        setReaders(readersData);
        const comm = readersData.reduce((sum, r) => sum + ((r.paymentAmount || 0) * (commissionRate / 100)), 0);
        setTotalCommission(comm);
      }
    } catch (e) {
      console.error('Failed to sync with backend:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchAll();
  }, [token, commissionRate]);

  if (!user && token) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-navy animate-pulse">Syncing Session...</div>;
  }
  
  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-navy animate-pulse">Loading Basic Dashboard Data...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={true} />
      
      <main className="flex-1 px-4 py-8 max-w-[1450px] mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Village Dashboard</h1>
        </div>

        {/* Global Notice */}
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-blue-900 relative overflow-hidden">
          <Layers className="absolute top-0 right-0 w-32 h-32 text-blue-500 opacity-10 -mr-6 -mt-6" />
          <div className="relative z-10">
            <h3 className="text-[10px] font-black text-steppergold uppercase tracking-[0.2em] mb-2">System Notice</h3>
            <p className="text-white font-medium text-sm leading-relaxed">{stats.notice}</p>
          </div>
        </div>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-8">
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors cursor-default">
             <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">Total Village Readers</h4>
                 <Users className="text-blue-500 w-5 h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{readers.length}</p>
             <p className="text-[10px] font-bold text-green-600 uppercase mt-2">+{readers.filter(r => new Date(r.createdAt || Date.now()).toDateString() === new Date().toDateString()).length} Registered Today</p>
          </div>
    
          <div className="bg-white p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-colors cursor-default relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-steppergold/5 rounded-bl-[100%]"></div>
             <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-navy uppercase tracking-widest leading-relaxed pr-2">SUBSCRIBERS REVENUE</h4>
                 <span className="text-steppergold font-black shrink-0">₹</span>
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-steppergold tracking-tighter">₹{totalCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
             <p className="text-[10px] font-bold text-navy uppercase tracking-widest mt-2">SUBSCRIBER INCOME</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-colors cursor-default relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-steppergold/5 rounded-bl-[100%]"></div>
             <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-navy uppercase tracking-widest leading-relaxed pr-2">ADVT REVENUE</h4>
                 <Clock className="text-steppergold w-5 h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-steppergold tracking-tighter">₹{newsCommission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
             <p className="text-[10px] font-bold text-navy uppercase tracking-widest mt-2">ADVT INCOME</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors cursor-default">
             <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">TOTAL ADVT</h4>
                 <FileText className="text-orange-500 w-5 h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{allAdsCount}</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">ALL TIME</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors cursor-default sm:col-span-2 xl:col-span-1">
             <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed">ACTIVE ADVT</h4>
                 <CheckCircle className="text-green-500 w-5 h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{stats.ads.active}</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">LIVE NOW</p>
          </div>

        </div>

        {/* Dashboard Actions & News Setup */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          
          {/* Action Center - Responsive Grid */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-2 px-1">Village Actions</h3>
            
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
                  <p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase mt-0.5">Add to Subscriber Base</p>
                </div>
              </div>
              <ArrowRight className="text-steppergold group-hover:translate-x-1 transition-transform" size={18} />
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
                  <p className="text-[10px] md:text-xs font-black text-white uppercase">Post Village Advt</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase mt-0.5">Submit story to HQ</p>
                </div>
              </div>
              <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={18} />
            </button>

            <button 
              onClick={() => setShowSimpleNewsModal(true)}
              className="w-full p-5 bg-green-50 hover:bg-green-600 hover:text-white border-2 border-green-500 rounded-2xl flex items-center justify-between transition-all group active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 md:p-3 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Newspaper className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] md:text-xs font-black text-green-900 group-hover:text-white uppercase transition-colors">NEWS</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-green-500 group-hover:text-green-100 uppercase mt-0.5 transition-colors">SUBMIT NEWS PORTAL</p>
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
                  <Newspaper className="text-blue-500" size={16} /> Latest Portal News
                </h3>
                <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">Live Updates</span>
              </div>
              
              <div className="p-0 flex-1 overflow-y-auto max-h-[250px] md:max-h-[300px]">
                {latestNews.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No recent news available.</div>
                ) : (
                  latestNews.map((news, idx) => (
                    <div key={news._id || idx} className="p-4 md:p-5 border-b border-gray-50 hover:bg-blue-50/30 transition-colors group relative">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 sm:mb-2 gap-1 sm:gap-4">
                        <h4 className="text-xs md:text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{news.title || news.headline || 'Breaking News'}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase whitespace-nowrap">{new Date(news.createdAt || Date.now()).toLocaleDateString()}</span>
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               setEditingNewsId(news._id);
                               setSimpleNewsForm({ 
                                 headline: news.title || news.headline || '', 
                                 name: news.name || '',
                                 category: news.category || 'Village Update', 
                                 content: news.content || '' 
                               });
                               setShowSimpleNewsModal(true);
                            }}
                            className="p-1 sm:p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all active:scale-90"
                            title="Edit News"
                          >
                            <Edit2 size={12} className="md:w-3.5 md:h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-600 line-clamp-2 leading-relaxed">{news.content || news.description || 'View news payload...'}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Revenue and Readers Feed */}
        <div className="grid grid-cols-1 gap-8 mt-8">          
          {/* Reader Directory Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-64 lg:h-[500px]">
            <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-[10px] md:text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2">
                <Users className="text-green-500" size={16} /> Reader Directory
              </h3>
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">Live Database</span>
            </div>
            <div className="p-0 flex-1 overflow-y-auto">
              {readers.length === 0 ? (
                <div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No readers registered yet.</div>
              ) : (
                readers.map((reader) => (
                  <div key={reader._id} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 transition-colors group">
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{reader.name}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">📞 {reader.mobile}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingReaderId(reader._id);
                            setReaderForm(reader);
                            setShowReaderModal(true);
                          }}
                          className="p-1 sm:p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all active:scale-90"
                          title="Edit Reader"
                        >
                          <Edit2 size={14} className="md:w-4 md:h-4" />
                        </button>
                       <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase">Active</span>
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
                 <p className="text-[8px] md:text-[10px] text-navy/80 font-black uppercase tracking-widest mt-1">Village Coordinator Portal</p>
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
                   <select value={readerForm.district} 
                     onChange={e => {
                        const dist = e.target.value;
                        setReaderForm({...readerForm, district: dist, taluka: '', village: ''});
                     }}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner">
                     <option value="">Select District</option>
                     {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Taluka</label>
                   <select value={readerForm.reader_taluka || readerForm.taluka} 
                     disabled={!readerForm.district}
                     onChange={e => {
                        const tal = e.target.value;
                        setReaderForm({...readerForm, taluka: tal, village: ''});
                     }}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner disabled:bg-gray-100">
                     <option value="">Select Taluka</option>
                     {(DISTRICT_TALUKAS[readerForm.district] || []).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Village Name</label>
                   <select value={readerForm.village} 
                     disabled={!readerForm.taluka}
                     onChange={e => setReaderForm({...readerForm, village: e.target.value})}
                     className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold focus:ring-2 focus:ring-steppergold/20 font-bold text-xs shadow-inner disabled:bg-gray-100">
                     <option value="">Select Village</option>
                     {(TALUKA_VILLAGES[readerForm.taluka] || []).map(v => <option key={v} value={v}>{v}</option>)}
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

              {/* Subscription Options (Radio Buttons) */}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <label className="block text-[10px] md:text-sm font-black text-navy uppercase tracking-widest mb-3">Subscription Plan</label>
                <div className="flex flex-col gap-2">
                   <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan === '1_year' ? 'border-steppergold bg-steppergold/10' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                         <input type="radio" name="sub_plan" className="w-4 h-4 text-steppergold border-gray-300 focus:ring-steppergold" 
                           checked={readerForm.subscriptionPlan === '1_year'} 
                           onChange={() => setReaderForm({...readerForm, subscriptionPlan: '1_year', paymentAmount: 1000})} />
                         <span className="font-bold text-xs md:text-sm text-navy uppercase">1 Year Subscription</span>
                      </div>
                      <span className="font-black text-sm md:text-base text-navy">₹1,000</span>
                   </label>
                   <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan === '2_year' ? 'border-steppergold bg-steppergold/10' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                         <input type="radio" name="sub_plan" className="w-4 h-4 text-steppergold border-gray-300 focus:ring-steppergold" 
                           checked={readerForm.subscriptionPlan === '2_year'} 
                           onChange={() => setReaderForm({...readerForm, subscriptionPlan: '2_year', paymentAmount: 1800})} />
                         <span className="font-bold text-xs md:text-sm text-navy uppercase">2 Year Subscription</span>
                      </div>
                      <span className="font-black text-sm md:text-base text-navy">₹1,800</span>
                   </label>
                   <label className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan === '3_year' ? 'border-steppergold bg-steppergold/10' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                         <input type="radio" name="sub_plan" className="w-4 h-4 text-steppergold border-gray-300 focus:ring-steppergold" 
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
                     alert("⚠️ Name, Phone and Full Address are required.");
                     return;
                  }
                  if (!editingReaderId) {
                     setPaymentContext('reader');
                     setShowPaymentOptions(true);
                     return;
                  }
                  const url = `http://localhost:5000/api/readers/${editingReaderId}`;
                  try {
                    const resp = await fetch(url, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({
                        ...readerForm,
                        village: user?.village || readerForm.village,
                        taluka: user?.taluka || readerForm.taluka,
                        district: user?.district || readerForm.district
                      })
                    });
                    const data = await resp.json();
                    if (data.reader || data.success) {
                       alert("✅ Database Updated: Reader information successfully persisted.");
                       await refetchAll();
                    }
                    setShowReaderModal(false);
                    setEditingReaderId(null);
                    setReaderForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
                  } catch (e) {
                     alert("⚠️ Sync failure: Could not update reader profile.");
                  }
                }}
                className="w-full h-12 md:h-14 bg-navy text-steppergold rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm hover:bg-black transition-all shadow-xl active:scale-[0.98] mt-2"
              >
                {editingReaderId ? 'SAVE CHANGES →' : 'PROCEED TO PAYMENT →'}
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
                                      const payload = {
                                         ...readerForm,
                                         village: user?.village || readerForm.village,
                                         taluka: user?.taluka || readerForm.taluka,
                                         district: user?.district || readerForm.district,
                                         zone: user?.zone || readerForm.zone
                                      };
                                      const res = await fetch('http://localhost:5000/api/readers', {
                                         method: 'POST',
                                         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                         body: JSON.stringify(payload)
                                      });
                                      const data = await res.json();
                                      if (data.reader) {
                                         setReaders([data.reader, ...readers]);
                                         setReceiptInfo({
                                            name: data.reader.name,
                                            plan: data.reader.subscriptionPlan,
                                            amount: data.reader.paymentAmount,
                                            commission: (data.reader.paymentAmount || 0) * (commissionRate / 100),
                                            transactionId: `TXN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                                         });
                                         refetchAll();
                                      }
                                      setReaderForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', subscriptionPlan: '1_year', paymentAmount: 1000 });
                                      setShowReaderModal(false);
                                   } else if (paymentContext === 'news') {
                                      const finalCat = newsForm.category === 'Other' ? (newsForm.customCategory || 'Other Announcements') : newsForm.category;
                                      const payload = {
                                         ...newsForm, 
                                         category: finalCat, 
                                         title: `${finalCat} Ad from ${newsForm.name}`,
                                         village: user?.village || newsForm.village,
                                         taluka: user?.taluka || newsForm.taluka,
                                         district: user?.district || newsForm.district,
                                         zone: user?.zone || newsForm.zone
                                      };
                                      
                                      const res = await fetch('http://localhost:5000/api/news', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                        body: JSON.stringify(payload)
                                      });
                                      const data = await res.json();
                                      if (data._id) {
                                         setReceiptInfo({
                                            name: newsForm.name,
                                            plan: `${newsForm.durationDays} Day Ad (${finalCat})`,
                                            amount: newsForm.paymentAmount,
                                            commission: newsForm.paymentAmount * (commissionRate / 100),
                                            transactionId: `AD_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                                         });
                                         refetchAll();
                                      }
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

      {/* News Booking Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-6 md:p-8 bg-navy text-white flex justify-between items-center relative gap-4">
              <div className="flex-1">
                 <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight line-clamp-1">Book Advt</h2>
                 <p className="text-[8px] md:text-[10px] text-steppergold font-black uppercase tracking-widest mt-1">Village Coordinator Portal</p>
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
                       <input type="file" id="news-photo-village" accept="image/*"
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
                       <label htmlFor="news-photo-village" className="w-full h-10 bg-navy text-steppergold rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-black transition-all">
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

              <div className="pt-2 border-t border-gray-100 flex flex-col gap-4 mt-2">
                <div className="pt-2">
                  <label className="block text-[10px] md:text-sm font-black text-navy uppercase tracking-widest mb-3">Booking Duration / Plan</label>
                  <div className="flex flex-col gap-2">
                     {[
                       {days: 1, label: '1 Day', price: 500},
                       {days: 2, label: '2 Days', price: 1000},
                       {days: 5, label: '5 Days', price: 2500}
                     ].map(p => (
                        <label key={p.days} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${newsForm.durationDays == p.days ? 'border-navy bg-navy/5' : 'border-gray-200 bg-white hover:border-blue-200'}`}>
                           <div className="flex items-center gap-3">
                              <input type="radio" name="advt_plan_v" className="w-4 h-4 text-navy border-gray-300 focus:ring-navy" 
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
        </div>
      )}
      {/* Simple News Modal (Free) */}
      {showSimpleNewsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-navy/90 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto border border-white/20">
            <div className="p-6 md:p-8 bg-navy text-white flex justify-between items-center relative gap-4">
              <div className="flex-1">
                 <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight line-clamp-1">Submit News</h2>
                 <p className="text-[9px] md:text-[10px] text-steppergold font-black uppercase tracking-widest mt-1">Village Coordinator Portal</p>
              </div>
              <button 
                onClick={() => {
                  setShowSimpleNewsModal(false);
                  setSimpleNewsForm({ headline: '', category: 'Village Update', content: '' });
                }} 
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex shrink-0 items-center justify-center transition-all active:scale-95">
                <span className="font-bold text-lg">✕</span>
              </button>
            </div>
            
            <div className="p-5 md:p-8 flex flex-col gap-5 bg-gray-50/80">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-2.5 ml-1">News Headline</label>
                  <input 
                    type="text" 
                    value={simpleNewsForm.headline}
                    onChange={e => setSimpleNewsForm({...simpleNewsForm, headline: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 font-bold text-sm shadow-sm transition-all" 
                    placeholder="Short news title..." 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-2.5 ml-1">Sender/Author Name</label>
                  <input 
                    type="text" 
                    value={simpleNewsForm.name}
                    onChange={e => setSimpleNewsForm({...simpleNewsForm, name: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 font-bold text-sm shadow-sm transition-all" 
                    placeholder="Your name or organization..." 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-2.5 ml-1">News Category</label>
                  <select 
                    value={simpleNewsForm.category}
                    onChange={e => setSimpleNewsForm({...simpleNewsForm, category: e.target.value})}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 font-bold text-sm shadow-sm transition-all appearance-none cursor-pointer"
                  >
                    <option>Village Update</option>
                    <option>Local Event</option>
                    <option>Notice</option>
                    <option>General News</option>
                  </select>
                </div>
                
                <div className="relative">
                  <div className="flex justify-between items-end mb-2.5 ml-1">
                    <label className="block text-[10px] font-black text-navy uppercase tracking-widest">News Content</label>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${simpleNewsForm.content.length > 1900 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-100 text-gray-400'}`}>
                      {simpleNewsForm.content.length} / 2000
                    </span>
                  </div>
                  <textarea 
                    maxLength={2000}
                    value={simpleNewsForm.content}
                    onChange={e => setSimpleNewsForm({...simpleNewsForm, content: e.target.value})}
                    rows={4} 
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:border-navy focus:ring-4 focus:ring-navy/5 font-bold text-sm shadow-sm transition-all resize-none min-h-[120px]" 
                    placeholder="Type news article content here..." 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={async () => { 
                    if (!simpleNewsForm.headline || !simpleNewsForm.content) {
                      alert("⚠️ Headline and Content are required.");
                      return;
                    }
                    
                    const method = editingNewsId ? 'PUT' : 'POST';
                    const url = editingNewsId ? `http://localhost:5000/api/news/${editingNewsId}` : 'http://localhost:5000/api/news';
                    
                    try {
                       const res = await fetch(url, {
                          method,
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({
                             ...simpleNewsForm,
                             title: simpleNewsForm.headline,
                             village: user?.village,
                             taluka: user?.taluka,
                             district: user?.district
                          })
                       });
                       const data = await res.json();
                       if (data._id || data.success) {
                          alert(editingNewsId ? "✅ Success: News record edited in database." : "✅ Success: News submitted to database.");
                          await refetchAll();
                       }
                       setShowSimpleNewsModal(false);
                       setEditingNewsId(null);
                       setSimpleNewsForm({ headline: '', name: '', category: 'Village Update', content: '' });
                    } catch (e) {
                       alert("⚠️ Error connecting to server database.");
                    }
                  }} 
                  className="w-full h-14 bg-navy text-steppergold rounded-2xl font-black uppercase tracking-[0.15em] text-sm hover:bg-black transition-all shadow-xl hover:shadow-navy/20 active:scale-[0.98] mt-2 flex items-center justify-center gap-3 group"
                >
                  <Newspaper size={18} className="group-hover:rotate-12 transition-transform" />
                  {editingNewsId ? 'UPDATE NEWS ARTICLE' : 'PUBLISH NEWS ARTICLE'}
                </button>
                <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-4">Authorized Village Press Release</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

