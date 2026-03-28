import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

const ZONES = [
  "Pune Zone", "Mumbai Zone", "Nashik Zone",
  "Nagpur Zone", "Amravati Zone", "Sambhaji Nagar Zone"
];

const DISTRICTS = {
  "Pune Zone": ["Pune Dist", "Solapur", "Satara", "Sangli", "Kolhapur"],
  "Mumbai Zone": ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad"],
  "Nashik Zone": ["Nashik", "Ahmednagar", "Jalgaon", "Dhule", "Nandurbar"],
  "Nagpur Zone": ["Nagpur", "Wardha", "Bhandara", "Gondia", "Chandrapur", "Gadchiroli"],
  "Amravati Zone": ["Amravati", "Akola", "Buldhana", "Washim", "Yavatmal"],
  "Sambhaji Nagar Zone": ["Sambhaji Nagar", "Jalna", "Beed", "Osmanabad", "Latur", "Nanded", "Parbhani", "Hingoli"]
};

const TALUKAS = {
  "Pune Dist": ["Haveli", "Khed", "Maval", "Mulshi", "Velhe", "Bhor", "Purandar", "Shirur"],
  "Solapur": ["North Solapur", "South Solapur", "Barshi", "Pandharpur", "Mangalvedhe"],
  "Satara": ["Satara", "Karad", "Wai", "Phaltan", "Mahabaleshwar"],
  "Nashik": ["Nashik City", "Niphad", "Sinnar", "Dindori", "Igatpuri", "Trimbakeshwar"],
  "Nagpur": ["Nagpur City", "Kamptee", "Hingna", "Butibori", "Ramtek"],
  "Thane": ["Kalyan", "Dombivli", "Bhiwandi", "Murbad", "Shahapur"],
  "Amravati": ["Amravati City", "Achalpur", "Chandur Bazar", "Morshi"],
  "Sambhaji Nagar": ["Aurangabad", "Kannad", "Paithan", "Gangapur"]
};

export default function TalukaSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    zone: '', district: '', taluka: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    setForm(f => {
      const updated = { ...f, [k]: v };
      if (k === 'zone') { updated.district = ''; updated.taluka = ''; }
      if (k === 'district') { updated.taluka = ''; }
      return updated;
    });
  };

  const districtOptions = DISTRICTS[form.zone] || [];
  const talukaOptions = TALUKAS[form.district] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/coordinators/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          role: 'taluka', zone: form.zone, district: form.district, taluka: form.taluka
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showNav={false} />

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">🏛️ Taluka Coordinator</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mt-1">Create New Account</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-center font-bold text-sm">
              ✅ Account Created! Redirecting to Login...
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-center text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Full Name *</label>
              <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium"
                placeholder="Eg: Rahul Deshmukh" />
            </div>

            {/* Zone */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Zone *</label>
              <div className="relative">
                <select required value={form.zone} onChange={e => set('zone', e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none text-sm font-bold text-gray-700">
                  <option value="">Select Zone ▼</option>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
              </div>
            </div>

            {/* District */}
            {form.zone && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">District *</label>
                <div className="relative">
                  <select required value={form.district} onChange={e => set('district', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none text-sm font-bold text-gray-700">
                    <option value="">Select District ▼</option>
                    {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            )}

            {/* Taluka */}
            {form.district && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Taluka *</label>
                <div className="relative">
                  <select required value={form.taluka} onChange={e => set('taluka', e.target.value)}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none text-sm font-bold text-gray-700">
                    <option value="">Select Taluka ▼</option>
                    {talukaOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Email ID *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium"
                placeholder="taluka@reporter.portal" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Password *</label>
              <div className="relative">
                <input required type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium pr-12"
                  placeholder="Min. 6 characters" />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                  onClick={() => setShowPwd(!showPwd)}>{showPwd ? '🙈' : '👁️'}</button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 px-1">Confirm Password *</label>
              <input required type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-medium"
                placeholder="Re-enter password" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-black text-xs py-5 rounded-2xl hover:bg-blue-700 transition active:scale-95 shadow-xl shadow-blue-200 uppercase tracking-[0.25em] flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : '✅ Create Taluka Coordinator Account'}
            </button>

            <div className="text-center pt-4 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
              </span>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] font-bold text-gray-400 tracking-wide">
            &copy; 2026 Reporter Portal &mdash; Pune HQ | MH-IND
          </p>
        </div>
      </div>
    </div>
  );
}
