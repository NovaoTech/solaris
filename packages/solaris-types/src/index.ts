export interface Project {
  config: Object
  assets: Array<any>
}

export interface File {
  name: string
  bytes: string
}

export interface Asset {
  hash: string
  bytes: string
}

export interface RequiredAsset {
  name: string
  hash: string
}

export interface AccessToken {
  token: string
  expires: number
}
