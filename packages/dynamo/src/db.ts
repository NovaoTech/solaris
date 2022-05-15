const mongoose = require('mongoose')

export const User = mongoose.model(
  'User',
  new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    casedUsername: String,
    userSecret: String,
    email: String,
    hashedPassword: String,
    level: String,
    comments: Array,
    projects: Array,
    bio: String,
    role: {type: String},
    secret: {type: String},
    validRefreshTokens: Array,
    messages: Array
  })
)

export const Config = mongoose.model('Config', new mongoose.Schema({key: String, value: Object}))

export const Asset = mongoose.model(
  'Asset',
  new mongoose.Schema({
    hash: String,
    bytes: String,
    uploadedBy: String
  })
)
