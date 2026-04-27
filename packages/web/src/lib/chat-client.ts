const API_BASE = import.meta.env.VITE_API_URL || '/api'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type PageContext = {
  path?: string
  unitId?: string
}

export type AgentEvent =
  | { type: 'agent_name'; name: string }
  | { type: 'text'; delta: string }
  | { type: 'tool_start'; id: string; name: string }
  | { type: 'tool_end'; id: string; name: string; ok: boolean; summary?: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export async function* streamChat(args: {
  slug: string
  messages: ChatMessage[]
  pageContext?: PageContext
  signal?: AbortSignal
}): AsyncGenerator<AgentEvent> {
  const res = await fetch(`${API_BASE}/dealers/${args.slug}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ messages: args.messages, pageContext: args.pageContext }),
    signal: args.signal,
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    let msg: string
    try {
      msg = JSON.parse(text).error ?? text
    } catch {
      msg = text || `Chat error: ${res.status}`
    }
    yield { type: 'error', message: msg }
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // SSE events are separated by a blank line.
    let idx: number
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 2)
      const parsed = parseSSEEvent(rawEvent)
      if (parsed) yield parsed
    }
  }

  // Flush anything left (server usually terminates with a trailing \n\n, but just in case).
  if (buffer.trim()) {
    const parsed = parseSSEEvent(buffer)
    if (parsed) yield parsed
  }
}

function parseSSEEvent(raw: string): AgentEvent | null {
  // Each line is either "event: X" or "data: Y". We care about data, JSON-parsed.
  let dataLine = ''
  for (const line of raw.split('\n')) {
    if (line.startsWith('data:')) dataLine += line.slice(5).trimStart()
  }
  if (!dataLine) return null
  try {
    return JSON.parse(dataLine) as AgentEvent
  } catch {
    return null
  }
}
