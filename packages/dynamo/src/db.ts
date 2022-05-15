import * as solaris from 'solaris-types'
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

/*

  TO-DO: Figure out how to make the Username and/or Name unique for each one.
  (E.g, user/project0, user/project1, and user1/project0 but not user/project and user/project)

*/

export const Project = mongoose.model(
  'Project',
  new mongoose.Schema({
    project: Object,
    author: String,
    published: Number,
    comments: Array,
    parent: String,
    id: String,
    name: String
  })
)
