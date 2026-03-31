import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ShieldCheck, Mail, Lock, UserCheck, ArrowRight, Smartphone } from 'lucide-react';

const ROLES = [
  { value: 'zone_coordinator', label: 'Regional Coordinator', badge: '🗺️', color: 'text-purple-600', bg: 'bg-purple-50' },
  { value: 'district_coordinator', label: 'District Coordinator', badge: '🏛️', color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'taluka_coordinator', label: 'Taluka Coordinator', badge: '🏛️', color: 'text-orange-600', bg: 'bg-orange-50' },
  { value: 'village_coordinator', label: 'Village Coordinator', badge: '🏘️', color: 'text-green-600', bg: 'bg-green-50' },
  { value: 'admin', label: 'Master Admin', badge: '👑', color: 'text-amber-600', bg: 'bg-amber-50' }
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, error, loading } = useAuth();
  const [role, setRole] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!role) {
      alert("Please select your designation portal first.");
      return;
    }

    // Frontend Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid official email address format.");
      return;
    }

    try {
      const result = await login({ email, password, role });
      if (result) {
        if (role === 'admin') navigate('/dashboard/admin');
        else if (role === 'village_coordinator') navigate('/dashboard/village');
        else if (role === 'taluka_coordinator') navigate('/dashboard/taluka');
        else if (role === 'district_coordinator') navigate('/dashboard/district');
        else if (role === 'zone_coordinator') navigate('/dashboard/zone');
        else navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login component error:", err);
    }
  };

  const currentRole = ROLES.find(r => r.value === role);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header showNav={false} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-white to-gray-50/50 overflow-y-auto">
        <div className="w-full max-w-xl bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden relative animate-in fade-in slide-in-from-bottom-6 duration-700 my-4">
          
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-navy/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="bg-navy p-8 md:p-14 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,183,1,1)_0%,transparent_80%)]"></div>
             <div className="w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-2xl backdrop-blur-sm group hover:scale-110 transition-transform">
                <ShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-steppergold" />
             </div>
             <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4 px-2">Reporter Portal</h2>
             <div className="flex items-center justify-center gap-3">
                <span className="h-[2px] w-5 md:w-10 bg-steppergold/30 rounded-full"></span>
                <p className="text-steppergold text-[8px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]">Coordination & Auth</p>
                <span className="h-[2px] w-5 md:w-10 bg-steppergold/30 rounded-full"></span>
             </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 md:p-14 space-y-8 md:space-y-12 relative text-left">
            
            {/* Identity Group */}
            <div className="relative group">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block px-2">1. Identity Alignment*</label>
               <div className="relative">
                  <select 
                    className="w-full pl-14 pr-12 py-5 bg-gray-50 border-2 border-transparent focus:border-navy focus:bg-white rounded-[1.5rem] outline-none font-bold text-sm text-gray-800 transition-all appearance-none cursor-pointer shadow-sm group-hover:shadow-md"
                    value={role} onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="" disabled>Select Your Designation...</option>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-xl bg-white shadow-sm ring-1 ring-gray-100">
                    {currentRole?.badge || '🔍'}
                  </div>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ArrowRight size={16} className="rotate-90" />
                  </div>
               </div>
            </div>

            {/* Auth Group */}
            <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block px-2">2. Secure Credentials</label>
                
                <div className="relative group/field">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-navy transition-colors">
                     <Mail size={18} />
                  </div>
                  <input type="email" required
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-navy focus:bg-white rounded-[1.5rem] outline-none transition-all text-sm font-black text-gray-800 tracking-tight"
                    placeholder="official@reporter.portal"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="relative group/field">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within/field:text-navy transition-colors">
                     <Lock size={18} />
                  </div>
                  <input type={showPwd ? 'text' : 'password'} required
                    className="w-full pl-16 pr-14 py-5 bg-gray-50 border-2 border-transparent focus:border-navy focus:bg-white rounded-[1.5rem] outline-none transition-all text-sm font-black text-gray-800 tracking-tight"
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-navy transition-colors">
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
            </div>

            {error && (
               <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center animate-shake border border-red-100">
                  {error}
               </div>
            )}

            <button type="submit" disabled={loading || !role}
              className={`w-full ${!role ? 'bg-gray-300' : 'bg-navy'} text-white h-16 md:h-24 rounded-[1.5rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[13px] hover:bg-black transition-all shadow-2xl shadow-navy/20 active:scale-[0.98] flex items-center justify-center gap-4 group overflow-hidden relative`}
            >
               <div className="absolute top-0 right-[-50%] w-[100%] h-full bg-white opacity-5 skew-x-[45deg] group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Verifying Gateway...
                </>
              ) : (
                <>
                  {role ? `Enter ${currentRole?.label} Portal` : 'Select Designation'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center space-y-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                  Each coordinator must use their own unique registered Email & Password. 
                  <span className="text-red-500 block">Generic or shared accounts are strictly prohibited.</span>
               </p>
               <button 
                 type="button"
                 onClick={() => navigate('/register')} 
                 className="w-full bg-white border-2 border-gray-200 text-gray-600 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-navy hover:text-navy transition-all shadow-sm flex items-center justify-center gap-2 group"
               >
                  <UserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Register New Coordinator Profile
               </button>
            </div>
          </form>
        </div>

        <div className="mt-16 text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
                 <span className="w-12 h-[1px] bg-gray-200"></span>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.8em]">Official Registry</p>
                 <span className="w-12 h-[1px] bg-gray-200"></span>
            </div>
            <p className="text-xs font-bold text-gray-400 max-w-sm mx-auto leading-relaxed">
              Proprietary technology developed for the BK Times News Network coordinator ecosystem. &copy; 2026
            </p>
        </div>
      </div>
    </div>
  );
}
