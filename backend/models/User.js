const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  mobile: { type: String, required: true, unique: true, index: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'zone_coordinator', 'district_coordinator', 'taluka_coordinator', 'village_coordinator', 'reporter', 'manager', 'senior_manager'],
    default: 'reporter' 
  },
  applying_for: { type: String },
  region: { type: String },
  district: { type: String },
  taluka: { type: String },
  village: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'none'], default: 'none' },
  transactionId: { type: String },
  paidAmount: { type: Number },
  coordinatorCode: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// (Standard schema exports)

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
