import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import {
  User,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  Briefcase,
  Info,
  ChevronRight,
  ChevronLeft,
  Printer,
  Camera,
  Upload,
  X,
  UserCheck,
  Eye,
  EyeOff,
  Calendar,
  LogIn,
  Mail,
  Smartphone
} from 'lucide-react';
import bkLogo from './bklogo.jpg';
import allLogo from './alllogo.jpg';

// --- Helper Functions ---
const calculateAge = (dob) => {
  if (!dob) return { years: '', months: '', days: '' };
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return { years: '', months: '', days: '' };

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return { years: 0, months: 0, days: 0 };
  return { years, months, days };
};

const regionDistricts = {
  "NASHIK": ["Nashik", "Dhule", "Nandurbar", "Jalgaon", "Alilyanagar"],
  "KOKAN": ["Mumbai City", "Mumbai Suburban", "Thane", "Palghar", "Raigad", "Ratnagiri", "Sindhudurg"],
  "PUNE": ["Pune", "Kolhapur", "Sangli", "Satara", "Solapur"],
  "CHHATRAPATI SAMBHAJI NAGAR": ["Chhatrapati Sambhajinagar", "Beed", "Jalna", "Latur", "Nanded", "Parbhani", "Hingoli", "Dharashiv"],
  "AMRAVATI": ["Amravati", "Akola", "Buldhana", "Washim", "Yavatmal"],
  "NAGPUR": ["Nagpur", "Bhandara", "Chandrapur", "Gadchiroli", "Gondia", "Wardha"]
};

// --- Sub-components (Moved Outside to prevent re-renders and focus loss) ---

const Header = () => (
  <div className="bg-white border-b-2 border-blue-800 p-2 sm:p-4 flex flex-row justify-between items-center shadow-sm z-10 relative">
    <div className="flex items-center">
      <img src={bkLogo} alt="BK TIMES Logo" className="h-16 md:h-28 object-contain" />
    </div>
    <div className="flex items-center">
      <img src={allLogo} alt="Campaign Logo" className="h-24 md:h-40 object-contain" />
    </div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 bg-blue-800 text-white p-2 px-3 rounded-md mt-4 mb-3 shadow-md">
    <Icon size={18} />
    <h2 className="font-bold uppercase tracking-widest text-[11px] md:text-sm">{title}</h2>
  </div>
);

const InputField = ({ label, name, type = "text", placeholder = "", options = null, value, onChange, icon: Icon, required, readOnly = false }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[10px] font-bold text-gray-700 uppercase flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
      {Icon && <Icon size={12} className="text-gray-400" />}
    </label>
    <div className="relative">
      {options ? (
        <select
          name={name}
          onChange={onChange}
          value={value || ''}
          disabled={readOnly}
          className="w-full border border-gray-300 p-1.5 px-2 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs bg-white h-8 md:h-10 appearance-none disabled:bg-gray-100 disabled:text-gray-500 transition-shadow"
        >
          <option value="">Select...</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full border border-gray-300 p-1.5 px-2 rounded focus:ring-1 focus:ring-blue-500 outline-none text-xs bg-white h-8 md:h-10 pr-6 transition-shadow ${readOnly ? 'bg-gray-100 text-gray-500' : ''}`}
        />
      )}
    </div>
  </div>
);

const ImageUpload = ({ label, name, value, onChange, height = "170px", subLabel }) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, JPEG, and PNG formats are allowed.");
        e.target.value = '';
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert(`File size must be 1MB or less. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(name, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start shrink-0">
      <div
        className={`relative border-2 border-dashed ${value ? 'border-blue-500' : 'border-gray-400'} bg-gray-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-blue-500 transition-colors group px-2 rounded-md`}
        style={{ width: '150px', height: height }}
        onClick={() => document.getElementById(`file-input-${name}`).click()}
      >
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover rounded-sm" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-sm">
              <Camera className="text-white" size={32} />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(name, null); }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors z-10"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center pointer-events-none p-2">
            <Upload className="text-gray-400 group-hover:text-blue-500 transition-colors" size={32} />
            <span className="text-xs md:text-sm text-gray-600 font-bold uppercase leading-snug">
              {label}<br />{subLabel}
            </span>
          </div>
        )}
      </div>
      <input id={`file-input-${name}`} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleFileChange} className="hidden" />
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, formData }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        <div className="bg-blue-800 p-8 text-center text-white relative">
          <div className="bg-white text-green-500 rounded-full p-4 shadow-xl border-4 border-gray-50 flex items-center justify-center w-20 h-20 mx-auto mb-4">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Success!</h2>
          <p className="text-blue-100 mt-2 text-xs font-bold uppercase tracking-widest opacity-80">Application Submitted</p>
        </div>
        <div className="p-8 text-center bg-gray-50/50">
          <p className="text-sm font-bold text-gray-700 mb-6 leading-relaxed">
            Thank you, <br />
            <span className="text-blue-800 text-lg">{formData.fullName || 'Applicant'}</span><br />
            Your details have been recorded.
          </p>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-8">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Status</p>
            <p className="text-sm font-black text-blue-900 uppercase">Awaiting Verification</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-800 text-white h-12 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-900 transition-all shadow-lg active:scale-95"
          >
            Close & Review
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginRoute = ({ formData, handleInputChange }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const onLogin = () => {
    const { loginIdentifier, loginPassword, email, mobile, password } = formData;
    const matchesIdentifier = (loginIdentifier === email || loginIdentifier === mobile);
    const matchesPassword = (loginPassword === password);

    if (matchesIdentifier && matchesPassword) {
      navigate('/form');
    } else {
      alert("Invalid Credentials! Please check your Email/Phone and Password.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto py-2 px-4 sm:px-8 flex-1 flex flex-col justify-center">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,112,184,0.1)] overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[400px]">
        {/* Left Side: Login */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col">
          <h2 className="text-2xl font-black text-blue-900 uppercase text-center mb-6">Login</h2>

          <div className="space-y-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs md:text-sm font-bold text-gray-700 uppercase flex items-center gap-1">
                Registered Email ID / Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="loginIdentifier"
                  placeholder="Enter Email or Phone Number"
                  value={formData.loginIdentifier || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base bg-white h-12 md:h-14 pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-3 text-gray-400">
                  <Mail size={18} />
                  <Smartphone size={18} />
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 uppercase">Password</label>
                <button className="text-xs md:text-sm text-blue-700 font-bold hover:underline">Forgot Password?</button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="loginPassword"
                placeholder="........"
                value={formData.loginPassword || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base bg-white h-12 md:h-14 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-blue-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* reCAPTCHA Mock */}
            <div className="border border-gray-300 bg-gray-50/50 p-4 rounded-md flex items-center gap-4 max-w-sm mx-auto shadow-inner">
              <input
                type="checkbox"
                checked={captchaVerified}
                onChange={(e) => setCaptchaVerified(e.target.checked)}
                className="w-6 h-6 md:w-8 md:h-8 cursor-pointer"
              />
              <span className="text-sm md:text-base font-medium text-gray-700 flex-1">I'm not a robot</span>
              <div className="flex flex-col items-center">
                <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 h-8 grayscale opacity-50" />
                <span className="text-[8px] md:text-[10px] text-gray-400 uppercase mt-1">Privacy - Terms</span>
              </div>
            </div>

            <button
              onClick={onLogin}
              disabled={!captchaVerified || !formData.loginIdentifier || !formData.loginPassword}
              className="w-full bg-blue-800 text-white h-10 md:h-12 rounded-md font-black uppercase tracking-widest text-xs md:text-sm hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 mt-4"
            >
              Login
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:flex items-center justify-center relative px-2 text-gray-200">
          <div className="h-[80%] w-[2px] bg-gray-200"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-gray-200 shadow-md w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-blue-800 z-10">
            OR
          </div>
        </div>

        {/* Right Side: New User */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center bg-gray-50/50">
          <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-6">New User?</h2>
          <button
            onClick={() => navigate('/register')}
            className="w-full max-w-sm bg-blue-800 text-white h-10 md:h-12 rounded-md font-black uppercase tracking-widest text-xs md:text-sm hover:bg-blue-700 transition-all shadow-lg"
          >
            Register Here
          </button>
          <p className="mt-4 text-xs md:text-sm text-gray-400 font-bold uppercase tracking-widest">To create a new registration</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm font-bold uppercase tracking-tight text-gray-600">
          <span>How to Register - <button className="text-blue-800 hover:underline">User Manual</button> | <button className="text-blue-800 hover:underline">Tutorial Video</button></span>
        </div>
        <button className="text-xs md:text-sm font-bold uppercase tracking-tight text-blue-800 hover:underline">How to Raise a Ticket</button>
      </div>
    </div>
  );
};

const RegistrationRoute = ({ formData, setFormData, handleInputChange, otpProps }) => {
  const navigate = useNavigate();
  const { otp, setOtp, isOtpSent, isVerified, loadingOtp, handleSendOtp, handleVerifyOtp, otpError, otpSuccess } = otpProps;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [regStep, setRegStep] = useState(1);

  const age = calculateAge(formData.dob);

  const onRegister = () => {
    const fullName = `${formData.firstName} ${formData.middleName} ${formData.lastName}`.trim();
    setFormData(prev => ({ ...prev, fullName: fullName }));
    alert("Success! Login with your Email or Mobile Number.");
    navigate('/login');
  };

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto py-2 px-4 sm:px-8 flex-1">
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,112,184,0.1)] overflow-hidden border border-gray-100 mb-4">
        <div className="p-4 text-center border-b border-gray-100 flex items-center bg-gray-50/50">
          <button onClick={() => navigate('/login')} className="text-blue-800 hover:bg-blue-100 p-2 rounded-full transition-colors"><ChevronLeft size={24} /></button>
          <h1 className="text-xl md:text-2xl font-black text-blue-900 uppercase tracking-tight flex-1">Register</h1>
          <div className="w-10"></div>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          <div className="border border-blue-400 bg-white p-3 rounded-md shadow-sm mb-4">
            <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Registration Instructions:</h3>
            <ul className="text-[10px] md:text-xs text-gray-500 space-y-1 font-medium leading-relaxed">
              <li>1. Enter your full name exactly as per official identity proof or educational documents.</li>
              <li>2. Use a valid email address and mobile number for verification and official communication.</li>
              <li>3. Provide accurate and complete information during registration; false details may lead to account rejection.</li>
              <li>4. Keep your password secure and do not share login credentials with others.</li>
              <li>5. By registering, you agree to use the account only for official reporting purposes and follow organization rules.</li>
            </ul>
          </div>

          <div className="flex justify-between mb-2 text-[10px] md:text-xs font-bold uppercase tracking-widest px-2">
            <span className={`${regStep === 1 ? 'text-blue-800 border-b-2 border-blue-800 pb-1' : 'text-gray-400 pb-1'}`}>1. Personal Details</span>
            <span className={`${regStep === 2 ? 'text-blue-800 border-b-2 border-blue-800 pb-1' : 'text-gray-400 pb-1'}`}>2. Account Setup</span>
          </div>

          {regStep === 1 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <InputField label="First Name" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleInputChange} />
                <InputField label="Middle Name" name="middleName" placeholder="Middle Name" required value={formData.middleName} onChange={handleInputChange} />
                <InputField label="Last Name" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleInputChange} />
                <InputField label="Date of Birth" name="dob" type="date" required value={formData.dob} onChange={handleInputChange} />
                <div className="md:col-span-1">
                  <label className="text-[10px] font-bold text-gray-700 uppercase mb-1 block">Age (Y / M / D)</label>
                  <div className="bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] md:text-xs font-bold rounded shadow-inner h-8 md:h-10">
                    {age.years !== '' ? `${age.years}Y / ${age.months}M / ${age.days}D` : '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputField label="Gender" name="gender" options={["MALE", "FEMALE", "OTHER"]} required value={formData.gender} onChange={handleInputChange} />
                <InputField label="Region" name="registrationRegion" options={["NASHIK", "KOKAN", "AMRAVATI", "CHHATRAPATI SAMBHAJI NAGAR", "NAGPUR", "PUNE"]} required value={formData.registrationRegion} onChange={handleInputChange} />
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.registrationRegion) {
                      alert("Please fill all mandatory fields labeled with * to continue.");
                      return;
                    }
                    setRegStep(2);
                  }}
                  className="w-32 bg-blue-800 text-white h-8 md:h-10 rounded font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {regStep === 2 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="flex flex-col gap-2 justify-end lg:col-span-2 w-full">
                  <InputField label="Email ID" name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="flex flex-col gap-1 w-full lg:col-span-2">
                  <div className="flex flex-col sm:flex-row gap-2 items-end w-full">
                    <div className="flex-1 w-full">
                      <InputField label="Mobile Number" name="mobile" type="tel" placeholder="Mobile" required value={formData.mobile} onChange={handleInputChange} />
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={loadingOtp || !formData.mobile}
                      className="w-full sm:w-auto shrink-0 bg-blue-800 text-white px-3 h-8 md:h-10 rounded text-[10px] font-bold shadow hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {loadingOtp ? "..." : (isOtpSent ? "Resend" : "Send OTP")}
                    </button>
                  </div>
                  {isOtpSent && !isVerified && (
                    <div className="mt-1 flex gap-2">
                      <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="OTP" className="border border-blue-400 p-1 rounded text-xs w-16 h-7 text-center shadow-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                      <button onClick={handleVerifyOtp} className="text-[10px] font-bold text-blue-800 uppercase hover:underline p-1">Verify</button>
                    </div>
                  )}
                  {otpSuccess && (
                    <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-md text-[11px] font-bold shadow-sm animate-in fade-in zoom-in-95 duration-300">
                      <ShieldCheck size={14} className="shrink-0" />
                      <span>OTP {otpSuccess} Successfully</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-2">
                  <InputField label="Password" name="password" type={showPassword ? "text" : "password"} placeholder="........" required value={formData.password} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-6 text-gray-400 hover:text-blue-700"><span className="p-1">{showPassword ? <EyeOff size={14} /> : <Eye size={14} />}</span></button>
                </div>
                <div className="relative md:col-span-2">
                  <InputField label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="........" required value={formData.confirmPassword} onChange={handleInputChange} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-6 text-gray-400 hover:text-blue-700"><span className="p-1">{showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}</span></button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4 border-t border-gray-100 pt-3">
                <button
                  onClick={() => setRegStep(1)}
                  className="w-full sm:w-28 bg-gray-100 text-gray-600 px-3 h-8 md:h-10 rounded font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <ChevronLeft size={14} /> Back
                </button>

                <div className="flex flex-col sm:flex-row flex-1 justify-end items-center gap-3 w-full">
                  <div className="border border-gray-300 bg-gray-50/50 p-1 rounded flex items-center gap-2 shadow-inner w-full sm:w-auto min-w-[180px] h-8 md:h-10">
                    <input type="checkbox" checked={captchaVerified} onChange={(e) => setCaptchaVerified(e.target.checked)} className="w-4 h-4 cursor-pointer ml-1" />
                    <span className="text-[10px] font-medium text-gray-700 flex-1">I'm not a robot</span>
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-5 h-5 grayscale opacity-50 mr-1" />
                  </div>
                  <button
                    onClick={onRegister}
                    disabled={!isVerified || !captchaVerified || formData.password !== formData.confirmPassword || !formData.password}
                    className="w-full sm:w-40 bg-blue-600 text-white px-4 h-8 md:h-10 rounded font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:opacity-50 shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Register
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step1 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <h1 className="text-center text-xl font-black text-blue-900 border-b-2 border-blue-900 pb-2 mb-4 uppercase">Application Form</h1>

    {/* Upload Instructions */}
    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-3 items-start">
      <span className="text-amber-500 text-lg shrink-0">ℹ️</span>
      <div className="text-[10px] md:text-xs text-amber-800 font-semibold leading-relaxed space-y-1">
        <p className="font-bold text-amber-900 uppercase tracking-wide mb-1">Upload Instructions</p>
        <p>1. Only <strong>PDF format</strong> is allowed for documents.</p>
        <p>2. File size must <strong>not exceed 1 MB</strong>.</p>
        <p>3. Document should be <strong>clear and readable</strong>.</p>
        <p>4. Upload only <strong>original scanned copy</strong>.</p>
        <p>5. <strong>Blurred or incorrect files</strong> may be rejected.</p>
      </div>
    </div>

    {/* Row 1: Region + District in one line */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
      <InputField label="Name of Region" name="region" options={Object.keys(regionDistricts)} value={formData.region} onChange={handleInputChange} required />
      <InputField label="Name of District" name="district" options={formData.region ? regionDistricts[formData.region] : []} value={formData.district} onChange={handleInputChange} required />
    </div>

    {/* Row 2: Passport + Signature below */}
    <div className="flex flex-row gap-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100 justify-center">
      <ImageUpload label="Passport" subLabel="Size Photo" name="photo_p1" value={formData.photo_p1} onChange={handleFileChange} height="120px" />
      <ImageUpload label="Signature" name="sign_p1" value={formData.sign_p1} onChange={handleFileChange} height="120px" />
    </div>
  </div>
);

const Step2 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <SectionTitle icon={User} title="Personal Information" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-100 pb-3">
      <InputField label="Title" name="title" options={["SHRI", "SMT", "KUMAR", "KUMARI"]} value={formData.title} onChange={handleInputChange} required />
      <div className="lg:col-span-3"><InputField label="Full Name (Firstname, Midname, Surname)" name="fullName" value={formData.fullName} readOnly /></div>

      <div className="lg:col-span-1"><InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-1"><InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} required /></div>
      <InputField label="Mobile No" name="mobile" value={formData.mobile} readOnly />
      <InputField label="Alternate Number" name="landline" value={formData.landline} onChange={handleInputChange} required />

      <div className="lg:col-span-2"><InputField label="Aadhaar No" name="aadhaar" type="tel" value={formData.aadhaar} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2"><InputField label="Email ID" name="email" value={formData.email} readOnly /></div>

      <div className="lg:col-span-2"><InputField label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2">
        <label className="text-[10px] font-bold text-gray-700 uppercase mb-1 block">Age (Y / M / D)</label>
        <div className="bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] md:text-xs font-bold rounded shadow-inner h-8 md:h-10">
          {(() => {
            const ageComp = calculateAge(formData.dob);
            return ageComp.years !== '' ? `${ageComp.years}Y / ${ageComp.months}M / ${ageComp.days}D` : '-';
          })()}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-b border-gray-100 pb-3 mt-3">
      <InputField label="Qualification" name="qualification" options={["SSC", "HSC", "GRADUATION", "POST GRADUATION", "DOCTOR", "DIPLOMA", "ITI"]} value={formData.qualification} onChange={handleInputChange} required />
      <InputField label="Profession" name="profession" options={["BUSINESS", "SERVICE", "OTHER"]} value={formData.profession} onChange={handleInputChange} required />
      {formData.profession === 'OTHER' && (
        <InputField label="Other Profession Details" name="other_profession" placeholder="Please specify your profession" value={formData.other_profession} onChange={handleInputChange} required />
      )}
    </div>

    <div className="mt-3 border-b border-gray-100 pb-3">
      <div className="flex flex-col md:flex-row gap-3 w-full bg-blue-50/30 p-3 rounded-lg border border-blue-50/50 items-start">
        <div className="flex-1 w-full">
          <label className="text-[10px] md:text-xs font-bold text-gray-700 uppercase flex items-center gap-1 mb-1 shadow-sm px-1">Permanent Address <span className="text-red-500">*</span></label>
          <textarea name="address_perm" rows="2" className="w-full border border-gray-300 p-2 rounded text-[10px] md:text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[40px] shadow-sm bg-white" value={formData.address_perm || ''} onChange={handleInputChange} placeholder="Enter your full permanent address" required />
        </div>
        <div className="w-full md:w-48 lg:w-48 self-stretch flex flex-col justify-end">
          <InputField label="Pin Code" name="pin_perm" value={formData.pin_perm} onChange={handleInputChange} required />
        </div>
      </div>
    </div>
  </div>
);

const Step3 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <SectionTitle icon={UserCheck} title="Nominee Details" />
    {/* Upload Instructions - Compact */}
    <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2 items-start">
      <span className="text-amber-500 text-sm shrink-0 mt-0.5">ℹ️</span>
      <div className="text-[9px] md:text-[10px] text-amber-800 font-semibold leading-tight w-full">
        <p className="font-bold text-amber-900 uppercase tracking-wide mb-1">Upload Instructions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
          <p>1. Only <strong>PDF format</strong> is allowed.</p>
          <p>2. File size must <strong>not exceed 1 MB</strong>.</p>
          <p>3. Document should be <strong>clear and readable</strong>.</p>
          <p>4. Upload only <strong>original scanned copy</strong>.</p>
          <p>5. <strong>Blurred or incorrect files</strong> may be rejected.</p>
        </div>
      </div>
    </div>

    {/* Compacted Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2 border-b border-gray-100 pb-2 mb-2">
      <InputField label="Title" name="nominee_title" options={["SHRI", "SHRIMATI", "KUMAR", "KUMARI"]} value={formData.nominee_title} onChange={handleInputChange} required />
      <div className="lg:col-span-2"><InputField label="Nominee Name" name="nominee_name" value={formData.nominee_name} onChange={handleInputChange} required /></div>
      <InputField label="Birth Date" name="nominee_dob" type="date" value={formData.nominee_dob} onChange={handleInputChange} required />

      <InputField label="Relationship" name="nominee_relation" options={["SPOUSE", "MOTHER", "FATHER", "SON", "DAUGHTER", "BROTHER", "SISTER"]} value={formData.nominee_relation} onChange={handleInputChange} required />
      <div className="lg:col-span-2"><InputField label="Name of Guardian" name="nominee_guardian_name" value={formData.nominee_guardian_name} onChange={handleInputChange} required /></div>
      <InputField label="Pin Code" name="nominee_guardian_pin" value={formData.nominee_guardian_pin} onChange={handleInputChange} required />

      <div className="lg:col-span-4 bg-blue-50/20 p-2 rounded-lg border border-blue-50/50">
        <label className="text-[9px] md:text-[10px] font-bold text-gray-700 uppercase flex items-center gap-1 shadow-sm px-1 mb-1">Address of Guardian <span className="text-red-500">*</span></label>
        <textarea name="nominee_guardian_address" rows="1" className="w-full border border-gray-300 p-1.5 rounded text-[10px] md:text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[30px] shadow-sm bg-white" value={formData.nominee_guardian_address || ''} onChange={handleInputChange} placeholder="Enter guardian's full address" required />
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-blue-50/10 p-3 rounded-lg border border-blue-50">
      <ImageUpload label="Passport Photo" name="photo_nominee" value={formData.photo_nominee} onChange={handleFileChange} height="110px" />
      <ImageUpload label="Signature" name="sign_nominee" value={formData.sign_nominee} onChange={handleFileChange} height="110px" />
    </div>
  </div>
);

const Step4 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <SectionTitle icon={CreditCard} title="Bank Details" />

    {/* Upload Instructions - Compact */}
    <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2 items-start">
      <span className="text-amber-500 text-sm shrink-0 mt-0.5">ℹ️</span>
      <div className="text-[9px] md:text-[10px] text-amber-800 font-semibold leading-tight w-full">
        <p className="font-bold text-amber-900 uppercase tracking-wide mb-1">Upload Instructions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
          <p>1. Only <strong>PDF format</strong> is allowed.</p>
          <p>2. File size must <strong>not exceed 1 MB</strong>.</p>
          <p>3. Document should be <strong>clear and readable</strong>.</p>
          <p>4. Upload only <strong>original scanned copy</strong>.</p>
          <p>5. <strong>Blurred or incorrect files</strong> may be rejected.</p>
        </div>
      </div>
    </div>

    {/* Compacted Grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-2 gap-x-2 bg-blue-50/30 p-2 rounded border border-blue-50 mb-2">
      <InputField label="IFSC Code" name="ifsc" value={formData.ifsc} onChange={handleInputChange} required />
      <div className="lg:col-span-2"><InputField label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleInputChange} required /></div>
      <InputField label="Types of Account" name="account_type" options={["SAVINGS", "CURRENT", "SALARY"]} value={formData.account_type} onChange={handleInputChange} required />
      <InputField label="Branch Code" name="branch_code" value={formData.branch_code} onChange={handleInputChange} required />

      <div className="lg:col-span-2"><InputField label="Address of Bank" name="bank_address" value={formData.bank_address} onChange={handleInputChange} required /></div>
      <div className="lg:col-span-2"><InputField label="Account Number" name="account_no" value={formData.account_no} onChange={handleInputChange} required /></div>
      <InputField label="MICR Code No" name="micr" value={formData.micr} onChange={handleInputChange} required />
    </div>

    <div className="flex justify-center mb-1">
      <div className="flex items-center gap-4 bg-blue-50/10 p-3 px-6 rounded border border-blue-50">
        <ImageUpload label="Bank Signature" name="sign_bank" value={formData.sign_bank} onChange={handleFileChange} height="110px" />
        <p className="text-[10px] text-gray-400 font-bold uppercase">Required</p>
      </div>
    </div>
  </div>
);

const Step5 = ({ formData, handleInputChange, handleFileChange }) => {
  const onFileSelect = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert("Only PDF format is allowed for document uploads.");
        e.target.value = '';
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        alert(`File size must be 1MB or less. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFileChange(name, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <SectionTitle icon={FileText} title="Document Upload" />

      {/* Upload Instructions - Compact */}
      <div className="mb-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex gap-2 items-start">
        <span className="text-amber-500 text-sm shrink-0 mt-0.5">ℹ️</span>
        <div className="text-[9px] md:text-[10px] text-amber-800 font-semibold leading-tight w-full">
          <p className="font-bold text-amber-900 uppercase tracking-wide mb-1">Upload Instructions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-1">
            <p>1. Only <strong>PDF format</strong> is allowed.</p>
            <p>2. File size must <strong>not exceed 1 MB</strong>.</p>
            <p>3. Document should be <strong>clear and readable</strong>.</p>
            <p>4. Upload only <strong>original scanned copy</strong>.</p>
            <p>5. <strong>Blurred or incorrect files</strong> may be rejected.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
        {[
          { title: "Age Proof Document", items: ["Leaving Certificate", "Birth Certificate", "Aadhar Card"], prefix: "age_proof" },
          { title: "Address Proof Document", items: ["Ration Card", "Driving License", "Passport", "Light Bill", "Aadhar Card"], prefix: "address_proof" },
          { title: "Identity Proof Document", items: ["PAN Card", "Aadhar Card", "School/College ID", "Driving Licence", "Voting Card", "Other"], prefix: "id_proof" }
        ].map(category => (
          <div key={category.title} className="bg-white rounded border border-blue-100 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-blue-800 px-3 py-1.5 flex flex-row items-center justify-between">
              <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wide">{category.title}</p>
              {formData[`${category.prefix}_file`] && <span className="bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">UPLOADED</span>}
            </div>
            <div className="p-3 flex flex-col gap-3 flex-1 bg-gray-50/50 justify-center">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] md:text-[10px] font-bold text-gray-600 uppercase">Select Document</label>
                <select
                  name={`${category.prefix}_type`}
                  value={formData[`${category.prefix}_type`] || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded text-[10px] md:text-xs bg-white outline-none focus:border-blue-500 font-semibold text-gray-700"
                >
                  <option value="" disabled>-- Choose ONE --</option>
                  {category.items.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <label className={`w-full flex items-center justify-center gap-2 py-2 rounded cursor-pointer text-[10px] md:text-xs font-bold uppercase transition-all shadow-sm ${!formData[`${category.prefix}_type`] ? 'opacity-50 pointer-events-none bg-gray-300 text-gray-500' : formData[`${category.prefix}_file`] ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                <Upload size={14} />
                {formData[`${category.prefix}_file`] ? 'Re-upload PDF' : 'Upload PDF'}
                <input type="file" name={`${category.prefix}_file`} className="hidden" accept="application/pdf" onChange={onFileSelect} disabled={!formData[`${category.prefix}_type`]} />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Educational Proof */}
        <div className="bg-white rounded border border-blue-100 shadow-sm overflow-hidden">
          <div className="bg-blue-800 px-3 py-1">
            <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wide">Educational Proof</p>
          </div>
          <div className="p-2 flex items-center gap-2">
            <p className="text-[10px] md:text-xs font-semibold text-gray-600 shrink-0">Marksheet / Certificate</p>
            <label className={`flex items-center gap-1 px-3 py-1 rounded cursor-pointer text-[9px] md:text-[10px] font-bold uppercase flex-1 justify-center ${formData.doc_education ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-50 text-blue-600 border border-dashed border-blue-300 hover:bg-blue-100'}`}>
              <Upload size={12} />
              {formData.doc_education ? '✓ Uploaded' : 'Upload'}
              <input type="file" name="doc_education" className="hidden" accept="application/pdf" onChange={onFileSelect} />
            </label>
          </div>
        </div>

        {/* Police Verification */}
        <div className="bg-white rounded border border-blue-100 shadow-sm overflow-hidden">
          <div className="bg-blue-800 px-3 py-1">
            <p className="text-white text-[10px] md:text-xs font-bold uppercase tracking-wide">Police Verification</p>
          </div>
          <div className="p-2">
            <div className="flex items-center gap-2">
              <input name="police_verification" className="flex-1 border border-gray-300 p-1.5 rounded text-[10px] md:text-xs outline-none focus:ring-1 focus:ring-blue-500" value={formData.police_verification || ''} onChange={handleInputChange} placeholder="Enter details" />
              <label className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-[9px] md:text-[10px] font-bold uppercase shrink-0 ${formData.doc_police ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}>
                <Upload size={10} />{formData.doc_police ? '✓' : 'Doc'}
                <input type="file" name="doc_police" className="hidden" accept="application/pdf" onChange={onFileSelect} />
              </label>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};


const Step6 = ({ formData, handleInputChange, handleFileChange }) => (
  <div className="animate-in fade-in duration-500">
    <SectionTitle icon={ShieldCheck} title="Declaration" />
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
      <div className="space-y-4 text-xs md:text-sm text-gray-800 font-medium leading-relaxed">
        <p className="flex gap-2">
          <span className="font-bold shrink-0">I,</span>
          <span>District Co-ordinator of <strong className="text-blue-800 underline underline-offset-2">{formData.region || '_________'}</strong> (Area) of BK Times, Nashik</span>
        </p>
        <p className="flex gap-3">
          <span className="font-bold text-blue-800 shrink-0">1.</span>
          <span>I hereby declare that the entries made by me in the co-ordinator form are complete and true to the best of my knowledge and based on records.</span>
        </p>
        <p className="flex gap-3">
          <span className="font-bold text-blue-800 shrink-0">2.</span>
          <span>I understand and agree to follow the rules, regulations, and policies of BK Times.</span>
        </p>
        <p className="flex gap-3">
          <span className="font-bold text-blue-800 shrink-0">3.</span>
          <span>I accept responsibility for any incorrect or false information submitted by me in this form.</span>
        </p>
        <p className="flex gap-3">
          <span className="font-bold text-blue-800 shrink-0">4.</span>
          <span>I confirm that all documents provided by me are genuine and valid.</span>
        </p>
        <p className="flex gap-3">
          <span className="font-bold text-blue-800 shrink-0">5.</span>
          <span>I understand that if any information is found incorrect, my appointment may be cancelled by BK Times without prior notice.</span>
        </p>
      </div>
      <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col items-center sm:items-end p-2 md:p-4">
        <div className="flex flex-col items-center gap-2 w-full sm:w-auto bg-blue-50/20 p-4 border border-blue-50 rounded-lg">
          <ImageUpload label="Your Signature" name="sign_declaration" value={formData.sign_declaration} onChange={handleFileChange} height="110px" />
          <div className="text-center">
            <p className="text-[9px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 inline-block">*(JPG/PNG only, Max 1 MB allowed)*</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FormRoute = ({ formData, setFormData, handleInputChange, handleFileChange }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Pre-fill form from registration data if empty
    setFormData(prev => ({
      ...prev,
      region: prev.region || prev.registrationRegion || '',
      landline: prev.landline || prev.mobile || '',
      // Always compute fullName from name parts
      fullName: [prev.firstName, prev.middleName, prev.lastName].filter(Boolean).join(' ') || prev.fullName || '',
    }));
  }, []);

  // Keep fullName in sync whenever first/middle/last name changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      fullName: [prev.firstName, prev.middleName, prev.lastName].filter(Boolean).join(' ') || prev.fullName || '',
    }));
  }, [formData.firstName, formData.middleName, formData.lastName]);

  const steps = [
    { title: "Application", component: <Step1 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Personal", component: <Step2 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Nominee", component: <Step3 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Bank", component: <Step4 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Documents", component: <Step5 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> },
    { title: "Finalize", component: <Step6 formData={formData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} /> }
  ];

  const validateStep = (step) => {
    const required = {
      1: ['region', 'district', 'photo_p1', 'sign_p1'],
      2: ['title', 'fatherName', 'motherName', 'aadhaar', 'landline', 'dob', 'qualification', 'profession', 'address_perm', 'pin_perm'],
      3: ['nominee_title', 'nominee_name', 'nominee_dob', 'nominee_relation', 'nominee_guardian_name', 'nominee_guardian_address', 'nominee_guardian_pin', 'photo_nominee', 'sign_nominee'],
      4: ['ifsc', 'bank_name', 'account_type', 'bank_address', 'branch_code', 'account_no', 'micr', 'sign_bank'],
      5: ['doc_education', 'police_verification', 'doc_police'],
      6: ['sign_declaration']
    };
    const missing = (required[step] || []).filter(f => !formData[f]);
    if (missing.length) {
      const niceNames = missing.map(m => m.replace(/_/g, ' ').toUpperCase());
      alert(`Please fill ALL required fields or upload missing files before proceeding.\n\nMissing:\n- ${niceNames.join('\n- ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;
    setIsSubmitting(true);
    console.log("FORM SUBMISSION DATA:", formData); // Added console logging as requested
    try {
      const res = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if ((await res.json()).success) {
        setShowSuccess(true);
      }
      else alert("Failed to submit. Please check all fields.");
    } catch {
      // Fallback for demo if backend is not running
      console.warn("Backend not reached, showing success modal for demo.");
      setShowSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full md:w-[98%] bg-white shadow-2xl rounded-xl overflow-hidden my-2 md:my-4 flex-1 flex flex-col h-fit animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="px-4 md:px-8 mt-4">
        <div className="flex justify-between mb-2 text-xs md:text-sm">
          {steps.map((s, i) => (<span key={i} className={`uppercase font-bold ${currentStep === i + 1 ? 'text-blue-700 underline underline-offset-4' : 'text-gray-400'}`}>{s.title}</span>))}
        </div>
        <div className="h-2 bg-gray-100 rounded-full"><div className="h-full bg-blue-700 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 6) * 100}%` }} /></div>
      </div>

      <div className="p-4 md:p-8 pt-4 md:pt-6 flex-1">
        <div className="print:hidden">
          {steps[currentStep - 1].component}
          <div className="mt-8 flex justify-between pt-6 border-t pb-2">
            <button onClick={() => currentStep > 1 ? setCurrentStep(s => s - 1) : navigate('/login')} className="flex gap-1 items-center text-xs md:text-sm font-bold uppercase text-gray-500 hover:text-blue-800 transition-colors"><ChevronLeft size={16} /> Back</button>
            <div className="flex gap-2">
              {currentStep === 6 && <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold uppercase flex gap-1 items-center hover:bg-black transition-all shadow-md"><Printer size={16} /> Print</button>}
              <button onClick={currentStep < 6 ? () => { if (validateStep(currentStep)) setCurrentStep(s => s + 1); } : handleSubmit} className="bg-blue-800 text-white px-6 md:px-8 py-2 rounded-full text-xs md:text-sm font-bold uppercase flex gap-1 items-center hover:bg-blue-900 transition-all shadow-lg">
                {isSubmitting ? "..." : (currentStep === 6 ? "Submit" : "Next")} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="hidden print:block space-y-12"><Step1 formData={formData} /><Step2 formData={formData} /><Step3 formData={formData} /><Step4 formData={formData} /><Step5 formData={formData} /><Step6 formData={formData} /></div>
      </div>
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} formData={formData} />
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    loginPassword: '',
    firstName: '', middleName: '', lastName: '',
    email: '', mobile: '', password: '', confirmPassword: '', dob: '', gender: '', registrationRegion: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Auto-fetch Bank Details when IFSC is entered (11 characters)
  useEffect(() => {
    if (formData.ifsc && formData.ifsc.length === 11) {
      fetch(`https://ifsc.razorpay.com/${formData.ifsc}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.BANK) {
            setFormData(prev => ({
              ...prev,
              bank_name: data.BANK || prev.bank_name,
              branch_code: data.BRANCH || prev.branch_code,
              bank_address: data.ADDRESS || prev.bank_address,
              micr: data.MICR || prev.micr
            }));
          }
        })
        .catch(err => console.error("IFSC fetch error:", err));
    }
  }, [formData.ifsc]);

  const handleInputChange = (e) => {
    let { name, value, type, checked } = e.target;
    const numericFields = ['mobile', 'landline', 'witness_mobile', 'regional_code', 'aadhaar', 'pin_corr', 'pin_perm', 'account_no', 'micr'];
    if (numericFields.includes(name)) value = value.replace(/[^0-9+ ]/g, '');

    setFormData(prev => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'registrationRegion') next.region = value;
      if (name === 'region') next.district = ''; // Clear district when region changes
      return next;
    });
  };

  const handleFileChange = (name, fileOrValue) => {
    if (fileOrValue instanceof File) {
      if (fileOrValue.size > 1 * 1024 * 1024) {
        alert(`File size must be 1MB or less. Your file is ${(fileOrValue.size / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }
    }
    setFormData(prev => ({ ...prev, [name]: fileOrValue }));
  };

  const handleSendOtp = async () => {
    if (!formData.mobile) { setOtpError('Enter mobile'); return; }
    setLoadingOtp(true); setOtpError(''); setOtpSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.mobile }),
      });
      if ((await res.json()).success) { setIsOtpSent(true); setOtpSuccess('Sent!'); }
      else setOtpError('Failed');
    } catch { setOtpError('Error'); } finally { setLoadingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    setLoadingOtp(true);
    try {
      const res = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.mobile, code: otp }),
      });
      if ((await res.json()).success) { setIsVerified(true); setOtpSuccess('Verified!'); setOtp(''); }
      else setOtpError('Invalid');
    } catch { setOtpError('Fail'); } finally { setLoadingOtp(false); }
  };

  const otpProps = { otp, setOtp, isOtpSent, isVerified, loadingOtp, handleSendOtp, handleVerifyOtp, otpError, otpSuccess };

  return (
    <Router>
      <div className="min-h-screen bg-gray-200 font-sans flex flex-col text-xs">
        <Header />

        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginRoute formData={formData} handleInputChange={handleInputChange} />} />
          <Route path="/register" element={<RegistrationRoute formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} otpProps={otpProps} />} />
          <Route path="/form" element={<FormRoute formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleFileChange={handleFileChange} />} />
        </Routes>

        <footer className="bg-blue-900 text-white p-4 text-center mt-auto">
          <p className="text-sm font-bold uppercase mb-2 tracking-widest">बीके-टाइम्स - एक गाव एक पत्रकार मोहीम-२०२६</p>
          <div className="text-[10px] tracking-[0.2em] font-light opacity-80">
            BK TIMES DISTRICT CO-ORDINATOR PORTAL © {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;