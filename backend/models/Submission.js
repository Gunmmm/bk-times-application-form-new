const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  submittedAt: { type: Date, default: Date.now },
  fullName: { type: String, index: true },
  email: { type: String, index: true },
  mobile: { type: String, index: true },
  applying_for: { type: String },
  region: { type: String },
  district: { type: String },
  taluka: { type: String },
  village: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'none'], default: 'none' },
  transactionId: { type: String },
  paidAmount: { type: Number },
  // Field to store the entire form object including base64 images, etc.
  formData: { type: mongoose.Schema.Types.Mixed }
}, { 
  strict: false, // Allow other fields that might be in the form
  timestamps: true 
});

module.exports = mongoose.model('Submission', submissionSchema);
