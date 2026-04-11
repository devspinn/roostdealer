/**
 * Map of lowercase brand names to logo filenames in /brands/.
 * Brands not in this map render as text badges.
 */
const BRAND_LOGOS: Record<string, string> = {
  yamaha: 'yamaha.svg',
  'yamaha boats': 'yamaha.svg',
  kawasaki: 'kawasaki.svg',
  cfmoto: 'cfmoto.svg',
  'sea-doo': 'sea-doo.svg',
  gasgas: 'gasgas.svg',
  husqvarna: 'husqvarna.svg',
  'husqvarna®': 'husqvarna.svg',
  bennington: 'bennington.svg',
  crestliner: 'crestliner.svg',
  lund: 'lund.svg',
  malibu: 'malibu.svg',
  manitou: 'manitou.svg',
  tracker: 'tracker.svg',
  honda: 'honda.svg',
  suzuki: 'suzuki.svg',
  polaris: 'polaris.svg',
  'can-am': 'can-am.svg',
  mercury: 'mercury.svg',
  'harley-davidson': 'harley-davidson.svg',
  ktm: 'ktm.svg',
  indian: 'indian.svg',
  ssr: 'ssr.svg',
}

export function getBrandLogoUrl(make: string): string | null {
  const key = make.toLowerCase().replace(/®/g, '')
  const filename = BRAND_LOGOS[key] ?? null
  return filename ? `/brands/${filename}` : null
}
