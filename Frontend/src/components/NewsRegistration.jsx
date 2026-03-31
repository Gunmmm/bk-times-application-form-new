import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const styles = {
  wrapper: {
    background: '#fff',
    padding: '16px',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    boxSizing: 'border-box',
  },
  heading: {
    fontSize: '16px',
    fontWeight: 900,
    color: '#1e2d4d',
    textAlign: 'center',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  card: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
  fieldGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 800,
    marginBottom: '6px',
    color: '#1e2d4d',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    fontSize: '12px',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box',
  },
  charCount: {
    fontSize: '10px',
    color: '#64748b',
    marginBottom: '4px',
    fontWeight: 600,
    textAlign: 'right',
  },
  charCountOver: {
    fontSize: '10px',
    color: '#dc3545',
    marginBottom: '4px',
    fontWeight: 600,
    textAlign: 'right',
  },
  fileName: {
    fontSize: '10px',
    color: '#1e2d4d',
    marginTop: '4px',
    fontWeight: 600,
    wordBreak: 'break-all',
  },
  errorText: {
    color: '#dc3545',
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '12px',
    fontWeight: 600,
    lineHeight: '1.4',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#1e2d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  // Payment step
  paymentWrapper: {
    padding: '20px 16px',
    textAlign: 'center',
    background: '#fff',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    boxSizing: 'border-box',
  },
  paymentHeader: {
    padding: '24px 16px',
    background: '#1e2d4d',
    borderRadius: '16px',
    color: '#fff',
    borderTop: '4px solid #C5A059',
    marginBottom: '20px',
  },
  paymentTitle: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#C5A059',
    margin: '0 0 6px',
  },
  paymentDuration: {
    fontSize: '13px',
    opacity: 0.8,
    color: '#fff',
    margin: 0,
  },
  paymentAmount: {
    margin: '16px 0 4px',
    fontSize: '28px',
    fontWeight: 900,
  },
  paymentMethods: {
    display: 'grid',
    gap: '10px',
    marginBottom: '20px',
  },
  paymentMethodBtn: {
    padding: '14px 16px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 700,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#1e2d4d',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  },
  payBtn: {
    width: '100%',
    padding: '16px',
    background: '#C5A059',
    color: '#1e2d4d',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  reviewBtn: {
    marginTop: '12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '8px',
  },
  // Success step
  successWrapper: {
    padding: '24px 16px',
    textAlign: 'center',
    background: '#fff',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    boxSizing: 'border-box',
  },
  successIcon: {
    width: '64px',
    height: '64px',
    background: '#f0fdf4',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1e2d4d',
    margin: '0 0 16px',
  },
  slipCard: {
    textAlign: 'left',
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    margin: '0 0 20px',
    fontSize: '12px',
    lineHeight: '1.7',
  },
  slipHeader: {
    textAlign: 'center',
    borderBottom: '1px dashed #ccc',
    paddingBottom: '10px',
    marginBottom: '10px',
    fontSize: '13px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  slipAmount: {
    borderTop: '1px dashed #ccc',
    paddingTop: '10px',
    marginTop: '6px',
    fontWeight: 900,
    fontSize: '14px',
  },
  doneBtn: {
    width: '100%',
    padding: '14px',
    background: '#1e2d4d',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 800,
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default function NewsRegistration({ onComplete }) {
  const { token, user } = useAuth();
  const [step, setStep] = useState('form'); // form, payment, success
  const [vendorId] = useState(() => `ADVT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Commercial ADVT',
    durationDays: '1',
    imageFile: null,
    imageFileName: ''
  });

  const costPerDay = 500;
  const paymentAmount = parseInt(form.durationDays || '0') * costPerDay;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setErrorText('');
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorText('Image size exceeds 5MB limit. Please provide a smaller, high-resolution file.');
        return;
      }
      setForm(f => ({ ...f, imageFile: file, imageFileName: file.name }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setErrorText('Please fill out all required fields.');
      return;
    }
    if (form.content.length > 2000) {
      setErrorText('ADVT content cannot exceed 2000 characters.');
      return;
    }
    if (!form.imageFile) {
        setErrorText('Please upload a cover image for the ADVT.');
        return;
    }
    setErrorText('');
    setStep('payment');
  };

  const submit = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        author: user?.fullName || 'Regional Coordinator',
        paymentAmount: paymentAmount,
        image: form.imageFileName,
        vendorId: vendorId,
        metadata: { duration: form.durationDays, fileLimitPassed: true }
      };

      const resp = await fetch('http://localhost:5000/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('Submission failed');
      setStep('success');
    } catch (err) {
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'payment') {
    return (
      <div style={styles.paymentWrapper}>
        <div style={styles.paymentHeader}>
          <h2 style={styles.paymentTitle}>ADVT Payment Portal</h2>
          <p style={styles.paymentDuration}>Duration: {form.durationDays} Days</p>
          <div style={styles.paymentAmount}>₹{paymentAmount}</div>
        </div>
        <div style={styles.paymentMethods}>
          {[
            { name: 'UPI / PayTM', icon: '📱' },
            { name: 'Debit / Credit Card', icon: '💳' },
            { name: 'Net Banking', icon: '🏦' },
            { name: 'PhonePe / GPay', icon: '⚡' }
          ].map(method => (
            <button key={method.name} style={styles.paymentMethodBtn}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{method.icon}</span>
              <span style={{ flex: 1 }}>{method.name}</span>
              <span style={{ color: '#1e2d4d', opacity: 0.3, flexShrink: 0 }}>→</span>
            </button>
          ))}
        </div>
        <button onClick={submit} disabled={loading} style={styles.payBtn}>
          {loading ? 'Processing...' : 'Secure Pay & Publish ADVT'}
        </button>
        {errorText && <p style={{ ...styles.errorText, marginTop: '12px' }}>{errorText}</p>}
        <button onClick={() => setStep('form')} style={styles.reviewBtn}>← Review Details</button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div style={styles.successWrapper}>
        <div style={styles.successIcon}>
          <span style={{ fontSize: '28px', color: '#22c55e' }}>✓</span>
        </div>
        <h2 style={styles.successTitle}>ADVT Booked Successfully</h2>
        <div style={styles.slipCard}>
          <div style={styles.slipHeader}>ADVT Transaction Slip</div>
          <p style={{ margin: '0 0 4px' }}><strong>Vendor ID:</strong> {vendorId}</p>
          <p style={{ margin: '0 0 4px' }}><strong>Publisher:</strong> {user?.fullName || user?.name || 'Authorized Coordinator'}</p>
          <p style={{ margin: '0 0 4px' }}><strong>Headline:</strong> {form.title}</p>
          <p style={{ margin: '0 0 4px' }}><strong>Duration:</strong> {form.durationDays} Days</p>
          <p style={styles.slipAmount}><strong>Amount Paid:</strong> ₹{paymentAmount}</p>
        </div>
        <button onClick={onComplete} style={styles.doneBtn}>Done</button>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Book ADVT Space</h2>
      
      <form onSubmit={handleNext}>
        <div style={styles.card}>
          
          <div style={styles.fieldGroup}>
            <label style={styles.label}>ADVT Headline *</label>
            <input required type="text" placeholder="Main banner text..." value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} style={styles.input} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={styles.input}>
              {['Commercial ADVT', 'Local Business', 'Political', 'Announcement', 'Classified'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>ADVT Content (Max 2000 chars) *</label>
            <p style={form.content.length > 2000 ? styles.charCountOver : styles.charCount}>{form.content.length} / 2000</p>
            <textarea required rows="5" placeholder="Enter ADVT description or text here..." value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} style={{ ...styles.input, border: `1px solid ${form.content.length > 2000 ? '#dc3545' : '#e2e8f0'}`, resize: 'vertical' }} />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Upload ADVT Image (Max 5MB) *</label>
            <input required type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
            {form.imageFileName && <p style={styles.fileName}>Selected: {form.imageFileName}</p>}
          </div>

          <div style={{ ...styles.fieldGroup, marginBottom: 0 }}>
            <label style={styles.label}>Duration (Days) *</label>
            <select value={form.durationDays} onChange={e => setForm(f => ({...f, durationDays: e.target.value}))} style={styles.input}>
              <option value="1">1 Day (₹500)</option>
              <option value="2">2 Days (₹1,000)</option>
              <option value="5">5 Days (₹2,500)</option>
            </select>
          </div>
        </div>

        {errorText && <p style={styles.errorText}>{errorText}</p>}

        <button type="submit" style={styles.submitBtn}>
          Proceed to Checkout (₹{paymentAmount})
        </button>
      </form>
    </div>
  );
}
