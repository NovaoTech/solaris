const mongoose = require('mongoose')

export const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  casedUsername: String,
  email: String,
  hashedPassword: String,
  level: String,
  comments: Array,
  projects: Array,
  bio: String,
  role: { type: String },
  secret: { type: String },
  tokens: [
    {
      accessToken: { type: String },
      refreshToken: { type: String },
      accessExpiry: { type: Number },
      refreshExpiry: { type: Number }
    }
  ]
}), )

export const Config = mongoose.model('Config', new mongoose.Schema({key: String, value: Object }))