const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  applicationId: { type: String, required: true },
  applicantName: { type: String },
  changedByUser: { type: String, required: true }, // name/email
  changedByRole: { type: String, required: true },
  actionType: { type: String, enum: ['Create', 'Edit', 'Approve', 'Reject', 'Forward', 'Note'], default: 'Edit' },
  oldStatus: { type: String },
  newStatus: { type: String },
  note: { type: String },
  district: { type: String }, // cached for easy filtering
  taluka: { type: String },
  village: { type: String },
  changedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
