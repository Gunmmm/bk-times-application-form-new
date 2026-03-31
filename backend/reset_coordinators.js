/**
 * BK Times - Clean Coordinator Reset Script
 * Deletes all 5 official coordinator accounts and re-seeds them fresh.
 * Run with: node reset_coordinators.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('Connection failed:', err); process.exit(1); });

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, lowercase: true, trim: true },
  mobile: String,
  password: String,
  role: String,
  isActive: { type: Boolean, default: true },
  coordinatorCode: String,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

// DO NOT use the pre-save hook here — we hash manually for full control
const User = mongoose.model('User', userSchema);

const OFFICIALS = [
  { fullName: 'Master Admin',         email: 'admin@bk-times.com',    password: 'bkadmin2026',    mobile: '9999900001', role: 'admin',                coordinatorCode: 'BKT-AD-0001' },
  { fullName: 'Zone Coordinator',     email: 'zone@bk-times.com',     password: 'bkzone2026',     mobile: '9999900002', role: 'zone_coordinator',     coordinatorCode: 'BKT-ZO-0002' },
  { fullName: 'District Coordinator', email: 'district@bk-times.com', password: 'bkdistrict2026', mobile: '9999900003', role: 'district_coordinator', coordinatorCode: 'BKT-DI-0003' },
  { fullName: 'Taluka Coordinator',   email: 'taluka@bk-times.com',   password: 'bktaluka2026',   mobile: '9999900004', role: 'taluka_coordinator',   coordinatorCode: 'BKT-TA-0004' },
  { fullName: 'Village Coordinator',  email: 'village@bk-times.com',  password: 'bkvillage2026',  mobile: '9999900005', role: 'village_coordinator',  coordinatorCode: 'BKT-VI-0005' },
];

async function reset() {
  try {
    // Step 1: Delete ALL existing official coordinator records
    const emailsToDelete = OFFICIALS.map(o => o.email);
    const result = await User.deleteMany({ email: { $in: emailsToDelete } });
    console.log(`\n✅ Deleted ${result.deletedCount} old coordinator accounts.`);

    // Step 2: Create fresh accounts with hashed passwords
    for (const official of OFFICIALS) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(official.password, salt);

      await User.create({
        fullName: official.fullName,
        email: official.email,
        mobile: official.mobile,
        password: hashedPassword,
        role: official.role,
        coordinatorCode: official.coordinatorCode,
        isActive: true,
      });

      console.log(`✅ Created: [${official.role}] ${official.email}`);
    }

    console.log('\n🔒 All 5 coordinators have been reset with fresh credentials.\n');
    console.log('--- CREDENTIALS ---');
    OFFICIALS.forEach(o => {
      console.log(`${o.role.padEnd(25)} | Email: ${o.email.padEnd(30)} | Password: ${o.password}`);
    });

  } catch (err) {
    console.error('Reset failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

reset();
