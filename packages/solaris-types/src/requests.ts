export interface CreateUser {
  username: string
  email: string
  password: string
}

export interface CreateAsset {
  bytes: string
}

export interface RequestToken {
  username: string
  password: string
}

export interface VerifyToken {
  username: string
  token: string
}
