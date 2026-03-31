const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  type: { type: String, default: 'global', unique: true },
  notice: { type: String, default: 'Welcome to the Ricotta Reporter Portal.' },
  commissions: {
    district: { type: Number, default: 13 },
    taluka: { type: Number, default: 13 },
    zone: { type: Number, default: 13 },
    village: { type: Number, default: 12 },
    ads: { type: Number, default: 18 }
  },
  permissions: {
    district: { canAdd: { type: Boolean, default: true }, canEdit: { type: Boolean, default: true }, canDelete: { type: Boolean, default: false }, canView: { type: Boolean, default: true } },
    taluka: { canAdd: { type: Boolean, default: true }, canEdit: { type: Boolean, default: true }, canDelete: { type: Boolean, default: false }, canView: { type: Boolean, default: true } },
    zone: { canAdd: { type: Boolean, default: true }, canEdit: { type: Boolean, default: true }, canDelete: { type: Boolean, default: false }, canView: { type: Boolean, default: true } },
    village: { canAdd: { type: Boolean, default: true }, canEdit: { type: Boolean, default: true }, canDelete: { type: Boolean, default: false }, canView: { type: Boolean, default: true } }
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
