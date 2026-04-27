import type { Skill } from './_loader'

export const leadCapture: Skill = {
  name: 'lead-capture',
  description:
    "When and how to collect the customer's contact info and submit it to the dealer team. Never upfront — earn it first.",
  whenToUse: [
    'Customer asks to schedule a test ride, visit, or service appointment',
    'Customer asks for financing help or a quote',
    'Customer asks the dealership to "let me know when X comes in"',
    'Customer asks "can someone call me"',
  ],
  domains: ['powersports', 'marine'],
  priority: 'high',
  body: `# Lead capture

## Goal
Collect first name, last name, email, and (if offered) phone, plus a short summary of what they're interested in. Then call \`submit_lead\`. Confirm success warmly.

## When NOT to capture
- Customer is still browsing / asking general questions.
- Customer hasn't expressed a specific intent ("just looking", "what about in a few months").
- First 1–2 turns of the conversation, almost always.

## When to capture
The customer has pulled toward a specific action:
- "Schedule a test ride"
- "Can someone call me about this"
- "I want to trade in my X"
- "What would my payments look like" (after you explain you can't quote, offer to route to finance team)
- They've asked 3+ focused questions about one specific unit.

## How to ask
**One message, all the fields at once.** Do not drip-ask one field at a time.

Good: "Great — can I grab your name, email, and phone? I'll have someone from {dealerName} follow up within one business day."

Do NOT:
- Break it into "first, your name?" / "and your email?" — feels like a form.
- Mention phone as required. Ask for it, but accept email-only.
- Promise a specific response time you don't know ("someone will call you in 30 minutes"). "Within one business day" is safe.

## After they give you the info
1. **Echo it back** briefly: "Got it — Devon Townsend, devon@example.com, interested in the Yamaha Kodiak. Confirming?"
2. **Call \`submit_lead\`** with:
   - \`firstName\`, \`lastName\`, \`email\` (required)
   - \`phone\` (if given)
   - \`interest\`: 5–10 word summary. Examples: "Test ride request for 2024 YXZ1000R", "Trade-in eval: 2019 Yamaha VX Cruiser", "Financing question on 2026 CFMOTO CFORCE 800".
   - \`message\`: 1–2 sentences of context from the conversation.
   - \`unitId\`: if one specific unit was the subject. Use the UUID you saw in a prior tool call.
3. **After success**, say something like: "All set — {dealerName}'s team will reach out within one business day. Anything else I can help with?"

## If a required field is missing
Ask politely for just the missing one. Don't nag about phone.

## Do not
- Submit twice for the same interest in the same conversation.
- Submit with placeholder data ("test@test.com"). If they seem to be joking, acknowledge it and move on.
- Front-load the conversation with "before we start, what's your name?" — that kills the vibe.
`,
}
