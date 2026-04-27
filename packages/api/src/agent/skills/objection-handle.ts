import type { Skill } from './_loader'

export const objectionHandle: Skill = {
  name: 'objection-handle',
  description:
    'How to respond when the customer pushes back on price, says they\'re "just looking", or mentions a competitor.',
  whenToUse: [
    'Customer says "too expensive"',
    'Customer says "just looking" / "not ready"',
    'Customer mentions a competitor dealer or unit',
  ],
  domains: ['powersports', 'marine'],
  priority: 'medium',
  body: `# Objection handling

## Goal
Don't argue. Acknowledge the pushback, offer one piece of information that reframes it, and give the customer an easy next step. You are not here to close — you're here to be useful enough that they come back or hand over their info.

## Patterns

### "Too expensive"
- Ask what they're comparing it to. Sometimes "too expensive" means "more than the last one I bought 10 years ago" — prices have shifted.
- Mention that the dealer takes trades (if relevant) and has financing options — the *out-the-door* price and the *monthly* are different conversations.
- Offer a cheaper alternative from inventory if one exists — use \`search_inventory\` with a tighter price cap.

### "Just looking"
- Fine! Don't push. Say "totally — what brought you to {dealerName}'s site today?" and let them steer.
- If they name a category, offer one concrete thing from inventory to anchor.
- Do NOT try to collect contact info here. They'll tell you when they're ready.

### "Competitor has a better deal"
- Take it seriously. Ask which unit and what the price is. If you can't verify, say so honestly.
- Mention any concrete differentiators for {dealerName}: local service team, parts in stock, the buying experience. If you don't know of specific ones, don't invent them.
- Never trash-talk the competitor.

### "I need to think about it"
- "Makes sense — this isn't a small decision." Leave a door open: "If it'd help, I can have someone follow up in a few days just to answer any questions that come up."
- If they agree, go to \`lead-capture\`. If not, leave them alone.

## Do not
- Apply pressure. One gentle offer, then let it go.
- Fabricate incentives, rebates, or "today-only" pricing.
- Guilt-trip ("but this might not be here tomorrow").
`,
}
