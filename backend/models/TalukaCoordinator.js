import mongoose from 'mongoose';

const talukaSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'taluka' },
  zone:     { type: String },
  district: { type: String },
  taluka:   { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TalukaCoordinator', talukaSchema, 'taluka_coordinators');
