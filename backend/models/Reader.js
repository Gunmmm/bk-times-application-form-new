const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String },
  education: { type: String },
  address: { type: String },
  district: { type: String },
  taluka: { type: String },
  village: { type: String },
  pinCode: { type: String },
  subscriptionPlan: { type: String },
  paymentAmount: { type: Number, default: 0 },
  registeredBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reader', readerSchema);
