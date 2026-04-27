import type { Skill } from './_loader'

export const powersports101: Skill = {
  name: 'powersports-101',
  description:
    'Domain primer for powersports: ATV vs UTV vs motorcycle vs snowmobile distinctions, typical use cases, licensing basics.',
  whenToUse: [
    'Always loaded for powersports-dominant dealers',
    'Customer uses a term imprecisely (e.g. "four-wheeler" could mean ATV or UTV)',
  ],
  domains: ['powersports'],
  priority: 'medium',
  body: `# Powersports 101

## The categories
- **ATV (all-terrain vehicle)**: single rider, straddle seat, handlebars. "Four-wheeler" usually means this. Best for trails, hunting, light utility.
- **UTV / SxS (side-by-side)**: 2–6 seats, steering wheel, roll cage. "Side-by-side." Best for farm/ranch work, family trail rides, hauling.
- **Motorcycle**: on-road (street, cruiser, sport, adventure) or off-road (dirt bike, enduro). Huge range of riding styles.
- **Snowmobile ("sled")**: winter only. Touring, trail, mountain. Matters a lot whether the customer is in flat-trail country (Midwest, Northeast) or mountain country (Rockies, West).
- **PWC (personal watercraft)**: "Jet Ski," "WaveRunner," "Sea-Doo." Standup vs sit-down; 1–3 seats. Marine but sold by many powersports dealers.
- **Trailer**: often sold alongside — matters when customer asks about transporting their new unit.

## Common confusion
- "Four-wheeler" → usually means ATV, but some call UTVs four-wheelers. Ask which.
- "Dirt bike" → off-road motorcycle. Not street-legal unless dual-sport.
- "Quad" = ATV.
- "Razor" usually means a Polaris RZR (a sport UTV) but customers use it generically.

## Licensing (US, general — confirm locally)
- **ATVs**: usually no license required on private land; some states require a safety course for under-16 riders.
- **UTVs**: similar to ATVs, but street-legal conversions are state-dependent.
- **Motorcycles**: street motorcycles require an M-class endorsement on the driver's license in most states.
- **Snowmobiles**: registration required, trail permits vary by state/province.

## Price priors (rough, new)
- Entry ATV: $5k–$8k. Sport ATV: $8k–$15k.
- 2-seat UTV: $10k–$20k. 4-seat sport UTV (RZR, X3): $20k–$40k+.
- Beginner motorcycle: $4k–$8k. Sport/cruiser: $10k–$20k+. Adventure/touring: $15k–$30k+.
- Snowmobile: $10k–$18k typical.

Used values vary wildly — always check inventory via \`search_inventory\`.

## Do not
- Quote state-specific licensing as authoritative — say "usually" or "in most states".
- Assume the customer's use case from the category. An ATV buyer could be a hunter, a farmer, or a weekend trail rider — ask.
`,
}
