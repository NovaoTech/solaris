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
import {verify} from 'jsonwebtoken'

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

// Create functions to verify tokens.
async function accessTokenCheckpoint(req: any, res: any, next: any) {
  req.body
  if (req.body.username && req.body.accessToken) {
    // The request is valid, continue with processing
    let user = await sdb.User.findOne({username: req.body.username.toLowerCase()})
    if (user != null) {
      // The user requested does exist. Continue with processing
      let result = (await authenticator).verifyToken(req.body.accessToken, user.username, 'accessToken')
      if (result && !result.expired) {
        // The token is 100% valid!
        req.token = result
        next()
      } else if (result && result.expired) {
        // The token is valid, but expired
        res.status(400).json({status: 400, reason: 'accessToken-expired'})
      } else
        [
          // The token is invalid for some reason
          res.status(400).json({status: 400})
        ]
    } else {
      // The username is invalid. Return a status code.
      res.status(400).json({status: 400, reason: 'username'})
    }
  } else {
    // The request is invalid. Terminate processing.
    res.status(400).json({status: 400})
  }
}

async function refreshTokenCheckpoint(req: any, res: any, next: any) {
  req.body
  if (req.body.username && req.body.refreshToken) {
    // Request is valid. Query the DB for the user and check the token.
    let user = await sdb.User.findOne({username: req.body.username.toLowerCase()})
    let rt: string = req.body.refreshToken
    let token = (await authenticator).verifyToken(rt, req.body.username, 'refreshToken')
    if (user && rt && token != undefined) {
      // Token is valid
      if (!token.expired && user.secret == token.payload.userSecret) {
        // The token is not expired
        let refreshTokens = user.validRefreshTokens
        if (refreshTokens.find((processing: string) => processing == token?.payload.jwtId)) {
          req.token = token
          next()
        } else {
          // Token theft has occured. Revoke all sessions for the user.
          user.validRefreshTokens = []
          user.secret = (await authenticator).genSecret(100)
          await user.save()
          res.status(400).json({status: 400})
        }
      } else if (token.expired) {
        // The token is expired. `splice` it from the user's tokens.
        if (user.validRefreshTokens.find((processing: string) => processing == token?.payload.jwtId)) {
          user.validRefreshTokens.splice(
            user.validRefreshTokens.findIndex((jwtId: any) => token?.payload.jwtId == jwtId),
            1
          )
        }
        await user.save()
        res.status(400).json({status: 400, reason: 'refreshToken-expired'})
      } else if (user.secret != token.payload.userSecret) {
        // Token theft has occured, but has already been handled
        res.status(400).json({status: 400})
      } else {
        // Something happened, but I don't know what. The token isn't valid here.
        res.status(400).json({status: 400})
      }
    } else if (user && rt && !token) {
      // Token is invalid, but the user is valid
      res.status(400).json({status: 400, reason: 'refreshToken-invalid'})
    } else if (!user && rt && token) {
      // Token is valid, but the user is not valid
      res.status(400).json({status: 400, reason: 'username-invalid'})
    } else {
      // Token is/(not) valid and/or the user is/(not)
      res.status(400).json({status: 400})
    }
  } else {
    // The request is invalid
    res.status(400).json({status: 400, reason: 'refreshToken-or-username-missing'})
  }
}

// Process Requeests
app.get('/', (_req, _res) => {
  _res.json({status: 200})
})

/*

  TO-DO: Restrain the characters available in usernames.

*/

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
        secret: (await authenticator).genSecret(100),
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

// Handle requests for user deletion
app.delete('/user/', accessTokenCheckpoint, async (req, res) => {
  let body = req.body
  if (body.token.freshness == 'fresh') {
    // The token is fresh, so continue
    let user = await sdb.User.findOne({username: body.username.toLowerCase})
    await user.delete()
    res.status(200).json({status: 200})
  } else {
    // The token is not fresh, so request a fresh token from the client
    res.status(400).json({status: 400, reason: 'accessToken-unfresh'})
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
      casedUsername: foundUser.casedUsername,
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
app.post('/session/create/', async (req, res) => {
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
      const refreshToken = (await authenticator).newRefreshToken(user.username.toLowerCase(), user.secret)
      user.validRefreshTokens.push(refreshToken.jwtId)
      // Save the data added and return a successful code.
      await user.save()
      res.status(200).json({status: 200, refreshToken: refreshToken.refreshToken})
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
app.post('/session/refresh/', refreshTokenCheckpoint, async (req, res) => {
  req.body
  // This token is still valid! Hurrah! Generate a new accessToken for the user.
  let result = (await authenticator).newAccessToken(req.body.username, 'non-fresh')
  // Since this is a short-lived accessToken, we don't have to bother with pushing it to the DB.
  res.status(200).json({status: 200, accessToken: result.accessToken})
})

// Handle requests to verify access tokens
app.post('/session/verify/', accessTokenCheckpoint, async (req: any, res) => {
  res.status(200).json({status: 200})
})

// Handle requests to revoke refresh tokens
app.delete('/session/', refreshTokenCheckpoint, async (req: any, res) => {
  let body = req.body
  let user = await sdb.User.findOne({username: body.username.toLowerCase()})
  console.log(user.validRefreshTokens)
  user.validRefreshTokens.splice(
    user.validRefreshTokens.findIndex((jwtId: any) => jwtId == req.token.jwtId),
    1
  )
  await user.save()
  res.status(200).json({status: 200})
})

/*

  TO-DO: Limit the size of assets.

*/

// Handle requests for asset creation
app.post('/assets/', accessTokenCheckpoint, async (req, res) => {
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
      await sdb.Asset.create({hash: hash, bytes: body.bytes, uploadedBy: body.username})
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

// Handle requests for projects
app.get('/:username/:projectName', async (req, res) => {
  let project = sdb.Project.findOne({
    author: req.params.username.toLowerCase(),
    id: req.params.projectName.toLowerCase()
  })
  if (project) {
    // Project exists! Hurrah! Return the found project.
    res.status(200).json(project)
  } else {
    // Project doesn't exist. Return an error.
    res.status(404).json({status: 404})
  }
})

// Handle Errors
app.use(function (req, res, next) {
  res.status(404).json({status: 404})
})

// Start the sever!)
app.listen(port)
