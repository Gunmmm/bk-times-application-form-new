import mongoose from 'mongoose';

const villageSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'village' },
  zone:     { type: String },
  district: { type: String },
  taluka:   { type: String },
  village:  { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('VillageCoordinator', villageSchema, 'village_coordinators');
