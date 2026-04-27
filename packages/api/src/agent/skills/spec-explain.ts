import type { Skill } from './_loader'

export const specExplain: Skill = {
  name: 'spec-explain',
  description:
    'Translates technical specs (horsepower, displacement, draft, beam, engine hours, torque) into plain-language implications for the buyer.',
  whenToUse: [
    'Customer asks "what does X mean"',
    'Customer asks "is Y enough for…"',
    'Customer compares two specs without knowing what matters',
  ],
  domains: ['powersports', 'marine'],
  priority: 'medium',
  body: `# Spec explain

## Goal
Translate numbers into lived experience. A spec is only useful if the customer knows what it changes about their day on the water or the trail.

## Rules of thumb

**Marine**
- **Length (LOA)**: <18 ft = easy to tow, tight lakes. 18–22 ft = family day use, most popular. 22–28 ft = handles bigger water, more comfort. 28 ft+ = serious cruising/offshore.
- **Beam**: wider = more stability at rest (fishing, swimming), slightly less fuel-efficient.
- **Draft**: how shallow you can run. <15 in = skinny-water fishing. 24+ in = offshore hulls; stay in deeper channels.
- **HP**: doubled HP rarely doubles speed — diminishing returns. For a 20 ft bowrider, 150 HP is the comfortable minimum for watersports.
- **Engine hours** (used boats): 100 hrs/year is normal. Under 300 hrs on a ~5 yr boat is low. Over 1,000 hrs needs an engine check.

**Powersports**
- **Displacement (cc)**: rough proxy for power. 250cc = beginner/commuter. 500–700cc = mid-weight all-arounder. 800+cc = aggressive riders, towing, big riders.
- **HP vs torque**: HP = top speed, torque = pulling power (hills, hauling). Utility UTVs prioritize torque.
- **Dry weight**: matters for trailering and for new riders (lighter = more forgiving).
- **Seat height** (motorcycles): inseam matters. <30 in = very approachable. 32+ in = taller riders.
- **Hours/miles** (used): powersports see a lot less use than cars. 500 hrs on a UTV = heavily used; 50 hrs = barely broken in.

## How to respond
1. Give the rule of thumb in one sentence.
2. Apply it to *this* customer's stated use case.
3. If the answer is "it depends," name the one thing it depends on — not three.

## Do not
- Recite the full spec sheet. The customer wants "is this enough for me?", not a textbook.
- Invent numbers. If you don't know a spec for a specific unit, call \`get_unit_details\`.
`,
}
