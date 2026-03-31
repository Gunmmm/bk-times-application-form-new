const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title:           { type: String },
  name:            { type: String },
  phone:           { type: String },
  pinCode:         { type: String },
  category:        { type: String, default: 'General' },
  customCategory:  { type: String },
  content:         { type: String },
  author:          { type: String },
  image:           { type: String },
  durationDays:    { type: Number, default: 1 },
  paymentAmount:   { type: Number, default: 500 },
  status:          { type: String, default: 'Pending Approval' },
  
  // Jurisdictional / Ownership info
  village:         { type: String },
  taluka:          { type: String },
  district:        { type: String },
  zone:            { type: String },
  submittedByRole: { type: String },
  registeredBy:    { type: String },
  currentAssignedRole: { type: String, default: 'village_coordinator' },
  
  createdAt:       { type: Date, default: Date.now },
  updatedAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
