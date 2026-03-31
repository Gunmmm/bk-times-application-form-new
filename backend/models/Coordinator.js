const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },   // stored as plain text (no bcrypt dep) — swap later
  role:     { type: String, required: true, enum: ['village', 'taluka', 'district', 'zone'] },
  zone:     { type: String },
  district: { type: String },
  taluka:   { type: String },
  village:  { type: String },
  coordinatorCode: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coordinator', coordinatorSchema, 'coordinators');
