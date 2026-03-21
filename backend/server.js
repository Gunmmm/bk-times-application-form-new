const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !VERIFY_SERVICE_SID) {
  console.error('CRITICAL: Twilio credentials or Verify Service SID are missing in .env');
} else {
  console.log('Twilio credentials detected in environment');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Ensure submissions file exists
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');
if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'BK Times API is running (Twilio OTP ready)' });
});

// Send OTP
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

// Verify OTP
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

app.post('/api/submit', (req, res) => {
  try {
    const formData = req.body;
    console.log('Received form submission:', formData.fullName || 'Anonymous');

    // Read existing submissions
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    const submissions = JSON.parse(data);

    // Add timestamp
    const newSubmission = {
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      ...formData
    };

    // Save back to file
    submissions.push(newSubmission);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully!',
      submissionId: newSubmission.id
    });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error occurred while saving the application.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
