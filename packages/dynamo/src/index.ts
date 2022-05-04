// Import dependencies
import express from 'express';
import dotenv from 'dotenv';
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Import solaris packages
import * as solaris from 'solaris-types';
import * as sdb from './db';

// Import from .env
dotenv.config();

// Create Express app
const app: express.Application = express();

// Add client info for mongoDB
const uri = "mongodb+srv://"+process.env.MONGODB_USER+":"+process.env.MONGODB_PASS+process.env.MONGODB_URI+"?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
let determinedDB;
if (process.env.DB) {
    determinedDB = process.env.DB;
} else {
    determinedDB = 'testing';
}
const database = determinedDB;

// Determine the port based on .env
let determinedPort: number;
if (process.env['DYNAMO_PORT']) {
    determinedPort = Number (process.env['DYNAMO_PORT']);
} else {
    determinedPort = 3000;
}
const port: number = determinedPort;

// Use JSON Parsing.
app.use(express.json());

// Process Requests
app.get('/', (_req, _res) => {
    _res.json({ status: '200' });
});

app.get('/assets/:assetID', async (req, res) => {
    let foundAsset = await Promise.resolve(sdb.find('testing', 'assets', { hash: req.params.assetID }, client))
    if (foundAsset != null) {
        res.json(foundAsset);   
    } else {
        res.status(404).json({ status: '404', requestedID: `${ req.params.assetID }` });
    }
});

// Handle Errors
app.use(function (req,res,next) {
    res.status(404).json({ status: '404' });
});

app.listen(port);