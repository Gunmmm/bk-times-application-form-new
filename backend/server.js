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
      password, // In production, use bcrypt: await bcrypt.hash(password, 10),
      applying_for,
      region: registrationRegion,
      district,
      taluka,
      village,
      paymentStatus: paymentStatus || 'none',
      transactionId,
      paidAmount
    });

    await newUser.save();
    res.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// Login User
app.post('/api/login', async (req, res) => {
  try {
    const { loginIdentifier, loginPassword } = req.body;
    const identifier = loginIdentifier.toLowerCase();

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { mobile: identifier }] 
    });

    if (!user || user.password !== loginPassword) { // Verify with bcrypt.compare if using hashes
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, user: { fullName: user.fullName, email: user.email } });
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

// Get All Registered Reporters (Users)
app.get('/api/reporters', async (req, res) => {
  try {
    const reporters = await User.find({ role: 'reporter' }).sort({ createdAt: -1 });
    res.json({ success: true, count: reporters.length, data: reporters });
  } catch (error) {
    console.error('Error fetching reporters:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reporters' });
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

// Global 404 Logger
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
