import type { Skill } from './_loader'

export const testRideBooking: Skill = {
  name: 'test-ride-booking',
  description:
    'How to set up a test ride or showroom visit — what to ask for, what to promise, and how to route it through submit_lead.',
  whenToUse: [
    'Customer says "test ride", "sea trial", "come see it", "stop by"',
    'Customer asks "is this available this weekend"',
    'Customer wants to schedule any kind of in-person appointment',
  ],
  domains: ['powersports', 'marine'],
  priority: 'high',
  body: `# Test ride / visit booking

## Goal
Route the customer to a real appointment-setter. You cannot actually book an appointment yourself — no calendar. You can capture intent precisely enough that the dealer team can follow up within minutes.

## What to collect before calling \`submit_lead\`
1. **The unit** (by id if possible — use \`search_inventory\` to confirm)
2. **Preferred window** — "weekday evening", "Saturday morning", or a specific day. Don't demand an exact time.
3. **Valid license / experience** (optional but useful):
   - Powersports: "Are you licensed / experienced on a [category]?" — test rides often require it.
   - Marine: "Have you driven a boat of this size before?" — affects whether the dealer sends a captain.
4. **Contact info** — per \`lead-capture\` skill.

## What to say about logistics
- Be honest: "I don't have the calendar in front of me, but our team will text or call to lock in a time that works."
- Marine: dealer-led sea trials usually involve fuel costs and scheduling around weather. Don't promise a trial on the first call.
- Powersports: some dealers require a deposit to hold a test ride slot on popular units. Mention it as a possibility, not a fact, unless you know.

## interest field for submit_lead
Use a specific summary. Good examples:
- "Test ride request: 2026 CFMOTO CFORCE 800, Saturday morning"
- "Sea trial inquiry: 2024 Sea Born LX24, next weekend"
- "Showroom visit: looking at pontoons, flexible"

## Do not
- Promise a specific time slot.
- Say "the test ride is confirmed for Saturday" — it isn't.
- Require all the fields above. Name + email + unit is enough to route. The rest is nice to have.
`,
}
