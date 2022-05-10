import * as sdb from './db'
import * as bcrypt from 'bcrypt'
import * as crypto from 'node:crypto'
import * as jwt from 'jsonwebtoken'
import { config } from 'dotenv';

export class solarisAuthenticator {
  publicKey: string
  privateKey: string
  constructor(keySet: { privateKey: string, publicKey: string }) {  
    this.privateKey = keySet.privateKey
    this.publicKey = keySet.publicKey
  }
  signIn(username: string, usersecret: Buffer) {
    /* return accessToken, sessionToken */
    return jwt.sign(
      {
        username: username,
        jwtid: crypto.randomBytes(100).toString("base64"),
        secret: usersecret
      },
      this.privateKey,
      { expiresIn: "100d" }
    )
  }
  verifyJWT(ciphertext: string, username: string, threshold: number): true | false | 'refresh' {
    return true
  }
  hashPass(password: string) {
    let salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }
}

function generateKeys(bits: number = 2048) {
  let options: crypto.RSAKeyPairOptions<'pem', 'pem'> = {
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    },
    modulusLength: bits,
   };
  let { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", options)
  return { publicKey, privateKey }
}

export async function setup() {
  let keySet = await Promise.resolve(sdb.Config.findOne({key: 'auth.keySet'}))
  if (keySet == null) {
    keySet = generateKeys()
    sdb.Config.create({key: 'auth.keySet', value: keySet})
  }
  // Set up authenticator object
  return new solarisAuthenticator(keySet)
}