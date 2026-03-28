import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const HIERARCHY_ROLES = ['Village reporter', 'Taluka reporter', 'District reporter', 'Other'];
const COUNT_OPTS = ['0', '1', '2', '3', '4', '5+'];

const Section = ({ title, children, isBlue = true }) => (
  <div style={{ 
    margin: '16px 0', 
    padding: '20px', 
    background: isBlue ? '#f0f7ff' : '#fff', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  }}>
    <h3 style={{ 
      fontSize: '12px', 
      fontWeight: 900, 
      color: '#1e40af', 
      marginBottom: '16px', 
      textTransform: 'uppercase', 
      letterSpacing: '0.1em',
      borderBottom: '1px solid #dbeafe',
      paddingBottom: '8px'
    }}>{title}</h3>
    {children}
  </div>
);

const Field = ({ label, helper, children, error }) => (
  <div style={{ marginBottom: '12px' }}>
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>{label} *</label>
    {children}
    {helper && <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>{helper}</p>}
    {error && <p style={{ fontSize: '10px', color: '#dc3545', marginTop: '4px' }}>{error}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', error, ...rest }) => (
  <input
    type={type}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    style={{ 
      width: '100%', 
      padding: '12px', 
      border: `1px solid ${error ? '#dc3545' : '#e2e8f0'}`, 
      borderRadius: '10px', 
      fontSize: '13px', 
      outline: 'none',
      background: '#fff',
      boxSizing: 'border-box'
    }}
    {...rest}
  />
);

const Select = ({ value, onChange, opts, error }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ 
      width: '100%', 
      padding: '12px', 
      border: `1px solid ${error ? '#dc3545' : '#e2e8f0'}`, 
      borderRadius: '10px', 
      fontSize: '13px', 
      outline: 'none',
      background: '#fff',
      appearance: 'none',
      boxSizing: 'border-box'
    }}
  >
    <option value="">Select</option>
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

export default function LeaderRegistration({ onComplete, leaderType = 'Village' }) {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    // Leader Core
    leaderName: '', phone: '', email: '', birthday: '', gender: 'Male', village: '',
    totalLeaders: '1',
    reportersInVillage: '0',
    reportersRegisteringVillages: '0',
    // Taluka Section
    talukaLeaderName: '', talukaLeaderPhone: '', talukaLeaderEmail: '', talukaName: user?.taluka || '',
    // Reporter Section
    repName: '', repPhone: '', repEmail: '', repVillage: '', repType: 'Village reporter', repOther: '',
    repDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameRegex.test(form.leaderName)) e.leaderName = "Full Name: Min 2 chars, letters only";
    if (!phoneRegex.test(form.phone)) e.phone = "Phone: 10 digits starting with 6-9";
    if (form.email && !emailRegex.test(form.email)) e.email = "Invalid email format";
    if (!form.village) e.village = "Village cannot be empty";
    if (!form.talukaName) e.talukaName = "Taluka cannot be empty";

    if (form.totalLeaders !== '0') {
        if (!nameRegex.test(form.repName)) e.repName = "Reporter Name required";
        if (!phoneRegex.test(form.repPhone)) e.repPhone = "Reporter Phone required";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/readers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
           personal: { 
             fullName: form.leaderName, 
             phone: form.phone, 
             email: form.email, 
             village: form.village,
             taluka: form.talukaName,
             district: user?.district || 'Pune',
             state: 'Maharashtra',
             pincode: '000000',
             birthday: form.birthday || new Date(),
             gender: form.gender,
             education: 'Other',
             plan: 'Leader Plan',
             metadata: form // Store everything expanded in metadata
           },
           amount: 0
        })
      });
      if (!res.ok) throw new Error('Submission failed');
      onComplete();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '10px', maxWidth: '420px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {leaderType} Reporter Registration
        </h2>
        { (user?.role?.includes('coordinator') || user?.role === 'taluka' || user?.role === 'district') && (
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginTop: '4px' }}>
            Filled by {user.role.includes('district') ? 'District' : 'Taluka'} Reporter ({user.role.includes('district') ? 'District' : 'Taluka'}: {user.district || user.taluka})
          </p>
        )}
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        <Section title={`${leaderType} Reporter Information`} isBlue={false}>
          <Field label="Full Name" error={errors.leaderName}>
            <Input value={form.leaderName} onChange={v => setForm({ ...form, leaderName: v })} placeholder="Eg: Rajesh Patil" />
          </Field>
          <div style={{ display: 'flex', gap: '8px' }}>
             <div style={{ flex: 1 }}>
               <Field label="Phone Number" error={errors.phone}>
                 <Input value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="10 Digits" maxLength={10} />
               </Field>
             </div>
             <div style={{ flex: 1 }}>
               <Field label="Email ID" error={errors.email}>
                 <Input value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="optional@mail.com" />
               </Field>
             </div>
          </div>
          <Field label="Village Name" error={errors.village}>
            <Input value={form.village} onChange={v => setForm({ ...form, village: v })} placeholder="Enter village" />
          </Field>
          
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
            <Field label="Total Reporters in Group" helper="Current active reporters in this village">
                <Select value={form.totalLeaders} onChange={v => setForm({ ...form, totalLeaders: v })} opts={COUNT_OPTS} />
            </Field>

            <Field label="Reporters registered in this village?" helper="Select estimated number of reporters already registered in this village.">
                <Select value={form.reportersInVillage} onChange={v => setForm({ ...form, reportersInVillage: v })} opts={COUNT_OPTS} />
            </Field>

            <Field label="Reporters registering villages?" helper="Select estimated number of reporters who are currently registering villages.">
                <Select value={form.reportersRegisteringVillages} onChange={v => setForm({ ...form, reportersRegisteringVillages: v })} opts={COUNT_OPTS} />
            </Field>
          </div>
        </Section>

        <Section title={`${user?.role?.includes('district') ? 'District' : 'Taluka'} Reporter Registration Details`}>
           <Field label={`${user?.role?.includes('district') ? 'District' : 'Taluka'} Reporter Name`}>
             <Input value={form.talukaLeaderName} onChange={v => setForm({ ...form, talukaLeaderName: v })} placeholder="Name" />
           </Field>
           <div style={{ display: 'flex', gap: '8px' }}>
             <div style={{ flex: 1 }}>
               <Field label="Reporter Phone">
                 <Input value={form.talukaLeaderPhone} onChange={v => setForm({ ...form, talukaLeaderPhone: v })} placeholder="Phone" />
               </Field>
             </div>
             <div style={{ flex: 1 }}>
               <Field label="Reporter Email">
                 <Input value={form.talukaLeaderEmail} onChange={v => setForm({ ...form, talukaLeaderEmail: v })} placeholder="Email" />
               </Field>
             </div>
           </div>
           <Field label="Taluka" error={errors.talukaName}>
             <Input value={form.talukaName} onChange={v => setForm({ ...form, talukaName: v })} readOnly />
           </Field>
        </Section>

        {form.totalLeaders !== '0' && (
          <Section title="Reporter is Village Reporter Register">
            <Field label="Reporter Full Name" error={errors.repName}>
              <Input value={form.repName} onChange={v => setForm({ ...form, repName: v })} placeholder="Name" />
            </Field>
            <div style={{ display: 'flex', gap: '8px' }}>
               <div style={{ flex: 1 }}>
                 <Field label="Phone" error={errors.repPhone}>
                   <Input value={form.repPhone} onChange={v => setForm({ ...form, repPhone: v })} placeholder="Phone" maxLength={10} />
                 </Field>
               </div>
               <div style={{ flex: 1 }}>
                 <Field label="Email">
                   <Input value={form.repEmail} onChange={v => setForm({ ...form, repEmail: v })} placeholder="Email" />
                 </Field>
               </div>
            </div>
            <Field label="Reporter Village">
              <Input value={form.repVillage} onChange={v => setForm({ ...form, repVillage: v })} placeholder="Village" />
            </Field>
            <Field label="Type of Reporter">
              <Select value={form.repType} onChange={v => setForm({ ...form, repType: v })} opts={HIERARCHY_ROLES} />
            </Field>
            {form.repType === 'Other' && (
              <Field label="Specify Other Type">
                <Input value={form.repOther} onChange={v => setForm({ ...form, repOther: v })} placeholder="Type..." />
              </Field>
            )}
            <Field label="Registration Date">
              <Input type="date" value={form.repDate} onChange={v => setForm({ ...form, repDate: v })} />
            </Field>
          </Section>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '16px', 
            background: '#1e40af', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '12px', 
            fontWeight: 900, 
            fontSize: '13px', 
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginTop: '12px',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.3)'
          }}
        >
          {loading ? 'Processing...' : 'Submit Master Registration'}
        </button>
      </form>
    </div>
  );
}
