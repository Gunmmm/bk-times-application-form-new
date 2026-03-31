import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const PLANS = [
  { label: '1 Year Plan ₹1,000', value: '1 Year', amount: 1000 },
  { label: '2 Year Plan ₹1,800', value: '2 Year', amount: 1800 },
  { label: '3 Year Plan ₹2,600', value: '3 Year', amount: 2600 },
];

const EDUCATION = [
  'Select', 'SSC', 'HSC', 'ITI', 'Diploma', 'Undergraduate', 'Bachelors', 'POSTgraduate', 'Doctorate', 'Advcate', 'Other'
];

const GENDERS = ['Select', 'Male', 'Female', 'Transgender', 'Other'];

const STATES = ['Select State', 'Maharashtra', 'Gujarat', 'Goa', 'Karnataka', 'Madhya Pradesh', 'Other'];

const MAHARASHTRA_DISTRICTS = [
  'Select District', 'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana',
  'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli',
  'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur',
  'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad',
  'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
];

const TALUKA_MAP = {
  'Ahmednagar': ['Select Taluka', 'Ahmednagar', 'Akole', 'Jamkhed', 'Karjat', 'Kopargaon', 'Nevasa', 'Parner', 'Pathardi', 'Rahata', 'Rahuri', 'Sangamner', 'Shevgaon', 'Shrigonda', 'Shrirampur'],
  'Akola': ['Select Taluka', 'Akola', 'Akot', 'Balapur', 'Barshitakli', 'Murtijapur', 'Patur', 'Telhara'],
  'Amravati': ['Select Taluka', 'Achalpur', 'Amravati', 'Anjangaon', 'Bhatkuli', 'Chandur Bazar', 'Chandur Railway', 'Daryapur', 'Dharni', 'Morshi', 'Nandgaon Khandeshwar', 'Teosa', 'Warud'],
  'Aurangabad': ['Select Taluka', 'Aurangabad', 'Gangapur', 'Kannad', 'Khuldabad', 'Paithan', 'Phulambri', 'Sillod', 'Soegaon', 'Vaijapur'],
  'Beed': ['Select Taluka', 'Ambejogai', 'Ashti', 'Beed', 'Georai', 'Kaij', 'Majalgaon', 'Parli', 'Patoda', 'Shirur (Kasar)', 'Wadwani'],
  'Bhandara': ['Select Taluka', 'Bhandara', 'Lakhandur', 'Lakhni', 'Mohadi', 'Pauni', 'Sakoli', 'Tumsar'],
  'Buldhana': ['Select Taluka', 'Buldhana', 'Chikhli', 'Deulgaon Raja', 'Jalgaon (Jamod)', 'Khamgaon', 'Lonar', 'Malkapur', 'Mehkar', 'Motala', 'Nandura', 'Shegaon', 'Sindkhed Raja'],
  'Chandrapur': ['Select Taluka', 'Ballarpur', 'Bhadravati', 'Bramhapuri', 'Chandrapur', 'Chimur', 'Gondpipri', 'Jiwati', 'Korpana', 'Mul', 'Nagbhir', 'Pombhurna', 'Rajura', 'Saoli', 'Sindewahi', 'Warora'],
  'Dhule': ['Select Taluka', 'Dhule', 'Sakri', 'Shirpur', 'Sindkheda'],
  'Gadchiroli': ['Select Taluka', 'Aheri', 'Armori', 'Bhamragad', 'Chamorshi', 'Dhanora', 'Etapalli', 'Gadchiroli', 'Korchi', 'Kurkheda', 'Mulchera', 'Sironcha'],
  'Gondia': ['Select Taluka', 'Amgaon', 'Arjuni Morgaon', 'Deori', 'Gondia', 'Goregaon', 'Sadak Arjuni', 'Salekasa', 'Tirora'],
  'Hingoli': ['Select Taluka', 'Aundha (Nagnath)', 'Basmath', 'Hingoli', 'Kalamnuri', 'Sengaon'],
  'Jalgaon': ['Select Taluka', 'Amalner', 'Bhadgaon', 'Bhusawal', 'Bodwad', 'Chalisgaon', 'Chopda', 'Dharangaon', 'Erandol', 'Jalgaon', 'Jamner', 'Muktainagar', 'Pachora', 'Parola', 'Raver', 'Yawal'],
  'Jalna': ['Select Taluka', 'Ambad', 'Badnapur', 'Bhokardan', 'Ghansawangi', 'Jafferabad', 'Jalna', 'Mantha', 'Partur'],
  'Kolhapur': ['Select Taluka', 'Ajra', 'Bhudargad', 'Chandgad', 'Gadhinglaj', 'Hatkanangale', 'Kagal', 'Karvir', 'Panhala', 'Radhanagari', 'Shahuwadi'],
  'Latur': ['Select Taluka', 'Ahmedpur', 'Ausa', 'Chakur', 'Deoni', 'Jalkot', 'Latur', 'Nilanga', 'Renapur', 'Shirur Anantpal', 'Udgir'],
  'Mumbai City': ['Select Taluka', 'Mumbai City'],
  'Mumbai Suburban': ['Select Taluka', 'Andheri', 'Borivali', 'Kurla'],
  'Nagpur': ['Select Taluka', 'Hingna', 'Kamptee', 'Katol', 'Kuhi', 'Mouda', 'Nagpur (Rural)', 'Nagpur (Urban)', 'Narkhed', 'Parseoni', 'Ramtek', 'Savner', 'Umred'],
  'Nanded': ['Select Taluka', 'Ardhapur', 'Bhokar', 'Biloli', 'Deglur', 'Dharmabad', 'Hadgaon', 'Himayatnagar', 'Kandhar', 'Kinwat', 'Loha', 'Mahur', 'Mudkhed', 'Mukhed', 'Naigaon', 'Nanded', 'Umri'],
  'Nandurbar': ['Select Taluka', 'Akkalkuwa', 'Akrani', 'Nandurbar', 'Nawapur', 'Shahada', 'Taloda'],
  'Nashik': ['Select Taluka', 'Baglan', 'Chandvad', 'Deola', 'Dindori', 'Igatpuri', 'Kalwan', 'Malegaon', 'Nandgaon', 'Nashik', 'Niphad', 'Peth', 'Peint', 'Sinnar', 'Surgana', 'Trimbakeshwar', 'Yeola'],
  'Osmanabad': ['Select Taluka', 'Bhum', 'Kalamb', 'Lohara', 'Osmanabad', 'Paranda', 'Tuljapur', 'Vashi', 'Washi'],
  'Palghar': ['Select Taluka', 'Dahanu', 'Jawhar', 'Mokhada', 'Palghar', 'Talasari', 'Vasai', 'Vikramgad', 'Wada'],
  'Parbhani': ['Select Taluka', 'Gangakhed', 'Jintur', 'Manwath', 'Palam', 'Parbhani', 'Pathri', 'Purna', 'Sailu', 'Sonpeth'],
  'Pune': ['Select Taluka', 'Ambegaon', 'Baramati', 'Bhor', 'Daund', 'Haveli', 'Indapur', 'Junnar', 'Khed', 'Maval', 'Mulshi', 'Pune City', 'Purandar', 'Shirur', 'Velhe'],
  'Raigad': ['Select Taluka', 'Alibag', 'Karjat', 'Khalapur', 'Mahad', 'Mangaon', 'Mhasla', 'Murud', 'Panvel', 'Pen', 'Poladpur', 'Roha', 'Shrivardhan', 'Sudhagad', 'Tala', 'Uran'],
  'Ratnagiri': ['Select Taluka', 'Chiplun', 'Dapoli', 'Guhagar', 'Khed', 'Lanja', 'Mandangad', 'Rajapur', 'Ratnagiri', 'Sangameshwar'],
  'Sangli': ['Select Taluka', 'Atpadi', 'Jat', 'Kadegaon', 'Kavathe Mahankal', 'Khanapur', 'Miraj', 'Palus', 'Shirala', 'Tasgaon', 'Walwa'],
  'Satara': ['Select Taluka', 'Jaoli', 'Karad', 'Khandala', 'Khatav', 'Koregaon', 'Mahabaleshwar', 'Man', 'Patan', 'Phaltan', 'Satara', 'Wai'],
  'Sindhudurg': ['Select Taluka', 'Devgad', 'Dodamarg', 'Kankavli', 'Kudal', 'Malwan', 'Sawantwadi', 'Vaibhavwadi', 'Vengurla'],
  'Solapur': ['Select Taluka', 'Akkalkot', 'Barshi', 'Karmala', 'Madha', 'Malshiras', 'Mangalvedhe', 'Mohol', 'Pandharpur', 'Sangola', 'Solapur North', 'Solapur South'],
  'Thane': ['Select Taluka', 'Ambarnath', 'Bhiwandi', 'Kalyan', 'Murbad', 'Shahapur', 'Thane', 'Ulhasnagar'],
  'Wardha': ['Select Taluka', 'Arvi', 'Ashti', 'Deoli', 'Hinganghat', 'Karanja', 'Samudrapur', 'Seloo', 'Wardha'],
  'Washim': ['Select Taluka', 'Karanja', 'Malegaon', 'Mangrulpir', 'Manora', 'Risod', 'Washim'],
  'Yavatmal': ['Select Taluka', 'Arni', 'Babulgaon', 'Darwha', 'Digras', 'Ghatanji', 'Kalamb', 'Kelapur', 'Mahagaon', 'Maregaon', 'Ner', 'Pandharkawoda', 'Pusad', 'Ralegaon', 'Umarkhed', 'Wani', 'Yavatmal', 'Zari Jamni']
};

function getTalukas(district) {
  if (!district || district === 'Select District') return ['Select Taluka'];
  return TALUKA_MAP[district] || ['Select Taluka', 'Main Taluka', 'Other'];
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

export default function ReaderRegistration({ onComplete, initialData }) {
  const { token, user } = useAuth();
  const isEdit = !!initialData?._id;
  const [step, setStep] = useState('form'); // form, payment, success
  const [vendorId] = useState(() => `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);

  const [form, setForm] = useState(() => {
    if (isEdit) {
      const p = initialData;
      let d = '', m = '', y = '';
      if (p.personal?.birthday || p.birthday) {
        const bd = new Date(p.personal?.birthday || p.birthday);
        d = bd.getDate().toString();
        m = (bd.getMonth() + 1).toString();
        y = bd.getFullYear().toString();
      }
      return {
        fullName: p.personal?.fullName || p.name || '', day: d, month: m, year: y,
        gender: p.personal?.gender || p.gender || 'Select', education: p.personal?.education || p.education || 'Select',
        phone: p.personal?.phone || p.mobile || p.phone || '', email: p.personal?.email || p.email || '', street: p.personal?.street || p.address || '',
        village: p.personal?.village || p.village || '', 
        district: p.personal?.district || p.district || 'Select District', 
        taluka: p.personal?.taluka || p.taluka || 'Select Taluka',
        state: p.personal?.state || p.state || 'Maharashtra', 
        pin: p.personal?.pincode || p.pinCode || '',
        plan: p.personal?.plan || p.subscriptionPlan || 'Select'
      };
    }
    return {
      fullName: '', day: '', month: '', year: '', gender: 'Select', education: 'Select',
      phone: '', email: '', street: '', village: '', district: 'Select District', taluka: 'Select Taluka',
      state: 'Maharashtra', pin: '', plan: 'Select'
    };
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
      education: form.education,
      address: form.street,
      village: form.village,
      taluka: form.taluka,
      district: form.district,
      state: form.state,
      pinCode: form.pin,
      subscriptionPlan: planObj?.label || form.plan,
      paymentAmount: planObj?.amount || 1000,
      registeredBy: user?.name || 'Local Admin',
      vendorId: vendorId
    };

    try {
      const url = isEdit ? `/api/readers/${initialData._id}` : '/api/readers';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
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
          <p style={{ fontSize: '13px', color: '#64748b' }}>Confirm your subscription: ₹{planObj?.amount || 1000}</p>
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
          <p><strong>Subscriber:</strong> {form.fullName}</p>
          <p><strong>District:</strong> {form.district}</p>
          <p><strong>Plan:</strong> {form.plan}</p>
          <p style={{ borderTop: '1px dashed #ccc', paddingTop: '8px', fontWeight: 900, fontSize: '14px' }}><strong>Paid Amount:</strong> ₹{PLANS.find(p => p.label === form.plan || p.value === form.plan)?.amount || 1000}</p>
        </div>
        <button onClick={onComplete} style={{ width: '100%', padding: '14px', background: '#065f46', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800 }}>Confirm & Close</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '20px', maxWidth: '420px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscriber Registration</h2>
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
          <F name="plan" label="Subscription Plan" value={form.plan} onChange={set} error={errors.plan} opts={['Select', ...PLANS.map(p => p.label)]} />
        </div>

        <button type="submit" disabled={submitting} style={{ marginTop: '12px', width: '100%', padding: '16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 900 }}>
          {submitting ? 'Please wait...' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}
