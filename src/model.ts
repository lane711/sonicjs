const PREFIX = 'v1:post:'

declare global {
  interface Crypto {
    randomUUID(): string
  }
}

export interface Post {
  id: string
  title: string
  body: string
}

export type Param = {
  title: string
  body: string
}

const generateID = (key: string) => {
  return `${PREFIX}${key}`
}

export const getPosts = async (KV: KVNamespace): Promise<Post[]> => {
  const list = await KV.list({ prefix: PREFIX })
  const keys = list.keys
  const posts: Post[] = []

  const len = keys.length
  for (let i = 0; i < len; i++) {
    const value = await KV.get(keys[i].name)
    if (value) {
      const post: Post = JSON.parse(value)
      posts.push(post)
    }
  }

  return posts
}

export const getPost = async (KV: KVNamespace, id: string): Promise<Post | undefined> => {
  const value = await KV.get(generateID(id))
  if (!value) return
  const post: Post = JSON.parse(value)
  return post
}

export const createPost = async (KV: KVNamespace, param: Param): Promise<Post | undefined> => {
  if (!(param && param.title && param.body)) return
  const id = crypto.randomUUID()
  const newPost: Post = { id: id, title: param.title, body: param.body }
  await KV.put(generateID(id), JSON.stringify(newPost))
  return newPost
}

export const updatePost = async (KV: KVNamespace, id: string, param: Param): Promise<boolean> => {
  if (!(param && param.title && param.body)) return false
  const post = await getPost(KV, id)
  if (!post) return false
  post.title = param.title
  post.body = param.body
  await KV.put(generateID(id), JSON.stringify(post))
  return true
}

export const deletePost = async (KV: KVNamespace, id: string): Promise<boolean> => {
  const post = await getPost(KV, id)
  if (!post) return false
  await KV.delete(generateID(id))
  return true
}
