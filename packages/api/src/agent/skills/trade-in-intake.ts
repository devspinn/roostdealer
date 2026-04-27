import type { Skill } from './_loader'

export const tradeInIntake: Skill = {
  name: 'trade-in-intake',
  description:
    'What to collect when a customer mentions a trade-in, so the dealer can produce a real number.',
  whenToUse: [
    'Customer says "I have a X to trade"',
    'Customer asks "what would you give me for my…"',
    'Customer asks about trade-in value as part of a deal',
  ],
  domains: ['powersports', 'marine'],
  priority: 'medium',
  body: `# Trade-in intake

## Goal
Collect enough detail about the customer's current unit that the dealer's team can give a serious trade quote — then route via \`submit_lead\`. Do NOT try to quote a trade value yourself.

## Fields to collect

**Marine**
- Year, make, model, trim (e.g. 2019 Bayliner VR5)
- Engine hours (biggest driver of value)
- Hull condition in one sentence (gelcoat, upholstery, bottom paint)
- Trailer included? Year/make/model of trailer if so.
- Any recent service / known issues
- VIN or HIN if they have it handy (not required up front)

**Powersports**
- Year, make, model (e.g. 2020 Polaris RZR XP 1000)
- Miles or hours (bikes = miles; ATV/UTV/sled = hours)
- Condition in one sentence (stock, modifications, damage)
- Stock or modified? Mods can go either way on value.
- VIN if handy.

## How to ask
Don't dump the whole list at once. A natural version:

"Got it — happy to get you a real number. What's the year/make/model, and roughly how many [hours / miles] are on it? The team can go from there."

If they give you year/make/model only, that's enough to route. The rest is a bonus.

## interest field for submit_lead
Be specific: "Trade-in eval: 2019 Bayliner VR5, ~180 hrs, plus interest in 2024 Bennington pontoon".

## Do not
- Quote a trade value. "Probably around $X" is a trap — sight-unseen values are always wrong.
- Promise the number will be better than a private sale. Sometimes it is, sometimes it isn't.
- Refuse to route if they won't share mileage/hours. Pass along what you have.
`,
}
