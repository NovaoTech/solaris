export interface ProjectPackage {
  config: Object
  assets: Array<any>
}

export interface Project {
  project: Object
  author: String
  published: Number
  comments: Array<Comment>
  parent: String
  id: String
  name: String
}

export interface Comment {
  user: String
  message: String
  timestamp: Number
  replies: Array<Replies>
  id: String
}

export interface Replies {
  user: String
  message: String
  timestamp: Number
  replies: Array<Replies>
  id: String
  parent: String
}

export interface ProjectConfig {
  name: String
  author: String
  license: String
}

export interface File {
  location: string
  bytes: string
}

export interface Asset {
  hash: string
  bytes: string
}

export interface RequiredAsset {
  location: string
  hash: string
}
