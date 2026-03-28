const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  advertiser: { type: String, required: true },
  phone: { type: String, required: true },
  zones: [{ type: String }],
  content: { type: String },
  price: { type: Number },
  date: { type: String },
  image: { type: String },
  status: { type: String, default: 'Pending Approval' },
  isRegistered: { type: Boolean, default: false },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reporter' },
  commission40pct: { type: Number, default: 0 },
  advertiserShare60pct: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ad', adSchema);
