// Import dependencies
import express from 'express'
import dotenv from 'dotenv'
import {sha512} from 'sha512-crypt-ts'
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb')
const mongoose = require('mongoose');

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
  mongoose.connect(String(process.env.MONGO_URI)+'/'+String(process.env.DB))
} catch (err) {
  console.error(err);
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
  _res.json({status: '200'})
})

app.post('/user/', async (req, res) => {
  let body = req.body
  if (body && body.username && body.password && body.email) {
    let foundUser: Object = await Promise.resolve(sdb.User.findOne({username: body.username}))
    if (foundUser != null) {
      res.status(400).json({status: '400', reason: 'username'})
    } else {
      sdb.User.create({
        username: body.username.toLowerCase(),
        casedUsername: body.username,
        email: body.email,
        hashedPassword: (await authenticator).hashPass(body.password),
        level: 'unverified',
        comments: {},
        projects: {},
        bio: ''
      })
      res.status(201).json({status: 201})
    }
  } else {
    res.status(400).json({status: '400'})
  }
})


app.get('/user/:username', async (req, res) => {
  let foundUser = await Promise.resolve(
    sdb.User.findOne({username: req.params.username.toLowerCase()})
  )
  if (foundUser != null) {
    res.json({
      username: foundUser.username,
      casedName: foundUser.casedName,
      bio: foundUser.bio,
      comments: foundUser.comments,
      projects: foundUser.projects
    })
  } else {
    res.status(404).json({status: '404', requestedUser: `${req.params.username}`})
  }
})

/* app.post('/session/', async (req, res) => {
  req.body
  if (req.body.username && req.body.password) {
    const user: any = await sdb.find(database, 'users', {username: req.body.username.toLowerCase()}, client)
    if (user != null && (await authenticator).hash(req.body.password) == user.hashedPassword) {
      res.status(200).json((await authenticator).signIn(user.username))
    } else {
      res.status(401).json({status: '400', reason: 'username-or-password'})
    }
  } else {
    res.status(400).json({status: '400'})
  }
})
app.post('/session/verify/', async (req, res) => {
  req.body
  if (req.body.username && req.body.password) {
    if ((await authenticator).verify(req.body.token, req.body.username.toLowerCase(), authtimeout)) {
      res.status(200).json({status: '200'})
    } else {
      res.status(401).json({status: '401'})
    }
  } else {
    res.status(400).json({status: '400'})
  }
}) */

/*
app.post('/assets/', async (req, res) => {
  let body
  try {
    body = req.body
  } catch {
    res.status(400).json({status: '400'})
  }
  if (body as srq.CreateAsset) {
    let hash: string = sha512.crypt(body.bytes, 'saltysalt').replace('$6$saltysalt$', '')
    let foundAsset: Object = await Promise.resolve(sdb.find(database, 'assets', {hash: hash}, client))
    if (foundAsset != null) {
      console.log(foundAsset)
      res.status(200).json({hash: hash})
    } else {
      sdb.insert(database, 'assets', {hash: hash, bytes: body.bytes}, client)
      res.status(200).json({hash: hash})
    }
  } else {
    res.status(400).json({status: '400'})
  }
})
app.get('/assets/:assetID', async (req, res) => {
  let foundAsset = await Promise.resolve(sdb.find(database, 'assets', {hash: req.params.assetID}, client))
  if (foundAsset != null) {
    res.json(foundAsset)
  } else {
    res.status(404).json({status: '404', requestedID: `${req.params.assetID}`})
  }
})
*/

// Handle Errors
app.use(function (req, res, next) {
  res.status(404).json({status: '404'})
})

app.listen(port)