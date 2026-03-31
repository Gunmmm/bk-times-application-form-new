import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PLANS = [
  { label: 'Basic Enrollment ₹500', value: 'Basic', amount: 500 },
  { label: 'Silver Enrollment ₹1,000', value: 'Silver', amount: 1000 },
  { label: 'Gold Enrollment ₹2,500', value: 'Gold', amount: 2500 },
  { label: 'Premium Enrollment ₹5,000', value: 'Premium', amount: 5000 },
];

const EDUCATION = [
  'Select', 'No Formal Education', 'Primary (1st-5th)', 'Middle (6th-8th)', 'Secondary (9th-10th)', 
  'Higher Secondary (11th-12th)', 'Diploma', 'Undergraduate - BA', 'Undergraduate - B.Com', 
  'Undergraduate - B.Sc', 'Undergraduate - BE/B.Tech', 'Undergraduate - BCA/BBA', 
  'Postgraduate - MA', 'Postgraduate - M.Com', 'Postgraduate - M.Sc', 'Postgraduate - ME/M.Tech', 
  'Postgraduate - MCA/MBA', 'Doctorate (PhD)', 'Professional Certification', 'Other'
];

const GENDERS = ['Select', 'Male', 'Female', 'Transgender', 'Other'];
const STATES = ['Maharashtra', 'Gujarat', 'Goa', 'Karnataka', 'Madhya Pradesh', 'Other'];

const F = ({ name, label, type='text', placeholder='', opts=null, value, onChange, error, ...rest }) => (
  <div style={{ marginBottom:'8px' }}>
    <label style={{ display:'block', fontSize:'10px', fontWeight:800, marginBottom:'2px', color:'#1e2d4d', textTransform:'uppercase' }}>
      {label} <span style={{ color:'#dc3545' }}>*</span>
    </label>
    {opts ? (
      <select
        value={value}
        onChange={e => onChange(name, e.target.value)}
        style={{ width:'100%', padding:'10px', border:`1px solid ${error?'#dc3545':'#e2e8f0'}`, borderRadius:'6px', fontSize:'12px', outline:'none', background:'#fff' }}
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{ width:'100%', padding:'10px', border:`1px solid ${error?'#dc3545':'#e2e8f0'}`, borderRadius:'6px', fontSize:'12px', outline:'none', minHeight:'60px', resize:'vertical' }}
      />
    ) : (
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        style={{ width:'100%', padding:'10px', border:`1px solid ${error?'#dc3545':'#e2e8f0'}`, borderRadius:'6px', fontSize:'12px', outline:'none' }}
        {...rest}
      />
    )}
    {error && <p style={{ fontSize:'9px', color:'#dc3545', marginTop:'2px' }}>{error}</p>}
  </div>
);

export default function UnifiedRegistration({ role, onComplete }) {
  const { token, user } = useAuth();
  const [step, setStep] = useState('form'); // form, payment, success
  const [vendorId] = useState(() => `BKT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  
  const [form, setForm] = useState({
    fullName:'', phone:'', gender:'Select', education:'Select', day:'', month:'', year:'',
    address:'', state:'Maharashtra', district:'', taluka:'', village:'', pinCode:'',
    plan: 'Select'
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSub] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = '10 digits';
    if (form.gender === 'Select') e.gender = 'Required';
    if (form.education === 'Select') e.education = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.district) e.district = 'Required';
    if (!form.taluka) e.taluka = 'Required';
    if (form.plan === 'Select') e.plan = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validate()) setStep('payment');
  };

  const submit = async () => {
    setSub(true);
    const planObj = PLANS.find(p => p.label === form.plan || p.value === form.plan);
    try {
      const res = await fetch('http://localhost:5000/api/master-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          role, // e.g. District Reporter
          subscriptionPlan: form.plan,
          paymentAmount: planObj?.amount || 0,
          vendorId
        }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
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
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
        <div style={{ padding: '24px', background: '#1e2d4d', borderRadius: '16px', color: '#fff', borderTop: '4px solid #C5A059', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#C5A059' }}>Payment Portal</h2>
          <p style={{ fontSize: '12px', opacity: 0.8, color: '#fff' }}>Role: {role}</p>
          <div style={{ margin: '15px 0', fontSize: '24px', fontWeight: 900 }}>₹{planObj?.amount || 0}</div>
        </div>
        <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
          <button style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#C5A059' }}>★</span> PhonePe / G-Pay
          </button>
          <button style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#C5A059' }}>★</span> Credit / Debit Card
          </button>
        </div>
        <button onClick={submit} disabled={submitting} style={{ width: '100%', padding: '16px', background: '#C5A059', color: '#1e2d4d', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900, cursor: 'pointer' }}>
          {submitting ? 'Authenticating...' : 'Secure Pay & Enroll'}
        </button>
        <button onClick={() => setStep('form')} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#64748b', fontSize: '11px', cursor: 'pointer' }}>← Review Application</button>
      </div>
    );
  }

  if (step === 'success') {
    const planObj = PLANS.find(p => p.label === form.plan || p.value === form.plan);
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
        <div style={{ width: '60px', height: '60px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <span style={{ fontSize: '24px', color: '#22c55e' }}>✓</span>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1e2d4d' }}>Enrollment Successful</h2>
        <div style={{ textAlign: 'left', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '20px 0', fontSize: '11px', lineHeight: '1.6' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #ccc', paddingBottom: '8px', marginBottom: '8px', fontSize: '12px', fontWeight: 800 }}>TRANSACTION SLIP</div>
          <p><strong>Vendor ID:</strong> {vendorId}</p>
          <p><strong>Collector:</strong> {user?.fullName || user?.name || 'Authorized Coordinator'}</p>
          <p><strong>Applicant:</strong> {form.fullName}</p>
          <p><strong>Role:</strong> {role}</p>
          <p><strong>Location:</strong> {form.district}, {form.state}</p>
          <p style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', fontWeight: 900, fontSize: '12px' }}><strong>Amount Paid:</strong> ₹{planObj?.amount || 0}</p>
        </div>
        <button onClick={onComplete} style={{ width: '100%', padding: '14px', background: '#1e2d4d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800 }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '15px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#1e2d4d', textAlign: 'center', marginBottom: '15px', textTransform: 'uppercase' }}>{role} Registration</h2>
      
      <form onSubmit={handleNext}>
        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <p style={{ fontSize: '9px', fontWeight: 900, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Personal Information</p>
          <F name="fullName" label="Full Name" placeholder="Full Name" value={form.fullName} onChange={set} error={errors.fullName} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}><F name="phone" label="Phone" placeholder="10 Digits" maxLength={10} value={form.phone} onChange={set} error={errors.phone} /></div>
            <div style={{ flex: 1 }}><F name="gender" label="Gender" opts={GENDERS} value={form.gender} onChange={set} error={errors.gender} /></div>
          </div>
          <F name="education" label="Education" opts={EDUCATION} value={form.education} onChange={set} error={errors.education} />
          
          <label style={{ display:'block', fontSize:'10px', fontWeight:800, marginBottom:'2px', color:'#1e2d4d', textTransform:'uppercase' }}>Full Birthday *</label>
          <div style={{ display: 'flex', gap: '6px' }}>
             <input placeholder="DD" value={form.day} onChange={e=>set('day', e.target.value)} style={{ width:'50px', padding:'10px', border:'1px solid #e2e8f0', borderRadius:'6px', textAlign:'center', fontSize:'12px' }} />
             <input placeholder="MM" value={form.month} onChange={e=>set('month', e.target.value)} style={{ width:'50px', padding:'10px', border:'1px solid #e2e8f0', borderRadius:'6px', textAlign:'center', fontSize:'12px' }} />
             <input placeholder="YYYY" value={form.year} onChange={e=>set('year', e.target.value)} style={{ width:'80px', padding:'10px', border:'1px solid #e2e8f0', borderRadius:'6px', textAlign:'center', fontSize:'12px' }} />
          </div>
        </div>

        <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
          <p style={{ fontSize: '9px', fontWeight: 900, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase' }}>Address Details</p>
          <F name="address" label="Full Address" type="textarea" placeholder="Complete address details..." value={form.address} onChange={set} error={errors.address} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}><F name="state" label="State" opts={STATES} value={form.state} onChange={set} error={errors.state} /></div>
            <div style={{ flex: 1 }}><F name="district" label="District" value={form.district} onChange={set} error={errors.district} placeholder="Enter District" /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}><F name="taluka" label="Taluka" value={form.taluka} onChange={set} error={errors.taluka} placeholder="Enter Taluka" /></div>
            <div style={{ flex: 1 }}><F name="village" label="Village" value={form.village} onChange={set} placeholder="Enter Village" /></div>
          </div>
          <F name="pinCode" label="Pincode" placeholder="6 Digits" maxLength={6} value={form.pinCode} onChange={set} error={errors.pinCode} />
        </div>

        <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '12px', marginBottom: '15px' }}>
          <label style={{ display:'block', fontSize:'10px', fontWeight:800, marginBottom:'2px', color:'#1e2d4d', textTransform:'uppercase' }}>Subscription Plan *</label>
          <select 
            value={form.plan} 
            onChange={e=>set('plan', e.target.value)}
            style={{ width:'100%', padding:'12px', border:'1px solid #2563eb', borderRadius:'8px', fontSize:'13px', fontWeight:700, color:'#1e2d4d' }}
          >
            <option>Select</option>
            {PLANS.map(p => <option key={p.value} value={p.label}>{p.label}</option>)}
          </select>
        </div>

        {errors.submit && <p style={{ color:'#dc3545', fontSize:'10px', textAlign:'center', marginBottom:'10px' }}>{errors.submit}</p>}

        <button type="submit" style={{ width:'100%', padding:'14px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'10px', fontWeight:900, cursor:'pointer' }}>
          Proceed to Payment
        </button>
      </form>
    </div>
  );
}
