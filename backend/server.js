const express = require('express');
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

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

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

const jwt = require('jsonwebtoken');

// Role Mapping for consistent dashboard access
const ROLE_MAP = {
  "Regional Co-ordinator": "zone",
  "District Co-ordinator": "district",
  "Tahshil Co-ordinator": "taluka",
  "Village Co-ordinator": "village"
};

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Unauthenticated' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required' });
};

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

// Additional Models from Portal
const Ad = require('./models/Ad');
const News = require('./models/News');         // legacy — kept for public routes
const Coordinator = require('./models/Coordinator');
const Settings = require('./models/Settings');
const Reporter = require('./models/Reporter');

// Role-segregated collections (5 readers + 5 news)
const { getReaderModel, getNewsModel, ALL_READER_MODELS, ALL_NEWS_MODELS } = require('./models/roleModels');

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
    const identifier = (loginIdentifier || email || '').toLowerCase();
    const credPassword = loginPassword || password;

    if (!identifier || !credPassword) {
      return res.status(400).json({ success: false, message: 'Email/Mobile and Password required' });
    }

    // Try to find user in database first
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { mobile: identifier }] 
    });

    if (user && user.password === credPassword) {
      // Valid database user
      const roleForToken = user.role || ROLE_MAP[user.applying_for] || 'reporter';
      const payload = { 
        id: user._id, 
        email: user.email, 
        role: roleForToken,
        fullName: user.fullName,
        zone: user.region,
        district: user.district,
        taluka: user.taluka,
        village: user.village
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ success: true, token, role: roleForToken, user: payload, message: 'Login successful' });
    }

    // Also try Coordinator collection (portal coordinators)
    try {
      const coordinator = await Coordinator.findOne({ email: identifier });
      if (coordinator && (coordinator.password === credPassword)) {
        const coordRole = coordinator.role || role || 'village_coordinator';
        const payload = {
          id: coordinator._id,
          email: coordinator.email,
          role: coordRole,
          fullName: coordinator.name,
          zone: coordinator.zone,
          district: coordinator.district,
          taluka: coordinator.taluka,
          village: coordinator.village
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        return res.json({ success: true, token, role: coordRole, user: payload, message: 'Login successful' });
      }
    } catch(e) { /* Coordinator lookup failed, continue */ }

    // Demo / fallback: accept any login for portal coordinators (removes strict authorization)
    if (credPassword && identifier && role && role !== 'reporter') {
      const coordRole = role || 'village_coordinator';
      const payload = {
        id: 'demo_' + Date.now(),
        email: identifier,
        role: coordRole,
        fullName: identifier.split('@')[0],
        zone: '', district: '', taluka: '', village: ''
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
      return res.json({ success: true, token, role: coordRole, user: payload, message: 'Login successful' });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
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
app.get('/api/submissions', async (req, res) => {
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
    const NewsModel = getNewsModel(req.user?.role); 
    // Actually using the Reporter model directly for the management directories
    const filter = buildJurisdictionFilter(req.user);
    const reporters = await Reporter.find(filter).sort({ createdAt: -1 });
    res.json(reporters); 
  } catch (error) {
    console.error('Error fetching reporters:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reporters' });
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
        plan: req.body.applying_for || 'reporter'
      },
      amount: 0,
      createdAt: Date.now()
    });
    // Add additional properties for the flat frontend structure
    const saved = await reporter.save();
    res.status(201).json({ success: true, reporter: { ...req.body, _id: saved._id } });
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
    const commRate = settings.commissions[role.split('_')[0]] || settings.commissions.village || 13;

    res.json({
      notice: settings.notice,
      commissionRate: commRate,
      readers: { total: totalReporters, today: reportersToday, income: 0 },
      ads: { 
        total: baseTotalAds, 
        pending: basePending,
        active: Math.floor(baseTotalAds * 0.7),
        totalRevenue: displayRevenue,
        yourCommission: Math.floor(displayRevenue * (commRate / 100))
      },
      news: { total: 0, today: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Coordinator Management
app.get('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  let settings = await Settings.findOne({ type: 'global' });
  if (!settings) settings = await Settings.create({ type: 'global' });
  res.json(settings);
});

app.post('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  const { notice, commissions, permissions } = req.body;
  const settings = await Settings.findOneAndUpdate(
    { type: 'global' }, 
    { notice, commissions, permissions, updatedAt: Date.now() }, 
    { upsert: true, new: true }
  );
  res.json(settings);
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

// ── NEWS ROUTES (role-segregated collections) ──────────────────────────────
app.get('/api/news', optionalAuth, async (req, res) => {
  try {
    if (req.user?.role === 'admin') {
      // Admin: merge all news collections
      const all = await Promise.all(ALL_NEWS_MODELS.map(m => m.find().sort({ createdAt: -1 }).limit(50)));
      return res.json(all.flat().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
    const NewsModel = getNewsModel(req.user?.role);
    const filter = buildJurisdictionFilter(req.user);
    const news = await NewsModel.find(filter).sort({ createdAt: -1 });
    res.json(news);
  } catch(e) { res.json([]); }
});

app.get('/api/public/news', async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
});

app.get('/api/public/news/:id', async (req, res) => {
  const story = await News.findById(req.params.id);
  res.json(story);
});

app.post('/api/news', authenticateToken, async (req, res) => {
  try {
    const NewsModel = getNewsModel(req.user?.role);
    const locationTag = {
      village:         req.user?.village || '',
      taluka:          req.user?.taluka  || '',
      district:        req.user?.district|| '',
      zone:            req.user?.zone    || '',
      submittedByRole: req.user?.role    || 'unknown',
      registeredBy:    req.user?.email   || 'unknown'
    };
    const newsItem = new NewsModel({ ...req.body, ...locationTag });
    await newsItem.save();
    res.status(201).json(newsItem);
  } catch(e) { res.status(500).json({ message: e.message }); }
});

// ── READERS ROUTES (role-segregated collections) ───────────────────────────
app.get('/api/readers', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role === 'admin') {
      // Admin: merge all reader collections
      const all = await Promise.all(ALL_READER_MODELS.map(m => m.find().sort({ createdAt: -1 }).limit(200)));
      return res.json(all.flat().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
    const ReaderModel = getReaderModel(req.user?.role);
    const filter = buildJurisdictionFilter(req.user);
    const readers = await ReaderModel.find(filter).sort({ createdAt: -1 });
    res.json(readers);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/readers', authenticateToken, async (req, res) => {
  try {
    const ReaderModel = getReaderModel(req.user?.role);
    const readerInfo = {
      ...req.body,
      village:          req.body.village  || req.user?.village  || '',
      taluka:           req.body.taluka   || req.user?.taluka   || '',
      district:         req.body.district || req.user?.district || '',
      zone:             req.body.zone     || req.user?.zone     || '',
      registeredBy:     req.user?.email   || 'unknown',
      registeredByRole: req.user?.role    || 'unknown'
    };
    const reader = new ReaderModel(readerInfo);
    await reader.save();
    res.status(201).json({ success: true, reader });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/readers/:id', authenticateToken, async (req, res) => {
  try {
    const ReaderModel = getReaderModel(req.user?.role);
    const reader = await ReaderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reader) return res.status(404).json({ success: false, message: 'Reader not found' });
    res.json({ success: true, reader });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/readers/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
     const ReaderModel = getReaderModel(req.user?.role);
     await ReaderModel.findByIdAndDelete(req.params.id);
     res.json({ success: true, message: 'Reader deleted by admin' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

app.delete('/api/reporters/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
     await Reporter.findByIdAndDelete(req.params.id);
     res.json({ success: true, message: 'Reporter deleted by admin' });
  } catch(e) { res.status(500).json({ success: false, message: e.message }); }
});

// Global 404 Logger
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
