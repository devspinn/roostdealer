import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { eq } from 'drizzle-orm'
import { dealers } from '@talosdealer/db'
import type { AppEnv } from '../app'
import { runAgent } from '../agent'

const app = new Hono<AppEnv>()

const MAX_MESSAGES = 40

// POST /api/dealers/:slug/chat — SSE stream
// Body: { messages: [{role, content}], pageContext?: { path, unitId } }
app.post('/:slug/chat', async (c) => {
  const db = c.get('db')
  const slug = c.req.param('slug')

  const [dealer] = await db.select().from(dealers).where(eq(dealers.slug, slug))
  if (!dealer) return c.json({ error: 'Dealer not found' }, 404)
  if (!dealer.chatEnabled) return c.json({ error: 'Chat disabled for this dealer' }, 403)

  const body = await c.req.json().catch(() => null)
  if (!body || !Array.isArray(body.messages)) {
    return c.json({ error: 'Expected { messages: [...] }' }, 400)
  }

  const rawMessages = body.messages as Array<{ role?: string; content?: string }>
  if (rawMessages.length === 0) return c.json({ error: 'messages is empty' }, 400)
  if (rawMessages.length > MAX_MESSAGES) {
    return c.json({ error: `Too many messages (max ${MAX_MESSAGES})` }, 400)
  }

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []
  for (const m of rawMessages) {
    if ((m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      return c.json({ error: 'Invalid message shape' }, 400)
    }
    messages.push({ role: m.role, content: m.content })
  }

  const pageContext = body.pageContext && typeof body.pageContext === 'object'
    ? {
        path: typeof body.pageContext.path === 'string' ? body.pageContext.path : undefined,
        unitId: typeof body.pageContext.unitId === 'string' ? body.pageContext.unitId : undefined,
      }
    : undefined

  if (!c.env.AWS_BEARER_TOKEN_BEDROCK) {
    return c.json({ error: 'Chat not configured: missing AWS_BEARER_TOKEN_BEDROCK' }, 500)
  }

  return streamSSE(
    c,
    async (stream) => {
      try {
        for await (const evt of runAgent({
          db,
          dealer,
          messages,
          pageContext,
          env: {
            AWS_BEARER_TOKEN_BEDROCK: c.env.AWS_BEARER_TOKEN_BEDROCK!,
            AWS_REGION: c.env.AWS_REGION,
            ANTHROPIC_SMALL_FAST_MODEL: c.env.ANTHROPIC_SMALL_FAST_MODEL,
          },
        })) {
          await stream.writeSSE({
            event: evt.type,
            data: JSON.stringify(evt),
          })
          if (evt.type === 'done' || evt.type === 'error') break
        }
      } catch (err) {
        console.error('[chat] agent error', err)
        const message = err instanceof Error ? err.message : 'Unknown error'
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({ type: 'error', message }),
        })
      }
    },
    async (err, stream) => {
      console.error('[chat] stream error', err)
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ type: 'error', message: err.message }),
      })
    },
  )
})

export default app
