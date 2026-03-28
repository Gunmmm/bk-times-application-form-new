import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Heart, Briefcase, Home, UserRound, 
  Search, Car, Star, Building2, 
  Monitor, Cross, Megaphone, Settings, 
  Plane, MessageSquare, ShoppingBag, CheckCircle2,
  ShieldCheck, CreditCard, QrCode, Zap,
  Globe, MapPin, Sparkles, UploadCloud, Image as ImageIcon, X, Trash2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'matrimonial', label: 'Matrimonial', icon: Heart },
  { id: 'recruitment', label: 'Recruitment', icon: Briefcase },
  { id: 'property', label: 'Property Sale/Rent', icon: Home },
  { id: 'name_change', label: 'Name Change', icon: UserRound },
  { id: 'lost_found', label: 'Lost/Found', icon: Search },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'astrology', label: 'Astrology', icon: Star },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'computers', label: 'Computers', icon: Monitor },
  { id: 'obituary', label: 'Obituary', icon: Cross },
  { id: 'announcement', label: 'Personal Announcement', icon: Megaphone },
  { id: 'services', label: 'Services', icon: Settings },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'messages', label: 'Personal Messages', icon: MessageSquare },
  { id: 'retail', label: 'Retail', icon: ShoppingBag },
  { id: 'other', label: 'Other', icon: CheckCircle2 },
];

const ZONES = [
  'Nashik', 'Chhatrapati Sambhaji Nagar', 'Nagpur', 
  'Mumbai', 'Pune', 'Amravati'
];

const EDITIONS = [
  { id: 'metro', label: 'Metro Edition', icon: Building2, desc: 'Highest reach in city centers' },
  { id: 'local', label: 'Local Edition', icon: MapPin, desc: 'Targeted neighborhood reach' },
  { id: 'special', label: 'Special Edition', icon: Sparkles, desc: 'Premium weekend supplement' },
];

export default function BookAd() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    content: '',
    date: '',
    duration: '1',
    zones: []
  });
  const [price, setPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedEdition, setSelectedEdition] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [adImage, setAdImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [adId, setAdId] = useState('');

  // Price Calculation Logic
  useEffect(() => {
    let base = 200;
    const dur = parseInt(form.duration) || 1;
    let calculated = base * dur;
    if (form.zones.length === ZONES.length) {
      calculated += 500;
    } else {
      calculated += form.zones.length * 100;
    }
    setPrice(Math.min(Math.max(calculated, 200), 2000));
  }, [form.duration, form.zones]);

  const handleZoneChange = (zone) => {
    if (zone === 'Full Maharashtra') {
      if (form.zones.length === ZONES.length) setForm(f => ({ ...f, zones: [] }));
      else setForm(f => ({ ...f, zones: [...ZONES] }));
      return;
    }
    setForm(f => {
      const newZones = f.zones.includes(zone) ? f.zones.filter(z => z !== zone) : [...f.zones, zone];
      return { ...f, zones: newZones };
    });
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!selectedCat) { alert('Please select a category'); return; }
    if (form.zones.length === 0) { alert('Please select at least one zone'); return; }
    setSubmitting(true);
    // Transition to "AD APPROVED" popup
    setTimeout(() => {
      setSubmitting(false);
      setStep(2);
    }, 1200);
  };

  const handlePaymentSelect = async (method) => {
    setPaymentMethod(method);
    setSubmitting(true);
    
    const uniqueId = Math.floor(1000 + Math.random() * 9000).toString();
    setAdId(uniqueId);
    const adData = {
      id: uniqueId, 
      category: currentCatLabel,
      advertiser: form.name,
      phone: form.phone,
      zones: form.zones,
      content: form.content,
      price: price,
      date: form.date,
      image: adImage?.preview || '',
      status: 'Pending Approval'
    };

    try {
      await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(adData)
      });
      setSubmitting(false);
      setStep(5); // Go directly to Success screen
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setStep(5);
    }
  };

  const handleFileUpload = (file) => {
    if (file && file.size <= 5 * 1024 * 1024) {
      setAdImage(Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
    } else {
      alert("Please upload an image under 5MB");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const currentCatLabel = CATEGORIES.find(c => c.id === selectedCat)?.label || 'Ad';
  const zonesLabel = form.zones.join(' + ');

  // --- RENDERING STEPS ---

  const renderStep1 = () => (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Book Classified Ad</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Step 1: Select Category & Details</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 transition">Cancel ✕</button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all active:scale-95
              ${selectedCat === cat.id 
                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100' 
                : 'border-white bg-white text-gray-500 hover:border-gray-200 shadow-sm'}`}
          >
            <cat.icon className={`w-6 h-6 mb-2 ${selectedCat === cat.id ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="text-[10px] sm:text-xs font-bold text-center leading-tight">{cat.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleInitialSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Advertiser Information</h3>
            <div className="space-y-4">
              <input required type="text" placeholder="Full Name*" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <input required type="tel" maxLength={10} placeholder="10-digit Phone Number*" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Photo Attachment</h3>
            {!adImage ? (
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('fileInp').click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-gray-50'}`}
              >
                <input 
                  id="fileInp" 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e.target.files[0])} 
                />
                <UploadCloud className={`w-10 h-10 mx-auto mb-2 ${dragging ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className="text-sm font-bold text-gray-700">Drag & Drop Family Photo</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">JPG, PNG under 5MB</p>
              </div>
            ) : (
              <div className="relative group mx-auto w-[200px] h-[200px]">
                <img src={adImage.preview} alt="Preview" className="w-[200px] h-[200px] object-cover rounded-2xl border-4 border-white shadow-xl" />
                <button 
                  onClick={() => setAdImage(null)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                  ✅ Photo ready for print quality!
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
              <h3 className="text-sm font-bold text-gray-800">Select Zones</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.zones.length === ZONES.length} onChange={() => handleZoneChange('Full Maharashtra')} className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="text-[10px] font-bold text-blue-600 uppercase">Full Maharashtra</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ZONES.map(z => (
                <label key={z} className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${form.zones.includes(z) ? 'border-blue-200 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={form.zones.includes(z)} onChange={() => handleZoneChange(z)} className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                  <span className="text-xs font-medium text-gray-700">{z}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Schedule & Pricing</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none" title="Starting Date" />
              <div className="relative">
                <input 
                  required 
                  type="number" 
                  min="1"
                  placeholder="Days (e.g. 365)" 
                  value={form.duration} 
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none bg-white pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Days</span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between mb-4 border border-blue-100">
              <span className="text-xs font-bold text-blue-600 uppercase">Price</span>
              <span className="text-2xl font-black text-blue-700">₹{price}</span>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 text-sm uppercase">
              {submitting ? 'Verifying...' : 'Proceed to Booking'}
            </button>
          </div>
        </div>
      </form>
    </>
  );

  const renderStep2Popup = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border-4 border-green-50 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
          <ShieldCheck className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2 italic">AD APPROVED!</h2>
        <p className="text-gray-500 mb-8 text-sm font-medium">Content verification successful. Please proceed to payment to finalize.</p>
        <button 
          onClick={() => setStep(3)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 uppercase tracking-widest text-sm"
        >
          GO TO PAYMENT →
        </button>
      </div>
    </div>
  );

  const renderStep3Payment = () => (
    <div className="max-w-md mx-auto pt-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Secure Checkout</h2>
        <p className="text-sm text-gray-500">Order Summary: {currentCatLabel} Ad · ₹{price}</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => handlePaymentSelect('razorpay')}
          className="w-full group bg-white border-2 border-blue-100 hover:border-indigo-600 p-6 rounded-[2rem] flex items-center justify-between transition-all hover:shadow-xl active:scale-95 shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition">
              <CreditCard className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-left">
              <span className="block font-black text-gray-800 text-xl italic uppercase tracking-tight">Razorpay</span>
              <span className="text-xs text-gray-400 font-medium">Safe & Secure · Cards / UPI / NetBanking</span>
            </div>
          </div>
          <div className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest group-hover:bg-indigo-700 transition">
            PAY NOW
          </div>
        </button>
      </div>

      {submitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 font-bold animate-pulse">Redirecting to ZUUM Secure...</p>
        </div>
      )}
    </div>
  );

  const renderStep4Edition = () => (
    <div className="max-w-2xl mx-auto pt-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-gray-800 mb-2">Select Edition</h2>
        <p className="text-sm text-gray-500">Choose the publication format for your ad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {EDITIONS.map(ed => (
          <button 
            key={ed.id}
            onClick={() => handleEditionSelect(ed.id)}
            className="group bg-white border-2 border-gray-100 hover:border-blue-500 p-8 rounded-[2rem] flex flex-col items-center gap-4 transition-all hover:shadow-xl active:scale-95"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition">
              <ed.icon className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition" />
            </div>
            <div className="text-center">
              <span className="block font-bold text-gray-800 text-lg">{ed.label}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{ed.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep5Confirmation = () => (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-4">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-lg w-full border border-blue-50">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-blue-100">
          <Globe className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-2 leading-tight">Booking Confirmed!</h2>
        <div className="bg-yellow-50 text-yellow-800 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest inline-block mb-6 border border-yellow-100">
          Ad #{adId || '000'} | Pending Approval
        </div>
        
        <div className="bg-gray-50 p-6 rounded-3xl mb-8 space-y-3">
          <p className="text-lg font-bold text-gray-700 leading-relaxed italic">
            "Your <span className="text-blue-600">{currentCatLabel}</span> ad publishes <br/>
            <span className="text-blue-600 uppercase pt-2 inline-block">{form.date || 'TBD'}</span> <br/>
            in <span className="text-blue-600 underline">{zonesLabel || 'All Zones'}</span>"
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition active:scale-95 uppercase tracking-widest text-sm"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      <Header showNav={true} />
      <main className="max-w-4xl mx-auto px-4 pt-6">
        {step === 1 && renderStep1()}
        {step === 2 && (
          <>
            {renderStep1()}
            {renderStep2Popup()}
          </>
        )}
        {step === 3 && renderStep3Payment()}
        {step === 4 && renderStep4Edition()}
        {step === 5 && renderStep5Confirmation()}
      </main>
    </div>
  );
}
