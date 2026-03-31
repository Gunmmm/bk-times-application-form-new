const express = require('express');
console.log("Starting server...");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const mongoose = require('mongoose');
const OTP = require('./models/OTP');
const User = require('./models/User');
const Submission = require('./models/Submission');
const Payment = require('./models/Payment');
const Reader = require('./models/Reader');
const Reporter = require('./models/Reporter');
const OfficialRegistration = require('./models/OfficialRegistration');
const { getReaderModel, getNewsModel } = require('./models/roleModels');

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Helper: Generate Unique Coordinator Identification Code
const generateCoordinatorCode = async (role) => {
  const prefix = (role || 'CO').substring(0, 2).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  const code = `BKT-${prefix}-${random}`;
  
  // Quick collision check
  const exists = await User.exists({ coordinatorCode: code });
  if (exists) return generateCoordinatorCode(role); // Retry once
  return code;
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedOfficialCoordinators();
  })
  .catch(err => console.log("MongoDB connection error:", err));

// Seed Official Coordinators as per User Request
async function seedOfficialCoordinators() {
  const officials = [
    { fullName: "Master Admin", email: "admin@bk-times.com", password: "bkadmin2026", mobile: "9999000001", role: "admin" },
    { fullName: "Zone Coordinator", email: "zone@bk-times.com", password: "bkzone2026", mobile: "9999000002", role: "zone_coordinator" },
    { fullName: "District Coordinator", email: "district@bk-times.com", password: "bkdistrict2026", mobile: "9999000003", role: "district_coordinator" },
    { fullName: "Taluka Coordinator", email: "taluka@bk-times.com", password: "bktaluka2026", mobile: "9999000004", role: "taluka_coordinator" },
    { fullName: "Village Coordinator", email: "village@bk-times.com", password: "bkvillage2026", mobile: "9999000005", role: "village_coordinator" }
  ];

  for (const official of officials) {
    try {
      const existing = await User.findOne({ email: official.email.toLowerCase() });
      if (!existing) {
        const coordCode = await generateCoordinatorCode(official.role);
        const user = new User({ ...official, email: official.email.toLowerCase(), coordinatorCode: coordCode });
        await user.save();
        console.log(`Seeded official: ${official.role} (${official.email})`);
      } else {
        const isMatch = await existing.comparePassword(official.password);
        if (!isMatch || existing.role !== official.role) {
           existing.password = official.password;
           existing.role = official.role;
           existing.fullName = official.fullName;
           await existing.save();
           console.log(`Reset official: ${official.role} credentials to fresh state`);
        }
      }
    } catch (err) {
      console.error(`Error resetting ${official.email}:`, err.message);
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

const ROLES_DISPLAY_NAMES = {
  village_coordinator: 'Village Coordinator',
  taluka_coordinator: 'Taluka Coordinator',
  district_coordinator: 'District Coordinator',
  zone_coordinator: 'Zone Coordinator',
  admin: 'Master Admin',
  reporter: 'Reporter'
};

const ROLE_MAP = {
  village_coordinator: 'village_coordinator',
  taluka_coordinator: 'taluka_coordinator',
  district_coordinator: 'district_coordinator',
  zone_coordinator: 'zone_coordinator',
  admin: 'admin',
  village: 'village_coordinator',
  taluka: 'taluka_coordinator',
  district: 'district_coordinator',
  zone: 'zone_coordinator',
  // Legacy/Portal mapping
  "Regional Co-ordinator": "zone",
  "District Co-ordinator": "district",
  "Tahshil Co-ordinator": "taluka",
  "Village Co-ordinator": "village"
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'bk_times_secure_2026_super_secret';

// --- Authentication Middleware (Verify JWT) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Contains id, email, role, etc.
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or Expired Token' });
  }
};

// --- Authorization Middleware (Verify Role) ---
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Authorization Required' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Permission Denied: ${req.user.role.replace('_', ' ').toUpperCase()} cannot access this resource.` 
      });
    }
    next();
  };
};

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// Routes
app.get('/', (req, res) => {
  res.json({ message: 'BK Times API is running (Twilio OTP ready)' });
});

// Send OTP (Twilio SMS)
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }
    // Validate phone format, e.g. +91xxxxxxxxxx
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone format' });
    }
    let normalizedPhone = phone.replace(/\s+/g, '');
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.length === 10) {
        normalizedPhone = `+91${normalizedPhone}`;
      } else {
        normalizedPhone = `+${normalizedPhone}`;
      }
    }
    const verification = await client.verify.v2.services(VERIFY_SERVICE_SID)
      .verifications
      .create({ to: normalizedPhone, channel: 'sms' });
    console.log('OTP sent to', normalizedPhone);
    res.json({ success: true, sid: verification.sid, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP: ' + error.message });
  }
});

// Verify OTP (Twilio SMS)
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone and OTP code required' });
    }
    let normalizedPhone = phone.replace(/\s+/g, '');
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.length === 10) {
        normalizedPhone = `+91${normalizedPhone}`;
      } else {
        normalizedPhone = `+${normalizedPhone}`;
      }
    }
    const verificationCheck = await client.verify.v2.services(VERIFY_SERVICE_SID)
      .verificationChecks
      .create({ to: normalizedPhone, code });
    if (verificationCheck.status === 'approved') {
      console.log('OTP verified for', normalizedPhone);
      res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed: ' + error.message });
  }
});

// Optional auth — reads token if present but never blocks the request
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};

// Centralized System Models (Single Source of Truth)
const News = require('./models/News');
const Ad = require('./models/Ad');
const Coordinator = require('./models/Coordinator');
const Settings = require('./models/Settings');
const AuditLog = require('./models/AuditLog');


// Activity Tracking Helper
const logActivity = async (data) => {
  try {
    const log = new AuditLog({
      applicationId: data.applicationId || 'N/A',
      applicantName: data.applicantName || 'N/A',
      changedByUser: data.user?.fullName || data.user?.email || 'System',
      changedByRole: data.user?.role || 'System',
      actionType: data.actionType,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
      note: data.note,
      district: data.user?.district || '',
      taluka: data.user?.taluka || '',
      village: data.user?.village || ''
    });
    await log.save();
  } catch (err) { console.error('Audit Log Error:', err); }
};

// --- AUTHENTICATION & PASSWORD RESET ENDPOINTS ---

// Register New User
app.post('/api/register', async (req, res) => {
  try {
    const { 
      firstName, middleName, lastName, email, mobile, password, 
      applying_for, registrationRegion, district, taluka, village,
      paymentStatus, transactionId, paidAmount 
    } = req.body;
    
    // Basic check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists with this email or mobile' });

    const coordCode = await generateCoordinatorCode(applying_for);

    const newUser = new User({
      fullName: `${firstName} ${middleName} ${lastName}`.trim(),
      email: email.toLowerCase(),
      mobile,
      password,
      applying_for,
      region: registrationRegion,
      district,
      taluka,
      village,
      role: ROLE_MAP[applying_for] || 'reporter',
      coordinatorCode: coordCode,
      paymentStatus: paymentStatus || 'none',
      transactionId,
      paidAmount
    });

    await newUser.save();

    // Also create a Coordinator record if it's a higher role (compatible with Portal logic)
    if (ROLE_MAP[applying_for]) {
      const coordinator = new Coordinator({
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        password: password,
        role: ROLE_MAP[applying_for],
        coordinatorCode: coordCode,
        zone: registrationRegion,
        district,
        taluka,
        village
      });
      await coordinator.save();
    }

    res.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// Login User (Combined)
app.post(['/api/login', '/api/auth/login'], async (req, res) => {
  try {
    const { loginIdentifier, email, password, loginPassword, role } = req.body;
    const identifier = (loginIdentifier || email || '').trim().toLowerCase();
    const credPassword = loginPassword || password;

    if (!identifier || !credPassword) {
       return res.status(400).json({ success: false, message: 'Identity and Password required' });
    }

    // Email regex check (Basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(identifier);
    // (If not email, assuming mobile; logic currently supports both)

    // Lookup user
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { mobile: identifier }] 
    });

    if (!user) {
       return res.status(401).json({ success: false, message: 'Invalid credentials. Access Denied.' });
    }

    const isMatch = await user.comparePassword(credPassword);
    if (!isMatch) {
       // Increment login attempts or handle lock logic here if needed
       return res.status(401).json({ success: false, message: 'Invalid credentials. Access Denied.' });
    }

    if (!user.isActive) {
       return res.status(403).json({ success: false, message: 'This account is inactive. Please contact your coordinator.' });
    }

    // --- STRICT PROFILE IDENTITY MATCH ---
    // The user's role MUST exactly match the portal they are trying to enter.
    // No fallbacks. No exceptions. ADMIN stays in ADMIN portal only.
    const roleInDb = user.role;
    if (!roleInDb) {
      return res.status(403).json({ success: false, message: 'Account role is not configured. Contact administrator.' });
    }

    if (role && roleInDb !== role) {
       const readableDb = (ROLES_DISPLAY_NAMES[roleInDb] || roleInDb).replace(/_/g, ' ').toUpperCase();
       const readableTarget = (ROLES_DISPLAY_NAMES[role] || role).replace(/_/g, ' ').toUpperCase();
       return res.status(403).json({ 
         success: false, 
         message: `Access Denied: This email belongs to the ${readableDb} portal. You selected ${readableTarget}. Please use the correct email for your portal.` 
       });
    }

    // Successful authentication
    const payload = { 
       id: user._id, 
       email: user.email, 
       role: roleInDb,
       fullName: user.fullName,
       coordinatorCode: user.coordinatorCode,
       zone: user.region,
       district: user.district,
       taluka: user.taluka,
       village: user.village
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ success: true, token, role: roleInDb, user: payload, message: 'Login successful' });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Authentication failure. Please try again later.' });
  }
});

// Coordinator Specific Signup (for pages like TalukaSignup)
app.post('/api/coordinators/signup', async (req, res) => {
  try {
     const { name, email, password, role, zone, district, taluka, village } = req.body;
     const exists = await Coordinator.findOne({ email: email.toLowerCase() });
     if (exists) return res.status(400).json({ success: false, message: 'Coordinator already exists' });

     const coordCode = await generateCoordinatorCode(role);
     const coordinator = new Coordinator({
       name,
       email: email.toLowerCase(),
       password,
       role,
       coordinatorCode: coordCode,
       zone, district, taluka, village
     });
     await coordinator.save();
     
     // Also sync with User collection
     const user = new User({
       fullName: name,
       email: email.toLowerCase(),
       mobile: `900${Math.floor(1000000 + Math.random()*8999999)}`, // Mock mobile
       password,
       role: role,
       applying_for: role,
       coordinatorCode: coordCode,
       region: zone,
       district,
       taluka,
       village
     });
     await user.save();
     
     res.status(201).json({ success: true, message: 'Account Created Successfully!', coordinatorCode: coordCode });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// Forgot Password Request (Sends OTP to Email)
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.findOneAndUpdate({ email: email.toLowerCase() }, { otp: otpCode, createdAt: new Date() }, { upsert: true });

    // Send the "Password Reset" email
    await sgMail.send({
      to: email.toLowerCase(),
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@bk-times.com',
      subject: 'BK-TIMES Password Reset Code',
      text: `Your reset code is: ${otpCode}. Valid for 5 minutes.`,
      html: `<h3>Reset Your Password</h3><p>Your verification code is: <strong>${otpCode}</strong></p>`
    });

    res.json({ success: true, message: 'Reset code sent!' });
  } catch (error) {
    console.error('Forgot PW error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset code' });
  }
});

// Reset Password Update
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    // First verify the OTP
    const storedOTP = await OTP.findOne({ email: email.toLowerCase(), otp: code });
    if (!storedOTP) return res.status(400).json({ success: false, message: 'Invalid or expired code.' });

    // Find the user and update password
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: newPassword }, 
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Cleanup OTP
    await OTP.deleteOne({ _id: storedOTP._id });

    res.json({ success: true, message: 'Password reset successful! Please login.' });
  } catch (error) {
    console.error('Reset PW error:', error);
    res.status(500).json({ success: false, message: 'Reset failed' });
  }
});

// --- EMAIL VERIFICATION ENDPOINTS (Direct SendGrid) ---

// Send Email OTP
app.post('/api/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert OTP in MongoDB: overwrites existing one if user requests again (prevents stale duplicates)
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send the email directly (No Redis/BullMQ version)
    await sgMail.send({
      to: email.toLowerCase(),
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@bk-times.com',
      subject: 'Your BK-TIMES Application Code',
      text: `Your OTP for registration is: ${otpCode}. Valid for 5 minutes.`,
      html: `<strong>Your OTP for registration is: ${otpCode}</strong><p>Valid for 5 minutes.</p>`,
    });

    console.log(`Email OTP sent successfully to ${email}`);
    res.json({ success: true, message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Send Email OTP error:', error);
    res.status(500).json({ success: false, message: 'Email OTP failed: ' + error.message });
  }
});

// Verify Email OTP
app.post('/api/verify-email-otp', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and Code required' });

    const storedOTP = await OTP.findOne({ email: email.toLowerCase(), otp: code });

    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
    }

    // Successfully verified! Delete it so it can't be reused (Prevent duplicate verification)
    await OTP.deleteOne({ _id: storedOTP._id });

    res.json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Verify Email OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed: ' + error.message });
  }
});

// TEST EMAIL ENDPOINT (for manual verification)
app.get('/api/test-email', async (req, res) => {
  try {
    await sgMail.send({
      to: "punamwadje28@gmail.com",
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@bk-times.com',
      subject: "Test Email",
      text: "SendGrid working successfully"
    });

    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email full error:', error.response?.body || error.message || error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.response?.body || error.message
    });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const formData = req.body;
    console.log('Received form submission:', formData.fullName || 'Anonymous');

    // Add timestamp
    const newSubmission = new Submission({
      ...formData,
      submittedAt: new Date().toISOString()
    });

    // Save to MongoDB
    await newSubmission.save();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully to Database!',
      submissionId: newSubmission._id
    });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while saving the application to Database.'
    });
  }
});

// Get All Submissions (Reporters Data)
app.get('/api/submissions', authenticateToken, authorizeRole(['admin', 'zone_coordinator', 'district_coordinator', 'taluka_coordinator', 'manager', 'senior_manager']), async (req, res) => {
  try {
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
  }
});

// Get All Registered Reporters (Users & Staff)
app.get('/api/reporters', authenticateToken, async (req, res) => {
  try {
    const filter = buildJurisdictionFilter(req.user);
    const reporters = await Reporter.find(filter).sort({ createdAt: -1 });
    res.json(reporters); 
  } catch (error) {
    console.error('Error fetching reporters:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reporters' });
  }
});

// Official Master Registration (Unified high-fidelity flow)
app.get('/api/official-registrations', authenticateToken, async (req, res) => {
  try {
    const filter = buildJurisdictionFilter(req.user);
    const results = await OfficialRegistration.find(filter).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/master-register', authenticateToken, async (req, res) => {
  try {
    const { 
      fullName, phone, gender, education, day, month, year,
      address, state, district, taluka, village, pinCode,
      role, subscriptionPlan, paymentAmount, vendorId 
    } = req.body;

    const registration = new OfficialRegistration({
      fullName,
      phone,
      gender,
      education,
      birthday: (day && month && year) ? new Date(`${year}-${month}-${day}`) : null,
      address,
      state: state || 'Maharashtra',
      district,
      taluka,
      village,
      pinCode,
      role,
      subscriptionPlan,
      paymentAmount,
      vendorId,
      registeredBy: req.user.fullName || req.user.email,
      registeredByRole: req.user.role,
      status: 'Active'
    });

    await registration.save();
    
    // Log the registration in audit logs
    await logActivity({
      applicantName: fullName,
      user: req.user,
      actionType: 'OFFICIAL_ENROLLMENT',
      note: `New ${role} enrolled with Vendor ID: ${vendorId}`
    });

    res.status(201).json({ success: true, message: 'Official Enrollment Successful', registration });
  } catch (err) {
    console.error('Master Register Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/reporters', authenticateToken, async (req, res) => {
  try {
    const reporterData = {
      ...req.body,
      registeredBy: req.user?.email || 'unknown',
      registeredByRole: req.user?.role || 'unknown',
      createdAt: Date.now()
    };
    const reporter = new Reporter({
      personal: {
        fullName: req.body.name,
        phone: req.body.mobile,
        gender: req.body.gender || 'Other',
        education: req.body.education || 'N/A',
        street: req.body.address || 'N/A',
        village: req.body.village || '',
        taluka: req.body.taluka || '',
        district: req.body.district || '',
        pincode: req.body.pinCode || '000000',
        state: 'Maharashtra',
        plan: req.body.applying_for || 'reporter',
        coordinatorCode: generateCoordinatorCode(req.body.applying_for || 'reporter')
      },
      amount: 0,
      createdAt: Date.now()
    });
    // Add additional properties for the flat frontend structure
    const saved = await reporter.save();
    res.status(201).json({ success: true, reporter: { ...req.body, _id: saved._id, coordinatorCode: reporter.personal.coordinatorCode } });
  } catch (err) {
    console.error('Save reporter error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/reporters/:id', authenticateToken, async (req, res) => {
  try {
    const update = {
      'personal.fullName': req.body.name,
      'personal.phone': req.body.mobile,
      'personal.gender': req.body.gender,
      'personal.education': req.body.education,
      'personal.street': req.body.address,
      'personal.village': req.body.village,
      'personal.taluka': req.body.taluka,
      'personal.district': req.body.district,
      'personal.pincode': req.body.pinCode,
      'personal.plan': req.body.applying_for
    };
    const reporter = await Reporter.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!reporter) return res.status(404).json({ success: false, message: 'Reporter not found' });
    res.json({ success: true, reporter: { ...req.body, _id: reporter._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find().populate('user', 'fullName email mobile').sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// --- PAYMENT GATEWAY ENDPOINTS (Razorpay Mock) ---

const ROLE_FEES = {
  "Regional Co-ordinator": { deposit: 80000, fees: 20000, total: 100000 },
  "District Co-ordinator": { deposit: 60000, fees: 10000, total: 70000 },
  "Tahshil Co-ordinator": { deposit: 40000, fees: 10000, total: 50000 },
  "Village Co-ordinator": { deposit: 0, fees: 0, total: 0 }
};

// Create Payment Order
app.post(['/create-order', '/api/create-order'], async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !ROLE_FEES[role]) {
      return res.status(400).json({ success: false, message: 'Invalid role for payment' });
    }

    const feeDetails = ROLE_FEES[role];
    if (feeDetails.total === 0) {
      return res.json({ success: true, paymentNotRequired: true });
    }

    const options = {
      amount: feeDetails.total * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { role: role }
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order: ' + error.message });
  }
});

// Create Reader Subscription Payment Order
app.post('/api/create-reader-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required' });

    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `reader_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create Reader Order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// Verify Payment
app.post(['/verify-payment', '/api/verify-payment'], async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, mobile, role } = req.body;
    
    // Verify Signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    if (generated_signature === razorpay_signature) {
      console.log(`Payment verified for order ${razorpay_order_id}`);
      const feeDetails = ROLE_FEES[role] || { total: 0 };

      // Find User Record if exists (linking by email or mobile)
      let userId = null;
      if (email || mobile) {
        const user = await User.findOneAndUpdate(
          { $or: [{ email: email?.toLowerCase() }, { mobile }] },
          { 
            paymentStatus: 'paid', 
            transactionId: razorpay_payment_id,
            paidAmount: feeDetails.total
          },
          { new: true }
        );
        if (user) userId = user._id;
      }

      // Save Payment Record
      const newPayment = new Payment({
        user: userId, // Store user_id directly
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: feeDetails.total,
        email: email?.toLowerCase(),
        mobile,
        role,
        status: 'success'
      });
      await newPayment.save();

      res.json({ success: true, message: 'Payment verified and recorded successfully' });
    } else {
      console.warn(`Payment signature mismatch for order ${razorpay_order_id}`);
      res.status(400).json({ success: false, message: 'Payment verification failed: Signature mismatch' });
    }
  } catch (error) {
    console.error('Verify Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// --- DASHBOARD & PORTAL ENDPOINTS (Ricotta Integration) ---

// Get Stats Dashboard Numbers
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { role, village, taluka, district, zone } = req.user;
    
    // Create jurisdiction filter for stats
    let jurisdictionFilter = {};
    if (role === 'village_coordinator' || role === 'village') jurisdictionFilter = { 'village': village || req.user.village };
    else if (role === 'taluka_coordinator' || role === 'taluka') jurisdictionFilter = { 'taluka': taluka || req.user.taluka };
    else if (role === 'district_coordinator' || role === 'district') jurisdictionFilter = { 'district': district || req.user.district };
    else if (role === 'zone_coordinator' || role === 'zone') jurisdictionFilter = { 'region': zone || req.user.zone };

    let baseTotalAds = await Ad.countDocuments();
    let basePending = await Ad.countDocuments({ status: 'Pending Approval' });
    let baseRevenue = 0; 

    // Simulation numbers if no real data
    if (role === 'village') {
      baseTotalAds = 10;
      baseRevenue = 2500;
    } else if (role === 'taluka') {
      baseTotalAds = 20;
      baseRevenue = 10000;
    }

    const totalReporters = await User.countDocuments({ ...jurisdictionFilter, role: 'reporter' });
    const reportersToday = await User.countDocuments({ ...jurisdictionFilter, role: 'reporter', createdAt: { $gte: today } });
    
    // Fetch global settings
    let settings = await Settings.findOne({ type: 'global' });
    if (!settings) settings = await Settings.create({ type: 'global' });

    const displayRevenue = baseRevenue;
    const roleKey = role.split('_')[0];
    const commRate = settings.commissions[roleKey] || settings.commissions.village || 13;
    const adsCommRate = settings.commissions.ads || 18;

    res.json({
      notice: settings.notice,
      commissionRate: commRate,
      adsCommissionRate: adsCommRate,
      readers: { total: totalReporters, today: reportersToday, income: 0 },
      ads: { 
        total: baseTotalAds, 
        pending: basePending,
        active: Math.floor(baseTotalAds * 0.7),
        totalRevenue: displayRevenue,
        yourCommission: Math.floor(displayRevenue * (adsCommRate / 100))
      },
      news: { total: 0, today: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin Management
app.get('/api/admin/settings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  let settings = await Settings.findOne({ type: 'global' });
  if (!settings) settings = await Settings.create({ type: 'global' });
  res.json(settings);
});

app.post('/api/admin/settings', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { notice, commissions, permissions } = req.body;
  const settings = await Settings.findOneAndUpdate(
    { type: 'global' }, 
    { notice, commissions, permissions, updatedAt: Date.now() }, 
    { upsert: true, new: true }
  );
  res.json(settings);
});

app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/admin/full-overview', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Aggregate stats from unified master collections
    const [coordinators, readersCount, newsCount, activeToday, logs] = await Promise.all([
      User.countDocuments({ role: { $ne: 'reporter' } }),
      Reader.countDocuments(),
      News.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      AuditLog.find().sort({ changedAt: -1 }).limit(10)
    ]);

    // Regional group by
    const regionalData = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: {
          _id: "$district",
          totalLeaders: { $sum: { $cond: [{ $ne: ["$role", "reporter"] }, 1, 0] } },
          totalReporters: { $sum: { $cond: [{ $eq: ["$role", "reporter"] }, 1, 0] } }
      }},
      { $project: { district: "$_id", _id: 0, totalLeaders: 1, totalReporters: 1, totalVillages: { $literal: 0 } } }
    ]);

    res.json({
      stats: {
        coordinators,
        reporters: readersCount,
        activeToday,
        allNews: newsCount
      },
      recentLogs: logs,
      regionalData: regionalData.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/audit-logs', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ changedAt: -1 }).limit(100);
    res.json(logs);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// Ads Routes
app.get('/api/ads', authenticateToken, async (req, res) => {
  const ads = await Ad.find().sort({ createdAt: -1 });
  res.json(ads);
});

app.post('/api/ads', authenticateToken, async (req, res) => {
  const adData = req.body;
  adData.commission40pct = adData.price * 0.4;
  adData.advertiserShare60pct = adData.price * 0.6;
  const newAd = new Ad(adData);
  await newAd.save();
  res.status(201).json(newAd);
});

// Helper: build jurisdiction filter from token user
function buildJurisdictionFilter(user) {
  if (!user) return {};
  const { role, village, taluka, district, zone } = user;
  if (role === 'village_coordinator' || role === 'village') return village ? { village } : {};
  if (role === 'taluka_coordinator'  || role === 'taluka')  return taluka  ? { taluka  } : {};
  if (role === 'district_coordinator'|| role === 'district')return district? { district} : {};
  if (role === 'zone_coordinator'    || role === 'zone')    return zone    ? { $or: [{ zone }, { region: zone }] } : {};
  return {}; // admin sees all
}

// ── NEWS/AD ROUTES (Unified Collection) ──────────────────────────────────
app.get('/api/news', authenticateToken, authorizeRole(['admin', 'zone_coordinator', 'district_coordinator', 'taluka_coordinator', 'village_coordinator', 'manager', 'senior_manager']), async (req, res) => {
  try {
    const filter = buildJurisdictionFilter(req.user);
    const news = await News.find(filter).sort({ createdAt: -1 });
    res.json(news);
  } catch(e) { res.json([]); }
});

app.post('/api/news', authenticateToken, async (req, res) => {
  try {
    const newsData = {
      ...req.body,
      village:         req.user?.village || req.body.village || '',
      taluka:          req.user?.taluka  || req.body.taluka || '',
      district:        req.user?.district|| req.body.district || '',
      zone:            req.user?.zone    || req.body.zone || '',
      submittedByRole: req.user?.role    || 'unknown',
      registeredBy:    req.user?.email   || 'unknown'
    };
    const newsItem = new News(newsData);
    await newsItem.save();
    
    await logActivity({
      applicationId: newsItem._id,
      applicantName: newsItem.name,
      user: req.user,
      actionType: 'Create',
      newStatus: 'Pending Approval',
      note: `New Ad Booking created by ${req.user.role}`
    });

    res.status(201).json(newsItem);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/news/:id', authenticateToken, async (req, res) => {
  try {
    const ad = await News.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: Date.now() }, { new: true });
    if (!ad) return res.status(404).json({ message: 'News record not found' });
    
    await logActivity({
      applicationId: ad._id,
      applicantName: ad.name || ad.headline,
      user: req.user,
      actionType: 'Update',
      newStatus: ad.status,
      note: `News record updated by ${req.user.role}`
    });

    res.json({ success: true, news: ad, _id: ad._id });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/news/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'News record deleted' });
  } catch(e) { res.status(500).json({ message: e.message }); }
});

app.patch('/api/news/:id/status', authenticateToken, authorizeRole(['admin', 'zone_coordinator', 'district_coordinator']), async (req, res) => {
  try {
    const { status, note } = req.body;
    const oldAd = await News.findById(req.params.id);
    if (!oldAd) return res.status(404).json({ message: 'Ad not found' });

    const ad = await News.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true });
    
    await logActivity({
      applicationId: ad._id,
      applicantName: ad.name,
      user: req.user,
      actionType: status === 'Rejected' ? 'Reject' : 'Approve',
      oldStatus: oldAd.status,
      newStatus: status,
      note: note || `Application status changed to ${status}`
    });

    res.json(ad);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// ── READERS ROUTES (Unified Collection) ─────────────────────────────────────
app.get('/api/readers', authenticateToken, authorizeRole(['admin', 'zone_coordinator', 'district_coordinator', 'taluka_coordinator', 'village_coordinator', 'manager', 'senior_manager']), async (req, res) => {
  try {
    const filter = buildJurisdictionFilter(req.user);
    const readers = await Reader.find(filter).sort({ createdAt: -1 });
    res.json(readers);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/readers', authenticateToken, async (req, res) => {
  try {
    const readerInfo = {
      ...req.body,
      village:          req.body.village  || req.user?.village  || '',
      taluka:           req.body.taluka   || req.user?.taluka   || '',
      district:         req.body.district || req.user?.district || '',
      zone:             req.body.zone     || req.user?.zone     || '',
      registeredBy:     req.user?.email   || 'unknown',
      registeredByRole: req.user?.role    || 'unknown'
    };
    const reader = new Reader(readerInfo);
    await reader.save();

    await logActivity({
      applicationId: reader._id,
      applicantName: reader.name,
      user: req.user,
      actionType: 'Create',
      newStatus: 'Active',
      note: `New Reader registered by ${req.user.role}`
    });

    res.status(201).json({ success: true, reader });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/readers/:id', authenticateToken, async (req, res) => {
  try {
    const reader = await Reader.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reader) return res.status(404).json({ success: false, message: 'Reader not found' });
    res.json({ success: true, reader });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/readers/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
     await Reader.findByIdAndDelete(req.params.id);
     res.json({ success: true, message: 'Reader deleted by admin' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete('/api/reporters/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
     await Reporter.findByIdAndDelete(req.params.id);
     res.json({ success: true, message: 'Reporter deleted by admin' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── REPORTERS ROUTES ────────────────────────────────────────────────────────
app.get('/api/reporters', authenticateToken, async (req, res) => {
  try {
    const filter = buildJurisdictionFilter(req.user);
    const reporters = await Reporter.find(filter).sort({ createdAt: -1 });
    res.json(reporters);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/reporters', authenticateToken, async (req, res) => {
  try {
    const reporter = new Reporter({
      ...req.body,
      registeredBy:     req.user?.email || 'unknown',
      registeredByRole: req.user?.role  || 'unknown'
    });
    await reporter.save();
    res.status(201).json({ success: true, reporter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/reporters/:id', authenticateToken, async (req, res) => {
  try {
    const reporter = await Reporter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reporter) return res.status(404).json({ success: false, message: 'Reporter not found' });
    res.json({ success: true, reporter });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper Function for Jurisdiction filtering
function buildJurisdictionFilter(user) {
  if (!user || user.role === 'admin') return {};
  const filter = {};
  if (user.zone) filter.zone = user.zone;
  if (user.district) filter.district = user.district;
  if (user.taluka) filter.taluka = user.taluka;
  if (user.village) filter.village = user.village;
  return filter;
}

// Global 404 Logger
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
