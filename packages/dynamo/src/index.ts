// Import dependencies
import express from 'express'
import dotenv from 'dotenv'
import {sha512} from 'sha512-crypt-ts'
const mongoose = require('mongoose')

// Import solaris packages
import * as solaris from 'solaris-types'
import * as srq from 'solaris-types/src/requests'
import * as sdb from './db'
import * as sauth from './auth'

// Import from .env
dotenv.config()

// Create Express app
const app: express.Application = express()

// Add client info for mongoDB
try {
  mongoose.connect(String(process.env.MONGO_URI) + '/' + String(process.env.DB))
} catch (err) {
  console.error(err)
}

let determinedDB
if (process.env.DB) {
  determinedDB = process.env.DB
} else {
  determinedDB = 'testing'
}
const database = 'testing'

// Determine the port based on .env
let determinedPort: number
if (process.env['DYNAMO_PORT']) {
  determinedPort = Number(process.env['DYNAMO_PORT'])
} else {
  determinedPort = 3000
}
const port: number = determinedPort

// Setup SAuth
let authenticator = Promise.resolve(sauth.setup())

// Make express process JSON
app.use(express.json())

// Process Requeests
app.get('/', (_req, _res) => {
  _res.json({status: 200})
})

// Handle requests for user creation
app.post('/user/', async (req, res) => {
  let body = req.body
  if (body && body.username && body.password && body.email) {
    // The request is valid. Continue processing
    let foundUser: Object = await Promise.resolve(sdb.User.findOne({username: body.username.toLowerCase()}))
    if (foundUser != null) {
      // A user already exists with the requested username. Terminate processing and return an error
      res.status(400).json({status: 400, reason: 'username-taken'})
    } else {
      // The username is not taken. Create a new user with the requested paramaters
      sdb.User.create({
        username: body.username.toLowerCase(),
        casedUsername: body.username,
        email: body.email,
        hashedPassword: (await authenticator).hashPass(body.password),
        level: 'unverified',
        comments: {},
        projects: {},
        bio: "Check it out, I'm a stargazer!"
      })
      // Return a successful status code
      res.status(201).json({status: 201})
    }
  } else {
    // The requst is invalid. HOW DARE YOU FOOLISH MORTALS MAKE SUCH ERRORS!
    res.status(400).json({status: 400})
  }
})

// Handle requests for users
app.get('/user/:username', async (req, res) => {
  // Find a user with the requsted username.
  let foundUser = await Promise.resolve(sdb.User.findOne({username: req.params.username.toLowerCase()}))
  if (foundUser != null) {
    // The username requested is valid. Return its data
    res.status(200).json({
      username: foundUser.username,
      casedName: foundUser.casedName,
      bio: foundUser.bio,
      comments: foundUser.comments,
      projects: foundUser.projects
    })
  } else {
    // The username is invalid. Return a 404 status code
    res.status(404).json({status: 404, requestedUser: `${req.params.username}`})
  }
})

// Handle requests to start a new session
app.post('/session/', async (req, res) => {
  req.body
  if (req.body.username && req.body.password) {
    // Request is valid, continue with processing
    const user: any = await sdb.User.findOne({username: req.body.username.toLowerCase()})
    if (
      user != null &&
      (await Promise.resolve((await authenticator).verifyPass(req.body.password, user.hashedPassword)))
    ) {
      // The requested user exists and the sent password is valid, continue processing
      if (user.secret) {
        // The user does not yet have a secret. Generate one, and apply it.
        user.secret = (await authenticator).genSecret(65)
      }
      // Generate a refresh token and add it to the user's tokens.
      const refreshToken = (await authenticator).signIn(user.username.toLowerCase(), user.secret)
      user.validRefreshTokens.push(refreshToken)
      // Save the data added and return a successful code.
      await user.save()
      res.status(200).json({status: 200, refreshToken: refreshToken})
    } else {
      // The username and/or password are invalid. Return an error.
      res.status(400).json({status: 400, reason: 'username-or-password'})
    }
  } else {
    // The request is invalid. Terminate processing.
    res.status(400).json({status: 400, reason: 'username-or-password'})
  }
})

// Handle requests to refresh access tokens
app.post('/session/refresh/', async (req, res) => {
  req.body
  if (req.body.username && req.body.refreshToken) {
    let user = await sdb.User.findOne({username: req.body.username.toLowerCase()})
    let rt: string = req.body.refreshToken
    let tokenValidity
    try {
      tokenValidity = (await authenticator).verifyJWT(rt)
    } catch {
      tokenValidity = false
    }
    console.log(typeof user.validRefreshTokens)
    if (user && rt && tokenValidity) {
      // Request contains valid information
      // Check to see if the refreshToken matches the username
      let decoded = (await authenticator).verifyJWT(rt)
      if (decoded.username == user.username) {
        // The refreshToken matches the username
        // Check to see if the refreshToken is current
        let x = []
        if (user.validRefreshTokens.find((token: any) => token == rt) != undefined && Date.now() < decoded.validUntil) {
          // RefreshToken is valid. Return a new accessToken
          let accessToken = {
            token: (await authenticator).genSecret(100),
            expires: Date.now() + 864000000
          }
          user.validAccessTokens.push(accessToken)
          await user.save()
          res.status(200).json({status: 200, accessToken: accessToken})
        } else if (
          user.validRefreshTokens.find((token: any) => token == rt) != undefined &&
          Date.now >= decoded.validUntil
        ) {
          // RefreshToken is expired
          // Remove the refreshToken from the user
          user.validRefreshTokens.splice(user.validRefreshTokens.findIndex(rt), 1)
          // Return an error
          res.status(400).json({status: 400, reason: 'refreshToken-expired'})
        } else if (
          user.validRefreshTokens.find((token: any) => token == rt) == undefined &&
          Date.now < decoded.validUntil
        ) {
          // The RSA key has been compromised. Return a generic error and log to console.
          res.status(400).json({status: 400})
          console.error('Warning: The RSA key has been potentially compromised.')
        } else {
          // The request is completely invalid.
          res.status(400).json({status: 400})
        }
      } else {
        // The refreshToken does not match the username
        // Check to see if the refreshToken is valid for the contained user
        let hackedUser = await sdb.User.findOne({username: decoded.username})
        if (hackedUser.validRefreshTokens.find((token: any) => token == rt)) {
          // The refreshToken is still valid, so invalidate it.
          hackedUser.validRefreshTokens.splice(hackedUser.validRefreshTokens.findIndex(rt), 1)
          // Save the user, return status
          await hackedUser.save()
          res.status(403).json({status: 403, message: 'Hackers Begone!'})
        } else {
          // The refreshToken is invalid, so no action is needed.
          res.status(403).json({status: 403, message: 'Hackers Begone!'})
        }
      }
    } else if (rt && !user && req.body.username) {
      // Request contains an invalid username
      res.status(400).json({status: 400, reason: 'username'})
      return
    } else if (!rt || !req.body.username) {
      // Request is missing the refreshToken OR the username paramater
      res.status(400).json({status: 400, reason: 'refreshToken-or-username-missing'})
    } else {
      res.status(400).json({status: 400, reason: 'refreshToken-expired'})
    }
  } else {
    res.status(400).json({status: 400, reason: 'refreshToken-or-username-missing'})
  }
})

// Handle requests to verify access tokens
app.post('/session/verify/', async (req, res) => {
  req.body
  if (req.body.username && req.body.accessToken) {
    // The request is valid, continue with processing
    let user = await sdb.User.findOne({username: req.body.username.toLowerCase()})
    if (user != null) {
      // The user requested does exist. Continue with processing
      if (user.validAccessTokens.find((token: any) => token == req.body.accessToken)) {
        // Check to see if the token is expired
        if (Date.now() < req.body.accessToken.expires) {
          // The token is valid, return a new status
          res.status(200).json({status: 200})
        } else {
          // The token is invalid, remove it from the list of tokens.
          user.validAccessTokens.splice(user.validAccessTokens.findIndex(user.accessToken), 1)
          await user.save()
          res.status(401).json({status: 401, reason: 'accessToken-expired'})
        }
      } else {
        // The token does not exist on the user. Return a status code
        res.status(401).json({status: 401})
      }
    } else {
      // The username is invalid. Return a status code.
      res.status(400).json({status: 400})
    }
  } else {
    // The request is invalid. Terminate processing.
    res.status(400).json({status: 400})
  }
})

// Handle requests for asset creation
app.post('/assets/', async (req, res) => {
  let body = req.body
  if (body.bytes) {
    // The request is valid! Hurrah! Continue with processing
    let hash: string = sha512.crypt(body.bytes, 'saltysalt').replace('$6$saltysalt$', '')
    let foundAsset: Object = await sdb.Asset.find({hash: hash})
    if (foundAsset != null) {
      // The asset already exists in the system. That's okay! We'll just send the client the preexising hash
      res.status(200).json({hash: hash})
    } else {
      // The asset doesn't exist in the system. Add the asset and its hash to the DB.
      await sdb.Asset.create({hash: hash, bytes: body.bytes})
      res.status(200).json({hash: hash})
    }
  } else {
    // The request is invalid. Better luck next time, send an error code.
    res.status(400).json({status: 400})
  }
})

// Handle requsts for assets
app.get('/assets/:assetID', async (req, res) => {
  let foundAsset = await sdb.Asset.findOne({hash: req.params.assetID})
  if (foundAsset != null) {
    // That asset exists! Good for the client! Send it to them.
    res.json(foundAsset)
  } else {
    // The asset does not exist in the system. Send an error.
    res.status(404).json({status: 404, requestedID: `${req.params.assetID}`})
  }
})

// Handle Errors
app.use(function (req, res, next) {
  res.status(404).json({status: 404})
})

// Start the sever!
app.listen(port)
