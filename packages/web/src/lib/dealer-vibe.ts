import type { Unit } from '@/types'

export type DealerVibe = 'marine' | 'powersports' | 'mixed'

/** Classify a dealer as marine, powersports, or mixed based on inventory type ratios. */
export function getDealerVibe(units: Unit[]): DealerVibe {
  const types = units.map((u) => u.type)
  const marine = types.filter((t) => t === 'boat' || t === 'pwc').length
  const land = types.filter((t) =>
    ['motorcycle', 'atv', 'utv', 'snowmobile'].includes(t),
  ).length
  if (marine > land) return 'marine'
  if (land > marine) return 'powersports'
  return 'mixed'
}
