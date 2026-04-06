import { Hono } from 'hono'
import { createAuth } from '../auth'
import type { AppEnv } from '../app'

const app = new Hono<AppEnv>()

app.on(['POST', 'GET'], '/**', (c) => {
  const auth = createAuth(c.env)
  return auth.handler(c.req.raw)
})

export default app
