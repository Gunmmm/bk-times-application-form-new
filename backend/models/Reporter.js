const mongoose = require('mongoose');

const reporterSchema = new mongoose.Schema({
  personal: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    birthday: { type: Date, required: true }, // Reverted to Date to support full birth date
    birthYear: { type: String }, // Optional field for the 4-digit year specifically
    gender: { type: String, required: true },
    education: { type: String, required: true },
    street: { type: String, required: true },
    village: { type: String },
    district: { type: String, required: true },
    taluka: { type: String, required: true },
    city: { type: String },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    plan: { type: String, required: true },
    comments: { type: String, maxLength: 500 },
    metadata: { type: Object },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    permissions: {
      canAdd: { type: Boolean, default: true },
      canEdit: { type: Boolean, default: true },
      canDelete: { type: Boolean, default: false },
      canView: { type: Boolean, default: true }
    }
  },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Using 'reporters' collection to maintain compatibility
module.exports = mongoose.model('Reporter', reporterSchema, 'reporters');
