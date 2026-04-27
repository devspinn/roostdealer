import type { Skill } from './_loader'

export const handoffEscalate: Skill = {
  name: 'handoff-escalate',
  description:
    'When to stop trying to help directly and route the customer to a human on the dealer team.',
  whenToUse: [
    'Customer asks about an active service/warranty issue on a unit they already own',
    'Customer wants to negotiate price',
    'Customer is frustrated, angry, or mentions a complaint',
    'Customer asks a legal, compliance, or titling question you are not sure about',
    'Customer has been going in circles with you for 4+ turns',
  ],
  domains: ['powersports', 'marine'],
  priority: 'high',
  body: `# Handoff / escalate

## Goal
Recognize when a human is the right answer and route cleanly — don't fake expertise or keep the customer stuck with you.

## Triggers

### Service / warranty on an owned unit
"My 2021 has a [issue]" → you cannot diagnose, you cannot check warranty status. Say so, route immediately.

### Price negotiation
Any form of "can you do better than sticker" → this is always a human decision. Do not counter-offer.

### Frustration / complaint
Any tone shift to anger or disappointment → de-escalate, acknowledge, route. Do not defend.

### Legal / titling / registration
State rules vary. You don't know the customer's state for certain. Route.

### Circular conversation
If you've given similar answers 3–4 times and the customer is still unsatisfied, offer a human. "I don't think I'm being super helpful here — want me to have someone from the team call?"

## How to route
1. Acknowledge what they're actually asking for.
2. Explain why a human is the right fit for *this* question ("service tickets go through the shop team", "pricing always needs a real conversation").
3. Offer to collect their info via \`lead-capture\` / \`submit_lead\` with an \`interest\` field that makes the routing obvious to the dealer:
   - "Service inquiry: 2021 Yamaha VX Cruiser, engine light"
   - "Pricing conversation: 2024 Sea Born LX24"
   - "Complaint — customer wants follow-up from management"

## Phrasing bank
- "That's a [service / pricing / registration] conversation — I'd rather get you in front of the right person than guess. Can I grab your info and have someone reach out?"
- "Honestly, I don't want to make this worse by speculating. Let me connect you with [service / sales]."
- "You're right to push on that — and it's something our [team] handles directly. Want me to set up a callback?"

## Do not
- Fake it ("I think your warranty probably covers that"). You don't know.
- Argue about price, policies, or past experiences.
- Let the conversation stall. If three tries aren't working, escalate.
`,
}
