import type { Skill } from './_loader'

export const marine101: Skill = {
  name: 'marine-101',
  description:
    'Domain primer for marine: boat categories (center console, bowrider, pontoon, etc.), typical use cases, trailering basics.',
  whenToUse: [
    'Always loaded for marine-dominant dealers',
    'Customer uses a term imprecisely or is shopping by use case',
  ],
  domains: ['marine'],
  priority: 'medium',
  body: `# Marine 101

## Boat categories
- **Bowrider**: family runabout, open bow seating, good for watersports and lake days. 17–26 ft most common. The best "one boat for everything" on a lake.
- **Deck boat**: wider than a bowrider, more seating, still pulls skiers/tubers. Pontoon comfort with better performance.
- **Pontoon**: flat deck on two or three aluminum tubes. Maximum seating, stable, great for cruising and lounging. "Tritoon" (3 tubes) handles rough water and higher HP.
- **Center console**: open layout, helm in the center, walk-around access. Fishing-first, big water. 20–30+ ft. "CC."
- **Bay boat**: shallower draft center console, designed for inshore/flats fishing. Usually 18–24 ft.
- **Cuddy / cabin cruiser**: enclosed cabin for overnighting. Less popular now — most buyers go bowrider or CC.
- **Walkaround**: CC with a small cabin. Compromise boat.
- **Jon boat / skiff**: flat-bottom aluminum, small tiller outboard. Cheap, utility, shallow water. Great first boat if the budget is tight.
- **PWC (Jet Ski / Sea-Doo / WaveRunner)**: personal watercraft, 1–3 seats. Sit-down is the default now.
- **Trailer**: often sold alongside. Bunk vs roller matters for launching.

## Fishing-style distinctions
- **Inshore / bay**: shallow draft, trolling motor, open layout. Bay boats, flats skiffs.
- **Offshore**: deeper V-hull, rod holders, live wells, big fuel tanks. Center consoles.
- **Freshwater bass**: bass boats (low-profile fiberglass, high-HP outboard, raised casting decks).

## Power
- **Outboard** dominates new boats today. Single, twin, or triple. Brands: Yamaha, Mercury, Suzuki, Honda.
- **Inboard / stern-drive (I/O)**: older designs, still common in ski/wake boats and older bowriders. Less fuel-efficient.
- **Electric outboards** exist but are early — small boats only.

## Trailering
- Ask whether they'll trailer or keep it at a dock/slip. Changes the calculus.
- Boats >8'6" wide are "wide load" — permits needed to tow.
- Truck/SUV tow capacity matters. A 24 ft bowrider + trailer is typically 5,000–6,500 lbs — requires a midsize truck or larger.

## Price priors (rough, new)
- 17–20 ft bowrider: $35k–$70k.
- 22–24 ft pontoon: $40k–$80k.
- 22 ft center console: $60k–$120k.
- 26+ ft offshore CC: $150k–$400k+.
- Entry aluminum skiff: $5k–$15k.
- PWC: $10k–$20k.

Used prices vary enormously with engine hours and condition — always check inventory via \`search_inventory\`.

## Do not
- Promise a boat is "bluewater-ready" unless the profile/description confirms it.
- Quote boat-US safety or registration rules as authoritative — say "usually" or route to the dealer.
`,
}
