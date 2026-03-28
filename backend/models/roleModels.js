/**
 * roleModels.js
 * 5 separate MongoDB collections — one per coordinator role.
 * Village   → village_readers  / village_news
 * Taluka    → taluka_readers   / taluka_news
 * District  → district_readers / district_news
 * Zone      → zone_readers     / zone_news
 * Admin     → admin_readers    / admin_news  (also has read-all access)
 */
const mongoose = require('mongoose');

// ── SHARED SCHEMA DEFINITIONS ──────────────────────────────────────────────

const readerFields = {
  name:             { type: String, required: true },
  mobile:           { type: String, required: true },
  gender:           { type: String },
  education:        { type: String },
  address:          { type: String },
  district:         { type: String },
  taluka:           { type: String },
  village:          { type: String },
  zone:             { type: String },
  pinCode:          { type: String },
  subscriptionPlan: { type: String, default: '1_year' },
  paymentAmount:    { type: Number, default: 1000 },
  registeredBy:     { type: String },
  registeredByRole: { type: String },
  createdAt:        { type: Date, default: Date.now }
};

const newsFields = {
  title:           { type: String },
  name:            { type: String },
  phone:           { type: String },
  pinCode:         { type: String },
  category:        { type: String },
  customCategory:  { type: String },
  content:         { type: String },
  durationDays:    { type: Number, default: 1 },
  paymentAmount:   { type: Number, default: 500 },
  status:          { type: String, default: 'Pending Approval' },
  village:         { type: String },
  taluka:          { type: String },
  district:        { type: String },
  zone:            { type: String },
  submittedByRole: { type: String },
  registeredBy:    { type: String },
  createdAt:       { type: Date, default: Date.now }
};

// ── FACTORY: create model bound to a specific collection ───────────────────
function makeReaderModel(collectionName) {
  // Avoid duplicate model registration on hot-reload
  const modelName = collectionName.replace('_', '') + 'Reader';
  return mongoose.models[modelName] ||
    mongoose.model(modelName, new mongoose.Schema(readerFields, { collection: collectionName }));
}

function makeNewsModel(collectionName) {
  const modelName = collectionName.replace('_', '') + 'News';
  return mongoose.models[modelName] ||
    mongoose.model(modelName, new mongoose.Schema(newsFields, { collection: collectionName }));
}

// ── 5 READER COLLECTIONS ───────────────────────────────────────────────────
const VillageReader   = makeReaderModel('village_readers');
const TalukaReader    = makeReaderModel('taluka_readers');
const DistrictReader  = makeReaderModel('district_readers');
const ZoneReader      = makeReaderModel('zone_readers');
const AdminReader     = makeReaderModel('admin_readers');

// ── 5 NEWS COLLECTIONS ─────────────────────────────────────────────────────
const VillageNews     = makeNewsModel('village_news');
const TalukaNews      = makeNewsModel('taluka_news');
const DistrictNews    = makeNewsModel('district_news');
const ZoneNews        = makeNewsModel('zone_news');
const AdminNews       = makeNewsModel('admin_news');

// ── HELPER: get the right model from a user's role ─────────────────────────
function getReaderModel(role) {
  switch (role) {
    case 'village_coordinator': case 'village': return VillageReader;
    case 'taluka_coordinator':  case 'taluka':  return TalukaReader;
    case 'district_coordinator':case 'district':return DistrictReader;
    case 'zone_coordinator':    case 'zone':    return ZoneReader;
    case 'admin': default:                       return AdminReader;
  }
}

function getNewsModel(role) {
  switch (role) {
    case 'village_coordinator': case 'village': return VillageNews;
    case 'taluka_coordinator':  case 'taluka':  return TalukaNews;
    case 'district_coordinator':case 'district':return DistrictNews;
    case 'zone_coordinator':    case 'zone':    return ZoneNews;
    case 'admin': default:                       return AdminNews;
  }
}

// ── ALL MODELS (for admin read-all) ───────────────────────────────────────
const ALL_READER_MODELS = [VillageReader, TalukaReader, DistrictReader, ZoneReader, AdminReader];
const ALL_NEWS_MODELS   = [VillageNews,   TalukaNews,   DistrictNews,   ZoneNews,   AdminNews];

module.exports = {
  VillageReader, TalukaReader, DistrictReader, ZoneReader, AdminReader,
  VillageNews,   TalukaNews,   DistrictNews,   ZoneNews,   AdminNews,
  getReaderModel, getNewsModel,
  ALL_READER_MODELS, ALL_NEWS_MODELS
};
