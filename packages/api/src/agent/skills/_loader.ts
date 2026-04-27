import { inventorySearch } from './inventory-search'
import { dealerVoice } from './dealer-voice'
import { unitRecommend } from './unit-recommend'
import { specExplain } from './spec-explain'
import { financingBasics } from './financing-basics'
import { objectionHandle } from './objection-handle'
import { powersports101 } from './powersports-101'
import { marine101 } from './marine-101'

export type SkillDomain = 'powersports' | 'marine'

export type Skill = {
  name: string
  description: string
  whenToUse: string[]
  domains: SkillDomain[]
  priority: 'low' | 'medium' | 'high'
  body: string
}

// Skills are TS modules (not .md) so the same format works in both
// Node (tsx) dev and Cloudflare Workers (esbuild) prod — no loader config needed.
// Bodies are human-editable template strings; Jay can edit them without touching logic.
const ALL_SKILLS: Skill[] = [
  inventorySearch,
  dealerVoice,
  unitRecommend,
  specExplain,
  financingBasics,
  objectionHandle,
  powersports101,
  marine101,
]

export function loadSkills(filter?: { domain?: SkillDomain }): Skill[] {
  const domain = filter?.domain
  if (!domain) return ALL_SKILLS
  // Include skills for this domain (both single-domain and multi-domain skills match).
  // The XOR between powersports-101 / marine-101 is implicit because each lists only one domain.
  return ALL_SKILLS.filter((s) => s.domains.includes(domain))
}
