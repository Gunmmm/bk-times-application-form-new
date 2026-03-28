import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PLANS = [
  { label: '1 Year Plan ₹1,000', value: '1 Year', amount: 1000 },
  { label: '2 Year Plan ₹1,800', value: '2 Year', amount: 1800 },
  { label: '3 Year Plan ₹2,600', value: '3 Year', amount: 2600 },
];

const EDUCATION = [
  'Select', 'Pre-Primary', 'Primary', 'Secondary', 'Higher Secondary', 'Undergraduate', 'Postgraduate', 'Other'
];

const GENDERS = ['Select', 'Male', 'Female', 'Other'];

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
  if (!form.taluka?.trim()) e.taluka = 'Required';
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

export default function ReaderRegistration({ onComplete, initialData }) {
  const { token } = useAuth();
  const isEdit = !!initialData?._id;

  const [form, setForm] = useState(() => {
    if (isEdit && initialData.personal) {
      const p = initialData.personal;
      let d='', m='', y='';
      if (p.birthday) {
        const bd = new Date(p.birthday);
        d = bd.getDate().toString();
        m = (bd.getMonth() + 1).toString();
        y = bd.getFullYear().toString();
      }
      return {
        fullName: p.fullName || '', day: d, month: m, year: y,
        gender: p.gender || 'Select', education: p.education || 'Select',
        phone: p.phone || '', email: p.email || '', street: p.street || '',
        village: p.village || '', district: p.district || '', taluka: p.taluka || '',
        city: p.city || '', state: p.state || '', pin: p.pincode || '',
        plan: p.plan || 'Select'
      };
    }
    return {
      fullName:'', day: '', month: '', year: '', gender:'Select', education:'Select',
      phone:'', email:'', street:'', village:'', district:'', taluka:'', city:'', state:'', pin:'', plan:'Select'
    };
  });

  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (k, v) => {
    if (['phone', 'pin', 'day', 'month', 'year'].includes(k)) {
      const nums = v.replace(/\D/g, '');
      setForm(f => ({ ...f, [k]: nums }));
    } else {
      setForm(f => ({ ...f, [k]: v }));
    }
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSub(true);
    
    const planObj = PLANS.find(p => p.label === form.plan || p.value === form.plan);
    const formattedDate = `${form.year}-${form.month.padStart(2,'0')}-${form.day.padStart(2,'0')}`;
    
    const payload = {
      personal: {
        fullName: form.fullName, phone: form.phone, email: form.email || '',
        birthday: formattedDate, birthYear: form.year, gender: form.gender, 
        education: form.education, street: form.street, village: form.village || '', 
        district: form.district, taluka: form.taluka || '', city: form.city || '', 
        state: form.state, pincode: form.pin, plan: planObj?.label || form.plan,
      },
      amount: planObj?.amount || 1000,
    };

    try {
      const url = isEdit ? `/api/readers/${initialData._id}` : '/api/readers/register';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Server Error');
      }
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onComplete?.(); }, 1500);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally { setSub(false); }
  };

  if (success)
    return (
      <div style={{ background:'#fff', padding:'40px 20px', textAlign:'center' }}>
        <div style={{ fontSize:'48px' }}>✅</div>
        <p style={{ fontWeight:700, color:'#2563eb', marginTop:'12px', fontSize:'18px' }}>
          {isEdit ? 'Details Updated!' : 'Registration Complete!'}
        </p>
        <p style={{ fontSize:'12px', color:'#94a3b8', marginTop:'4px' }}>Updating Dashboard Stats...</p>
      </div>
    );

  return (
    <div style={{ background:'#fff', padding:'20px', paddingBottom:'60px', maxWidth:'380px', margin:'0 auto', fontFamily:'Initial, sans-serif' }}>
      <h2 style={{ fontSize:'14px', fontWeight:800, marginBottom:'16px', color:'#1e293b', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.05em' }}>
        {isEdit ? 'Edit Record' : 'Create New Registration'}
      </h2>
      <form onSubmit={submit} noValidate style={{ overflow:'visible' }}>
        <F name="fullName" label="Full Name" placeholder="Eg: Anil Sharma" value={form.fullName} onChange={set} error={errors.fullName} />
        
        <div style={{ marginBottom:'12px' }}>
           <label style={{ display:'block', fontSize:'12px', fontWeight:700, marginBottom:'2px', color:'#555', textTransform:'uppercase' }}>Full Birthday *</label>
           <div style={{ display:'flex', gap:'6px' }}>
               <input type="tel" maxLength={2} placeholder="DD" value={form.day} onChange={e => set('day', e.target.value)} style={{ width:'70px', padding:'12px', border:`1px solid ${errors.birthday?'#dc3545':'#e2e8f0'}`, borderRadius:'8px', textAlign:'center', boxSizing:'border-box' }} />
               <input type="tel" maxLength={2} placeholder="MM" value={form.month} onChange={e => set('month', e.target.value)} style={{ width:'70px', padding:'12px', border:`1px solid ${errors.birthday?'#dc3545':'#e2e8f0'}`, borderRadius:'8px', textAlign:'center', boxSizing:'border-box' }} />
               <input type="tel" maxLength={4} placeholder="YYYY" value={form.year} onChange={e => set('year', e.target.value)} style={{ width:'120px', padding:'12px', border:`1px solid ${errors.birthday?'#dc3545':'#e2e8f0'}`, borderRadius:'8px', textAlign:'center', boxSizing:'border-box' }} />
           </div>
           {errors.birthday && <p style={{ fontSize:'11px', color:'#dc3545', marginTop:'2px' }}>{errors.birthday}</p>}
        </div>

        <F name="gender" label="Gender" opts={GENDERS} value={form.gender} onChange={set} error={errors.gender} />
        <F name="education" label="Education" opts={EDUCATION} value={form.education} onChange={set} error={errors.education} />
        <F name="phone" label="Mobile Number" type="tel" placeholder="10 Digits" maxLength={10} value={form.phone} onChange={set} error={errors.phone} />

        <div style={{ margin:'16px 0', padding:'16px', background:'#f8fafc', borderRadius:'12px', border:'1px solid #f1f5f9' }}>
          <p style={{ fontSize:'10px', fontWeight:800, color:'#64748b', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Address Details</p>
          <F name="street" label="Street/Flat" placeholder="Local address" value={form.street} onChange={set} error={errors.street} />
          <F name="village" label="Village/Area" placeholder="Optional" optional value={form.village} onChange={set} error={errors.village} />
          <div style={{ display:'flex', gap:'8px' }}>
            <div style={{ flex:1 }}><F name="taluka" label="Taluka" placeholder="Eg: Nashik" value={form.taluka} onChange={set} error={errors.taluka} /></div>
            <div style={{ flex:1 }}><F name="district" label="District" placeholder="Nashik" value={form.district} onChange={set} error={errors.district} /></div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <div style={{ flex:1 }}><F name="city" label="City" placeholder="Optional" optional value={form.city} onChange={set} error={errors.city} /></div>
            <div style={{ flex:1 }}><F name="state" label="State" placeholder="Maharashtra" value={form.state} onChange={set} error={errors.state} /></div>
          </div>
          <F name="pin" label="Pincode" placeholder="6 Digits" maxLength={6} type="tel" value={form.pin} onChange={set} error={errors.pin} />
        </div>

        <F name="plan" label="Select Plan" opts={['Select', ...PLANS.map(p => p.label)]} value={form.plan} onChange={set} error={errors.plan} />

        {errors.submit && <div style={{ background:'#fef2f2', border:'1px solid #fee2e2', color:'#b91c1c', padding:'10px', borderRadius:'8px', fontSize:'11px', marginBottom:'12px', textAlign:'center' }}>{errors.submit}</div>}

        <button
          type="submit"
          disabled={submitting}
          style={{ width:'100%', padding:'14px', background: submitting ? '#94a3b8' : '#2563eb', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:'pointer', marginTop:'4px', transition:'all 0.2s' }}
        >
          {submitting ? 'Verifying...' : isEdit ? 'Update Details' : 'Register & Pay'}
        </button>
      </form>
    </div>
  );
}
