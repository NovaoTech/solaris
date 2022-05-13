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

  newAccessToken(username: string, freshness: 'fresh' | 'non-fresh'): {accessToken: string; jwtId: string} {
    let jwtId: string = crypto.randomBytes(100).toString('base64')
    username = username.toLowerCase()
    let accessToken: string = jwt.sign(
      {username: username, jwtId: jwtId, freshness: freshness, type: 'accessToken'},
      this.privateKey,
      {algorithm: 'PS256', expiresIn: '15m'}
    )
    return {accessToken: accessToken, jwtId: jwtId}
  }

  newRefreshToken(username: string, userSecret: string): {refreshToken: string; jwtId: string} {
    let jwtId: string = crypto.randomBytes(100).toString('base64')
    username = username.toLowerCase()
    let refreshToken: string = jwt.sign({username: username, jwtId: jwtId, userSecret: userSecret, type: 'refreshToken'}, this.privateKey, {
      algorithm: 'PS256',
      expiresIn: '100d'
    })
    return {refreshToken: refreshToken, jwtId: jwtId}
  }

  verifyToken(
    token: string,
    username: string,
    type: 'any' | 'refreshToken' | 'accessToken' = 'any'
  ):
    | {type: 'refreshToken' | 'accessToken'; freshness: 'fresh' | 'non-fresh'; expired: true | false; payload: any}
    | undefined {
    let decodedToken: any
    try {
      decodedToken = jwt.verify(token, this.publicKey)
    } catch {
      return undefined
    }
    username = username.toLowerCase()
    if (
      decodedToken &&
      decodedToken.type &&
      decodedToken.jwtId &&
      decodedToken.username &&
      decodedToken.username == username
    ) {
      if ((type != 'any' && type == decodedToken.type) || type == 'any') {
        let freshness
        if (decodedToken.freshness) {
          freshness = decodedToken.freshness
        } else {
          freshness = 'fresh'
        }
        let expired
        if (decodedToken.exp < Date.now()) {
          expired = false
        } else {
          expired = true
        }
        return {type: decodedToken.type, freshness: freshness, expired: expired, payload: decodedToken}
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  hashPass(password: string) {
    return bcrypt.hashSync(password, 12)
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
