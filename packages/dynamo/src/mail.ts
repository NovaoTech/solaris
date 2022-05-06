export interface Email {
  to: string
  content: string
}

export class SolarisMailer {
  stmpUsername: string
  stmpPassword: string
  stmpServer: string
  constructor(username: string, password: string, server: string) {
    this.stmpUsername = username
    this.stmpPassword = password
    this.stmpServer = server
  }
  send(email: Email) {
    return false
  }
}

export async function setup() {}
