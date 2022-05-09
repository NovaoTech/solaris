import * as sdb from './db'
import * as CryptoJS from 'crypto-js'
import * as bcrypt from 'bcrypt'

export class solarisAuthenticator {
  key: any
  constructor(key: any) {
    this.key = key
  }
  signIn(username: string) {
    let session = {
      user: username,
      date: Math.floor(new Date().getTime() / 1000),
      salt: randomString(4)
    }
    let tokenizedSession = CryptoJS.AES.encrypt(JSON.stringify(session), this.key).toString()
    return tokenizedSession
  }
  verify(ciphertext: string, username: string, threshold: number): true | false {
    let bytes = CryptoJS.AES.decrypt(ciphertext, this.key)
    let decryptedData
    try {
      decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    } catch {
      return false
    }
    if (decryptedData.user == username && Math.floor(new Date().getTime() / 1000) < decryptedData.date + threshold) {
      return true
    } else {
      return false
    }
  }
  hash(text: string): string {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(text, salt);
    return hash
  }
}

function randomString(length: number) {
  let charset = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    '!',
    '$',
    '.'
  ]
  let aeskey: string = ''
  for (let i = 0; i < length; i++) {
    aeskey = aeskey + charset[Math.floor(Math.random() * charset.length)]
  }
  return aeskey
}
export async function setup(client: any, database: string) {
  let token = await Promise.resolve(sdb.find(database, 'config', {key: 'auth.signingToken'}, client))
  if (token == null) {
    // Set up configuration
    token = {key: 'auth.signingToken', value: randomString(Math.floor(Math.random() * 100000))}
    sdb.insert(database, 'config', token, client)
  }
  // Set up authenticator object
  return Promise.resolve(new solarisAuthenticator(token.value))
}
