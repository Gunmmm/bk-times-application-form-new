const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobile: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, default: 'reporter' },
  applying_for: { type: String },
  region: { type: String },
  district: { type: String },
  taluka: { type: String },
  village: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'none'], default: 'none' },
  transactionId: { type: String },
  paidAmount: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
