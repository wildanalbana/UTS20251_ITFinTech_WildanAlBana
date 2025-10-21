const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  passwordHash: String, // hash bcrypt
  phone: { type: String, unique: true, sparse: true },
  isAdmin: { type: Boolean, default: false },
  mfaEnabled: { type: Boolean, default: false },
  // OTP single-use (store short-lived), or better simpan in-memory/Redis. Simpel: store otp + expiresAt
  otp: String,
  otpExpiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
