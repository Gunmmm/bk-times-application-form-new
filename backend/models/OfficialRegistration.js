const mongoose = require('mongoose');

const officialRegistrationSchema = new mongoose.Schema({
  // Personal Info
  fullName:         { type: String, required: true },
  phone:            { type: String, required: true },
  gender:           { type: String },
  education:        { type: String },
  birthday:         { type: Date },
  
  // Location
  address:          { type: String },
  state:            { type: String, default: 'Maharashtra' },
  district:         { type: String },
  taluka:           { type: String },
  village:          { type: String },
  pinCode:          { type: String },
  
  // Registration Details
  role:             { type: String, required: true }, // reader, district_coordinator, taluka_coordinator, reporter
  subscriptionPlan: { type: String },
  paymentAmount:    { type: Number },
  vendorId:         { type: String, unique: true },
  
  // Auditing
  registeredBy:     { type: String }, // Name of the coordinator who registered them
  registeredByRole: { type: String },
  status:           { type: String, default: 'Active' },
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('OfficialRegistration', officialRegistrationSchema);
