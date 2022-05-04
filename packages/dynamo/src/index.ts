// Import dependencies
import express from 'express'
import dotenv from 'dotenv'
import {sha512} from 'sha512-crypt-ts'
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb')

// Import solaris packages
import * as solaris from 'solaris-types'
import * as sdb from './db'
import {error} from 'console'

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

// Process Requests
app.use(express.json())
app.get('/', (_req, _res) => {
  _res.json({status: '200'})
})

app.get('/assets/:assetID', async (req, res) => {
  let foundAsset = await Promise.resolve(sdb.find(database, 'assets', {hash: req.params.assetID}, client))
  if (foundAsset != null) {
    res.json(foundAsset)
  } else {
    res.status(404).json({status: '404', requestedID: `${req.params.assetID}`})
  }
})

app.get('/test/', async (req, res) => {
  sdb.insert(database, 'test', {text: 'Yay, it works!', date: Date.now}, client)
  res.status(200).json({status: '200'})
})

app.post('/assets/', async (req, res) => {
  let body
  try {
    body = req.body
  } catch {
    res.status(400).json({status: '400'})
  }

  if (body.bytes) {
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
// Handle Errors
app.use(function (req, res, next) {
  res.status(404).json({status: '404'})
})

app.listen(port)
