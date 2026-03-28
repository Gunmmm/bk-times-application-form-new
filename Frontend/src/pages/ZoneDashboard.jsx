import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { Layers, Users, FileText, CheckCircle, Clock, PlusCircle, Newspaper, Edit3, Edit2, ArrowRight } from 'lucide-react';

export default function ZoneDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ readers:{total:0,today:0}, ads:{total:0,pending:0,active:0}, notice:"Welcome to your Zone Coordinator Portal. Data is syncing..." });
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [readers, setReaders] = useState([]);
  const [reporters, setReporters] = useState([]);
  const [reportersCount, setReportersCount] = useState(0);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showReaderModal, setShowReaderModal] = useState(false);
  const [showReporterModal, setShowReporterModal] = useState(false);
  const [newsForm, setNewsForm] = useState({ name:'',phone:'',pinCode:'',category:'Matrimonial',durationDays:1,content:'',paymentAmount:500,photo:null,customCategory:'' });
  const [readerForm, setReaderForm] = useState({ name:'',mobile:'',gender:'',education:'',address:'',district:'',taluka:'',village:'',pinCode:'',subscriptionPlan:'1_year',paymentAmount:1000 });
  const [reporterForm, setReporterForm] = useState({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', applying_for: 'reporter' });
  const [editingReaderId, setEditingReaderId] = useState(null);
  const [editingReporterId, setEditingReporterId] = useState(null);
  const [allAdsCount, setAllAdsCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [newsCommission, setNewsCommission] = useState(0);
  const [receiptInfo, setReceiptInfo] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
            notice: data.notice || "Welcome to your Zone Coordinator Portal."
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
           setTotalCommission(data.reduce((sum, r) => sum + ((r.paymentAmount || 0) * (commissionRate / 100)), 0));
        }
      })
      .catch(e => console.error('Failed readers:', e));

    fetch('http://localhost:5000/api/reporters', { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json()).then(data=>{ if(Array.isArray(data)){ setReporters(data); setReportersCount(data.length); } }).catch(()=>{});
  }, [token, commissionRate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-navy animate-pulse">Loading Zone Dashboard Data...</div>;

  const handlePayment = async (method) => {
    setIsProcessingPayment(true);
    await new Promise(r=>setTimeout(r,1500));
    try {
      if (paymentContext==='reader') {
        const res = await fetch('http://localhost:5000/api/readers',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(readerForm)});
        const data = await res.json();
        if(data.reader){setReaders([data.reader,...readers]);setTotalCommission(p=>p+((data.reader.paymentAmount||0)*0.18));setReceiptInfo({name:data.reader.name,plan:data.reader.subscriptionPlan,amount:data.reader.paymentAmount,commission:(data.reader.paymentAmount||0)*0.18,transactionId:`TXN_${Math.random().toString(36).substring(2,10).toUpperCase()}`});}
        setReaderForm({name:'',mobile:'',gender:'',education:'',address:'',district:'',taluka:'',village:'',pinCode:'',subscriptionPlan:'1_year',paymentAmount:1000});setShowReaderModal(false);
      } else if (paymentContext==='news') {
        const finalCat=newsForm.category==='Other'?(newsForm.customCategory||'Other'):newsForm.category;
        const payload={...newsForm,category:finalCat,title:`${finalCat} Ad from ${newsForm.name}`};
        await fetch('http://localhost:5000/api/news',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
        setLatestNews([{...payload,date:new Date().toISOString(),status:'Pending Approval'},...latestNews].slice(0,5));setNewsCommission(p=>p+(newsForm.paymentAmount*0.18));setAllAdsCount(p=>p+1);
        setReceiptInfo({name:newsForm.name,plan:`${newsForm.durationDays} Day Ad (${finalCat})`,amount:newsForm.paymentAmount,commission:newsForm.paymentAmount*0.18,transactionId:`AD_${Math.random().toString(36).substring(2,10).toUpperCase()}`});
        setNewsForm({name:'',phone:'',pinCode:'',category:'Matrimonial',durationDays:1,content:'',paymentAmount:500,photo:null,customCategory:''});setShowNewsModal(false);
      }
      setShowPaymentOptions(false);setIsProcessingPayment(false);setPaymentContext(null);
    } catch(e){alert("Payment verification failed. Check backend.");setIsProcessingPayment(false);}
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={true} />
      <main className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-navy tracking-tight uppercase">Zone Dashboard</h1>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Logged in as: <span className="text-blue-600">{user?.fullName||'Coordinator'}</span> • {user?.zone||'Zone Area'}</p>
        </div>
        <div className="bg-navy rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-blue-900 relative overflow-hidden">
          <Layers className="absolute top-0 right-0 w-32 h-32 text-blue-500 opacity-10 -mr-6 -mt-6" />
          <div className="relative z-10"><h3 className="text-[10px] font-black text-steppergold uppercase tracking-[0.2em] mb-2">System Notice</h3><p className="text-white font-medium text-sm leading-relaxed">{stats.notice}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-8 gap-3 sm:gap-4 mb-8">
          {/* District Reporters Stat Box */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-all relative overflow-hidden">
             <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-navy uppercase tracking-widest leading-tight pr-4">District Reporters</h4>
                 <Users className="text-steppergold w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{reporters.filter(r => r.applying_for === 'district_coordinator').length}</p>
             <p className="text-[8px] sm:text-[10px] font-bold text-navy uppercase mt-auto pt-2">Region Heads</p>
          </div>

          {/* Taluka Reporters Stat Box */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-orange-200 shadow-md flex flex-col hover:border-orange-500 transition-all relative overflow-hidden">
             <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-orange-600 uppercase tracking-widest leading-tight pr-4">Taluka Reporters</h4>
                 <Users className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{reporters.filter(r => r.applying_for === 'taluka_coordinator').length}</p>
             <p className="text-[8px] sm:text-[10px] font-bold text-orange-400 uppercase mt-auto pt-2">Area Managers</p>
          </div>

          {/* Village Reporters Stat Box */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-blue-200 shadow-md flex flex-col hover:border-blue-500 transition-all relative overflow-hidden">
             <div className="flex items-start justify-between mb-4">
                 <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-blue-600 uppercase tracking-widest leading-tight pr-4">Village Reporters</h4>
                 <Users className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{reporters.filter(r => r.applying_for === 'reporter' || !r.applying_for).length}</p>
             <p className="text-[8px] sm:text-[10px] font-bold text-blue-400 uppercase mt-auto pt-2">Field Staff</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors relative overflow-hidden">
             <div className="flex items-start justify-between mb-2">
                 <h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest pr-4">Zone Readers</h4>
                 <Users className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
             </div>
             <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 tracking-tighter">{readers.length}</p>
             <p className="text-[8px] sm:text-[10px] font-bold text-green-600 uppercase mt-auto pt-2">+{readers.filter(r => new Date(r.createdAt || Date.now()).toDateString() === new Date().toDateString()).length} Today</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-colors relative overflow-hidden"><div className="absolute top-0 right-0 w-12 h-12 bg-steppergold/5 rounded-bl-[100%]"></div><div className="flex items-start justify-between mb-4"><h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-navy uppercase tracking-widest leading-tight pr-2">Reader Comm.</h4><span className="text-steppergold font-black shrink-0 text-sm">₹</span></div><p className="text-2xl sm:text-3xl xl:text-4xl font-black text-steppergold">₹{totalCommission.toLocaleString(undefined,{maximumFractionDigits:0})}</p><p className="text-[8px] sm:text-[10px] font-bold text-navy uppercase tracking-widest mt-auto pt-2">Earned via Subs</p></div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-steppergold/50 shadow-md flex flex-col hover:border-steppergold transition-colors relative overflow-hidden"><div className="absolute top-0 right-0 w-12 h-12 bg-steppergold/5 rounded-bl-[100%]"></div><div className="flex items-start justify-between mb-4"><h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-navy uppercase tracking-widest leading-tight pr-2">Ad Comm.</h4><Clock className="text-steppergold w-4 h-4 sm:w-5 sm:h-5 shrink-0"/></div><p className="text-2xl sm:text-3xl xl:text-4xl font-black text-steppergold">₹{newsCommission.toLocaleString(undefined,{maximumFractionDigits:0})}</p><p className="text-[8px] sm:text-[10px] font-bold text-navy uppercase tracking-widest mt-auto pt-2">Earned via Ads</p></div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors relative overflow-hidden"><div className="flex items-start justify-between mb-4"><h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest leading-tight pr-4">Zone Ads</h4><FileText className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0"/></div><p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900">{allAdsCount}</p><p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase mt-auto pt-2">All time</p></div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:border-blue-500 transition-colors relative overflow-hidden"><div className="flex items-start justify-between mb-4"><h4 className="text-[9px] sm:text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest leading-tight pr-4">Active Ads</h4><CheckCircle className="text-green-500 w-4 h-4 sm:w-5 sm:h-5 shrink-0"/></div><p className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900">{stats.ads.active}</p><p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase mt-auto pt-2">Live Now</p></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
          <div className="xl:col-span-1 flex flex-col gap-3">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-1 px-1">Zone Area Control</h3>
            
            <button onClick={() => { setEditingReaderId(null); setShowReaderModal(true); }} className="w-full p-4 bg-steppergold/10 hover:bg-steppergold/20 border-2 border-steppergold rounded-2xl flex items-center justify-between transition-all group active:scale-95">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><PlusCircle className="text-steppergold w-5 h-5"/></div>
                <div className="text-left"><p className="text-[10px] md:text-xs font-black text-navy uppercase">Register Zone Readers</p><p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase mt-0.5">Subscriber Management</p></div>
              </div>
              <ArrowRight className="text-steppergold group-hover:translate-x-1 transition-transform" size={16}/>
            </button>

            <button onClick={() => { setEditingReporterId(null); setReporterForm({...reporterForm, applying_for: 'district_coordinator'}); setShowReporterModal(true); }} className="w-full p-4 bg-navy hover:bg-black border-2 border-navy rounded-2xl flex items-center justify-between transition-all group active:scale-95 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 p-2 rounded-lg group-hover:scale-110 transition-transform"><Users className="text-white w-5 h-5"/></div>
                <div className="text-left"><p className="text-[10px] md:text-xs font-black text-white uppercase">Register District Reporters</p><p className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase mt-0.5">Regional Management</p></div>
              </div>
              <ArrowRight className="text-white group-hover:translate-x-1 transition-transform" size={16}/>
            </button>

            <button onClick={() => { setEditingReporterId(null); setReporterForm({...reporterForm, applying_for: 'taluka_coordinator'}); setShowReporterModal(true); }} className="w-full p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-500 rounded-2xl flex items-center justify-between transition-all group active:scale-95 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Users className="text-orange-600 w-5 h-5"/></div>
                <div className="text-left"><p className="text-[10px] md:text-xs font-black text-orange-900 uppercase">Register Taluka Reporters</p><p className="text-[8px] md:text-[9px] font-bold text-orange-400 uppercase mt-0.5">Area Hierarchy</p></div>
              </div>
              <ArrowRight className="text-orange-600 group-hover:translate-x-1 transition-transform" size={16}/>
            </button>

            <button onClick={() => { setEditingReporterId(null); setReporterForm({...reporterForm, applying_for: 'reporter'}); setShowReporterModal(true); }} className="w-full p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-600 rounded-2xl flex items-center justify-between transition-all group active:scale-95 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Users className="text-blue-600 w-5 h-5"/></div>
                <div className="text-left"><p className="text-[10px] md:text-xs font-black text-blue-900 uppercase">Register Village Reporters</p><p className="text-[8px] md:text-[9px] font-bold text-blue-400 uppercase mt-0.5">Field Presence</p></div>
              </div>
              <ArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" size={16}/>
            </button>

            <button onClick={()=>setShowNewsModal(true)} className="w-full p-4 bg-gray-100 hover:bg-navy hover:text-white rounded-2xl flex items-center justify-between transition-all group active:scale-95">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Edit3 className="text-navy w-5 h-5"/></div>
                <div className="text-left"><p className="text-[10px] md:text-xs font-black uppercase">Post Zone News</p><p className="text-[8px] md:text-[9px] font-bold text-gray-500 uppercase mt-0.5">Publish Updates</p></div>
              </div>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16}/>
            </button>
          </div>

          <div className="xl:col-span-2"><div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col"><div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50"><h3 className="text-[10px] md:text-xs font-black text-navy uppercase tracking-widest flex items-center gap-2"><Newspaper className="text-blue-500" size={16}/> Latest Zone News</h3><span className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">Live Updates</span></div><div className="p-0 flex-1 overflow-y-auto max-h-[250px] md:max-h-[350px]">{latestNews.length===0?<div className="p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No recent news available.</div>:latestNews.map((news,idx)=><div key={idx} className="p-4 md:p-5 border-b border-gray-50 hover:bg-blue-50/30 transition-colors group cursor-pointer"><div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1"><h4 className="text-xs md:text-sm font-black text-gray-900 group-hover:text-blue-600 line-clamp-1">{news.title||'Breaking News'}</h4><span className="text-[8px] font-bold text-gray-400 uppercase whitespace-nowrap">{new Date(news.createdAt||Date.now()).toLocaleDateString()}</span></div><p className="text-[10px] md:text-xs text-gray-600 line-clamp-2">{news.content||'View news payload...'}...</p></div>)}</div></div></div>
        </div>

        {/* Bottom Section: Management Directories (4-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 xl:grid-cols-4 xl:grid-rows-1 gap-4 mt-8">
          
          {/* District Reporter Directory */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-64 lg:h-[450px]">
             <div className="p-4 border-b border-navy/5 flex items-center justify-between bg-navy/5"><h3 className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-2"><Users className="text-navy" size={14}/> District Reps</h3><span className="text-[8px] font-black text-navy/40 uppercase">Reg. Level</span></div>
             <div className="p-0 flex-1 overflow-y-auto">
                {reporters.filter(r => r.applying_for === 'district_coordinator').length === 0 ? <div className="p-8 text-center text-gray-300 font-bold text-[10px]">No District Staff</div> : reporters.filter(r => r.applying_for === 'district_coordinator').map((rep) => (
                  <div key={rep._id} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 group">
                    <div><h4 className="text-xs font-black text-navy">{rep.name}</h4><p className="text-[8px] text-gray-400 uppercase font-bold">📞 {rep.mobile}</p></div>
                    <button onClick={() => { setEditingReporterId(rep._id); setReporterForm(rep); setShowReporterModal(true); }} className="p-1 px-2 text-[8px] font-black bg-navy text-white rounded-full opacity-0 group-hover:opacity-100 transition-all">EDIT</button>
                  </div>
                ))}
             </div>
          </div>

          {/* Taluka Reporter Directory */}
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden flex flex-col h-64 lg:h-[450px]">
             <div className="p-4 border-b border-orange-50 flex items-center justify-between bg-orange-50/50"><h3 className="text-[10px] font-black text-orange-900 uppercase tracking-widest flex items-center gap-2"><Users className="text-orange-600" size={14}/> Taluka Reps</h3><span className="text-[8px] font-black text-orange-400 uppercase">Area Mgmt</span></div>
             <div className="p-0 flex-1 overflow-y-auto">
                {reporters.filter(r => r.applying_for === 'taluka_coordinator').length === 0 ? <div className="p-8 text-center text-gray-300 font-bold text-[10px]">No Taluka Staff</div> : reporters.filter(r => r.applying_for === 'taluka_coordinator').map((rep) => (
                  <div key={rep._id} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-orange-50/10 group">
                    <div><h4 className="text-xs font-black text-orange-900">{rep.name}</h4><p className="text-[8px] text-gray-400 uppercase font-bold">📞 {rep.mobile}</p></div>
                    <button onClick={() => { setEditingReporterId(rep._id); setReporterForm(rep); setShowReporterModal(true); }} className="p-1 px-2 text-[8px] font-black bg-orange-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all">EDIT</button>
                  </div>
                ))}
             </div>
          </div>

          {/* Village Reporter Directory */}
          <div className="bg-white rounded-3xl shadow-sm border border-blue-100 overflow-hidden flex flex-col h-64 lg:h-[450px]">
             <div className="p-4 border-b border-blue-50 flex items-center justify-between bg-blue-50/50"><h3 className="text-[10px] font-black text-blue-900 uppercase tracking-widest flex items-center gap-2"><Users className="text-blue-600" size={14}/> Village Reps</h3><span className="text-[8px] font-black text-blue-400 uppercase">Field force</span></div>
             <div className="p-0 flex-1 overflow-y-auto">
                {reporters.filter(r => r.applying_for === 'reporter' || !r.applying_for).length === 0 ? <div className="p-8 text-center text-gray-300 font-bold text-[10px]">No Village Staff</div> : reporters.filter(r => r.applying_for === 'reporter' || !r.applying_for).map((rep) => (
                  <div key={rep._id} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-blue-50/10 group">
                    <div><h4 className="text-xs font-black text-blue-900">{rep.name}</h4><p className="text-[8px] text-gray-400 uppercase font-bold">📞 {rep.mobile}</p></div>
                    <button onClick={() => { setEditingReporterId(rep._id); setReporterForm(rep); setShowReporterModal(true); }} className="p-1 px-2 text-[8px] font-black bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all">EDIT</button>
                  </div>
                ))}
             </div>
          </div>

          {/* Readers Directory */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-64 lg:h-[450px]">
             <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50"><h3 className="text-[10px] font-black text-navy uppercase tracking-widest flex items-center gap-2"><Users className="text-green-500" size={14}/> Readers</h3><span className="text-[8px] font-black text-green-600 uppercase">Live DB</span></div>
             <div className="p-0 flex-1 overflow-y-auto">
                {readers.length === 0 ? <div className="p-8 text-center text-gray-300 font-bold text-[10px]">No Readers registered</div> : readers.map((reader) => (
                  <div key={reader._id} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 group">
                    <div><h4 className="text-xs font-black text-gray-900">{reader.name}</h4><p className="text-[8px] text-gray-400 uppercase font-bold">📞 {reader.mobile}</p></div>
                    <button onClick={() => { setEditingReaderId(reader._id); setReaderForm(reader); setShowReaderModal(true); }} className="p-1 px-2 text-[8px] font-black bg-gray-800 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all">EDIT</button>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </main>

      {/* Reader Modal */}
      {showReaderModal&&(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"><div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto"><div className="p-6 md:p-8 bg-steppergold text-navy flex justify-between items-center gap-4"><div className="flex-1"><h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">{editingReaderId?'Update Reader':'Register New Reader'}</h2><p className="text-[8px] md:text-[10px] text-navy/80 font-black uppercase tracking-widest mt-1">Zone Coordinator Portal</p></div><button onClick={()=>{setShowReaderModal(false);setEditingReaderId(null);setReaderForm({name:'',mobile:'',gender:'',education:'',address:'',district:'',taluka:'',village:'',pinCode:'',subscriptionPlan:'1_year',paymentAmount:1000});}} className="w-8 h-8 md:w-10 md:h-10 bg-navy/10 hover:bg-navy/20 rounded-full flex shrink-0 items-center justify-center"><span className="font-bold text-navy text-sm">✕</span></button></div>
        <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Reader Name</label><input type="text" value={readerForm.name} onChange={e=>setReaderForm({...readerForm,name:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs" placeholder="Enter full name..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Mobile Number</label><input type="tel" value={readerForm.mobile} onChange={e=>{const v=e.target.value.replace(/\D/g,'');if(v.length<=10)setReaderForm({...readerForm,mobile:v});}} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs" placeholder="10-digit mobile..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Gender</label><select value={readerForm.gender} onChange={e=>setReaderForm({...readerForm,gender:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs"><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Education</label><select value={readerForm.education} onChange={e=>setReaderForm({...readerForm,education:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs"><option value="">Select Degree</option><option value="Diploma">Diploma</option><option value="Undergraduate">Undergraduate</option><option value="Postgraduate">Postgraduate</option><option value="Doctorate">Doctorate / PhD</option></select></div>
            <div className="sm:col-span-2"><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Full Address</label><textarea rows="2" value={readerForm.address} onChange={e=>setReaderForm({...readerForm,address:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs resize-none" placeholder="Enter full address..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">District</label><input type="text" value={readerForm.district} onChange={e=>setReaderForm({...readerForm,district:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs" placeholder="District name..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Taluka</label><input type="text" value={readerForm.taluka} onChange={e=>setReaderForm({...readerForm,taluka:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs" placeholder="Taluka name..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Village</label><input type="text" value={readerForm.village} onChange={e=>setReaderForm({...readerForm,village:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs" placeholder="Village name..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">PIN Code</label><input type="text" value={readerForm.pinCode} onChange={e=>{const v=e.target.value.replace(/\D/g,'');if(v.length<=6)setReaderForm({...readerForm,pinCode:v});}} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-steppergold font-bold text-xs" placeholder="6-digit PIN..."/></div>
          </div>
          <div className="pt-2 border-t border-gray-200 mt-2"><label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-3">Subscription Plan</label><div className="flex flex-col gap-2">{[{key:'1_year',label:'1 Year',amount:1000},{key:'2_year',label:'2 Year',amount:1800},{key:'3_year',label:'3 Year',amount:2600}].map(p=><label key={p.key} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${readerForm.subscriptionPlan===p.key?'border-steppergold bg-steppergold/10':'border-gray-200 bg-white hover:border-blue-200'}`}><div className="flex items-center gap-3"><input type="radio" name="sub_plan_z" className="w-4 h-4" checked={readerForm.subscriptionPlan===p.key} onChange={()=>setReaderForm({...readerForm,subscriptionPlan:p.key,paymentAmount:p.amount})}/><span className="font-bold text-xs text-navy uppercase">{p.label} Subscription</span></div><span className="font-black text-sm text-navy">₹{p.amount.toLocaleString()}</span></label>)}</div></div>
          <div className="w-full flex items-center justify-between bg-navy text-white p-4 rounded-xl mt-2"><span className="text-[10px] font-black uppercase tracking-widest text-steppergold">Total Payment Due</span><span className="text-xl font-black">₹{readerForm.paymentAmount.toLocaleString()}</span></div>
          <button onClick={async()=>{if(!readerForm.name||!readerForm.mobile||!readerForm.district||!readerForm.address){alert("⚠️ Fill in Name, Mobile, Address and District.");return;}if(!editingReaderId){setPaymentContext('reader');setShowPaymentOptions(true);return;}fetch(`http://localhost:5000/api/readers/${editingReaderId}`,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(readerForm)}).then(r=>r.json()).then(data=>{if(data.reader)setReaders(readers.map(r=>r._id===editingReaderId?data.reader:r));setShowReaderModal(false);setEditingReaderId(null);setReaderForm({name:'',mobile:'',gender:'',education:'',address:'',district:'',taluka:'',village:'',pinCode:'',subscriptionPlan:'1_year',paymentAmount:1000});}).catch(()=>{alert('Saved (Offline Mode).');setShowReaderModal(false);});}} className="w-full h-10 md:h-12 bg-navy text-steppergold rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-black transition-all shadow-lg active:scale-95 mt-2">{editingReaderId?'Update Registration':'Proceed to Payment →'}</button>
        </div></div></div>)}

      {showPaymentOptions&&(<div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-navy/90 backdrop-blur-md animate-in fade-in duration-300"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative"><div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 flex flex-col items-center"><button onClick={()=>{setShowPaymentOptions(false);setPaymentContext(null);}} className="absolute top-4 right-4 text-white hover:text-blue-200">✕</button><span className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Razorpay Secured Checkout</span><span className="text-white text-3xl font-black">₹{(paymentContext==='news'?newsForm.paymentAmount:readerForm.paymentAmount).toLocaleString()}</span></div><div className="p-6">{isProcessingPayment?<div className="flex flex-col items-center py-8"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div><p className="text-xs font-bold text-gray-500 uppercase animate-pulse">Processing Payment...</p></div>:<div className="flex flex-col gap-3"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Select Payment Method</p>{['UPI / PayTM','Debit / Credit Card','Net Banking'].map((m,i)=><button key={i} onClick={handlePayment} className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/50 transition-all group"><span className="font-bold text-sm text-navy">{m}</span><span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span></button>)}</div>}</div></div></div>)}

      {receiptInfo&&(<div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300"><div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-6 flex flex-col items-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="text-green-500 w-8 h-8"/></div><h2 className="text-xl font-black text-navy uppercase text-center mb-1">Payment Successful</h2><p className="text-xs text-gray-500 font-bold uppercase text-center mb-6">{receiptInfo.transactionId}</p><div className="w-full space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100"><div className="flex justify-between text-xs"><span className="font-bold text-gray-400 uppercase">{receiptInfo.transactionId.startsWith('AD_')?'Advertiser':'Reader'}</span><span className="font-black text-gray-800">{receiptInfo.name}</span></div><div className="flex justify-between text-xs"><span className="font-bold text-gray-400 uppercase">{receiptInfo.transactionId.startsWith('AD_')?'Ad Package':'Subscription'}</span><span className="font-black text-gray-800">{receiptInfo.plan.replace('_',' ').toUpperCase()}</span></div><div className="flex justify-between text-xs pt-3 border-t border-gray-200"><span className="font-bold text-gray-400 uppercase">Total Paid</span><span className="font-black text-navy text-sm">₹{receiptInfo.amount.toLocaleString()}</span></div></div><div className="w-full bg-steppergold/10 border-2 border-steppergold p-4 rounded-xl flex items-center justify-between mb-6"><span className="text-[10px] font-black text-navy uppercase tracking-widest">Your 18% Commission</span><span className="text-xl font-black text-steppergold">₹{receiptInfo.commission.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div><button onClick={()=>setReceiptInfo(null)} className="w-full h-12 bg-navy text-steppergold rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg active:scale-95">Close Receipt</button></div></div>)}

      {showNewsModal&&(<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto"><div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto"><div className="p-6 md:p-8 bg-navy text-white flex justify-between items-center gap-4"><div className="flex-1"><h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">Book News / Ad</h2><p className="text-[8px] md:text-[10px] text-steppergold font-black uppercase tracking-widest mt-1">Zone Coordinator Portal</p></div><button onClick={()=>{setShowNewsModal(false);setNewsForm({name:'',phone:'',pinCode:'',category:'Matrimonial',durationDays:1,content:'',paymentAmount:500,photo:null,customCategory:''}); }} className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex shrink-0 items-center justify-center"><span className="font-bold text-sm">✕</span></button></div>
        <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Advertiser Name</label><input type="text" value={newsForm.name} onChange={e=>setNewsForm({...newsForm,name:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs" placeholder="Full name..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Phone (10 Digits)</label><input type="tel" value={newsForm.phone} onChange={e=>{const v=e.target.value.replace(/\D/g,'');if(v.length<=10)setNewsForm({...newsForm,phone:v});}} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs" placeholder="10-digit mobile..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">PIN Code</label><input type="text" value={newsForm.pinCode} onChange={e=>{const v=e.target.value.replace(/\D/g,'');if(v.length<=6)setNewsForm({...newsForm,pinCode:v});}} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs" placeholder="6-digit PIN..."/></div>
            <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Ad Category</label><select value={newsForm.category} onChange={e=>setNewsForm({...newsForm,category:e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs"><option value="Matrimonial">Matrimonial</option><option value="Recruitment">Recruitment</option><option value="Property Sale">Property Sale</option><option value="Property Rent">Property Rent</option><option value="Name Change">Name Change</option><option value="Lost & Found">Lost & Found</option><option value="Vehicle Sale">Vehicle Sale</option><option value="Services">Services / Business</option><option value="Other">Other Announcements</option></select></div>
            {newsForm.category==='Other'&&<div className="md:col-span-2 animate-in fade-in duration-300"><label className="block text-[9px] font-black text-blue-600 uppercase tracking-widest mb-2">Specify Custom Category</label><input type="text" value={newsForm.customCategory||''} onChange={e=>setNewsForm({...newsForm,customCategory:e.target.value})} className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl outline-none font-bold text-xs" placeholder="E.g. Festival Greeting..."/></div>}
          </div>
          <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Ad / News Content</label><textarea value={newsForm.content} onChange={e=>setNewsForm({...newsForm,content:e.target.value})} rows={4} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-navy font-bold text-xs resize-none" placeholder="Type the full ad or news content here..."/></div>
          <div><label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2">Attach Photo</label><input type="file" accept="image/*" onChange={e=>setNewsForm({...newsForm,photo:e.target.files[0]})} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-navy file:text-steppergold hover:file:bg-black"/></div>
          <div className="pt-4 border-t border-gray-200"><label className="block text-[10px] font-black text-navy uppercase tracking-widest mb-3">Duration & Charges</label><div className="flex gap-2 w-full">{[1,2,3].map(d=>{const price=d*500;const sel=newsForm.durationDays===d;return <button key={d} onClick={()=>setNewsForm({...newsForm,durationDays:d,paymentAmount:price})} className={`flex-1 p-3 flex flex-col items-center rounded-xl border-2 transition-all ${sel?'border-steppergold bg-steppergold/10':'border-gray-200 bg-white hover:border-blue-100'}`}><span className={`text-[10px] font-black uppercase ${sel?'text-steppergold':'text-gray-400'}`}>{d} Day{d>1&&'s'}</span><span className="text-sm font-black text-navy">₹{price}</span></button>})}</div></div>
          <div className="w-full flex items-center justify-between bg-navy text-white p-4 rounded-xl mt-2"><span className="text-[10px] font-black uppercase tracking-widest text-steppergold">Total Amount Due</span><span className="text-xl font-black">₹{newsForm.paymentAmount.toLocaleString()}</span></div>
          <button onClick={()=>{if(!newsForm.name||!newsForm.phone||!newsForm.content){alert("⚠️ Name, Phone and Content are required.");return;}setPaymentContext('news');setShowPaymentOptions(true);}} className="w-full h-12 bg-navy text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg active:scale-95">Submit & Proceed to Checkout →</button>
        </div></div></div>)}

      {/* Reporter Registration Modal (Identical to District Implementation) */}
      {showReporterModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
            <div className="p-6 md:p-8 bg-black text-white flex justify-between items-center relative gap-4 text-left">
              <div className="flex-1 text-left">
                 <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight line-clamp-1">{editingReporterId ? 'Update Reporter' : 'Register New Reporter'}</h2>
                 <p className="text-[8px] md:text-[10px] text-white/80 font-black uppercase tracking-widest mt-1 text-left uppercase">{editingReporterId ? 'Modify Details' : 'Zone Coordinator Portal'}</p>
              </div>
              <button 
                onClick={() => { setShowReporterModal(false); setEditingReporterId(null); setReporterForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', applying_for: 'reporter' }); }} 
                className="w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex shrink-0 items-center justify-center transition-colors">
                <span className="font-bold text-white text-sm md:text-base">✕</span>
              </button>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 bg-gray-50 text-left">
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4 text-left">
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Full Name</label>
                  <input type="text" value={reporterForm.name} onChange={e => setReporterForm({...reporterForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/20 font-bold text-xs" placeholder="Full name..." />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Mobile Number</label>
                  <input type="tel" value={reporterForm.mobile} onChange={e => {
                     const val = e.target.value.replace(/\D/g, '');
                     if (val.length <= 10) setReporterForm({...reporterForm, mobile: val});
                  }}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/20 font-bold text-xs" placeholder="10-digit mobile..." />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Gender</label>
                  <select value={reporterForm.gender} onChange={e => setReporterForm({...reporterForm, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black font-bold text-xs text-left">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Education</label>
                  <select value={reporterForm.education} onChange={e => setReporterForm({...reporterForm, education: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black font-bold text-xs text-left">
                    <option value="">Select Degree</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div className="sm:col-span-2 text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Address</label>
                  <textarea rows="2" value={reporterForm.address} onChange={e => setReporterForm({...reporterForm, address: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black font-bold text-xs resize-none text-left" placeholder="Full address..." />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">District</label>
                  <input type="text" value={reporterForm.district} onChange={e => setReporterForm({...reporterForm, district: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black font-bold text-xs" placeholder="District..." />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] md:text-[10px] font-black text-navy uppercase tracking-widest mb-2 text-left">Taluka</label>
                  <input type="text" value={reporterForm.taluka} onChange={e => setReporterForm({...reporterForm, taluka: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-black font-bold text-xs" placeholder="Taluka..." />
                </div>
                <div className="text-left sm:col-span-2">
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 text-left">Assigning Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'district_coordinator', label: 'District' },
                      { key: 'taluka_coordinator', label: 'Taluka' },
                      { key: 'reporter', label: 'Village' }
                    ].map(role => (
                      <button 
                        key={role.key}
                        onClick={() => setReporterForm({...reporterForm, applying_for: role.key})}
                        className={`p-2 rounded-lg border-2 text-[10px] font-black transition-all ${reporterForm.applying_for === role.key ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={async () => {
                    if (!reporterForm.name || !reporterForm.mobile) {
                      alert("⚠️ Name and Mobile are required.");
                      return;
                    }
                    if (!editingReporterId) {
                      const res = await fetch('http://localhost:5000/api/reporters', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(reporterForm)
                      });
                      const data = await res.json();
                      if (data.success) {
                        setReporters([...reporters, { ...reporterForm, _id: data.reporter._id }]);
                        setReportersCount(reportersCount + 1);
                      }
                    } else {
                      const res = await fetch(`http://localhost:5000/api/reporters/${editingReporterId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(reporterForm)
                      });
                      const data = await res.json();
                      if (data.success) {
                        setReporters(reporters.map(r => r._id === editingReporterId ? { ...reporterForm, _id: editingReporterId } : r));
                      }
                    }
                    setShowReporterModal(false);
                    setEditingReporterId(null);
                    setReporterForm({ name: '', mobile: '', gender: '', education: '', address: '', district: '', taluka: '', village: '', pinCode: '', applying_for: 'reporter' });
                    alert("Staff details updated successfully!");
                  }}
                  className="w-full h-12 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-900 transition-all shadow-lg active:scale-95 mt-4"
                >
                  {editingReporterId ? 'Update Staff Member' : 'Register Staff Member →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
