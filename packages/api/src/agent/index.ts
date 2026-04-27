import type { Database, Dealer } from '@talosdealer/db'
import {
  createBedrockClient,
  streamClaude,
  type ClaudeMessage,
  type ContentBlock,
} from './client'
import {
  buildSystemPrompt,
  fetchInventorySummary,
  pickDomain,
  resolveAgentName,
  type PageContext,
} from './context'
import { findTool, toolDefinitionsForClaude, type AgentContext } from './tools'

export type AgentEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool_start'; id: string; name: string }
  | { type: 'tool_end'; id: string; name: string; ok: boolean; summary?: string }
  | { type: 'agent_name'; name: string }
  | { type: 'done' }
  | { type: 'error'; message: string }

export type RunAgentArgs = {
  db: Database
  dealer: Dealer
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  pageContext?: PageContext
  env: {
    AWS_BEARER_TOKEN_BEDROCK: string
    AWS_REGION?: string
    ANTHROPIC_SMALL_FAST_MODEL?: string
  }
}

const MAX_TOOL_TURNS = 6

/**
 * Run a single agent turn, streaming events as the model works.
 * Handles the tool-use loop: model calls tool, we run it, feed result back, repeat until end_turn.
 */
export async function* runAgent(args: RunAgentArgs): AsyncGenerator<AgentEvent> {
  const { db, dealer, messages: userMessages, pageContext, env } = args

  if (!env.AWS_BEARER_TOKEN_BEDROCK) {
    yield { type: 'error', message: 'Chat not configured: missing AWS_BEARER_TOKEN_BEDROCK' }
    return
  }

  const inventorySummary = await fetchInventorySummary(db, dealer.id)
  const domain = pickDomain(inventorySummary)
  const agentName = resolveAgentName(dealer, domain)
  yield { type: 'agent_name', name: agentName }

  const systemPrompt = buildSystemPrompt({
    dealer,
    inventorySummary,
    pageContext,
    agentName,
    domain,
  })

  const client = createBedrockClient({
    region: env.AWS_REGION ?? 'us-east-1',
    bearerToken: env.AWS_BEARER_TOKEN_BEDROCK,
  })
  const model = env.ANTHROPIC_SMALL_FAST_MODEL ?? 'us.anthropic.claude-sonnet-4-6'

  const toolCtx: AgentContext = { db, dealer }

  // Build message array. User-sent messages are plain strings; we'll append structured
  // assistant turns (with tool_use) and synthetic user turns (with tool_result) as we loop.
  const messages: ClaudeMessage[] = userMessages.map((m) => ({ role: m.role, content: m.content }))

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    let stopReason: string | null = null
    let assistantContent: ContentBlock[] = []

    try {
      for await (const evt of streamClaude({
        client,
        model,
        systemPrompt,
        messages,
        tools: toolDefinitionsForClaude(),
        maxTokens: 1024,
      })) {
        if (evt.type === 'text_delta') {
          yield { type: 'text', delta: evt.text }
        } else if (evt.type === 'tool_use_start') {
          yield { type: 'tool_start', id: evt.id, name: evt.name }
        } else if (evt.type === 'tool_use_complete') {
          // emitted in loop below after we actually run it
        } else if (evt.type === 'message_stop') {
          stopReason = evt.stopReason
          assistantContent = evt.assistantContent
        } else if (evt.type === 'error') {
          yield { type: 'error', message: evt.message }
          return
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bedrock stream failed'
      yield { type: 'error', message: msg }
      return
    }

    // Append the assistant turn (with any tool_use blocks) to the running conversation.
    messages.push({ role: 'assistant', content: assistantContent })

    if (stopReason !== 'tool_use') {
      yield { type: 'done' }
      return
    }

    // Run each tool_use block and prepare tool_result blocks as a user message.
    const toolResults: ContentBlock[] = []
    for (const block of assistantContent) {
      if (block.type !== 'tool_use') continue
      const spec = findTool(block.name)
      if (!spec) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify({ error: `Unknown tool: ${block.name}` }),
          is_error: true,
        })
        yield { type: 'tool_end', id: block.id, name: block.name, ok: false, summary: 'unknown tool' }
        continue
      }
      try {
        const result = await spec.handler(block.input, toolCtx)
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        })
        yield {
          type: 'tool_end',
          id: block.id,
          name: block.name,
          ok: true,
          summary: summarize(block.name, result),
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Tool error'
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify({ error: msg }),
          is_error: true,
        })
        yield { type: 'tool_end', id: block.id, name: block.name, ok: false, summary: msg }
      }
    }

    messages.push({ role: 'user', content: toolResults })
    // Loop continues — model will synthesize a response using tool results.
  }

  // Hit the tool-turn cap without a natural end. Tell the client and stop.
  yield { type: 'error', message: 'Agent exceeded tool-use loop limit' }
}

function summarize(toolName: string, result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined
  const r = result as Record<string, unknown>
  if (toolName === 'search_inventory' && typeof r.count === 'number') {
    return `${r.count} unit${r.count === 1 ? '' : 's'}`
  }
  if (toolName === 'get_unit_details' && typeof r.make === 'string') {
    const year = r.year ?? ''
    return `${year} ${r.make} ${r.model ?? ''}`.trim()
  }
  if (toolName === 'get_dealer_info' && typeof r.name === 'string') {
    return String(r.name)
  }
  return undefined
}
