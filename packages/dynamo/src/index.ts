// Import dependencies
import express from 'express'
import dotenv from 'dotenv'
import {sha512} from 'sha512-crypt-ts'
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb')

// Import solaris packages
import * as solaris from 'solaris-types'
import * as srq from 'solaris-types/src/requests'
import * as sdb from './db'
import * as sauth from './auth'
import * as smail from './mail'
import {error} from 'console'
import e from 'express'
import {verify} from 'crypto'

// Import from .env
dotenv.config()

// Create Express app
const app: express.Application = express()

// Add client info for mongoDB
const uri =
  'mongodb+srv://' +
  process.env.MONGODB_USER +
  ':' +
  process.env.MONGODB_PASS +
  process.env.MONGODB_URI +
  '?retryWrites=true&w=majority'
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1})
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
let authenticator = sauth.setup(client, database)
let determinedAuthtimout
if (process.env['AUTH_TIMEOUT']) {
  determinedAuthtimout = Number(process.env['AUTH_TIMEOUT'])
} else {
  determinedAuthtimout = 604800000
}
const authtimeout = determinedAuthtimout

// Make express process JSON
app.use(express.json())

// Process Requeests
app.get('/', (_req, _res) => {
  _res.json({status: '200'})
})

if (database == 'testing') {
  app.get('/test/', async (req, res) => {
    sdb.insert(database, 'test', {text: 'Yay, it works!', date: Date.now}, client)
    res.status(200).json({status: '200'})
  })
}

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

app.post('/user/', async (req, res) => {
  let body
  try {
    body = req.body
  } catch {
    res.status(400).json({status: '400'})
  }

  if (body.username && body.password && body.email) {
    let foundUser: Object = await Promise.resolve(
      sdb.find(database, 'users', {username: body.username.toLowerCase()}, client)
    )
    console.log(foundUser)
    if (foundUser != null) {
      res.status(400).json({status: '400', reason: 'username'})
    } else {
      let insertUser = {
        username: body.username.toLowerCase(),
        casedUsername: body.username,
        email: body.email,
        hashedPassword: (await authenticator).hash(body.password),
        level: 'user',
        verification:
          (await authenticator).hash(body.username.toLowerCase()) + (await authenticator).hash(body.password),
        comments: {},
        projects: {},
        bio: ''
      }
      sdb.insert(database, 'users', insertUser, client)
      res.status(200).json({status: 200})
    }
  } else {
    res.status(400).json({status: '400'})
  }
})

app.delete('/user/', async (req, res) => {
  req.body
  if (req.body.username && req.body.token) {
    if ((await authenticator).verify(req.body.token, req.body.username.toLowerCase(), authtimeout)) {
      let result = await Promise.resolve(
        sdb.deleteQuery(database, 'users', {username: req.body.username.toLowerCase()}, client)
      )
      if (result.deletedCount === 1) {
        res.status(200).json({status: '200'})
      } else {
        res.status(200).json({status: '500'})
      }
    } else {
      res.status(401).json({status: '401'})
    }
  } else {
    res.status(400).json({status: '400'})
  }
})

app.get('/user/:username', async (req, res) => {
  let foundUser = await Promise.resolve(
    sdb.find(database, 'users', {username: req.params.username.toLowerCase()}, client)
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

app.post('/session/', async (req, res) => {
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
  if (req.body.username && req.body.token) {
    if ((await authenticator).verify(req.body.token, req.body.username.toLowerCase(), authtimeout)) {
      res.status(200).json({status: '200'})
    } else {
      res.status(401).json({status: '401'})
    }
  } else {
    res.status(400).json({status: '400'})
  }
})

app.get('/verify/:user/:verificationToken', async (req, res) => {
  let foundUser = await Promise.resolve(sdb.find(database, 'users', {username: req.params.user.toLowerCase()}, client))
  if (foundUser != null) {
    if (foundUser.verification == req.params.verificationToken && req.params.verificationToken != 'verified') {
      sdb.update(database, 'users', foundUser, {verification: 'verified'}, client)
      res.status(200).json({status: '200'})
    } else if (foundUser.verification == 'verified') {
      res.status(400).json({status: '400', reason: 'verified'})
    } else if (foundUser.verification != req.params.verificationToken) {
      res.status(400).json({status: '400', reason: 'invalid'})
    } else {
      res.status(500).json({status: '500'})
    }
  } else {
    res.status(404).json({status: '404', reason: 'username'})
  }
})

// Handle Errors
app.use(function (req, res, next) {
  res.status(404).json({status: '404'})
})

app.listen(port)