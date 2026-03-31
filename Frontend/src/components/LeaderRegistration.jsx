import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PLANS = [
  { label: 'Basic Enrollment ₹500', value: 'Basic', amount: 500 },
  { label: 'Silver Enrollment ₹1,000', value: 'Silver', amount: 1000 },
  { label: 'Gold Enrollment ₹2,500', value: 'Gold', amount: 2500 }
];

const EDUCATION = [
  'Select', 'No Formal Education', 'Primary (1st-5th)', 'Middle (6th-8th)', 'Secondary (9th-10th)', 
  'Higher Secondary (11th-12th)', 'Diploma', 'Undergraduate - BA', 'Undergraduate - B.Com', 
  'Undergraduate - B.Sc', 'Undergraduate - BE/B.Tech', 'Undergraduate - BCA/BBA', 
  'Postgraduate - MA', 'Postgraduate - M.Com', 'Postgraduate - M.Sc', 'Postgraduate - ME/M.Tech', 
  'Postgraduate - MCA/MBA', 'Doctorate (PhD)', 'Professional Certification', 'Other'
];

const GENDERS = ['Select', 'Male', 'Female', 'Transgender', 'Other'];

const STATES = ['Select State', 'Maharashtra', 'Gujarat', 'Goa', 'Karnataka', 'Madhya Pradesh', 'Other'];

const MAHARASHTRA_DISTRICTS = [
  'Select District', 'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana', 
  'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 
  'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhurdurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

const NASHIK_TALUKAS = ['Select Taluka', 'Nashik', 'Sinnar', 'Igatpuri', 'Trimbakeshwar', 'Niphad', 'Yeola', 'Chandwad', 'Kalwan', 'Nandgaon', 'Malegaon', 'Baglan', 'Surgana', 'Peint', 'Deola'];
const PUNE_TALUKAS = ['Select Taluka', 'Pune City', 'Haveli', 'Khed', 'Ambegaon', 'Junnar', 'Shirur', 'Daund', 'Indapur', 'Baramati', 'Purandar', 'Bhor', 'Velhe', 'Mulshi', 'Maval'];
const MUMBAI_TALUKAS = ['Select Taluka', 'Mumbai City', 'Borivali', 'Andheri', 'Kurla'];

function getTalukas(district) {
  if (!district || district === 'Select District') return ['Select Taluka'];
  const d = district.toLowerCase();
  if (d.includes('nashik')) return NASHIK_TALUKAS;
  if (d.includes('pune')) return PUNE_TALUKAS;
  if (d.includes('mumbai')) return MUMBAI_TALUKAS;
  return ['Select Taluka', 'Main Taluka', 'Other'];
}

function validate(form) {
  const e = {};
  if (!form.fullName?.trim()) e.fullName = 'Required';
  if (!/^\d{1,2}$/.test(form.day)) e.birthday = 'Check Day';
  if (!/^\d{1,2}$/.test(form.month)) e.birthday = 'Check Month';
  if (!/^\d{4}$/.test(form.year)) e.birthday = 'Check Year';
  if (!form.gender || form.gender === 'Select') e.gender = 'Required';
  if (!form.education || form.education === 'Select') e.education = 'Required';
  if (!/^\d{10}$/.test(form.phone)) e.phone = '10 digits';
  if (!form.street?.trim()) e.street = 'Required';
  if (!form.district?.trim()) e.district = 'Required';
  if (!form.state?.trim()) e.state = 'Required';
  if (!/^\d{6}$/.test(form.pin)) e.pin = '6 digits';
  if (!form.plan || form.plan === 'Select') e.plan = 'Required';
  return e;
}

const F = ({ name, label, type='text', placeholder='', opts=null, optional=false, value, onChange, error, ...rest }) => (
  <div style={{ marginBottom:'8px' }}>
    <label style={{ display:'block', fontSize:'12px', fontWeight:700, marginBottom:'2px', color:'#555', textTransform:'uppercase' }}>
      {label}{!optional && <span style={{ color:'#dc3545' }}> *</span>}
    </label>
    {opts ? (
      <select
        value={value}
        onChange={e => onChange(name, e.target.value)}
        style={{ width:'100%', padding:'12px', border:`1px solid ${error?'#dc3545':'#e2e8f0'}`, borderRadius:'8px', fontSize:'13px', outline:'none', background:'#fff' }}
        {...rest}
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{ width:'100%', padding:'12px', border:`1px solid ${error?'#dc3545':'#e2e8f0'}`, borderRadius:'8px', fontSize:'13px', outline:'none', minHeight:'100px', resize:'vertical' }}
        {...rest}
      />
    ) : (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{ width:'100%', padding:'12px', border:`1px solid ${error?'#dc3545':'#e2e8f0'}`, borderRadius:'8px', fontSize:'13px', outline:'none' }}
        {...rest}
      />
    )}
    {error && <p style={{ fontSize:'10px', color:'#dc3545', marginTop:'2px', fontStyle:'italic' }}>{error}</p>}
  </div>
);

export default function LeaderRegistration({ onComplete, leaderType = 'Village' }) {
  const { token, user } = useAuth();
  const [step, setStep] = useState('form');
  const [vendorId] = useState(() => `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const [form, setForm] = useState({
    fullName: '', day: '', month: '', year: '', gender: 'Select', education: 'Select',
    phone: '', email: '', street: '', village: '', district: 'Select District', taluka: 'Select Taluka',
    state: 'Maharashtra', pin: '', plan: 'Select'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSub] = useState(false);

  const set = (k, v) => {
    if (['phone', 'pin', 'day', 'month', 'year'].includes(k)) {
      const nums = v.replace(/\D/g, '');
      setForm(f => ({ ...f, [k]: nums }));
    } else {
      setForm(f => ({ ...f, [k]: v }));
    }
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const handleNextToPayment = (ev) => {
    ev.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep('payment');
  };

  const submit = async () => {
    setSub(true);
    const planObj = PLANS.find(p => p.label === form.plan || p.value === form.plan);
    const payload = {
      name: form.fullName,
      mobile: form.phone,
      gender: form.gender,
      education: form.education || 'Other',
      address: form.street,
      village: form.village,
      taluka: form.taluka,
      district: form.district,
      state: form.state,
      pinCode: form.pin || '000000',
      applying_for: leaderType?.toLowerCase().includes('district') ? 'district_coordinator' : (leaderType?.toLowerCase().includes('taluka') ? 'taluka_coordinator' : 'reporter'),
      metadata: { ...form, plan: form.plan },
      subscriptionPlan: planObj?.label || form.plan,
      paymentAmount: planObj?.amount || 500,
      registeredBy: user?.name || 'Local Admin',
      vendorId: vendorId
    };

    try {
      const res = await fetch('/api/reporters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Submission Failed');
      setStep('success');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSub(false);
    }
  };

  if (step === 'payment') {
    const planObj = PLANS.find(p => p.label === form.plan || p.value === form.plan);
    return (
      <div style={{ padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '20px' }}>
        <div style={{ marginBottom: '25px' }}>
          <div style={{ width: '60px', height: '60px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <span style={{ fontSize: '24px' }}>💳</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Secure Payment</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Confirm your enrollment fee: ₹{planObj?.amount || 500}</p>
        </div>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '25px' }}>
          <button style={{ padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textAlign: 'left' }}>⚛️ UPI / Google Pay</button>
          <button style={{ padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 700, textAlign: 'left' }}>📱 QR Code Scan</button>
        </div>
        <button onClick={submit} disabled={submitting} style={{ width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>
          {submitting ? 'Verifying...' : 'Pay & Complete'}
        </button>
        <button onClick={() => setStep('form')} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={{ padding: '30px', textAlign: 'center', background: '#fff', borderRadius: '20px' }}>
        <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: '24px', color: '#22c55e' }}>✓</span>
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#065f46' }}>Registration Successful!</h2>
        <div style={{ textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px 0', fontSize: '12px', fontFamily: 'monospace' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '10px', marginBottom: '10px', fontSize: '14px', fontWeight: 800 }}>PAYMENT RECEIPT</div>
          <p><strong>Vendor ID:</strong> {vendorId}</p>
          <p><strong>Collector:</strong> {user?.name || 'Local Admin'}</p>
          <p><strong>Coordinator:</strong> {form.fullName}</p>
          <p><strong>Role:</strong> {leaderType} Reporter</p>
          <p><strong>District:</strong> {form.district}</p>
          <p><strong>Plan:</strong> {form.plan}</p>
          <p style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', fontWeight: 900, fontSize: '14px' }}><strong>Paid Amount:</strong> ₹{PLANS.find(p => p.label === form.plan || p.value === form.plan)?.amount || 500}</p>
        </div>
        <button onClick={onComplete} style={{ width: '100%', padding: '14px', background: '#065f46', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800 }}>Confirm & Close</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '20px', maxWidth: '420px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {leaderType} Reporter Registration
        </h2>
      </div>

      <form onSubmit={handleNextToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Personal Information</p>
          <F name="fullName" label="Full Name" placeholder="Full Name" value={form.fullName} onChange={set} error={errors.fullName} />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <F name="phone" label="Phone" placeholder="10 Digits" maxLength={10} type="tel" value={form.phone} onChange={set} error={errors.phone} />
            </div>
            <div style={{ flex: 1 }}>
              <F name="gender" label="Gender" value={form.gender} onChange={set} error={errors.gender} opts={GENDERS} />
            </div>
          </div>

          <F name="education" label="Education" value={form.education} onChange={set} error={errors.education} opts={EDUCATION} />

          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '2px', color: '#555', textTransform: 'uppercase' }}>Full Birthday *</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="tel" maxLength={2} placeholder="DD" value={form.day} onChange={e => set('day', e.target.value)} style={{ width: '70px', padding: '12px', border: `1px solid ${errors.birthday ? '#dc3545' : '#e2e8f0'}`, borderRadius: '8px', textAlign: 'center' }} />
              <input type="tel" maxLength={2} placeholder="MM" value={form.month} onChange={e => set('month', e.target.value)} style={{ width: '70px', padding: '12px', border: `1px solid ${errors.birthday ? '#dc3545' : '#e2e8f0'}`, borderRadius: '8px', textAlign: 'center' }} />
              <input type="tel" maxLength={4} placeholder="YYYY" value={form.year} onChange={e => set('year', e.target.value)} style={{ width: '120px', padding: '12px', border: `1px solid ${errors.birthday ? '#dc3545' : '#e2e8f0'}`, borderRadius: '8px', textAlign: 'center' }} />
            </div>
          </div>
        </div>

        <div style={{ margin: '16px 0', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Address Details</p>
          <F name="street" label="Full Address" type="textarea" placeholder="Complete address details..." value={form.street} onChange={set} error={errors.street} />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}><F name="state" label="State" value={form.state} onChange={set} error={errors.state} opts={STATES} /></div>
            <div style={{ flex: 1 }}><F name="district" label="District" value={form.district} onChange={set} error={errors.district} opts={MAHARASHTRA_DISTRICTS} /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}><F name="taluka" label="Taluka" value={form.taluka} onChange={set} error={errors.taluka} opts={getTalukas(form.district)} /></div>
            <div style={{ flex: 1 }}><F name="village" label="Village" value={form.village} onChange={set} placeholder="Enter Village" /></div>
          </div>
          <F name="pin" label="Pincode" placeholder="6 Digits" maxLength={6} type="tel" value={form.pin} onChange={set} error={errors.pin} />
        </div>

        <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px' }}>
          <F name="plan" label="Enrollment Plan" value={form.plan} onChange={set} error={errors.plan} opts={['Select', ...PLANS.map(p => p.label)]} />
        </div>

        <button type="submit" disabled={submitting} style={{ marginTop: '12px', width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900 }}>
          {submitting ? 'Please wait...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}
