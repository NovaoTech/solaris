import * as sdb from './db'
import * as bcrypt from 'bcrypt'
import * as crypto from 'node:crypto'
import * as jwt from 'jsonwebtoken'
import {config} from 'dotenv'

export class solarisAuthenticator {
  publicKey: string
  privateKey: string
  constructor(keySet: any) {
    this.privateKey = keySet.value.privateKey
    this.publicKey = keySet.value.publicKey
  }
  signIn(username: string, usersecret: Buffer) {
    /* return accessToken, sessionToken */
    return jwt.sign(
      {
        username: username,
        jwtid: crypto.randomBytes(100).toString('base64'),
        secret: usersecret,
        validUntil: Date.now() + 8640000000
      },
      this.privateKey,
      {algorithm: 'PS256', expiresIn: '100d'}
    )
  }
  verifyJWT(refreshToken: any): any {
    return jwt.verify(refreshToken, this.publicKey)
  }
  hashPass(password: string) {
    return bcrypt.hashSync(password, 10)
  }
  verifyPass(password: string, hashed: string) {
    return bcrypt.compare(password, hashed)
  }
  genSecret(length: number): string {
    return crypto.randomBytes(length).toString('base64')
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
    modulusLength: bits
  }
  let {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', options)
  return {publicKey, privateKey}
}

export async function setup(): Promise<solarisAuthenticator> {
  let keySet = await sdb.Config.findOne({key: 'auth.keySet'})
  if (keySet == null) {
    keySet = generateKeys()
    sdb.Config.createSync({key: 'auth.keySet', value: keySet})
  }

  // Set up authenticator object
  return new solarisAuthenticator(keySet)
}
