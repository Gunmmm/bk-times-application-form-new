const { Worker } = require('bullmq');
const Redis = require('ioredis');

const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const connection = new Redis({ maxRetriesPerRequest: null });

const worker = new Worker('email-queue', async job => {
  if (job.name === 'send-otp-email') {
    const { email, otp } = job.data;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@bk-times.com',
      subject: 'Your BK-TIMES Application Code',
      text: `Your OTP for registration is: ${otp}. Valid for 5 minutes.`,
      html: `<strong>Your OTP for registration is: ${otp}</strong><p>Valid for 5 minutes.</p>`,
    };

    try {
      await sgMail.send(msg);
      console.log(`[EmailWorker] Sent OTP to ${email}`);
    } catch (error) {
      console.error(`[EmailWorker] Failed to send email to ${email}:`, error.response ? error.response.body : error.message);
      throw error; // Let BullMQ retry
    }
  }
}, { connection });

console.log('[EmailWorker] Worker is listening on email-queue...');
