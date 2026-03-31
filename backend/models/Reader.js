const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  mobile:           { type: String, required: true },
  gender:           { type: String },
  education:        { type: String },
  address:          { type: String },
  district:         { type: String },
  taluka:           { type: String },
  village:          { type: String },
  city:             { type: String },
  state:            { type: String },
  zone:             { type: String },
  pinCode:          { type: String },
  subscriptionPlan: { type: String, default: '1_year' },
  paymentAmount:    { type: Number, default: 1000 },
  status:           { type: String, default: 'Active' },
  
  // Auditing
  registeredBy:     { type: String },
  registeredByRole: { type: String },
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reader', readerSchema);
